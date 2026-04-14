'use client';

import { useState, useEffect, useRef } from 'react';
import { FaEllipsisV } from 'react-icons/fa';
import { FiCheck, FiX } from 'react-icons/fi';
import { createClient } from '@/lib/supabase/client';
import type { UsuarioListItem } from '@/hooks/usuarios/useUsuarioData';

const supabase = createClient();

const ROLE_LABELS: Record<string, string> = {
  user_admin:          'Administrador',
  admin:               'Super Admin',
  order_manager:       'Gestión de Órdenes',
  scheduler:           'Programación',
  operations_manager:  'Operaciones',
  client_manager:      'Clientes',
  order_controller:    'Control Despacho',
  dispatcher:          'Despacho',
};

function getRoleStyle(role: string) {
  switch (role) {
    case 'user_admin':         return 'bg-slate-100 border-slate-200 text-slate-600';
    case 'admin':              return 'bg-red-50 border-red-100 text-red-600';
    case 'order_manager':      return 'bg-emerald-50 border-emerald-100 text-emerald-600';
    case 'scheduler':          return 'bg-pink-50 border-pink-100 text-pink-600';
    case 'operations_manager': return 'bg-blue-50 border-blue-100 text-blue-600';
    case 'client_manager':     return 'bg-orange-50 border-orange-100 text-orange-600';
    case 'order_controller':   return 'bg-purple-50 border-purple-100 text-purple-600';
    case 'dispatcher':         return 'bg-amber-50 border-amber-100 text-amber-600';
    default:                   return 'bg-slate-100 border-slate-200 text-slate-500';
  }
}

interface UsuariosTableProps {
  usuarios: UsuarioListItem[];
  toggleActive: (userId: string, currentActive: boolean, isOffboarded: boolean) => Promise<void>;
  changeRole: (userId: string, newRoleId: number) => Promise<void>;
  offboardUser: (userId: string) => Promise<void>;
}

type MenuMode = 'menu' | 'changeRole' | 'confirmDelete';

