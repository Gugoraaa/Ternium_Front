"use client";
import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export type UserWithRole = User & { role_name?: string };

const AuthContext = createContext<{ user: UserWithRole | null; loading: boolean }>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingUser, setPendingUser] = useState<User | null | undefined>(undefined);

  const supabase = useMemo(() => createClient(), []);

  // Only set state inside the callback — no Supabase queries here
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setPendingUser(session?.user ?? null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch the role in a separate effect, outside the auth lock
  useEffect(() => {
    if (pendingUser === undefined) return;

    async function signOutUnauthorizedUser() {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore local sign out errors; we still want to drop app state.
      }
      setUser(null);
      setPendingUser(null);
      setLoading(false);
    }

    if (!pendingUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role_id, active, offboarded_at')
          .eq('id', pendingUser.id)
          .single();

        if (userError) {
          if (userError.code === 'PGRST116') {
            await signOutUnauthorizedUser();
            return;
          }
          throw userError;
        }

        if (!userData?.active || userData.offboarded_at) {
          await signOutUnauthorizedUser();
          return;
        }

        const roleId = userData?.role_id;
        if (!roleId) {
          await signOutUnauthorizedUser();
          return;
        }

        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('name')
          .eq('id', roleId)
          .single();

        if (roleError || !roleData?.name) {
          if (roleError?.code === 'PGRST116' || !roleData?.name) {
            await signOutUnauthorizedUser();
            return;
          }
          throw roleError;
        }

        setUser({
          ...pendingUser,
          role_name: roleData.name,
        });
        setLoading(false);
      } catch {
        setUser(pendingUser);
        setLoading(false);
      }
    })();
  }, [pendingUser]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useUser = () => useContext(AuthContext);
