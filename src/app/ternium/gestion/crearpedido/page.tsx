'use client';

import { useState } from 'react';
import { 
  FiSearch, FiGrid, FiUser, FiZap, FiSave, 
  FiSend, FiCheckCircle, FiRefreshCw 
} from 'react-icons/fi';
import { HiOutlineDocumentText } from 'react-icons/hi';

const CapturaOrden = () => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8 font-sans text-slate-700">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        
        {/* COLUMNA PRINCIPAL (IZQUIERDA) */}
        <div className="flex-1 space-y-6">
          
          {/* SECCIÓN 1: CAPTURA BASE */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
              <HiOutlineDocumentText className="text-[#ff4301] text-xl" />
              <h2 className="font-bold text-slate-800">Captura base de la orden</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Producto Terminado</label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar código o nombre del producto..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="Master ID" placeholder="Ej. MST-2024-8821" icon={<FiGrid />} />
                <InputGroup label="Cliente" placeholder="Buscar cliente..." icon={<FiUser />} />
              </div>

              <div className="flex justify-end pt-2">
                <button className="bg-[#ff4301] hover:bg-[#e63d01] text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-orange-100">
                  <FiZap className="fill-current" /> Generar Especificación
                </button>
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: ESPECIFICACIÓN GENERADA */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-slate-800">Especificación generada</h2>
                <p className="text-[10px] text-slate-400 mt-0.5 tracking-wide">🕒 24 Oct, 10:42 AM</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Grilla de parámetros */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DisplayField label="DIÁMETRO INTERNO" value="508" unit="mm" />
                <DisplayField label="DIÁMETRO EXTERNO" value="1,250" unit="mm" />
                <DisplayField label="PESOS (MÍN/MÁX)" value="8,500 - 12,000" unit="kg" />
                <DisplayField label="PIEZAS POR PAQUETE" value="25" unit="pzs" />
                <DisplayField label="ANCHO TARIMA" value="1,100" unit="mm" />
                <DisplayField label="EMBALAJE" value="Estándar Exportación" />
              </div>

              <div className="pt-2">
                <label className="text-[10px] font-bold text-slate-400 block mb-1.5 tracking-widest uppercase">ID de Especificación</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700">
                  SPEC-9921-X
                </div>
              </div>

              {/* Validación y Responsabilidad */}
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <input 
                    type="checkbox" 
                    className="mt-1 w-5 h-5 accent-[#ff4301] cursor-pointer" 
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-700 leading-tight">
                      Confirmo que he revisado y validado todos los parámetros generados para esta orden.
                    </p>
                    <p className="text-[11px] text-slate-400 italic mt-1">
                      La validación implica conformidad operativa con los valores calculados por el modelo.
                    </p>
                  </div>
                  <button className="text-slate-500 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-white transition-all">
                    <FiRefreshCw /> Solicitar regeneración
                  </button>
                </div>

                <div className="bg-orange-50/50 border-l-4 border-orange-500 p-4 rounded-r-xl">
                  <p className="text-[10px] font-black text-orange-600 tracking-widest uppercase mb-1 flex items-center gap-1">
                    <FiCheckCircle /> Responsabilidad Operativa
                  </p>
                  <p className="text-[11px] text-orange-800 leading-relaxed font-medium">
                    Al confirmar esta especificación, el usuario asume validación operativa completa. Cualquier desviación en producción resultante de estos parámetros será trazable a esta confirmación digital.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* SIDEBAR (DERECHA) */}
        <div className="w-full lg:w-[350px] space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            
            {/* Cabecera del Sidebar */}
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-black text-slate-800 text-lg tracking-tight">ORDEN #48291-MX</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Creado: Hoy, 09:30 AM</p>
                </div>
                <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">Borrador</span>
              </div>
              <div className="mt-4">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 w-[66%]"></div>
                </div>
                <p className="text-right text-[10px] font-bold text-orange-600 mt-1.5">66% Completado</p>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Lista de Verificación</h4>
              <ul className="space-y-4">
                <CheckItem done title="Datos Base Capturados" sub="Cliente y producto definidos" />
                <CheckItem done title="Especificación Generada" sub="Valores calculados por modelo" />
                <CheckItem done={isChecked} title="Validación Final" sub="Pendiente de envío" />
              </ul>
            </div>

            {/* Botones de Acción */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <button className="w-full bg-[#ff4301] hover:bg-[#e63d01] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-100 active:scale-95">
                <FiSave /> Generar Orden
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---

const InputGroup = ({ label, placeholder, icon }: any) => (
  <div className="flex-1">
    <label className="text-xs font-bold text-slate-500 block mb-1.5">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
      <input 
        type="text" 
        placeholder={placeholder} 
        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
      />
    </div>
  </div>
);

const DisplayField = ({ label, value, unit }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{label}</label>
    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
      <span className="font-bold text-slate-800">{value}</span>
      {unit && <span className="text-[10px] font-bold text-slate-400">{unit}</span>}
    </div>
  </div>
);

const CheckItem = ({ done, title, sub }: any) => (
  <li className="flex gap-3">
    <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border-2 ${done ? 'bg-green-50 border-green-500 text-green-600' : 'border-slate-200'}`}>
      {done && <FiCheckCircle size={14} />}
    </div>
    <div>
      <p className={`text-xs font-bold leading-none ${done ? 'text-slate-700' : 'text-slate-400'}`}>{title}</p>
      <p className="text-[10px] text-slate-400 mt-1">{sub}</p>
    </div>
  </li>
);

export default CapturaOrden;