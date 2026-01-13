import { Calculator, CheckCircle2 } from 'lucide-react';

const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);
};

export default function TotalPreview({ result }) {
    if (!result) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center sticky top-8">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Calculator className="w-8 h-8" />
                </div>
                <h3 className="text-slate-500 font-medium">Cotización Pendiente</h3>
                <p className="text-sm text-slate-400 mt-2">Ingrese los datos para ver el costo.</p>
            </div>
        );
    }

    const { volumetricWeight, chargeableWeight, basePrice, method, error, surchargeTotal, taxTotal, total } = result;

    if (error) {
        return (
            <div className="bg-red-50 rounded-2xl border border-red-100 p-6 text-center text-red-600 sticky top-8">
                <h3 className="font-bold">No se pudo cotizar</h3>
                <p className="text-sm mt-1">{error}</p>
            </div>
        );
    }

    return (
        <div className="sticky top-8 space-y-4">
            <div className="bg-gradient-to-br from-andreani-dark to-black rounded-2xl shadow-xl overflow-hidden text-white p-6 relative group border-t-4 border-andreani-red">

                {/* Abstract Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-andreani-red/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4 relative z-10">
                    <div className="bg-white/10 p-2 rounded-lg">
                        <Calculator className="w-5 h-5 text-andreani-red" />
                    </div>
                    <h2 className="text-lg font-bold">Resumen de Costos</h2>
                </div>

                <div className="space-y-4 relative z-10">
                    {/* Peso Details */}
                    <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm border border-white/5">
                        <div className="flex justify-between text-slate-300">
                            <span>Peso Volumétrico:</span>
                            <span className="font-mono">{volumetricWeight.toFixed(2)} kg</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                            <span className="font-medium text-red-200">Peso Facturable:</span>
                            <span className="font-mono font-bold text-white">{chargeableWeight.toFixed(2)} kg</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-white/10 mt-2">
                            <span>Criterio:</span>
                            <span className="truncate max-w-[150px]">{method}</span>
                        </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-2 pt-2 text-sm">
                        <div className="flex justify-between items-center text-slate-300">
                            <span>Tarifa Base</span>
                            <span className="font-medium text-white">{formatCurrency(basePrice)}</span>
                        </div>

                        {surchargeTotal > 0 && (
                            <div className="flex justify-between items-center text-slate-400">
                                <span>+ Recargos</span>
                                <span>{formatCurrency(surchargeTotal)}</span>
                            </div>
                        )}

                        {taxTotal > 0 && (
                            <div className="flex justify-between items-center text-slate-400">
                                <span>+ Impuestos</span>
                                <span>{formatCurrency(taxTotal)}</span>
                            </div>
                        )}
                    </div>

                    {/* Total */}
                    <div className="pt-4 mt-2 border-t border-white/10">
                        <div className="flex justify-between items-end">
                            <span className="text-slate-400 font-medium">Total Estimado</span>
                            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-white">
                                {formatCurrency(total)}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-500 text-right mt-1">*IVA Incluido si corresponde</p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                    <h4 className="font-bold text-slate-800 text-sm">Todo listo</h4>
                    <p className="text-xs text-slate-500 mt-1">
                        Se ha aplicado el coeficiente de aforo estándar (3.5).
                    </p>
                </div>
            </div>
        </div>
    );
}
