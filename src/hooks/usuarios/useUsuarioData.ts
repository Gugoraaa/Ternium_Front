'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import type { Database } from '@/types/database';
import { getUserCategoryForRole } from '@/lib/permissions';

const supabase = createClient();

type UserRow = Database['public']['Tables']['users']['Row'];
type RoleRow = Database['public']['Tables']['roles']['Row'];
type ClientWorkerRow = Database['public']['Tables']['client_workers']['Row'];

export type UsuarioListItem = UserRow & {
    roles: Pick<RoleRow, 'id' | 'name'> | null;
    clientLinks: Array<Pick<ClientWorkerRow, 'client_id'>>;
};

export function useUsuarioData() {
    const [usuarios, setUsuarios] = useState<UsuarioListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [sessionReady, setSessionReady] = useState<boolean | null>(null);

    async function getFunctionErrorMessage(error: unknown, fallback: string) {
        let message = fallback;

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
                } else if (typeof errorBody?.message === 'string' && errorBody.message.trim()) {
                    message = errorBody.message;
                }
            } catch {
                // Fall back to the generic or SDK-provided message.
            }
        }

        return message;
    }

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
            const [usersRes, clientWorkersRes] = await Promise.all([
                supabase.from('users').select('*, roles(name, id)'),
                supabase.from('client_workers').select('user_id, client_id'),
            ]);

            if (usersRes.error) throw usersRes.error;
            if (clientWorkersRes.error) throw clientWorkersRes.error;

            const clientLinksByUserId = new Map<string, Array<Pick<ClientWorkerRow, 'client_id'>>>();

            (clientWorkersRes.data ?? []).forEach((link) => {
                const currentLinks = clientLinksByUserId.get(link.user_id) ?? [];
                currentLinks.push({ client_id: link.client_id });
                clientLinksByUserId.set(link.user_id, currentLinks);
            });

            if (usersRes.data) {
                setUsuarios(
                    (usersRes.data as Array<UserRow & { roles: Pick<RoleRow, 'id' | 'name'> | null }>).map((user) => ({
                        ...user,
                        clientLinks: clientLinksByUserId.get(user.id) ?? [],
                    }))
                );
            }
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
            const selectedUser = usuarios.find((user) => user.id === userId);

            if (!selectedUser) {
                throw new Error('No se encontró el usuario a actualizar');
            }

            const { data: targetRole, error: targetRoleError } = await supabase
                .from('roles')
                .select('id, name')
                .eq('id', newRoleId)
                .single();

            if (targetRoleError) throw targetRoleError;

            const currentCategory = selectedUser.clientLinks.length > 0
                ? 'external'
                : getUserCategoryForRole(selectedUser.roles?.name);
            const targetCategory = getUserCategoryForRole(targetRole?.name);

            if (currentCategory && targetCategory && currentCategory !== targetCategory) {
                if (currentCategory === 'external') {
                    toast.error('Los usuarios externos solo pueden mantener roles de cliente');
                } else {
                    toast.error('No se puede convertir un usuario interno en cliente desde esta pantalla');
                }
                return;
            }

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
            const message = await getFunctionErrorMessage(error, 'Error al dar de baja al usuario');
            toast.error(message);
        }
    }

    async function reactivateUser(userId: string) {
        try {
            const { data, error } = await supabase.functions.invoke('admin-reactivate-user', {
                body: { target_user_id: userId },
            });

            if (error) throw error;
            if (!data?.success) throw new Error('La función no devolvió una respuesta válida');

            await fetchUsuarios();
            toast.success('Usuario reactivado correctamente');
        } catch (error) {
            const message = await getFunctionErrorMessage(error, 'Error al reactivar al usuario');
            toast.error(message);
        }
    }

    return { usuarios, loading, toggleActive, changeRole, offboardUser, reactivateUser };
}
