'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { CreateUserFormData, UserCategory } from '@/types/crearUsuario';
import { INITIAL_FORM_DATA } from '@/types/crearUsuario';

/**
 * Hook de formulario para la vista "Crear Usuario".
 * Maneja estado, validaciones y envío del formulario.
 */
export function useCreateUsuarioForm() {
  const [userCategory, setUserCategory] = useState<UserCategory>('employee');
  const router = useRouter();
  const supabase = createClient();
  const [formData, setFormData] = useState<CreateUserFormData>(INITIAL_FORM_DATA);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.contraseña,
        options: {
          data: {
            name: formData.nombre,
            second_name: formData.apellido,
            // Solo enviamos role_id para empleados.
            // Evita parsear rol cuando el usuario es externo (antes podía quedar NaN).
            role_id: userCategory === 'employee' ? parseInt(formData.rol, 10) : undefined,
          },
        },
      });

      if (error) throw error;

      if (userCategory === 'external') {
        const { error: clientError } = await supabase.from('client_workers').insert({
          user_id: data.user?.id,
          client_id: formData.cliente,
        });

        if (clientError) throw clientError;
      }

      toast.success('Usuario creado exitosamente', { id: 'createUser' });
      setFormData(INITIAL_FORM_DATA);

      setTimeout(() => {
        router.push('/ternium/usuarios');
      }, 1500);
    } catch (error: any) {
      if (error.message?.includes('User already registered')) {
        toast.error('El correo electrónico ya está registrado', { id: 'createUser' });
      } else if (error.message?.includes('Invalid email')) {
        toast.error('El correo electrónico no es válido', { id: 'createUser' });
      } else {
        toast.error('Error al crear usuario. Intenta nuevamente', { id: 'createUser' });
      }
    }
  }

  return {
    userCategory,
    setUserCategory,
    formData,
    handleInputChange,
    handleSubmit,
  };
}
