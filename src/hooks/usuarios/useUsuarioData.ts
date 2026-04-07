'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

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

    const fetchUsuarios = useCallback(async () => {
        try {
            const { data, error } = await supabase
              .from('users')
              .select(`*, roles(name, id)`);
            if (error) throw error;
            if (data) setUsuarios(data);
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

    async function toggleActive(userId: string, currentActive: boolean) {
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

    async function deleteUser(userId: string) {
        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', userId);
            if (error) throw error;
            setUsuarios(prev => prev.filter(u => u.id !== userId));
            toast.success('Usuario eliminado');
        } catch {
            toast.error('Error al eliminar el usuario');
        }
    }

    return { usuarios, loading, toggleActive, changeRole, deleteUser };
}
