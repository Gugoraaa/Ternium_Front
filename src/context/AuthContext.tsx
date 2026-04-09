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
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        setPendingUser(session?.user ?? null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch the role in a separate effect, outside the auth lock
  useEffect(() => {
    if (pendingUser === undefined) return;

    if (!pendingUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('role_id')
          .eq('id', pendingUser.id)
          .single();

        const roleId = userData?.role_id;
        if (!roleId) {
          setUser(pendingUser);
          setLoading(false);
          return;
        }

        const { data: roleData } = await supabase
          .from('roles')
          .select('name')
          .eq('id', roleId)
          .single();

        setUser({
          ...pendingUser,
          role_name: roleData?.name || 'No Role Assigned',
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
