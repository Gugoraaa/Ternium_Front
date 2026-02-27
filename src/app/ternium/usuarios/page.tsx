'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  FaPlus, FaSearch, FaFilter, FaFileExport, FaEllipsisV 
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function UsuariosPage() {
  const supabase = createClient();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUsuarios() {
      const { data, error } = await supabase
        .from('users') 
        .select(`
          *,
          roles (
            name
          )
        `);

      if (data) setUsuarios(data);

      console.log(data)
      setLoading(false);
    }
    fetchUsuarios();
  }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans text-slate-700">
      {/* Header */}
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1a2b49] tracking-tight">Gestión de Accesos y Usuarios</h1>
          <p className="text-gray-400 mt-1">Administre los permisos, roles y accesos de los usuarios del portal operativo.</p>
        </div>
        <button onClick={() => router.push('/ternium/usuarios/crearusuario')}className="bg-[#ff3d00] hover:bg-[#e63600] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95">
          <FaPlus size={14} /> Crear Nueva Cuenta
        </button>
      </header>

      {/* Barra de Búsqueda y Filtros */}
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

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Usuario</th>
              <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Rol Asignado</th>
              <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Fecha de Registro</th>
              <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Estado</th>
              <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {usuarios.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-5 flex items-center gap-4">
                  
                  <div>
                    <div className="font-bold text-slate-900">{user.name} {user.second_name}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>
                </td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${getRoleStyle(user.roles?.name)}`}>
                    {user.roles?.name || 'Sin Rol'}
                  </span>
                </td>
                <td className="p-5 text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="p-5">
                  <span className={`flex items-center gap-1.5 text-xs font-bold ${user.active === true ? 'text-green-500' : 'text-gray-400'}`}>
                    <span className={`w-2 h-2 rounded-full ${user.active === true ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    { user.active === true ? 'Activo' : 'Inactivo' }
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
    </div>
  );
}

function getRoleStyle(role: string) {
  switch (role) {
    case 'Operaciones': return 'bg-blue-50 border-blue-100 text-blue-500';
    case 'Logística': return 'bg-orange-50 border-orange-100 text-orange-500';
    case 'Gestión': return 'bg-emerald-50 border-emerald-100 text-emerald-500';
    case 'Programación': return 'bg-pink-50 border-pink-100 text-pink-500';
    default: return 'bg-purple-50 border-purple-100 text-purple-500';
  }
}