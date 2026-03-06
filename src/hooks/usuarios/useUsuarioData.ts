'use client';

// Importando librerías necesarias
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

// Definiendo el hook useUsuarioData
export function useUsuarioData() {
    const supabase = createClient();
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Efecto que consulta a la base de datos de usuarios para obtener los datos de estos
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
        
          // Si hay datos, se setean los datos en el estado de usuarios
          if (data) setUsuarios(data);
                
          /**
           * Se imprimen los datos en la consola para verificar que se han cargado correctamente
           * Si hay error, se imprime el error en la consola
           * Si no hay error, se setea el estado de carga a false
           */
          console.log(data)
          } catch (error) {
            console.error('Error al cargar usuarios:', error);
          } finally {
          setLoading(false);
          }
        }
        // Se ejecuta la función fetchUsuarios para obtener los datos de los usuarios
        fetchUsuarios();
      }, []);
    
    return { usuarios, loading };
}