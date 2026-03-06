'use client';

import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRolesAndClients } from './hooks/useRolesAndClients';
import { useCreateUsuarioForm } from './hooks/useCreateUsuarioForm';
import CrearUsuarioHeader from './components/CrearUsuarioHeader';
import DatosGeneralesSection from './components/DatosGeneralesSection';
import FormActions from './components/FormActions';

/**
 * Vista contenedora de Crear Usuario.
 * Aquí solo se conectan hooks + UI.
 */
export default function CrearUsuarioView() {
  const router = useRouter();
  const { roles, clients, loading } = useRolesAndClients();
  const { userCategory, setUserCategory, formData, handleInputChange, handleSubmit } =
    useCreateUsuarioForm();

  if (loading) {
    return <LoadingSpinner size="large" message="Cargando datos del formulario..." fullScreen />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-slate-50">
        <div className="p-6 md:p-12 font-sans text-slate-600 w-full">
          <div className="w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <CrearUsuarioHeader />

            <div className="p-8 space-y-12">
              <DatosGeneralesSection
                formData={formData}
                userCategory={userCategory}
                roles={roles}
                clients={clients}
                onInputChange={handleInputChange}
                onCategoryChange={setUserCategory}
              />
              <FormActions onCancel={() => router.push('/ternium/usuarios')} />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
