export const ROLE_ALLOWED_PATHS: Record<string, string[]> = {
  user_admin:        ['/ternium/dashboard', '/ternium/usuarios',     '/ternium/leaderboard'],
  client_manager:    ['/ternium/dashboard', '/ternium/clientes',     '/ternium/leaderboard'],
  order_manager:     ['/ternium/dashboard', '/ternium/gestion',      '/ternium/leaderboard'],
  operations_manager:['/ternium/dashboard', '/ternium/operaciones',  '/ternium/leaderboard'],
  scheduler:         ['/ternium/dashboard', '/ternium/programacion', '/ternium/leaderboard'],
  order_controller:  ['/ternium/dashboard', '/ternium/management',   '/ternium/leaderboard'],
};

/**
 * Returns true if the given role_name is allowed to access the given path.
 * - 'admin' bypasses all restrictions.
 * - Path matching is prefix-based so sub-routes are also covered.
 */
export function isAllowed(roleName: string | undefined, path: string): boolean {
  if (!roleName) return false;
  if (roleName === 'admin') return true;
  const allowed = ROLE_ALLOWED_PATHS[roleName] ?? [];
  return allowed.some(p => path === p || path.startsWith(p + '/'));
}