export default function UsuariosTable({ usuarios, toggleActive, changeRole, offboardUser }: UsuariosTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuMode, setMenuMode] = useState<MenuMode>('menu');
  const [selectedRoleId, setSelectedRoleId] = useState<number | ''>('');
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  function closeMenu() {
    setOpenMenuId(null);
    setMenuMode('menu');
    setSelectedRoleId('');
  }

  // Cargar roles disponibles
  useEffect(() => {
    supabase.from('roles').select('id, name').then(({ data }) => {
      if (data) setRoles(data);
    });
  }, []);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    if (!openMenuId) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  function openMenu(userId: string) {
    setOpenMenuId(userId);
    setMenuMode('menu');
    setSelectedRoleId('');
  }

  async function handleToggleActive(userId: string, active: boolean, isOffboarded: boolean) {
    closeMenu();
    await toggleActive(userId, active, isOffboarded);
  }

  async function handleChangeRole(userId: string) {
    if (!selectedRoleId) return;
    closeMenu();
    await changeRole(userId, Number(selectedRoleId));
  }

  async function handleOffboard(userId: string) {
    closeMenu();
    await offboardUser(userId);
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100">
            <th scope="col" className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Usuario</th>
            <th scope="col" className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Rol Asignado</th>
            <th scope="col" className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Fecha de Registro</th>
            <th scope="col" className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Estado</th>
            <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {usuarios.map((user) => {
            const roleName = user.roles?.name ?? '';
            const isOpen = openMenuId === user.id;
            const isOffboarded = Boolean(user.offboarded_at);
            const statusLabel = isOffboarded ? 'De baja' : user.active ? 'Activo' : 'Inactivo';
            const statusClasses = isOffboarded
              ? 'text-red-600'
              : user.active
                ? 'text-green-500'
                : 'text-gray-400';
            const statusDotClasses = isOffboarded
              ? 'bg-red-500'
              : user.active
                ? 'bg-green-500'
                : 'bg-gray-400';

            return (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                {/* Usuario */}
                <td className="p-5">
                  <div className="font-bold text-slate-900">{user.name} {user.second_name}</div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                </td>

                {/* Rol */}
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${getRoleStyle(roleName)}`}>
                    {(ROLE_LABELS[roleName] ?? roleName) || 'Sin Rol'}
                  </span>
                </td>

                {/* Fecha */}
                <td className="p-5 text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString('es-ES', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </td>

                {/* Estado */}
                <td className="p-5">
                  <span className={`flex items-center gap-1.5 text-xs font-bold ${statusClasses}`}>
                    <span className={`w-2 h-2 rounded-full ${statusDotClasses}`} />
                    {statusLabel}
                  </span>
                </td>

                {/* Acciones */}
                <td className="p-5 text-center">
                  <div className="relative inline-block" ref={isOpen ? menuRef : null}>
                    <button
                      aria-label={`Acciones para ${user.name} ${user.second_name}`}
                      aria-expanded={isOpen}
                      onClick={() => isOpen ? closeMenu() : openMenu(user.id)}
                      className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-slate-100 text-slate-700' : 'text-gray-300 hover:text-gray-600 hover:bg-slate-50'}`}
                    >
                      <FaEllipsisV aria-hidden="true" size={14} />
                    </button>

                    {isOpen && (
                      <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl border border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.12)] z-50 overflow-hidden">

                        {menuMode === 'menu' && (
                          <>
                            {/* Activar / Desactivar */}
                            {!isOffboarded && (
                              <button
                                onClick={() => handleToggleActive(user.id, user.active, isOffboarded)}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-gray-400' : 'bg-green-500'}`} />
                                {user.active ? 'Desactivar usuario' : 'Activar usuario'}
                              </button>
                            )}

                            {/* Cambiar rol */}
                            <button
                              onClick={() => {
                                if (isOffboarded) return;
                                setMenuMode('changeRole');
                                setSelectedRoleId(user.roles?.id ?? '');
                              }}
                              disabled={isOffboarded}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 disabled:text-slate-300 disabled:bg-white disabled:cursor-not-allowed flex items-center gap-2.5 transition-colors"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                              Cambiar rol
                            </button>

                            {/* Separador + Baja segura */}
                            <div className="border-t border-slate-100 my-1" />
                            {isOffboarded ? (
                              <div className="w-full text-left px-4 py-2.5 text-sm text-slate-400 flex items-center gap-2.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                Usuario dado de baja
                              </div>
                            ) : (
                              <button
                                onClick={() => setMenuMode('confirmDelete')}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                Dar de baja
                              </button>
                            )}
                          </>
                        )}

                        {menuMode === 'changeRole' && (
                          <div className="p-3 flex flex-col gap-2">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cambiar rol</p>
                            <select
                              value={selectedRoleId}
                              onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-[#ff4301]/20 focus:border-[#ff4301]/40 outline-none"
                            >
                              <option value="">Seleccionar rol</option>
                              {roles.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {ROLE_LABELS[r.name] ?? r.name}
                                </option>
                              ))}
                            </select>
                            <div className="flex gap-2">
                              <button
                                onClick={closeMenu}
                                className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => handleChangeRole(user.id)}
                                disabled={!selectedRoleId}
                                className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-[#ff4301] text-white hover:bg-[#e63d01] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                Guardar
                              </button>
                            </div>
                          </div>
                        )}

                        {menuMode === 'confirmDelete' && (
                          <div className="p-3 flex flex-col gap-2">
                            <p className="text-sm font-semibold text-slate-800">¿Dar de baja a {user.name}?</p>
                            <p className="text-[11px] text-slate-400">Bloquea el acceso del usuario y conserva su historial operativo.</p>
                            <div className="flex gap-2">
                              <button
                                onClick={closeMenu}
                                className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
                              >
                                <FiX size={12} /> Cancelar
                              </button>
                              <button
                                onClick={() => handleOffboard(user.id)}
                                className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                              >
                                <FiCheck size={12} /> Confirmar
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
