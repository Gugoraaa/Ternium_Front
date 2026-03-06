import { FaPlus } from 'react-icons/fa';

interface UsuariosHeaderProps {
  onCreateUser: () => void;
}

/**
 * Componente de presentacion del encabezado.
 */
export default function UsuariosHeader({ onCreateUser }: UsuariosHeaderProps) {
  return (
    <header className="flex justify-between items-start mb-8">
      <div>
        <h1 className="text-3xl font-black text-[#1a2b49] tracking-tight">
          Gestión de Accesos y Usuarios
        </h1>
        <p className="text-gray-400 mt-1">
          Administre los permisos, roles y accesos de los usuarios del portal operativo.
        </p>
      </div>
      <button
        onClick={onCreateUser}
        className="bg-[#ff3d00] hover:bg-[#e63600] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
      >
        <FaPlus size={14} /> Crear Nueva Cuenta
      </button>
    </header>
  );
}
