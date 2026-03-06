'use client'

// Importando librerías necesarias
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useUsuarioData } from '@/hooks/usuarios/useUsuarioData'; // Importamos el hook useUsuarioData que ya habíamos creado
import UsuariosHeader from '@/components/usuarios/UsuariosHeader';
import UsuariosFilters from '@/components/usuarios/UsuariosFilters';
import UsuariosTable from '@/components/usuarios/UsuariosTable';


// Definición de la página de usuarios
export default function UsuariosPage() {
  const { usuarios, loading } = useUsuarioData();
  const router = useRouter();

  if (loading) {
    return <LoadingSpinner size="large" message="Cargando usuarios..." fullScreen />;
  }


  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans text-slate-700">
      <UsuariosHeader onCreateUser={() => router.push('/ternium/usuarios/crearusuario')} />
      <UsuariosFilters />
      <UsuariosTable usuarios={usuarios} />
    </div>
  );
}