'use client';

import { useProgrammingData } from '@/hooks/programacion/useProgrammingData';
import { FiDownload} from 'react-icons/fi';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ProgramacionPage() {
  const {
    orders,
    loading,
    error,
    filters,
    pagination,
    updateFilters,
    updatePage,
    assignOrder
  } = useProgrammingData();

  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getResponsibleName = (order: any) => {
    if (order.worker?.name) {
      const nameParts = order.worker.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = order.worker.second_name || (nameParts[1] || '');
      return lastName ? `${firstName} ${lastName}` : firstName;
    }
    return '—';
  };

  

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans text-slate-700">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner size="large" message="Cargando programación..." fullScreen />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans text-slate-700">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight">Programación de Órdenes</h1>
            <p className="text-slate-500 mt-2 max-w-2xl">
              Gestione y asigne órdenes aprobadas para ejecución en planta.
            </p>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ESTADO ASIGNACIÓN</label>
              <select
                className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg focus:ring-orange-500 block w-full p-2.5 outline-none appearance-none cursor-pointer"
                value={filters.assignmentStatus}
                onChange={(e) => updateFilters({ assignmentStatus: e.target.value as any })}
              >
                <option value="Todos">Todos</option>
                <option value="Sin asignar">Sin asignar</option>
                <option value="Aceptado">Asignado</option>
                <option value="Reasignado">Reasignado</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CLIENTE</label>
              <select
                className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg focus:ring-orange-500 block w-full p-2.5 outline-none appearance-none cursor-pointer"
                value={filters.client}
                onChange={(e) => updateFilters({ client: e.target.value })}
              >
                <option value="Todos los clientes">Todos los clientes</option>
                <option value="Cliente A">Cliente A</option>
                <option value="Cliente B">Cliente B</option>
                <option value="Cliente C">Cliente C</option>
                <option value="Constructora X">Constructora X</option>
                <option value="Industrial Z">Industrial Z</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RESPONSABLE</label>
              <select
                className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg focus:ring-orange-500 block w-full p-2.5 outline-none appearance-none cursor-pointer"
                value={filters.responsible}
                onChange={(e) => updateFilters({ responsible: e.target.value })}
              >
                <option value="Cualquiera">Cualquiera</option>
                <option value="G. Sinchez">G. Sinchez</option>
                <option value="M. Luna">M. Luna</option>
                <option value="J. Rodriguez">J. Rodriguez</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">LISTADO DE ÓRDENES</h2>
            <div className="flex gap-4 text-slate-500">
              <button className="hover:text-slate-800 transition-colors">
                <FiDownload size={20} />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#fcfdfe] border-b border-slate-100">
                <tr className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="px-6 py-4">ORDEN ID</th>
                  <th className="px-6 py-4">PRODUCTO</th>
                  <th className="px-6 py-4">CLIENTE</th>
                  <th className="px-6 py-4">ESTADO ADMIN</th>
                  <th className="px-6 py-4">RESPONSABLE</th>
                  <th className="px-6 py-4">FECHA ASIGNADA</th>
                  <th className="px-6 py-4">ESTADO ASIGNACIÓN</th>
                  <th className="px-6 py-4 text-right">ACCIÓN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-sm text-slate-700">
                      ORD-{order.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {order.product?.master || 'Producto'}
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
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.programing_instruction?.status === 'Sin asignar' 
                          ? 'bg-slate-100 text-slate-700'
                          : order.programing_instruction?.status === 'Aceptado'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.programing_instruction?.status || 'Sin asignar'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => window.location.href = `/ternium/programacion/editar/${order.id}`}
                        className="text-[#ff4301] border border-[#ff4301] hover:bg-[#ff4301] hover:text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                      >
                        {order.programing_instruction?.status === 'Sin asignar' ? 'Asignar' : 'Editar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 bg-[#fcfdfe] flex justify-between items-center border-t border-slate-100">
            <span className="text-xs text-slate-400 font-medium">
              Mostrando {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} 
              de {pagination.totalItems} registros
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
                        ? 'bg-[#ff4301] text-white shadow-md'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => updatePage(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 text-xs font-bold text-slate-800 hover:text-black transition-colors border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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