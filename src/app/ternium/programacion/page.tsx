'use client';

import { useProgrammingData } from '@/hooks/programacion/useProgrammingData';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useRouter } from 'next/navigation';
import type { OrderWithProgramming, ProgramingStatus } from '@/types/programacion';

export default function ProgramacionPage() {
  useRoleGuard('/ternium/programacion');
  const router = useRouter();
  const {
    orders,
    loading,
    error,
    filters,
    pagination,
    clientOptions,
    responsibleOptions,
    updateFilters,
    updatePage
  } = useProgrammingData();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getResponsibleName = (order: OrderWithProgramming) => {
    const responsibleUser = order.programing_instruction?.responsible_user;
    if (responsibleUser?.name) {
      return `${responsibleUser.name} ${responsibleUser.second_name ?? ''}`.trim();
    }
    return '—';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f8fafc] to-[#edf0f7] p-6 lg:p-10 font-sans text-slate-700">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner size="large" message="Cargando programación..." fullScreen />
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

        <header className="mb-8 flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#ff4301]/10 text-[#ff4301] text-[11px] font-bold px-3 py-1 rounded-full mb-3 border border-[#ff4301]/20">
              <span className="w-1.5 h-1.5 bg-[#ff4301] rounded-full" />
              PROGRAMACIÓN
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Programación de Órdenes</h1>
            <p className="text-slate-500 mt-1.5 max-w-2xl">
              Gestione y asigne órdenes aprobadas para ejecución en planta.
            </p>
          </div>
        </header>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_2px_16px_rgba(15,23,42,0.06)] mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ESTADO ASIGNACIÓN</label>
              <select
                className="bg-slate-50/80 border border-slate-200 text-slate-600 text-sm rounded-xl focus:ring-2 focus:ring-[#ff4301]/20 focus:border-[#ff4301]/40 block w-full p-2.5 outline-none appearance-none cursor-pointer transition-all"
                value={filters.assignmentStatus}
                onChange={(e) =>
                  updateFilters({ assignmentStatus: e.target.value as ProgramingStatus | 'Todos' })
                }
              >
                <option value="Todos">Todos</option>
                <option value="Sin asignar">Sin asignar</option>
                <option value="Asignado">Asignado</option>
                <option value="Reasignado">Reasignado</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CLIENTE</label>
              <select
                className="bg-slate-50/80 border border-slate-200 text-slate-600 text-sm rounded-xl focus:ring-2 focus:ring-[#ff4301]/20 focus:border-[#ff4301]/40 block w-full p-2.5 outline-none appearance-none cursor-pointer transition-all"
                value={filters.client}
                onChange={(e) => updateFilters({ client: e.target.value })}
              >
                {clientOptions.map((clientName) => (
                  <option key={clientName} value={clientName}>
                    {clientName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RESPONSABLE</label>
              <select
                className="bg-slate-50/80 border border-slate-200 text-slate-600 text-sm rounded-xl focus:ring-2 focus:ring-[#ff4301]/20 focus:border-[#ff4301]/40 block w-full p-2.5 outline-none appearance-none cursor-pointer transition-all"
                value={filters.responsible}
                onChange={(e) => updateFilters({ responsible: e.target.value })}
              >
                <option value="Cualquiera">Cualquiera</option>
                {responsibleOptions.map((responsible) => (
                  <option key={responsible.id} value={responsible.id}>
                    {responsible.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_rgba(15,23,42,0.08),0_1px_4px_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <h2 className="font-bold text-slate-800 text-base">LISTADO DE ÓRDENES</h2>
              <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pagination.totalItems}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gradient-to-r from-slate-50 to-[#f8fafc] border-b border-slate-100">
                <tr className="text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
                  <th scope="col" className="px-6 py-4">ORDEN ID</th>
                  <th scope="col" className="px-6 py-4">PRODUCTO</th>
                  <th scope="col" className="px-6 py-4">CLIENTE</th>
                  <th scope="col" className="px-6 py-4">ESTADO ADMIN</th>
                  <th scope="col" className="px-6 py-4">RESPONSABLE</th>
                  <th scope="col" className="px-6 py-4">FECHA ASIGNADA</th>
                  <th scope="col" className="px-6 py-4">ESTADO ASIGNACIÓN</th>
                  <th scope="col" className="px-6 py-4 text-right">ACCIÓN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No hay órdenes que coincidan con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#fff6f2] transition-colors duration-150 group">
                      <td className="px-6 py-4 font-bold text-sm text-slate-700">
                        ORD-{order.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {order.product?.master || order.product?.pt || 'Producto'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {order.client?.name || 'Cliente'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {order.status}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {getResponsibleName(order)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {formatDate(order.programing_instruction?.assigned_date || null)}
                      </td>
                      <td className="px-6 py-4">
                        <AssignmentStatusBadge status={order.programing_instruction?.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => router.push(`/ternium/programacion/editar/${order.id}`)}
                          className="text-[#ff4301] bg-[#ff4301]/5 border border-[#ff4301]/30 hover:bg-[#ff4301] hover:text-white hover:shadow-[0_4px_12px_rgba(255,67,1,0.3)] px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
                        >
                          {order.programing_instruction?.status === 'Sin asignar' || !order.programing_instruction?.status ? 'Asignar' : 'Editar'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-gradient-to-r from-[#fafbfc] to-white flex justify-between items-center border-t border-slate-100">
            <span className="text-xs text-slate-400 font-medium">
              {pagination.totalItems === 0
                ? 'Mostrando 0 de 0 registros'
                : `Mostrando ${((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-${Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    pagination.totalItems
                  )} de ${pagination.totalItems} registros`}
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
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => updatePage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      pagination.currentPage === pageNum
                        ? 'bg-gradient-to-br from-[#ff4301] to-[#e03200] text-white shadow-[0_2px_8px_rgba(255,67,1,0.4)]'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-[#ff4301]/30 hover:text-[#ff4301]'
                    }`}
                  >
                    {pageNum}
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
        </div>
      </div>
    </div>
  );
}

function AssignmentStatusBadge({ status }: { status: string | null | undefined }) {
  const map: Record<string, { classes: string }> = {
    'Sin asignar': { classes: 'bg-slate-100 text-slate-600 border border-slate-200' },
    'Asignado':    { classes: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
    'Reasignado':  { classes: 'bg-amber-50 text-amber-700 border border-amber-100' },
  };

  const label = status || 'Sin asignar';
  const cfg = map[label] ?? map['Sin asignar'];

  return (
    <span className={`inline-flex px-3 py-1.5 text-[11px] font-semibold rounded-lg ${cfg.classes}`}>
      {label}
    </span>
  );
}
