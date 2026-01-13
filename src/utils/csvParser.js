import Papa from 'papaparse';

/**
 * Cleans price strings like "$ 1.200,50", "131.258.80", or "Excedente 375.02".
 * @param {string|number} str 
 * @returns {number}
 */
export const cleanPriceString = (str) => {
    if (typeof str === 'number') return str;
    if (!str) return 0;

    let cleaned = str.toString().trim();

    // Handle "Excedente" prefix
    if (cleaned.toLowerCase().includes('excedente')) {
        cleaned = cleaned.replace(/[^0-9.,]/g, '');
    }

    // Limpiamos símbolos de moneda y cosas raras
    cleaned = cleaned.replace(/[^0-9.,]/g, '');

    // OJO ACÁ: Manejo de formatos tipo "131.258.80" (que a veces vienen con doble punto).
    // La lógica es tratar de entender si es un número estilo americano o argentino.
    const dots = (cleaned.match(/\./g) || []).length;
    const commas = (cleaned.match(/,/g) || []).length;

    if (dots > 0 && commas > 0) {
        // Tienen punto y coma. Asumimos formato AR: el punto es mil, la coma es decimal.
        // Ejemplo: 1.250,50 -> lo pasamos a 1250.50 para que JS lo entienda.
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else if (dots > 1) {
        // Multiple dots, no comma. e.g. "131.258.80"
        // This is tricky. Is it 131,258.80? Or is it 131.258.80?
        // IF the file comes from Excel CSV save, it might have weird formatting.
        // Let's assume the LAST separator is the decimal one IF it is followed by 1 or 2 digits?
        // Or just remove all non-decimals.

        // Safe bet: remove all dots except the last one.
        const lastDotIndex = cleaned.lastIndexOf('.');
        const integerPart = cleaned.substring(0, lastDotIndex).replace(/\./g, '');
        const decimalPart = cleaned.substring(lastDotIndex + 1);
        cleaned = `${integerPart}.${decimalPart}`;
    }
    // If just 1 dot and no comma, it's standard float.
    // If just commas, likely decimal.
    else if (commas > 0) {
        cleaned = cleaned.replace(',', '.');
    }

    return parseFloat(cleaned) || 0;
};

export const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: false,
            skipEmptyLines: false, // We need empty lines to preserve relative structure if any, but logic uses offsets so maybe safer to read all
            complete: (results) => {
                try {
                    const processed = processCSVData(results.data);
                    resolve(processed);
                } catch (e) {
                    reject(e);
                }
            },
            error: (err) => reject(err)
        });
    });
};

const processCSVData = (data) => {
    const pricingData = {};
    const zips = new Set();

    let i = 0;
    while (i < data.length) {
        const row = data[i];

        // Lógica de detección: Buscamos donde empieza el bloque de una "Unidad Operativa"
        if (row && row[0] && row[0].toString().includes("Unidad Operativa origen")) {

            // Encontramos un bloque nuevo.
            // Fila 0: Cabeceras
            // Fila 1: Valores (ahí está el CP en la columna G)

            const valRow = data[i + 1];
            if (valRow && valRow[6]) {
                const zip = valRow[6].toString().trim();
                zips.add(zip);

                // Recorremos los rangos (suelen ser 13 filas para abajo desde el CP)
                // Esto está hardcodeado en base a cómo viene el excel de Andreani.
                // Wait, "Row 1 to 14" usually implies relative to the header?
                // Let's check the code provided. It started loop at ` currentRow + 1`.

                const ranges = [];
                // Rows 1-12 relative to the VALUES row? Or Header?
                // Code used: `data[currentRow + i]` where i=1..12.
                // `currentRow` was the header row.
                // So `currentRow + 1` is the Values row (which matches the CP row).
                // Wait, does the Values row ALSO contain the first price range?
                // Checking the `andreani.md` code...
                // `ranges` loops `rangeRow = data[currentRow + i]` for i=1..12.
                // `currentRow` is Header. `currentRow+1` is the row with CP.
                // Does `currentRow+1` have price data?
                // CSV snippet:
                // Header: Unidad Operativa...
                // Vals: ;LITORAL;;;;;4139;;0;75000;46.005.44;...
                // Yes, "0;75000;46.005.44" is in the same row as the CP.
                // So strict logic:
                // i=1 (Header+1) -> Range 1 + CP
                // i=2 (Header+2) -> Range 2
                // ...

                for (let offset = 1; offset <= 13; offset++) {
                    // Description said 14 rows total?
                    // Row 1 (Header+1) to Row 14?
                    // Let's look at the data snippet again.
                    // Ranges usually go up to 350kg.
                    // 0-75000
                    // 75001-100000
                    // ...
                    const r = data[i + offset];
                    if (!r) continue;

                    // Col I (8), J (9), K (10)
                    const min = cleanPriceString(r[8]);
                    const max = cleanPriceString(r[9]);
                    const price = cleanPriceString(r[10]);

                    if (max > 0) { // Valid range
                        ranges.push({ min, max, price });
                    }
                }

                // Lógica de Excedentes
                // Buscamos si algunas de las filas siguientes dice "Excedente" para sacar el precio extra.

                let excessPrice = 0;
                let baseExcess = 0;

                // Look for the row with "Excedente" around offset 13-15
                for (let off = 12; off <= 15; off++) {
                    const er = data[i + off];
                    if (er && er[10] && er[10].toString().toLowerCase().includes('excedente')) {
                        excessPrice = cleanPriceString(er[10]);
                        // Base excess is the price of the max range (usually the one right before?)
                        // Or the max range of the specific row 13?
                        // Logic: "Precio Base = Valor de la Fila 13... Precio Excedente = Fila 14"
                        // So Base is the price of the Last Range.
                        if (ranges.length > 0) {
                            baseExcess = ranges[ranges.length - 1].price;
                        }
                        break;
                    }
                }

                pricingData[zip] = { ranges, excessPrice, baseExcess };
            }

            i += 14; // Skip block
        } else {
            i++;
        }
    }

    return { pricingData, zips: Array.from(zips).sort() };
};
