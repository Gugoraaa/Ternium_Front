'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useUsuarioData } from '@/hooks/usuarios/useUsuarioData';
import UsuariosHeader from '@/components/usuarios/UsuariosHeader';
import UsuariosFilters from '@/components/usuarios/UsuariosFilters';
import UsuariosTable from '@/components/usuarios/UsuariosTable';

export default function UsuariosPage() {
  useRoleGuard('/ternium/usuarios');
  const { usuarios, loading, toggleActive, changeRole, offboardUser } = useUsuarioData();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return <LoadingSpinner size="large" message="Cargando usuarios..." fullScreen />;
  }

  const filteredUsuarios = searchQuery.trim()
    ? usuarios.filter((u) => {
        const q = searchQuery.toLowerCase();
        const fullName = `${u.name ?? ''} ${u.second_name ?? ''}`.toLowerCase();
        const email = (u.email ?? '').toLowerCase();
        const role = (u.roles?.name ?? '').toLowerCase();
        return fullName.includes(q) || email.includes(q) || role.includes(q);
      })
    : usuarios;

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans text-slate-700">
      <UsuariosHeader onCreateUser={() => router.push('/ternium/usuarios/crearusuario')} />
      <UsuariosFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <UsuariosTable
        usuarios={filteredUsuarios}
        toggleActive={toggleActive}
        changeRole={changeRole}
        offboardUser={offboardUser}
      />
    </div>
  );
}
