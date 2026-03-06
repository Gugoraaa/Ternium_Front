import { FaSearch, FaFilter, FaFileExport } from 'react-icons/fa';

/**
 * Componente visual de filtros.
 */
export default function UsuariosFilters() {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 mb-6">
      <div className="relative flex-1">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, correo o rol..."
          className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
        />
      </div>
      <button className="flex items-center gap-2 px-6 py-3 bg-[#1a2b49] text-white rounded-xl font-bold text-sm hover:bg-[#253a61] transition-colors">
        <FaFilter size={14} /> Filtros
      </button>
      <button className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">
        <FaFileExport size={14} /> Exportar
      </button>
    </div>
  );
}
