'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Worker {
  id: string;
  name: string;
  second_name: string;
  email: string;
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
        
        const { data, error } = await supabase
          .from('users')
          .select('id, name, second_name, email')
          .eq('role_id', 5)
          .eq('active', true)
          .order('name', { ascending: true });

        if (error) {
          throw error;
        }

        setWorkers(data || []);
      } catch (error) {
        console.error('Error fetching workers:', error);
        setError('Error al cargar los trabajadores');
      } finally {
        setLoading(false);
      }
    }

    fetchWorkers();
  }, []);

  return { workers, loading, error };
}
