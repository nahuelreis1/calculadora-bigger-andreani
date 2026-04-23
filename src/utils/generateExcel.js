import JSZip from 'jszip';

/**
 * Escapa caracteres especiales para XML.
 */
function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Construye el XML de una celda para la fila 3.
 * @param {string} col - Letra de columna (A, B, etc.)
 * @param {*} value - Valor de la celda
 * @param {boolean} isNumber - Si es numérico
 * @param {string} style - ID de estilo (opcional)
 */
function buildCell(col, value, isNumber, style = '1') {
  const ref = `${col}3`;
  if (value === '' || value === null || value === undefined) {
    return `<x:c r="${ref}" s="${style}" />`;
  }
  if (isNumber) {
    return `<x:c r="${ref}" s="${style}" t="n"><x:v>${value}</x:v></x:c>`;
  }
  // Inline string (t="inlineStr") para no depender de sharedStrings
  return `<x:c r="${ref}" s="${style}" t="inlineStr"><x:is><x:t>${escapeXml(value)}</x:t></x:is></x:c>`;
}

/**
 * Genera y descarga la plantilla Excel de Andreani con los datos del envío.
 * Usa JSZip para manipular el ZIP directamente y preservar las validaciones de datos.
 */
export async function generateAndreaniExcel({
  dimensions, units, declaredValue, selectedZip, shipmentData, distributionType
}) {
  // 1. Cargar la plantilla base desde /public como ArrayBuffer
  const response = await fetch('/Plantilla.xlsx');
  const arrayBuffer = await response.arrayBuffer();

  // 2. Abrir como ZIP
  const zip = await JSZip.loadAsync(arrayBuffer);

  // 3. Determinar qué archivo XML editar según tipo de distribución
  // sheet2.xml = "351003587 Distribucion .Bs As"
  // sheet3.xml = "351003358 Distribucion"
  const sheetFile = distributionType === 'bsas'
    ? 'xl/worksheets/sheet2.xml'
    : 'xl/worksheets/sheet3.xml';

  const sheetXml = await zip.file(sheetFile).async('string');

  // 4. Normalizar dimensiones a cm y kg
  let h = parseFloat(dimensions.h) || 0;
  let w = parseFloat(dimensions.w) || 0;
  let d = parseFloat(dimensions.d) || 0;
  let weight = parseFloat(dimensions.weight) || 0;

  if (units.dim === 'm') { h *= 100; w *= 100; d *= 100; }
  if (units.weight === 'g') { weight /= 1000; }

  const volumen = (h * w * d) / 1000000;
  const dv = parseFloat(declaredValue) || 0;
  const bultos = parseInt(shipmentData.bultos) || 1;

  // 5. Construir la fila 3 como XML
  // Estilos: 1=normal, 2=entero, 3=obligatorio-resaltado (según las cols del template)
  const row3Xml = `<x:row r="3" spans="1:22">`
    + buildCell('A', weight, true, '1')
    + buildCell('B', volumen, true, '1')
    + buildCell('C', Math.round(h), true, '2')
    + buildCell('D', Math.round(w), true, '2')
    + buildCell('E', Math.round(d), true, '2')
    + buildCell('F', dv, true, '1')
    + buildCell('G', bultos, true, '2')
    + buildCell('H', shipmentData.numeroInterno || '', false, '1')
    + buildCell('I', shipmentData.remito || '', false, '1')
    + buildCell('J', shipmentData.remitosHijos || '', false, '3')
    + buildCell('K', shipmentData.nombre || '', false, '1')
    + buildCell('L', shipmentData.apellido || '', false, '1')
    + buildCell('M', shipmentData.documentoTipo || 'DNI', false, '1')
    + buildCell('N', shipmentData.documento || '', false, '1')
    + buildCell('O', shipmentData.email || '', false, '1')
    + buildCell('P', shipmentData.telefono || '', false, '3')
    + buildCell('Q', shipmentData.calle || '', false, '1')
    + buildCell('R', shipmentData.numero || '', false, '1')
    + buildCell('S', shipmentData.piso || '', false, '1')
    + buildCell('T', shipmentData.departamento || '', false, '1')
    + buildCell('U', shipmentData.observaciones || '', false, '1')
    + buildCell('V', selectedZip || '', false, '3')
    + `</x:row>`;

  // 6. Inyectar la fila 3 justo antes de </x:sheetData>
  // También actualizar el dimension ref de "A1:V2" a "A1:V3"
  let modifiedXml = sheetXml
    .replace('</x:sheetData>', row3Xml + '</x:sheetData>')
    .replace('ref="A1:V2"', 'ref="A1:V3"');

  // 7. Guardar el XML modificado en el ZIP
  zip.file(sheetFile, modifiedXml);

  // 8. Generar el ZIP y descargar
  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

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
