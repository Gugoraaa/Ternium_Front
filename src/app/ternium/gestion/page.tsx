'use client';
import { 
  FiSearch, FiFilter, FiDownload, FiPrinter, 
  FiClipboard, FiClock, FiCheckCircle, FiTrendingUp, FiPlus
} from 'react-icons/fi';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { useRouter } from 'next/navigation';

// --- Interfaces ---
interface Order {
  id: string;
  producto: string;
  cliente: string;
  fecha: string;
  estado: 'Revisión Operador' | 'Aceptado' | 'Rechazado';
}

const orders: Order[] = [
  { id: 'ORD-8823', producto: 'Acero Galvanizado', cliente: 'Cliente A - Constructora', fecha: '24/05/2024', estado: 'Revisión Operador' },
  { id: 'ORD-8822', producto: 'Bobina Laminada', cliente: 'Cliente B - Metales Ind.', fecha: '23/05/2024', estado: 'Aceptado' },
  { id: 'ORD-8821', producto: 'Perfiles Estructurales', cliente: 'Cliente C - Perfiles Nte.', fecha: '22/05/2024', estado: 'Rechazado' },
  { id: 'ORD-8819', producto: 'Tubería Industrial', cliente: 'Distribuidora Central', fecha: '20/05/2024', estado: 'Aceptado' },
  { id: 'ORD-8815', producto: 'Acero Inoxidable', cliente: 'Industrial S.A.', fecha: '19/05/2024', estado: 'Revisión Operador' },
];

export default function DashboardOrdenes() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans text-slate-700">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight">Seguimiento de Órdenes</h1>
            <p className="text-slate-500 mt-2 max-w-2xl">
              Panel de control operativo para el monitoreo de propuestas, validación de clientes y cierre de ciclo de gestión.
            </p>
          </div>
          <button 
            onClick={() => router.push('/ternium/gestion/crearpedido')}
            className="bg-[#ff4301] hover:bg-[#e63d01] text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg transition-all hover:-translate-y-1 active:scale-95"
          >
            <FiPlus size={18} />
            Crear Nueva Orden
          </button>
        </header>

        {/* TOP STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            label="ÓRDENES TOTALES" 
            value="1,284" 
            subtext={<span className="flex items-center gap-1 text-green-600 font-bold"><FiTrendingUp /> +12% <span className="font-normal text-slate-400">desde el último mes</span></span>}
            icon={<FiClipboard className="text-blue-600 text-xl" />}
            iconBg="bg-blue-50"
          />
          <StatCard 
            label="PENDIENTES REVISIÓN" 
            value="42" 
            subtext={<span className="flex items-center gap-1 text-orange-600 font-medium"><HiOutlineExclamationCircle /> Requiere atención inmediata</span>}
            icon={<FiClock className="text-orange-500 text-xl" />}
            iconBg="bg-orange-50"
          />
          <StatCard 
            label="TASA DE ACEPTACIÓN" 
            value="89.4%" 
            subtext={<span className="flex items-center gap-1 text-green-600 font-medium"><FiCheckCircle /> Meta trimestral superada</span>}
            icon={<FiCheckCircle className="text-green-500 text-xl" />}
            iconBg="bg-green-50"
          />
        </div>

        {/* FILTER BAR CONTAINER */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <FilterSelect label="ESTADO" options={['Todos los Estados', 'Aceptado', 'Rechazado', 'En Revisión']} />
            <FilterSelect label="CLIENTE" options={['Todos los Clientes', 'Cliente A', 'Cliente B']} />
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400">BUSCAR POR ID</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Ej: ORD-8823" 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                />
              </div>
            </div>
            <button className="bg-[#ff4301] hover:bg-[#e63d01] text-white font-bold py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <FiFilter /> Aplicar Filtros
            </button>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Órdenes Generadas</h2>
            <div className="flex gap-4 text-slate-500">
              <button className="hover:text-slate-800 transition-colors"><FiDownload size={20} /></button>
              <button className="hover:text-slate-800 transition-colors"><FiPrinter size={20} /></button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#fcfdfe] border-b border-slate-100">
                <tr className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="px-6 py-4">Orden ID</th>
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Fecha Generación</th>
                  <th className="px-6 py-4 text-center">Estado Cliente</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-sm text-slate-700">{order.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{order.producto}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{order.cliente}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{order.fecha}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.estado} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[#ff4301] border border-[#ff4301] hover:bg-[#ff4301] hover:text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all">
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER / PAGINATION */}
          <div className="p-4 bg-[#fcfdfe] flex justify-between items-center border-t border-slate-100">
            <span className="text-xs text-slate-400 font-medium">Mostrando 5 de 1,284 registros</span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Anterior</button>
              <div className="flex gap-1">
                {[1, 2, 3].map((p) => (
                  <button key={p} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === 1 ? 'bg-[#ff4301] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    {p}
                  </button>
                ))}
              </div>
              <button className="px-3 py-1 text-xs font-bold text-slate-800 hover:text-black transition-colors border border-slate-200 rounded-lg">Siguiente</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- Componentes Atómicos ---

const StatCard = ({ label, value, subtext, icon, iconBg }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[10px] font-bold text-slate-400 tracking-widest mb-2">{label}</p>
        <h3 className="text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">{value}</h3>
      </div>
      <div className={`${iconBg} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
    <div className="text-[11px] border-t border-slate-50 pt-3 mt-1">
      {subtext}
    </div>
  </div>
);

const FilterSelect = ({ label, options }: { label: string, options: string[] }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
    <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg focus:ring-orange-500 block w-full p-2.5 outline-none appearance-none cursor-pointer">
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const StatusBadge = ({ status }: { status: Order['estado'] }) => {
  const styles = {
    'Revisión Operador': 'bg-blue-100 text-blue-700',
    'Aceptado': 'bg-green-100 text-green-700',
    'Rechazado': 'bg-red-100 text-red-700'
  };

  return (
    <span className={`mx-auto block w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${styles[status]}`}>
      {status}
    </span>
  );
};