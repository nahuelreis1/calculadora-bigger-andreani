import { Package } from 'lucide-react';
import Autocomplete from '../ui/Autocomplete';
import clsx from 'clsx';

const InputField = ({ label, value, onChange, unit, placeholder }) => (
    <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
        <div className="relative group">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium 
                   focus:ring-2 focus:ring-andreani-red/20 focus:border-andreani-red outline-none transition-all
                   group-hover:bg-white group-hover:border-slate-300 placeholder:font-normal"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                {unit}
            </span>
        </div>
    </div>
);

const Toggle = ({ options, value, onChange }) => (
    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
        {options.map((opt) => (
            <button
                key={opt}
                onClick={() => onChange(opt)}
                className={clsx("px-3 py-1 text-xs font-bold rounded-md transition-all",
                    value === opt ? 'bg-andreani-dark text-white shadow' : 'text-slate-400 hover:text-slate-600'
                )}
            >
                {opt}
            </button>
        ))}
    </div>
);

export default function DimensionsModule({
    zipCodes,
    selectedZip,
    onZipChange,
    dimensions,
    onDimensionsChange,
    units,
    onUnitChange,
    disabled
}) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 relative z-20">
            {disabled && <div className="absolute inset-0 bg-slate-50/60 z-10 backdrop-blur-[1px] flex items-center justify-center">
                <span className="bg-white px-4 py-2 rounded-lg shadow-sm font-medium text-slate-500 text-sm">Cargue un tarifario primero</span>
            </div>}

            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30 rounded-t-2xl">
                <div className="flex items-center gap-3">
                    <div className="bg-red-50 p-2 rounded-lg text-andreani-red">
                        <Package className="w-5 h-5" />
                    </div>
                    <h2 className="font-bold text-slate-800">Paquete y Destino</h2>
                </div>

                {/* Global Units */}
                <div className="flex gap-3">
                    <Toggle options={['cm', 'm']} value={units.dim} onChange={(v) => onUnitChange('dim', v)} />
                    <Toggle options={['kg', 'g']} value={units.weight} onChange={(v) => onUnitChange('weight', v)} />
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* ZIP Selector */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">Código Postal Destino</label>
                    <Autocomplete
                        options={zipCodes}
                        value={selectedZip}
                        onChange={onZipChange}
                        placeholder="Escribe o selecciona..."
                    />
                    <p className="text-xs text-slate-400">Selecciona el CP para aplicar tarifa regional específica.</p>
                </div>

                {/* Inputs Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <InputField
                        label="Alto"
                        value={dimensions.h}
                        onChange={(v) => onDimensionsChange('h', v)}
                        unit={units.dim}
                        placeholder="0"
                    />
                    <InputField
                        label="Ancho"
                        value={dimensions.w}
                        onChange={(v) => onDimensionsChange('w', v)}
                        unit={units.dim}
                        placeholder="0"
                    />
                    <InputField
                        label="Profundidad"
                        value={dimensions.d}
                        onChange={(v) => onDimensionsChange('d', v)}
                        unit={units.dim}
                        placeholder="0"
                    />
                    <InputField
                        label="Peso Real"
                        value={dimensions.weight}
                        onChange={(v) => onDimensionsChange('weight', v)}
                        unit={units.weight}
                        placeholder="0"
                    />
                </div>
            </div>
        </div>
    );
}
