'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import type { Database } from '@/types/database';

const supabase = createClient();

type UserRow = Database['public']['Tables']['users']['Row'];
type RoleRow = Database['public']['Tables']['roles']['Row'];

export type UsuarioListItem = UserRow & {
    roles: Pick<RoleRow, 'id' | 'name'> | null;
};

export function useUsuarioData() {
    const [usuarios, setUsuarios] = useState<UsuarioListItem[]>([]);
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

    const fetchUsuarios = useCallback(async () => {
        try {
            const { data, error } = await supabase
              .from('users')
              .select(`*, roles(name, id)`);
            if (error) throw error;
            if (data) setUsuarios(data as UsuarioListItem[]);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (sessionReady !== true) {
          if (sessionReady === false) setLoading(false);
          return;
        }
        fetchUsuarios();
    }, [sessionReady, fetchUsuarios]);

    async function toggleActive(userId: string, currentActive: boolean, isOffboarded: boolean) {
        if (isOffboarded) {
            toast.error('Los usuarios dados de baja no se pueden reactivar desde esta pantalla');
            return;
        }

        try {
            const { error } = await supabase
                .from('users')
                .update({ active: !currentActive })
                .eq('id', userId);
            if (error) throw error;
            setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, active: !currentActive } : u));
            toast.success(currentActive ? 'Usuario desactivado' : 'Usuario activado');
        } catch {
            toast.error('Error al actualizar el estado del usuario');
        }
    }

    async function changeRole(userId: string, newRoleId: number) {
        try {
            const { error } = await supabase
                .from('users')
                .update({ role_id: newRoleId })
                .eq('id', userId);
            if (error) throw error;
            await fetchUsuarios();
            toast.success('Rol actualizado correctamente');
        } catch {
            toast.error('Error al cambiar el rol');
        }
    }

    async function offboardUser(userId: string) {
        try {
            const { data, error } = await supabase.functions.invoke('admin-offboard-user', {
                body: { target_user_id: userId },
            });

            if (error) throw error;
            if (!data?.success) throw new Error('La función no devolvió una respuesta válida');

            await fetchUsuarios();
            toast.success('Usuario dado de baja correctamente');
        } catch (error) {
            let message = 'Error al dar de baja al usuario';

            if (error instanceof Error && error.message) {
                message = error.message;
            }

            if (
                typeof error === 'object' &&
                error !== null &&
                'context' in error &&
                error.context instanceof Response
            ) {
                try {
                    const errorBody = await error.context.json();
                    if (typeof errorBody?.error === 'string' && errorBody.error.trim()) {
                        message = errorBody.error;
                    }
                } catch {
                    // Fall back to the generic or SDK-provided message.
                }
            }

            toast.error(message);
        }
    }

    return { usuarios, loading, toggleActive, changeRole, offboardUser };
}
