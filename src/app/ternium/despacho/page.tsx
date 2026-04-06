'use client';

import { useRouter } from 'next/navigation';
import { useDespachoOrders } from '@/hooks/despacho/useDespachoOrders';
import LoadingSpinner from '@/components/LoadingSpinner';
import { type ShippingInfoStatus } from '@/types/despacho';

export default function DespachoPage() {
  const router = useRouter();
  const { orders, loading, error, filters, pagination, updateFilters, updatePage } =
    useDespachoOrders();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10">
        <LoadingSpinner size="large" message="Cargando órdenes..." fullScreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans text-slate-700">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight">
            Logística y Despacho
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Gestiona la salida y entrega de órdenes aprobadas para despacho.
          </p>
        </header>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                ESTADO DE ENVÍO
              </label>
              <select
                className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg focus:ring-orange-500 block w-full p-2.5 outline-none appearance-none cursor-pointer"
                value={filters.shippingStatus}
                onChange={(e) =>
                  updateFilters({ shippingStatus: e.target.value as ShippingInfoStatus | 'Todos' })
                }
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Aceptado">Aceptado</option>
                <option value="Rechazado">Rechazado</option>
                <option value="Todos">Todos</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => updateFilters({ shippingStatus: 'Pendiente' })}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 px-4 rounded-lg transition-colors text-sm"
              >
                Restablecer
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">ÓRDENES DE DESPACHO</h2>
            <span className="text-xs text-slate-400 font-medium">
              {pagination.totalItems} órdenes
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#fcfdfe] border-b border-slate-100">
                <tr className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="px-6 py-4">ORDEN ID</th>
                  <th className="px-6 py-4">PRODUCTO (PT)</th>
                  <th className="px-6 py-4">CLIENTE</th>
                  <th className="px-6 py-4">FECHA APROBACIÓN</th>
                  <th className="px-6 py-4 text-center">ESTADO</th>
                  <th className="px-6 py-4 text-right">ACCIÓN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No hay órdenes en este estado
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const isPending = order.shipping_info?.status === 'Pendiente';
                    const approvedAt = order.dispatch_validation?.approved_at;
                    return (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
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
                          {approvedAt
                            ? new Date(approvedAt).toLocaleDateString('es-MX', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <ShippingStatusBadge status={order.shipping_info?.status ?? null} />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isPending ? (
                            <button
                              onClick={() =>
                                router.push(`/ternium/despacho/gestionar/${order.id}`)
                              }
                              className="text-[#ff4301] border border-[#ff4301] hover:bg-[#ff4301] hover:text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                            >
                              Gestionar Entrega
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                router.push(`/ternium/despacho/orden/${order.id}`)
                              }
                              className="text-slate-500 border border-slate-300 hover:bg-slate-100 px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                            >
                              Ver Detalle
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-4 bg-[#fcfdfe] flex justify-between items-center border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">
                Mostrando {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}–
                {Math.min(
                  pagination.currentPage * pagination.itemsPerPage,
                  pagination.totalItems
                )}{' '}
                de {pagination.totalItems} registros
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updatePage(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 text-xs font-bold text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          ? 'bg-[#ff4301] text-white shadow-md'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => updatePage(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 text-xs font-bold text-slate-800 hover:text-black border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

function ShippingStatusBadge({ status }: { status: string | null }) {
  const map: Record<string, { label: string; classes: string }> = {
    Pendiente: { label: 'Pendiente',  classes: 'bg-yellow-100 text-yellow-700' },
    Aceptado:  { label: 'Entregado',  classes: 'bg-green-100 text-green-700' },
    Rechazado: { label: 'Rechazado',  classes: 'bg-red-100 text-red-700' },
  };

  const cfg = status ? (map[status] ?? map['Pendiente']) : map['Pendiente'];

  return (
    <span className={`inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}
