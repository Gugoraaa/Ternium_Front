'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient(); // ← fuera del hook

export function useUsuarioData() {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        
            console.log('data:', data);
            console.log('error:', error);

            if (data) setUsuarios(data);
                
          } catch (error) {
            console.error('Error al cargar usuarios:', error);
          } finally {
            setLoading(false);
          }
        }

        fetchUsuarios();
      }, []); // ← array vacío, sin dependencias
    
    return { usuarios, loading };
}