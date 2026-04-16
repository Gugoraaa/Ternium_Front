import { createClient } from '@/lib/supabase/server';

export interface AuthorizedServerUser {
  id: string;
  roleName: string;
}

export async function getAuthorizedServerUser(): Promise<AuthorizedServerUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role_id, active, offboarded_at')
    .eq('id', user.id)
    .single();

  if (userError || !userData?.role_id || !userData.active || userData.offboarded_at) {
    return null;
  }

  const { data: roleData, error: roleError } = await supabase
    .from('roles')
    .select('name')
    .eq('id', userData.role_id)
    .single();

  if (roleError || !roleData?.name) {
    return null;
  }

  return {
    id: user.id,
    roleName: roleData.name,
  };
}
