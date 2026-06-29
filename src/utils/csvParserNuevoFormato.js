// andreani-calculator/src/utils/csvParserNuevoFormato.js

// Import circular con csvParser.js: cleanPriceString se referencia solo dentro
// de cuerpos de función (nunca a nivel de módulo) porque ESM tolera ciclos
// cuando los exports se usan en call-time, no en load-time. Si en el futuro
// alguien necesita cleanPriceString a nivel top-level, moverla a un módulo
// compartido o inline-arla.
import { cleanPriceString } from './csvParser.js';

const TIPO_DESTINO_COL = 2;
const ZIP_COL = 3;
const RANGE_HEADER_COLS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]; // 12 cols
const EXCESS_COL = 17;
const REQUIRED_COLS = 18; // mínimo para que tenga col de Excedente

const isNumericZip = (s) => {
    if (s == null) return false;
    const trimmed = s.toString().trim();
    if (trimmed.length === 0) return false;
    return /^\d+$/.test(trimmed);
};

const parseRangeHeader = (headerCell) => {
    if (headerCell == null) return null;
    const parts = headerCell.toString().trim().split('-');
    if (parts.length !== 2) return null;
    const min = parseInt(parts[0], 10);
    const max = parseInt(parts[1], 10);
    if (Number.isNaN(min) || Number.isNaN(max)) return null;
    return { min, max };
};

/**
 * Procesa datos del formato nuevo (ancho/tidy) ya parseados por Papa.parse.
 * Devuelve { pricingData, zips } idéntico en forma al parser viejo.
 * @param {string[][]} data - Filas del CSV (header + datos).
 * @returns {{ pricingData: Object, zips: string[] }}
 */
export const processNuevoFormatoData = (data) => {
    const pricingData = {};
    const zips = new Set();

    // 1. Encontrar la fila de header (defensa en profundidad: aunque el
    //    dispatcher ya detectó formato nuevo, re-validamos acá por si hay
    //    preamble).
    let headerIdx = -1;
    for (let i = 0; i < data.length; i++) {
        const r = data[i];
        if (!r || r[0] == null) continue;
        const cell = r[0].toString().replace(/^\uFEFF/, '').trim();
        if (cell === 'Tipo origen') {
            headerIdx = i;
            break;
        }
    }
    if (headerIdx === -1) {
        return { pricingData, zips: [] };
    }

    // 2. Pre-parsear los bounds de los 12 rangos desde el header
    const headerRow = data[headerIdx];
    const rangeBounds = RANGE_HEADER_COLS.map((colIdx) =>
        parseRangeHeader(headerRow[colIdx])
    );

    // 3. Iterar filas de datos (después del header)
    for (let i = headerIdx + 1; i < data.length; i++) {
        const row = data[i];

        // Filtro combinado: solo filas CP con zip numérico.
        // - row.length < REQUIRED_COLS descarta TDF 3-col y filas truncadas.
        // - row[TIPO_DESTINO_COL] !== 'CP' descarta RE estándar + TDF 24+ col
        //   (todas tienen TipoDestino === "RE").
        // - !isNumericZip(row[ZIP_COL]) descarta RE rows (col 3 = nombre región).
        if (!row || row.length < REQUIRED_COLS) continue;
        if (row[TIPO_DESTINO_COL] !== 'CP') continue;
        if (!isNumericZip(row[ZIP_COL])) continue;

        const zip = row[ZIP_COL].toString().trim();
        zips.add(zip);

        // Construir ranges desde cols 5–16 usando bounds del header.
        // Col 4 (Tipo distribución) se ignora intencionalmente: el índice
        // RANGE_HEADER_COLS saltea de 5 en adelante, dejando col 4 afuera.
        const ranges = [];
        for (let j = 0; j < RANGE_HEADER_COLS.length; j++) {
            const colIdx = RANGE_HEADER_COLS[j];
            const bounds = rangeBounds[j];
            if (!bounds) continue;
            const price = cleanPriceString(row[colIdx]);
            ranges.push({ min: bounds.min, max: bounds.max, price });
        }

        // Excedentes: col 17 (header "Excedente"). baseExcess = precio del
        // último rango (col 16, header "325001-350000"), igual que el parser viejo.
        const excessPrice = cleanPriceString(row[EXCESS_COL]);
        const baseExcess = ranges.length > 0 ? ranges[ranges.length - 1].price : 0;

        // Duplicate CP: last-loaded wins (REQ-006, semántica natural de
        // object assignment). No esperado en samples reales de Andreani.
        pricingData[zip] = { ranges, excessPrice, baseExcess };
    }

    // Sort lexicográfico (no numérico) para matchear el parser viejo y no
    // alterar el orden visible del dropdown de CPs en la UI.
    return { pricingData, zips: Array.from(zips).sort() };
};
