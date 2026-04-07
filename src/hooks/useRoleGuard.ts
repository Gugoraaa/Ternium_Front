'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/AuthContext';
import { isAllowed } from '@/lib/permissions';

/**
 * Redirects to /ternium/dashboard if the current user's role is not
 * allowed to access `protectedPath`.
 *
 * Usage at the top of any protected page component:
 *   useRoleGuard('/ternium/usuarios');
 */
export function useRoleGuard(protectedPath: string): void {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAllowed(user?.role_name, protectedPath)) {
      router.replace('/ternium/dashboard');
    }
  }, [user, loading, protectedPath, router]);
}
