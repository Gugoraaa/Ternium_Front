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

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const fetchUserData = async (currentUser: User | null) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const roleId = currentUser.user_metadata?.role_id;

      if (roleId) {
        const { data: roleData } = await supabase
          .from('roles')
          .select('name')
          .eq('id', roleId)
          .single();

        setUser({
          ...currentUser,
          role_name: roleData?.name || 'No Role Assigned',
        });
      } else {
        setUser(currentUser);
      }

      setLoading(false);
    };

    supabase.auth.getUser().then(({ data: { user: initialUser } }) => {
      fetchUserData(initialUser);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserData(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useUser = () => useContext(AuthContext);