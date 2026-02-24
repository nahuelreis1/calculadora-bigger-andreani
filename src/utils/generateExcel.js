import * as XLSX from 'xlsx';

/**
 * Genera y descarga la plantilla Excel de Andreani con los datos del envío.
 *
 * @param {Object} params
 * @param {Object} params.dimensions - { h, w, d, weight } en cm/kg
 * @param {Object} params.units - { dim: 'cm'|'m', weight: 'kg'|'g' }
 * @param {string} params.declaredValue - Valor declarado sin IVA
 * @param {string} params.selectedZip - Formato "PROVINCIA / LOCALIDAD / CP"
 * @param {Object} params.shipmentData - Datos del formulario de envío
 * @param {string} params.distributionType - 'bsas' | 'nacional'
 */
export async function generateAndreaniExcel({
    dimensions,
    units,
    declaredValue,
    selectedZip,
    shipmentData,
    distributionType
}) {
    // 1. Cargar la plantilla base desde /public
    const response = await fetch('/Plantilla.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: 'array' });

    // 2. Seleccionar la hoja correcta según tipo de distribución
    const sheetName = distributionType === 'bsas'
        ? '351003587 Distribucion .Bs As'
        : '351003358 Distribucion';

    const ws = wb.Sheets[sheetName];

    if (!ws) {
        throw new Error(`No se encontró la hoja "${sheetName}" en la plantilla.`);
    }

    // 3. Normalizar dimensiones a cm y kg
    let h = parseFloat(dimensions.h) || 0;
    let w = parseFloat(dimensions.w) || 0;
    let d = parseFloat(dimensions.d) || 0;
    let weight = parseFloat(dimensions.weight) || 0;

    if (units.dim === 'm') { h *= 100; w *= 100; d *= 100; }
    if (units.weight === 'g') { weight /= 1000; }

    // Volumen en m3 (como pide la plantilla)
    const volumen = (h * w * d) / 1000000;

    // 4. Construir el formato de Provincia / Localidad / CP
    // El selectedZip ya viene con el formato correcto del Autocomplete
    const provinciaLocalidadCP = selectedZip || '';

    // 5. Escribir la fila de datos (fila 3 = index 2 en la hoja)
    const rowData = [
        weight,                                       // A: Peso total (Kg)
        volumen,                                       // B: Volumen total (m3)
        h,                                             // C: Alto (cm)
        w,                                             // D: Ancho (cm)
        d,                                             // E: Profundidad (cm)
        parseFloat(declaredValue) || 0,                // F: Valor declarado total ($ S/IVA)
        parseInt(shipmentData.bultos) || 1,            // G: Cantidad de bultos
        shipmentData.numeroInterno || '',              // H: Numero interno
        shipmentData.remito || '',                     // I: Remito
        shipmentData.remitosHijos || '',               // J: Remitos hijos
        shipmentData.nombre || '',                     // K: Nombre
        shipmentData.apellido || '',                   // L: Apellido
        shipmentData.documentoTipo || 'DNI',           // M: Documento tipo
        shipmentData.documento || '',                  // N: DNI
        shipmentData.email || '',                      // O: Email
        shipmentData.telefono || '',                   // P: Telefono
        shipmentData.calle || '',                      // Q: Calle
        shipmentData.numero || '',                     // R: Numero
        shipmentData.piso || '',                       // S: Piso
        shipmentData.departamento || '',               // T: Departamento
        shipmentData.observaciones || '',              // U: Observaciones
        provinciaLocalidadCP                           // V: Provincia / Localidad / CP
    ];

    // Escribir cada celda en la fila 3 (row index 2)
    const ROW = 2;
    rowData.forEach((value, colIdx) => {
        const cellRef = XLSX.utils.encode_cell({ r: ROW, c: colIdx });
        ws[cellRef] = { v: value, t: typeof value === 'number' ? 'n' : 's' };
    });

    // Actualizar el rango de la hoja para incluir la nueva fila
    const currentRange = XLSX.utils.decode_range(ws['!ref']);
    if (currentRange.e.r < ROW) {
        currentRange.e.r = ROW;
    }
    ws['!ref'] = XLSX.utils.encode_range(currentRange);

    // 6. Generar y descargar el archivo
    const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbOut], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const fileName = `Envio_Andreani_${shipmentData.remito || 'sin-remito'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Valida que todos los campos obligatorios estén completos.
 * Retorna un array de errores (vacío si todo OK).
 */
export function validateShipmentData({ dimensions, declaredValue, selectedZip, shipmentData }) {
    const errors = [];

    if (!dimensions.weight) errors.push('Peso');
    if (!dimensions.h || !dimensions.w || !dimensions.d) errors.push('Dimensiones (Alto, Ancho, Profundidad)');
    if (!declaredValue) errors.push('Valor Declarado');
    if (!selectedZip) errors.push('Código Postal / Destino');
    if (!shipmentData.bultos) errors.push('Cantidad de Bultos');
    if (!shipmentData.remito) errors.push('Remito');
    if (!shipmentData.nombre) errors.push('Nombre');
    if (!shipmentData.apellido) errors.push('Apellido');
    if (!shipmentData.documento) errors.push('Documento');
    if (!shipmentData.email) errors.push('Email');
    if (!shipmentData.telefono) errors.push('Teléfono');
    if (!shipmentData.calle) errors.push('Calle');
    if (!shipmentData.numero) errors.push('Número');

    return errors;
}
