import { FaSearch } from 'react-icons/fa';

interface UsuariosFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function UsuariosFilters({ searchQuery, onSearchChange }: UsuariosFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 mb-6">
      <div className="relative flex-1">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nombre, correo o rol..."
          className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
        />
      </div>
    </div>
  );
}
