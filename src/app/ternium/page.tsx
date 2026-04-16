import { redirect } from 'next/navigation';
import { getDefaultPathForRole } from '@/lib/permissions';
import { getAuthorizedServerUser } from '@/lib/server-auth';

export default async function Ternium() {
  const authorizedUser = await getAuthorizedServerUser();

  if (!authorizedUser) {
    redirect('/login');
  }

  redirect(getDefaultPathForRole(authorizedUser.roleName));
}
