'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { createClient, createIsolatedClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { CreateUserFormData, UserCategory } from '@/types/crearUsuario';
import { INITIAL_FORM_DATA } from '@/types/crearUsuario';
import type { Role } from '@/types/crearUsuario';
import { normalizeRoleName } from '@/lib/permissions';

/**
 * Hook de formulario para la vista "Crear Usuario".
 * Maneja estado, validaciones y envío del formulario.
 */
export function useCreateUsuarioForm(roles: Role[] | null) {
  const [userCategory, setUserCategory] = useState<UserCategory>('employee');
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const isolatedSupabase = useMemo(() => createIsolatedClient(), []);
  const [formData, setFormData] = useState<CreateUserFormData>(INITIAL_FORM_DATA);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => clearTimeout(redirectTimerRef.current);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const field = e.target.dataset.field ?? e.target.name;
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleCategoryChange(category: UserCategory) {
    setUserCategory(category);
    setFormData((prev) => ({
      ...prev,
      rol: category === 'employee' ? prev.rol : '',
      cliente: category === 'external' ? prev.cliente : '',
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.nombre || !formData.apellido || !formData.email || !formData.contraseña) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (userCategory === 'employee' && !formData.rol) {
      toast.error('Por favor selecciona un rol para el empleado');
      return;
    }

    if (userCategory === 'external' && !formData.cliente) {
      toast.error('Por favor selecciona un cliente para el usuario externo');
      return;
    }

    if (formData.contraseña.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      toast.loading('Creando usuario...', { id: 'createUser' });

      const externalRoleId = roles?.find((role) => normalizeRoleName(role.name) === 'client_manager')?.id;
      if (userCategory === 'external' && !externalRoleId) {
        throw new Error('No se encontró el rol configurado para clientes');
      }

      const { data, error } = await isolatedSupabase.auth.signUp({
        email: formData.email,
        password: formData.contraseña,
        options: {
          data: {
            name: formData.nombre,
            second_name: formData.apellido,
            role_id: userCategory === 'employee' ? parseInt(formData.rol, 10) : externalRoleId,
          },
        },
      });

      if (error) throw error;
      if (!data.user?.id) throw new Error('No se recibió el usuario creado');

      if (userCategory === 'external') {
        const { error: clientError } = await supabase.from('client_workers').insert({
          user_id: data.user?.id,
          client_id: formData.cliente,
        });

        if (clientError) throw clientError;
      }

      toast.success('Usuario creado exitosamente', { id: 'createUser' });
      setFormData(INITIAL_FORM_DATA);
      handleCategoryChange('employee');

      redirectTimerRef.current = setTimeout(() => {
        router.push('/ternium/usuarios');
      }, 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('User already registered')) {
        toast.error('El correo electrónico ya está registrado', { id: 'createUser' });
      } else if (message.includes('Invalid email')) {
        toast.error('El correo electrónico no es válido', { id: 'createUser' });
      } else {
        toast.error('Error al crear usuario. Intenta nuevamente', { id: 'createUser' });
      }
    } finally {
      await isolatedSupabase.auth.signOut();
    }
  }

  return {
    userCategory,
    handleCategoryChange,
    formData,
    handleInputChange,
    handleSubmit,
  };
}
