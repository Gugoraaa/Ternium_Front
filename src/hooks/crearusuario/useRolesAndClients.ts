'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import type { Role, Client } from '@/types/crearUsuario';

/**
 * Hook de datos para la vista "Crear Usuario".
 * Carga roles y clientes y expone estado de loading.
 */
export function useRolesAndClients() {
  const [roles, setRoles] = useState<Role[] | null>([]);
  const [clients, setClients] = useState<Client[] | null>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  async function fetchData() {
    try {
      setLoading(true);

      const [rolesRes, clientsRes] = await Promise.all([
        supabase.from('roles').select('*'),
        supabase.from('clients').select('*'),
      ]);

      /**
       * Nota de tipado:
       * Aunque `clients.id` en BD sea UUID, en frontend llega como string.
       * Por eso en `types.ts` usamos `Client.id: string` para evitar depender
       * de tipos de Node (`crypto.UUID`) en componentes cliente.
       * */ 
      if (rolesRes.data) setRoles(rolesRes.data);
      if (clientsRes.data) setClients(clientsRes.data);
    } catch (err) {
      console.error('Error en la carga inicial:', err);
      toast.error('Error al cargar los datos del formulario');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return { roles, clients, loading };
}
