'use client';

import { useRouter } from 'next/navigation';
import { useOperacionesOrders } from '@/hooks/operaciones/useOperacionesOrders';
import LoadingSpinner from '@/components/LoadingSpinner';
import { type ExecutionDetailsStatus } from '@/types/operaciones';
import { useRoleGuard } from '@/hooks/useRoleGuard';

export default function OperacionesPage() {
  useRoleGuard('/ternium/operaciones');
  const router = useRouter();
  const { orders, loading, error, filters, pagination, clientOptions, updateFilters, updatePage } =
    useOperacionesOrders();

  const getResponsibleName = (order: (typeof orders)[number]) => {
    const user = order.programing_instructions?.responsible_user;
    if (!user) return '—';
    return `${user.name} ${user.second_name}`.trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f8fafc] to-[#edf0f7] p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner size="large" message="Cargando operaciones..." fullScreen />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f8fafc] to-[#edf0f7] p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f8fafc] to-[#edf0f7] p-6 lg:p-10 font-sans text-slate-700">
      <div className="max-w-7xl mx-auto">

        <header className="mb-8">
          <div className="inline-flex items-center gap-1.5 bg-[#ff4301]/10 text-[#ff4301] text-[11px] font-bold px-3 py-1 rounded-full mb-3 border border-[#ff4301]/20">
            <span className="w-1.5 h-1.5 bg-[#ff4301] rounded-full" />
            MÓDULO OPERATIVO
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Operaciones</h1>
          <p className="text-slate-500 mt-1.5 max-w-2xl">
            Control de planta y seguimiento de órdenes en proceso de ejecución.
          </p>
        </header>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_2px_16px_rgba(15,23,42,0.06)] mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                ESTADO ASIGNACIÓN
              </label>
              <select
                className="bg-slate-50/80 border border-slate-200 text-slate-600 text-sm rounded-xl focus:ring-2 focus:ring-[#ff4301]/20 focus:border-[#ff4301]/40 block w-full p-2.5 outline-none appearance-none cursor-pointer transition-all"
                value={filters.assignmentStatus}
                onChange={(e) => updateFilters({ assignmentStatus: e.target.value as typeof filters.assignmentStatus })}
              >
                <option value="Todos">Todos</option>
                <option value="Asignado">Asignado</option>
                <option value="Sin asignar">Sin asignar</option>
                <option value="Reasignado">Reasignado</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                CLIENTE
              </label>
              <select
                className="bg-slate-50/80 border border-slate-200 text-slate-600 text-sm rounded-xl focus:ring-2 focus:ring-[#ff4301]/20 focus:border-[#ff4301]/40 block w-full p-2.5 outline-none appearance-none cursor-pointer transition-all"
                value={filters.client}
                onChange={(e) => updateFilters({ client: e.target.value })}
              >
                {clientOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => updateFilters({ assignmentStatus: 'Todos', client: 'Todos los clientes' })}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2.5 px-4 rounded-xl transition-colors border border-slate-200 hover:border-slate-300 text-sm"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_rgba(15,23,42,0.08),0_1px_4px_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <h2 className="font-bold text-slate-800 text-base">ÓRDENES EN OPERACIÓN</h2>
              <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {orders.length}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              {pagination.totalItems} total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gradient-to-r from-slate-50 to-[#f8fafc] border-b border-slate-100">
                <tr className="text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
                  <th scope="col" className="px-6 py-4">ORDEN ID</th>
                  <th scope="col" className="px-6 py-4">PRODUCTO</th>
                  <th scope="col" className="px-6 py-4">CLIENTE</th>
                  <th scope="col" className="px-6 py-4">RESPONSABLE</th>
                  <th scope="col" className="px-6 py-4">PESO MÍN. (TON)</th>
                  <th scope="col" className="px-6 py-4 text-center">ESTADO</th>
                  <th scope="col" className="px-6 py-4 text-right">ACCIÓN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No hay órdenes en operación
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#fff6f2] transition-colors duration-150 group">
                      <td className="px-6 py-4 font-bold text-sm text-slate-700">
                        ORD-{order.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {order.product?.pt || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {order.client?.name || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {getResponsibleName(order)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {order.specs?.minimum_shipping_weight ?? '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <ExecutionStatusBadge status={order.execution_details?.status ?? null} />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => router.push(`/ternium/operaciones/orden/${order.id}`)}
                          className="text-[#ff4301] bg-[#ff4301]/5 border border-[#ff4301]/30 hover:bg-[#ff4301] hover:text-white hover:shadow-[0_4px_12px_rgba(255,67,1,0.3)] px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
                        >
                          Ver Orden
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="p-4 bg-gradient-to-r from-[#fafbfc] to-white flex justify-between items-center border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">
                Mostrando {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}–
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} de{' '}
                {pagination.totalItems} registros
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updatePage(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => updatePage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        pagination.currentPage === p
                          ? 'bg-gradient-to-br from-[#ff4301] to-[#e03200] text-white shadow-[0_2px_8px_rgba(255,67,1,0.4)]'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-[#ff4301]/30 hover:text-[#ff4301]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => updatePage(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 text-xs font-bold text-slate-800 hover:text-black transition-colors border border-slate-200 rounded-lg hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function ExecutionStatusBadge({ status }: { status: ExecutionDetailsStatus | null }) {
  const map: Record<ExecutionDetailsStatus, { label: string; classes: string }> = {
    Pendiente: { label: 'Pendiente', classes: 'bg-slate-100 text-slate-600' },
    Aceptado:  { label: 'Aceptado',  classes: 'bg-green-100 text-green-700' },
    Rechazado: { label: 'Rechazado', classes: 'bg-red-100 text-red-700' },
  };

  const cfg = status ? map[status] : map['Pendiente'];

  return (
    <span className={`inline-flex px-3 py-1.5 text-[11px] font-semibold rounded-lg ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}
