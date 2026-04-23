'use client';

import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import type { CreateUserFormData, UserCategory } from '@/types/crearUsuario';
import { INITIAL_FORM_DATA, NEW_CLIENT_SENTINEL } from '@/types/crearUsuario';
import type { Role } from '@/types/crearUsuario';
import { normalizeRoleName } from '@/lib/permissions';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export function useCreateUsuarioForm(roles: Role[] | null) {
  const [userCategory, setUserCategory] = useState<UserCategory>('employee');
  const router = useRouter();
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
      clienteNombre: '',
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.nombre || !formData.apellido || !formData.email || !formData.contraseña) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!EMAIL_REGEX.test(formData.email.trim())) {
      toast.error('El correo electrónico no tiene un formato válido');
      return;
    }

    if (userCategory === 'employee' && !formData.rol) {
      toast.error('Por favor selecciona un rol para el empleado');
      return;
    }

    if (userCategory === 'external') {
      if (!formData.cliente) {
        toast.error('Por favor selecciona un cliente para el usuario externo');
        return;
      }
      if (formData.cliente === NEW_CLIENT_SENTINEL && !formData.clienteNombre.trim()) {
        toast.error('Por favor ingresa el nombre del nuevo cliente');
        return;
      }
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

      const roleId = userCategory === 'employee' ? parseInt(formData.rol, 10) : externalRoleId!;

      const payload: Record<string, unknown> = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
        contraseña: formData.contraseña,
        roleId,
      };

      if (userCategory === 'external') {
        if (formData.cliente === NEW_CLIENT_SENTINEL) {
          payload.clienteNombre = formData.clienteNombre.trim();
        } else {
          payload.clienteId = formData.cliente;
        }
      }

      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? 'Error al crear usuario');
      }

      toast.success('Usuario creado exitosamente', { id: 'createUser' });
      setFormData(INITIAL_FORM_DATA);
      handleCategoryChange('employee');

      redirectTimerRef.current = setTimeout(() => {
        router.push('/ternium/usuarios');
      }, 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      toast.error(message || 'Error al crear usuario. Intenta nuevamente', { id: 'createUser' });
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
