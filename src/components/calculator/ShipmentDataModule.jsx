import { useState } from 'react';
import { Package, User, MapPin, FileDown, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { generateAndreaniExcel, validateShipmentData } from '../../utils/generateExcel';

function SectionHeader({ icon: Icon, title, color }) {
    return (
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Icon className={`w-4 h-4 ${color}`} />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</h4>
        </div>
    );
}

function Field({ label, required, children, className = '' }) {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {label} {required && <span className="text-andreani-red">*</span>}
            </label>
            {children}
        </div>
    );
}

function Input({ type = 'text', value, onChange, placeholder, ...props }) {
    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium
        focus:ring-2 focus:ring-andreani-red/20 focus:border-andreani-red outline-none transition-all
        hover:bg-white hover:border-slate-300 placeholder:font-normal placeholder:text-slate-400"
            {...props}
        />
    );
}

export default function ShipmentDataModule({
    dimensions, units, declaredValue, selectedZip, disabled
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [distributionType, setDistributionType] = useState('bsas');
    const [isGenerating, setIsGenerating] = useState(false);
    const [errors, setErrors] = useState([]);

    const [shipmentData, setShipmentData] = useState({
        bultos: '1',
        numeroInterno: '',
        remito: '',
        remitosHijos: '',
        nombre: '',
        apellido: '',
        documentoTipo: 'DNI',
        documento: '',
        email: '',
        telefono: '',
        calle: '',
        numero: '',
        piso: '',
        departamento: '',
        observaciones: ''
    });

    const update = (key, value) => {
        setShipmentData(prev => ({ ...prev, [key]: value }));
        setErrors([]);
    };

    const handleGenerate = async () => {
        const validationErrors = validateShipmentData({
            dimensions, declaredValue, selectedZip, shipmentData
        });

        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsGenerating(true);
        setErrors([]);

        try {
            await generateAndreaniExcel({
                dimensions, units, declaredValue, selectedZip, shipmentData, distributionType
            });
        } catch (err) {
            console.error('Error generando Excel:', err);
            setErrors(['Error al generar el archivo. Intentá de nuevo.']);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Toggle Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-500 p-2 rounded-lg shadow-sm shadow-emerald-200">
                        <FileDown className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-slate-800">Generar Plantilla Andreani</h3>
                        <p className="text-xs text-slate-400">Completá los datos y descargá el Excel listo para subir</p>
                    </div>
                </div>
                {isOpen
                    ? <ChevronUp className="w-5 h-5 text-slate-400" />
                    : <ChevronDown className="w-5 h-5 text-slate-400" />
                }
            </button>

            {/* Collapsible Content */}
            {isOpen && (
                <div className="px-5 pb-5 space-y-5 border-t border-slate-100">

                    {/* Sección 1: Datos del Envío */}
                    <div className="pt-4 space-y-3">
                        <SectionHeader icon={Package} title="Datos del Envío" color="text-blue-500" />
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <Field label="Bultos" required>
                                <Input type="number" value={shipmentData.bultos} onChange={v => update('bultos', v)} placeholder="1" min="1" />
                            </Field>
                            <Field label="Remito" required>
                                <Input value={shipmentData.remito} onChange={v => update('remito', v)} placeholder="Ej: 123" />
                            </Field>
                            <Field label="Nro Interno">
                                <Input value={shipmentData.numeroInterno} onChange={v => update('numeroInterno', v)} placeholder="Ej: Ref123" />
                            </Field>
                            <Field label="Remitos Hijos">
                                <Input value={shipmentData.remitosHijos} onChange={v => update('remitosHijos', v)} placeholder="Ej: 123;456" />
                            </Field>
                        </div>
                    </div>

                    {/* Sección 2: Destinatario */}
                    <div className="space-y-3">
                        <SectionHeader icon={User} title="Destinatario" color="text-violet-500" />
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Nombre" required>
                                <Input value={shipmentData.nombre} onChange={v => update('nombre', v)} placeholder="Ej: Juan" />
                            </Field>
                            <Field label="Apellido" required>
                                <Input value={shipmentData.apellido} onChange={v => update('apellido', v)} placeholder="Ej: Pérez" />
                            </Field>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <Field label="Tipo Doc" required>
                                <select
                                    value={shipmentData.documentoTipo}
                                    onChange={(e) => update('documentoTipo', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium
                    focus:ring-2 focus:ring-andreani-red/20 focus:border-andreani-red outline-none transition-all
                    hover:bg-white hover:border-slate-300"
                                >
                                    <option value="DNI">DNI</option>
                                    <option value="CUIT">CUIT</option>
                                    <option value="CUIL">CUIL</option>
                                </select>
                            </Field>
                            <Field label="Documento" required>
                                <Input value={shipmentData.documento} onChange={v => update('documento', v)} placeholder="Ej: 11222333" />
                            </Field>
                            <Field label="Email" required className="col-span-2 sm:col-span-1">
                                <Input type="email" value={shipmentData.email} onChange={v => update('email', v)} placeholder="Ej: juan@email.com" />
                            </Field>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <Field label="Teléfono" required>
                                <Input value={shipmentData.telefono} onChange={v => update('telefono', v)} placeholder="Ej: 1155555555" />
                            </Field>
                        </div>
                    </div>

                    {/* Sección 3: Dirección de Entrega */}
                    <div className="space-y-3">
                        <SectionHeader icon={MapPin} title="Dirección de Entrega" color="text-amber-500" />
                        <div className="grid grid-cols-4 gap-3">
                            <Field label="Calle" required className="col-span-2">
                                <Input value={shipmentData.calle} onChange={v => update('calle', v)} placeholder="Ej: Av. Boedo" />
                            </Field>
                            <Field label="Número" required>
                                <Input value={shipmentData.numero} onChange={v => update('numero', v)} placeholder="Ej: 1234" />
                            </Field>
                            <Field label="Piso">
                                <Input value={shipmentData.piso} onChange={v => update('piso', v)} placeholder="Ej: 5" />
                            </Field>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            <Field label="Depto">
                                <Input value={shipmentData.departamento} onChange={v => update('departamento', v)} placeholder="Ej: A" />
                            </Field>
                            <Field label="Observaciones" className="col-span-3">
                                <Input value={shipmentData.observaciones} onChange={v => update('observaciones', v)} placeholder="Ej: El edificio de la esquina" />
                            </Field>
                        </div>
                        {selectedZip && (
                            <div className="bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-500">
                                <span className="font-semibold text-slate-600">Destino:</span> {selectedZip}
                            </div>
                        )}
                    </div>

                    {/* Tipo de distribución */}
                    <div className="flex items-center gap-4 pt-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo de envío:</span>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                                type="radio"
                                name="distType"
                                value="bsas"
                                checked={distributionType === 'bsas'}
                                onChange={() => setDistributionType('bsas')}
                                className="accent-andreani-red"
                            />
                            <span className="text-sm text-slate-700">Bs. As.</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                                type="radio"
                                name="distType"
                                value="nacional"
                                checked={distributionType === 'nacional'}
                                onChange={() => setDistributionType('nacional')}
                                className="accent-andreani-red"
                            />
                            <span className="text-sm text-slate-700">Nacional</span>
                        </label>
                    </div>

                    {/* Errores */}
                    {errors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            <div className="text-xs text-red-600">
                                <span className="font-semibold">Faltan campos obligatorios:</span>{' '}
                                {errors.join(', ')}
                            </div>
                        </div>
                    )}

                    {/* Botón generar */}
                    <button
                        onClick={handleGenerate}
                        disabled={disabled || isGenerating}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold
              rounded-xl transition-all shadow-sm shadow-emerald-200 disabled:shadow-none
              flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                    >
                        <FileDown className="w-4 h-4" />
                        {isGenerating ? 'Generando...' : 'Descargar Plantilla Excel'}
                    </button>
                </div>
            )}
        </div>
    );
}
