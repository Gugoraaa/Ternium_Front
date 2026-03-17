'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export function useUsuarioData() {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sessionReady, setSessionReady] = useState<boolean | null>(null);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
            setSessionReady(!!session);
          }
        });
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (sessionReady !== true) {
          if (sessionReady === false) setLoading(false);
          return;
        }

        async function fetchUsuarios() {
          try {
            const { data, error } = await supabase
              .from('users')
              .select(`
                *,
                roles (
                  name
                )
              `);

            if (error) throw error;
            if (data) setUsuarios(data);

          } catch (error) {
            console.error('Error al cargar usuarios:', error);
          } finally {
            setLoading(false);
          }
        }

        fetchUsuarios();
    }, [sessionReady]);

    return { usuarios, loading };
}
