import { FaEllipsisV } from 'react-icons/fa';

interface UsuariosTableProps {
  usuarios: any[];
}

/**
 * Tabla de usuarios donde se muestran los datos de los usuarios
 */
export default function UsuariosTable({ usuarios }: UsuariosTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100">
            <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Usuario</th>
            <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
              Rol Asignado
            </th>
            <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
              Fecha de Registro
            </th>
            <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
              Estado
            </th>
            <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {usuarios.map((user) => (
            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="p-5 flex items-center gap-4">
                <div>
                  <div className="font-bold text-slate-900">
                    {user.name} {user.second_name}
                  </div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                </div>
              </td>
              <td className="p-5">
                <span
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${getRoleStyle(user.roles?.name)}`}
                >
                  {user.roles?.name || 'Sin Rol'}
                </span>
              </td>
              <td className="p-5 text-sm text-gray-500">
                {new Date(user.created_at).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>
              <td className="p-5">
                <span
                  className={`flex items-center gap-1.5 text-xs font-bold ${user.active === true ? 'text-green-500' : 'text-gray-400'}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${user.active === true ? 'bg-green-500' : 'bg-gray-400'}`}
                  ></span>
                  {user.active === true ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="p-5 text-center">
                <button className="text-gray-300 hover:text-gray-600 transition-colors">
                  <FaEllipsisV />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Función que devuelve el estilo del rol dependiendo del rol
function getRoleStyle(role: string) {
  switch (role) {
    case 'Operaciones':
      return 'bg-blue-50 border-blue-100 text-blue-500';
    case 'Logística':
      return 'bg-orange-50 border-orange-100 text-orange-500';
    case 'Gestión':
      return 'bg-emerald-50 border-emerald-100 text-emerald-500';
    case 'Programación':
      return 'bg-pink-50 border-pink-100 text-pink-500';
    default:
      return 'bg-purple-50 border-purple-100 text-purple-500';
  }
}
