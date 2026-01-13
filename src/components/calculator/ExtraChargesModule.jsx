import { Plus, Trash2, Tag, FileText, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const ItemRow = ({ item, onChange, onRemove, icon: Icon }) => (
    <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100 group hover:border-red-100 hover:shadow-sm transition-all"
    >
        <div className="bg-white p-2 rounded-lg text-slate-400 border border-slate-100 group-hover:text-andreani-red transition-colors">
            <Icon className="w-4 h-4" />
        </div>

        <input
            type="text"
            placeholder="Concepto..."
            value={item.name}
            onChange={(e) => onChange(item.id, 'name', e.target.value)}
            className="flex-grow bg-transparent border-none outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:text-andreani-dark"
        />

        <div className="flex gap-2 items-center">
            <div className="relative w-48 flex items-center shrink-0">
                <input
                    type="number"
                    placeholder="0"
                    value={item.value}
                    onChange={(e) => onChange(item.id, 'value', e.target.value)}
                    className="flex-1 min-w-0 pl-3 pr-1 py-1.5 bg-white border border-slate-200 rounded-l-lg text-sm font-bold text-slate-700 outline-none focus:border-andreani-red z-10 focus:z-20 h-full"
                />

                {/* Type Toggle */}
                <div className="flex shrink-0 bg-slate-200 p-0.5 rounded-r-lg border border-l-0 border-slate-200 h-full items-center">
                    <button
                        onClick={() => onChange(item.id, 'type', '$')}
                        title="Monto Fijo"
                        className={clsx(
                            "px-2 py-1 text-xs font-bold rounded transiton-all",
                            item.type === '$' ? "bg-white text-andreani-dark shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        $
                    </button>
                    <button
                        onClick={() => onChange(item.id, 'type', '%')}
                        title="Porcentaje sobre Subtotal"
                        className={clsx(
                            "px-2 py-1 text-xs font-bold rounded transiton-all",
                            item.type === '%' ? "bg-white text-andreani-dark shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        %
                    </button>
                </div>
            </div>

            <button
                onClick={() => onRemove(item.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    </motion.div>
);

export default function ExtraChargesModule({ title, items, setItems, type = 'surcharge' }) {
    const Icon = type === 'surcharge' ? Tag : FileText;

    const addItem = () => {
        setItems(prev => [...prev, { id: Date.now(), name: '', value: '', type: '$' }]);
    };

    const handleChange = (id, field, val) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
    };

    const handleRemove = (id) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-400" />
                    {title}
                </h3>
                <button
                    onClick={addItem}
                    className="text-xs font-bold text-andreani-red bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                >
                    <Plus className="w-3 h-3" /> Agregar
                </button>
            </div>

            <div className="p-4 space-y-2 flex-grow">
                <AnimatePresence initial={false}>
                    {items.map(item => (
                        <ItemRow key={item.id} item={item} onChange={handleChange} onRemove={handleRemove} icon={Icon} />
                    ))}
                </AnimatePresence>

                {items.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
                        Sin ítems adicionales
                    </div>
                )}
            </div>
        </div>
    );
}
