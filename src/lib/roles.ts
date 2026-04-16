export type RoleSlug =
  | 'admin'
  | 'user_admin'
  | 'client_manager'
  | 'order_manager'
  | 'operations_manager'
  | 'scheduler'
  | 'order_controller'
  | 'dispatcher';

export interface RoleMeta {
  slug: RoleSlug;
  label: string;
  defaultPath: string;
  primaryModuleLabel: string;
  primaryModulePath: string;
  allowedPaths: string[];
  canSeeDashboard: boolean;
  canSeeLeaderboard: boolean;
  userCategory: 'internal' | 'external';
  assignableInProgramming: boolean;
  aliases: string[];
  allAccess?: boolean;
}

export const ROLE_METADATA: Record<RoleSlug, RoleMeta> = {
  admin: {
    slug: 'admin',
    label: 'Super Admin',
    defaultPath: '/ternium/dashboard',
    primaryModuleLabel: 'Dashboard',
    primaryModulePath: '/ternium/dashboard',
    allowedPaths: [
      '/ternium/dashboard',
      '/ternium/leaderboard',
      '/ternium/usuarios',
      '/ternium/clientes',
      '/ternium/gestion',
      '/ternium/programacion',
      '/ternium/operaciones',
      '/ternium/management',
      '/ternium/despacho',
    ],
    canSeeDashboard: true,
    canSeeLeaderboard: true,
    userCategory: 'internal',
    assignableInProgramming: false,
    aliases: ['admin', 'super_admin', 'super admin'],
    allAccess: true,
  },
  user_admin: {
    slug: 'user_admin',
    label: 'Administrador',
    defaultPath: '/ternium/dashboard',
    primaryModuleLabel: 'Usuarios',
    primaryModulePath: '/ternium/usuarios',
    allowedPaths: ['/ternium/dashboard', '/ternium/usuarios', '/ternium/leaderboard'],
    canSeeDashboard: true,
    canSeeLeaderboard: true,
    userCategory: 'internal',
    assignableInProgramming: false,
    aliases: ['user_admin', 'usuario_admin', 'administrador'],
  },
  client_manager: {
    slug: 'client_manager',
    label: 'Cliente',
    defaultPath: '/ternium/clientes',
    primaryModuleLabel: 'Clientes',
    primaryModulePath: '/ternium/clientes',
    allowedPaths: ['/ternium/dashboard', '/ternium/clientes'],
    canSeeDashboard: true,
    canSeeLeaderboard: false,
    userCategory: 'external',
    assignableInProgramming: false,
    aliases: ['client_manager', 'cliente', 'cliente_externo', 'client'],
  },
  order_manager: {
    slug: 'order_manager',
    label: 'Gestion de Ordenes',
    defaultPath: '/ternium/gestion',
    primaryModuleLabel: 'Gestion',
    primaryModulePath: '/ternium/gestion',
    allowedPaths: ['/ternium/dashboard', '/ternium/gestion', '/ternium/leaderboard'],
    canSeeDashboard: true,
    canSeeLeaderboard: true,
    userCategory: 'internal',
    assignableInProgramming: false,
    aliases: ['order_manager', 'gestion', 'gestion_ordenes'],
  },
  operations_manager: {
    slug: 'operations_manager',
    label: 'Operaciones',
    defaultPath: '/ternium/operaciones',
    primaryModuleLabel: 'Operaciones',
    primaryModulePath: '/ternium/operaciones',
    allowedPaths: ['/ternium/dashboard', '/ternium/operaciones', '/ternium/leaderboard'],
    canSeeDashboard: true,
    canSeeLeaderboard: true,
    userCategory: 'internal',
    assignableInProgramming: true,
    aliases: [
      'operations_manager',
      'operations',
      'operaciones',
      'operator',
      'operador',
      'operators',
      'operadores',
    ],
  },
  scheduler: {
    slug: 'scheduler',
    label: 'Programacion',
    defaultPath: '/ternium/programacion',
    primaryModuleLabel: 'Programacion',
    primaryModulePath: '/ternium/programacion',
    allowedPaths: ['/ternium/dashboard', '/ternium/programacion', '/ternium/leaderboard'],
    canSeeDashboard: true,
    canSeeLeaderboard: true,
    userCategory: 'internal',
    assignableInProgramming: false,
    aliases: ['scheduler', 'programacion', 'programming'],
  },
  order_controller: {
    slug: 'order_controller',
    label: 'Order Management',
    defaultPath: '/ternium/management',
    primaryModuleLabel: 'Order Management',
    primaryModulePath: '/ternium/management',
    allowedPaths: ['/ternium/dashboard', '/ternium/management'],
    canSeeDashboard: true,
    canSeeLeaderboard: false,
    userCategory: 'internal',
    assignableInProgramming: false,
    aliases: ['order_controller', 'management', 'order_management', 'control_despacho'],
  },
  dispatcher: {
    slug: 'dispatcher',
    label: 'Despacho',
    defaultPath: '/ternium/despacho',
    primaryModuleLabel: 'Despacho',
    primaryModulePath: '/ternium/despacho',
    allowedPaths: ['/ternium/despacho'],
    canSeeDashboard: false,
    canSeeLeaderboard: false,
    userCategory: 'internal',
    assignableInProgramming: false,
    aliases: ['dispatcher', 'despacho', 'dispatch'],
  },
};

const ROLE_ALIAS_MAP = Object.values(ROLE_METADATA).reduce<Record<string, RoleSlug>>((acc, meta) => {
  meta.aliases.forEach((alias) => {
    acc[alias.toLowerCase()] = meta.slug;
  });
  acc[meta.slug.toLowerCase()] = meta.slug;
  return acc;
}, {});

export function normalizeRoleName(roleName: string | undefined | null): RoleSlug | null {
  if (!roleName) return null;
  const normalized = roleName.trim().toLowerCase();
  return ROLE_ALIAS_MAP[normalized] ?? null;
}

export function getRoleMeta(roleName: string | undefined | null): RoleMeta | null {
  const slug = normalizeRoleName(roleName);
  return slug ? ROLE_METADATA[slug] : null;
}

export function getRoleLabel(roleName: string | undefined | null): string {
  return getRoleMeta(roleName)?.label ?? (roleName || 'Sin rol');
}

export function getDefaultPathForRole(roleName: string | undefined | null): string {
  return getRoleMeta(roleName)?.defaultPath ?? '/login';
}

export function canSeeLeaderboard(roleName: string | undefined | null): boolean {
  return Boolean(getRoleMeta(roleName)?.canSeeLeaderboard);
}

export function isAssignableProgrammingRole(roleName: string | undefined | null): boolean {
  return Boolean(getRoleMeta(roleName)?.assignableInProgramming);
}

export function getUserCategoryForRole(roleName: string | undefined | null): RoleMeta['userCategory'] | null {
  return getRoleMeta(roleName)?.userCategory ?? null;
}

export function isAllowed(roleName: string | undefined | null, path: string): boolean {
  const meta = getRoleMeta(roleName);
  if (!meta) return false;
  if (meta.allAccess) return true;
  return meta.allowedPaths.some((allowedPath) => path === allowedPath || path.startsWith(`${allowedPath}/`));
}

export const ROLE_ALLOWED_PATHS: Record<string, string[]> = Object.fromEntries(
  Object.values(ROLE_METADATA).map((meta) => [meta.slug, meta.allowedPaths])
);
