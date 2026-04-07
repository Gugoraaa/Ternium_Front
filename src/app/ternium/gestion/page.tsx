'use client';
import {
  FiSearch, FiDownload, FiPrinter, FiPlus
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/hooks/orders/useOrders';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusPill from '@/components/StatusPill';
import { useRoleGuard } from '@/hooks/useRoleGuard';


export default function DashboardOrdenes() {
  useRoleGuard('/ternium/gestion');
  const router = useRouter();
  const { orders, loading, filteredOrders, filters, setFilters, resetFilters } = useOrders();

  const uniqueStates = ['Todos los Estados', ...new Set(orders.map(order => order.status))];
  const uniqueClients = ['Todos los Clientes', ...new Set(orders.map(order => order.cliente))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f8fafc] to-[#edf0f7] p-6 lg:p-10 font-sans text-slate-700">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner size="large" message="Cargando órdenes..." fullScreen />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f8fafc] to-[#edf0f7] p-6 lg:p-10 font-sans text-slate-700">
      <div className="max-w-7xl mx-auto">

        <header className="mb-8 flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#ff4301]/10 text-[#ff4301] text-[11px] font-bold px-3 py-1 rounded-full mb-3 border border-[#ff4301]/20">
              <span className="w-1.5 h-1.5 bg-[#ff4301] rounded-full" />
              GESTIÓN DE ÓRDENES
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Seguimiento de Órdenes</h1>
            <p className="text-slate-500 mt-1.5 max-w-2xl">
              Panel de control operativo para el monitoreo de propuestas, validación de clientes y cierre de ciclo de gestión.
            </p>
          </div>
          <button
            onClick={() => router.push('/ternium/gestion/crearpedido')}
            className="bg-gradient-to-r from-[#ff4301] to-[#e63d01] hover:from-[#e63d01] hover:to-[#cc3500] text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-[0_4px_16px_rgba(255,67,1,0.35)] hover:shadow-[0_6px_24px_rgba(255,67,1,0.45)] transition-all hover:-translate-y-0.5 active:scale-95"
          >
            <FiPlus size={18} />
            Crear Nueva Orden
          </button>
        </header>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_2px_16px_rgba(15,23,42,0.06)] mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <FilterSelect
              label="ESTADO"
              options={uniqueStates}
              value={filters.estado}
              onChange={(value) => setFilters({ estado: value })}
            />
            <FilterSelect
              label="CLIENTE"
              options={uniqueClients}
              value={filters.cliente}
              onChange={(value) => setFilters({ cliente: value })}
            />
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BUSCAR POR ID</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ej: ORD-8823"
                  value={filters.searchId}
                  onChange={(e) => setFilters({ searchId: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#ff4301]/20 focus:border-[#ff4301]/40 transition-all outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={resetFilters}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2.5 px-4 rounded-xl transition-colors border border-slate-200 hover:border-slate-300 text-sm"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_rgba(15,23,42,0.08),0_1px_4px_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <h2 className="font-bold text-slate-800 text-base">Órdenes Generadas</h2>
              <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {filteredOrders.length}
              </span>
            </div>
            <div className="flex gap-1 text-slate-400">
              <button aria-label="Descargar órdenes" className="hover:text-slate-700 transition-colors p-1.5 hover:bg-slate-100 rounded-lg">
                <FiDownload size={18} />
              </button>
              <button aria-label="Imprimir órdenes" className="hover:text-slate-700 transition-colors p-1.5 hover:bg-slate-100 rounded-lg">
                <FiPrinter size={18} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gradient-to-r from-slate-50 to-[#f8fafc] border-b border-slate-100">
                <tr className="text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
                  <th scope="col" className="px-6 py-4">Orden ID</th>
                  <th scope="col" className="px-6 py-4">Producto</th>
                  <th scope="col" className="px-6 py-4">Cliente</th>
                  <th scope="col" className="px-6 py-4">Fecha Generación</th>
                  <th scope="col" className="px-6 py-4 text-center">Estado Cliente</th>
                  <th scope="col" className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#fff6f2] transition-colors duration-150 group">
                    <td className="px-6 py-4 font-bold text-sm text-slate-700">{order.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{order.producto}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{order.cliente}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {order.fecha ? new Date(order.fecha).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 w-fit">
                      <StatusPill status={order.status || ''} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => router.push(`/ternium/gestion/orden/${order.id}`)}
                        className="text-[#ff4301] bg-[#ff4301]/5 border border-[#ff4301]/30 hover:bg-[#ff4301] hover:text-white hover:shadow-[0_4px_12px_rgba(255,67,1,0.3)] px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-gradient-to-r from-[#fafbfc] to-white flex justify-between items-center border-t border-slate-100">
            <span aria-live="polite" className="text-xs text-slate-400 font-medium">
              Mostrando {filteredOrders.length} de {orders.length} registros
            </span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Anterior</button>
              <div className="flex gap-1">
                {[1, 2, 3].map((p) => (
                  <button key={p} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === 1 ? 'bg-gradient-to-br from-[#ff4301] to-[#e03200] text-white shadow-[0_2px_8px_rgba(255,67,1,0.4)]' : 'bg-white border border-slate-200 text-slate-600 hover:border-[#ff4301]/30 hover:text-[#ff4301]'}`}>
                    {p}
                  </button>
                ))}
              </div>
              <button className="px-3 py-1 text-xs font-bold text-slate-800 hover:text-black transition-colors border border-slate-200 rounded-lg hover:border-slate-300">Siguiente</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}


const FilterSelect = ({ label, options, value, onChange }: {
  label: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
}) => {
  const id = `filter-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
      <select
        id={id}
        aria-label={label}
        className="bg-slate-50/80 border border-slate-200 text-slate-600 text-sm rounded-xl focus:ring-2 focus:ring-[#ff4301]/20 focus:border-[#ff4301]/40 block w-full p-2.5 outline-none appearance-none cursor-pointer transition-all"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
};
