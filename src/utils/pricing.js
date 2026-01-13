
export const calculateVolumetricWeight = (h, w, d) => {
    // Acá aplicamos la fórmula del peso volumétrico: (Alto x Ancho x Prof x 3.5) / 10000
    // Esto es clave para saber si el paquete ocupa mucho espacio aunque sea liviano.
    return (h * w * d * 3.5) / 10000;
};

export const calculateShippingCost = (zip, weight, dimensions, pricingData) => {
    const { h, w, d } = dimensions;

    // 1. Definimos el peso final
    // Comparamos el peso real con el volumétrico y nos quedamos con el más grande.
    // Ese será el peso por el que se cobra (chargeableWeight).
    const volWeight = calculateVolumetricWeight(h, w, d);
    const finalWeightKg = Math.max(weight, volWeight);
    const finalWeightGrams = finalWeightKg * 1000;

    const result = {
        volumetricWeight: volWeight,
        chargeableWeight: finalWeightKg,
        basePrice: 0,
        method: '',
        error: null
    };

    const region = pricingData[zip];
    if (!region) {
        result.error = "Código Postal no encontrado en el tarifario.";
        return result;
    }

    // 2. Buscamos en qué rango de precios cae
    const match = region.ranges.find(r => finalWeightGrams >= r.min && finalWeightGrams <= r.max);

    if (match) {
        result.basePrice = match.price;
        result.method = 'Rango Estándar';
    } else {
        // Si no entra en los rangos normales, chequeamos si es un excedente (generalmente > 350kg).
        const lastRange = region.ranges[region.ranges.length - 1];
        if (lastRange && finalWeightGrams > lastRange.max) {
            const excessGrams = finalWeightGrams - lastRange.max;

            // Calculamos cuántos kilos se pasó
            const maxKg = lastRange.max / 1000;
            const diffKg = finalWeightKg - maxKg;

            // Fórmula de Andreani: Precio Base (el del último rango) + (Kilos de diferencia * Precio por Kg extra)
            result.basePrice = region.baseExcess + (diffKg * region.excessPrice);
            result.method = `Excedente (> ${maxKg}kg)`;
        } else {
            result.error = "Peso fuera de rango y no tarifado.";
        }
    }

    return result;
};
