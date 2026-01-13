import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

export default function Autocomplete({ options, value, onChange, placeholder }) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState(value);
    const [filteredOptions, setFilteredOptions] = useState(options);
    const containerRef = useRef(null);

    useEffect(() => {
        setQuery(value);
    }, [value]);

    useEffect(() => {
        const filtered = options.filter(opt =>
            opt.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredOptions(filtered.slice(0, 5000)); // Increased limit significantly
    }, [query, options]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (val) => {
        onChange(val);
        setQuery(val);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        onChange(e.target.value); // Propagate changes instantly
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-andreani-red/20 focus:border-andreani-red outline-none transition-all font-medium text-slate-800 placeholder:font-normal placeholder:text-slate-400"
                />
                <ChevronDown className={clsx("absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
            </div>

            <AnimatePresence>
                {isOpen && filteredOptions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto"
                    >
                        {filteredOptions.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => handleSelect(opt)}
                                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm text-slate-700 flex items-center justify-between group transition-colors"
                            >
                                <span>{opt}</span>
                                {value === opt && <Check className="w-4 h-4 text-andreani-red" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
