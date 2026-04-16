'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isAssignableProgrammingRole, normalizeRoleName } from '@/lib/roles';

interface Worker {
  id: string;
  name: string;
  second_name: string | null;
  email: string;
  role_name: string | null;
}

interface UseWorkersReturn {
  workers: Worker[];
  loading: boolean;
  error: string | null;
}

export function useWorkers(): UseWorkersReturn {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkers() {
      try {
        setLoading(true);
        setError(null);

        const supabase = createClient();

        const { data: rolesData, error: roleError } = await supabase
          .from('roles')
          .select('id, name');

        if (roleError) throw roleError;

        const eligibleRoleIds = (rolesData || [])
          .filter((role) => isAssignableProgrammingRole(role.name))
          .map((role) => role.id);

        if (eligibleRoleIds.length === 0) {
          setWorkers([]);
          return;
        }

        const { data, error } = await supabase
          .from('users')
          .select(`
            id,
            name,
            second_name,
            email,
            active,
            offboarded_at,
            roles:role_id (name)
          `)
          .in('role_id', eligibleRoleIds)
          .eq('active', true)
          .is('offboarded_at', null)
          .order('name', { ascending: true });

        if (error) throw error;

        setWorkers(
          (data || []).map((worker) => {
            const role = Array.isArray(worker.roles) ? worker.roles[0] : worker.roles;

            return {
              id: worker.id,
              name: worker.name,
              second_name: worker.second_name,
              email: worker.email,
              role_name: normalizeRoleName(role?.name),
            };
          })
        );
      } catch (fetchError) {
        console.error('Error fetching workers:', fetchError);
        setError('Error al cargar los responsables disponibles');
      } finally {
        setLoading(false);
      }
    }

    fetchWorkers();
  }, []);

  return { workers, loading, error };
}
