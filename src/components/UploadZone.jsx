import { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { parseCSV } from '../utils/csvParser';

export default function UploadZone({ onDataLoaded }) {
    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    };

    const processFile = async (file) => {
        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            setStatus('error');
            setMessage('Por favor, sube un archivo CSV válido.');
            return;
        }

        setStatus('loading');
        try {
            const { pricingData, zips } = await parseCSV(file);
            setStatus('success');
            setMessage(`Tarifario cargado correctamente (${zips.length} regiones).`);
            onDataLoaded({ pricingData, zips });
        } catch (err) {
            console.error(err);
            setStatus('error');
            setMessage('Error al procesar el archivo. Verifique el formato.');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    return (
        <div
            className={clsx(
                "relative rounded-2xl border-2 border-dashed transition-all duration-300 p-8 text-center cursor-pointer group",
                isDragging ? "border-andreani-blue bg-blue-50/50 scale-[1.01]" : "border-slate-200 hover:border-andreani-blue/50 hover:bg-slate-50",
                status === 'success' ? "bg-green-50/50 border-green-200" : "",
                status === 'error' ? "bg-red-50/50 border-red-200" : ""
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleChange}
                accept=".csv"
            />

            <AnimatePresence mode="wait">
                {status === 'loading' ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-3"
                    >
                        <div className="w-10 h-10 border-4 border-andreani-blue border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-medium text-slate-600">Procesando tarifario...</p>
                    </motion.div>
                ) : status === 'success' ? (
                    <motion.div
                        key="success"
                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center gap-2"
                    >
                        <div className="bg-green-100 p-3 rounded-full text-green-600">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-slate-800">¡Tarifario Activo!</h3>
                        <p className="text-sm text-slate-500">{message}</p>
                        <p className="text-xs text-blue-500 mt-2 font-medium group-hover:underline">Clic para reemplazar</p>
                    </motion.div>
                ) : status === 'error' ? (
                    <motion.div
                        key="error"
                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center gap-2"
                    >
                        <div className="bg-red-100 p-3 rounded-full text-red-600">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-red-800">Error</h3>
                        <p className="text-sm text-red-600">{message}</p>
                        <p className="text-xs text-slate-500 mt-2">Clic para intentar de nuevo</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-3"
                    >
                        <div className={clsx("bg-slate-100 p-4 rounded-full transition-colors", isDragging ? "bg-blue-100 text-blue-600" : "text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50")}>
                            <Upload className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-700">Carga tu CSV de Tarifas</h3>
                            <p className="text-sm text-slate-400 mt-1">Arrastra el archivo o haz clic aquí</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                            <FileText className="w-3 h-3" />
                            Soporta formato Andreani complejo
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
