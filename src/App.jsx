import { useState, useMemo } from 'react';
import { Truck } from 'lucide-react';
import UploadZone from './components/UploadZone';
import DimensionsModule from './components/calculator/DimensionsModule';
import ExtraChargesModule from './components/calculator/ExtraChargesModule';
import TotalPreview from './components/calculator/TotalPreview';
import { calculateShippingCost } from './utils/pricing';

export default function App() {
  // Data State
  const [pricingData, setPricingData] = useState(null);
  const [zipCodes, setZipCodes] = useState([]);

  // Input State
  const [selectedZip, setSelectedZip] = useState('');
  const [dimensions, setDimensions] = useState({ h: '', w: '', d: '', weight: '' });
  const [units, setUnits] = useState({ dim: 'cm', weight: 'kg' });

  const [surcharges, setSurcharges] = useState([]); // { name, value, type: $, % }
  const [taxes, setTaxes] = useState([]);

  // Cuando el usuario carga el CSV, guardamos toda la data acá.
  const handleDataLoaded = ({ pricingData, zips }) => {
    setPricingData((prev) => pricingData);
    setZipCodes(zips);
  };

  // Acá ocurre la magia: cada vez que cambia un input, recalculamos el precio.
  // Usamos useMemo para que no se ejecute si no cambió nada importante.
  const calculationResult = useMemo(() => {
    if (!pricingData || !selectedZip || !dimensions.weight || !dimensions.h || !dimensions.w || !dimensions.d) {
      return null;
    }

    // 1. Normalizamos unidades (pasamos todo a cm y kg para que la fórmula no falle)
    let h = parseFloat(dimensions.h) || 0;
    let w = parseFloat(dimensions.w) || 0;
    let d = parseFloat(dimensions.d) || 0;
    let weight = parseFloat(dimensions.weight) || 0;

    if (units.dim === 'm') { h *= 100; w *= 100; d *= 100; }
    if (units.weight === 'g') { weight /= 1000; }

    // 2. Calculamos el costo base con la data del CSV
    const baseResult = calculateShippingCost(selectedZip, weight, { h, w, d }, pricingData);

    if (baseResult.error) {
      return baseResult;
    }

    // 3. Sumamos los extras (Impuestos, seguro, etc)
    const calculateAddons = (items, currentTotal) => {
      return items.reduce((acc, item) => {
        const val = parseFloat(item.value) || 0;
        if (item.type === '%') {
          return acc + (currentTotal * (val / 100));
        }
        return acc + val;
      }, 0);
    };

    const surchargeTotal = calculateAddons(surcharges, baseResult.basePrice);
    const subtotal = baseResult.basePrice + surchargeTotal;
    const taxTotal = calculateAddons(taxes, subtotal);
    const total = subtotal + taxTotal;

    return {
      ...baseResult,
      surchargeTotal,
      taxTotal,
      total
    };

  }, [pricingData, selectedZip, dimensions, units, surcharges, taxes]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-600 pb-20">

      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 mb-8 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/80">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="bg-andreani-red p-2 rounded-lg shadow-sm shadow-red-200">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Calculadora Envios Bigger <span className="text-andreani-red">(Andreani)</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">by Nahuel Reis</p>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-8">

        <header>
          <UploadZone onDataLoaded={handleDataLoaded} />
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          <div className="lg:col-span-2 space-y-6">
            <DimensionsModule
              zipCodes={zipCodes}
              selectedZip={selectedZip}
              onZipChange={setSelectedZip}
              dimensions={dimensions}
              onDimensionsChange={(key, val) => setDimensions(d => ({ ...d, [key]: val }))}
              units={units}
              onUnitChange={(key, val) => setUnits(u => ({ ...u, [key]: val }))}
              disabled={!pricingData}
            />

            <div className="grid grid-cols-1 gap-6 items-start">
              <ExtraChargesModule
                title="Recargos (Seguro, Etc)"
                items={surcharges}
                setItems={setSurcharges}
                type="surcharge"
              />
              <ExtraChargesModule
                title="Impuestos"
                items={taxes}
                setItems={setTaxes}
                type="tax"
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <TotalPreview result={calculationResult} />
          </div>

        </main>
      </div>
    </div>
  );
}
