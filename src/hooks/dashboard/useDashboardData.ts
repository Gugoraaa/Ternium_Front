'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/context/AuthContext';
import { normalizeRoleName } from '@/lib/permissions';

export interface DashboardKpi {
  label: string;
  value: number;
  sublabel: string;
  color: 'orange' | 'emerald' | 'blue' | 'red' | 'slate';
  alert?: boolean;
}

export interface RecentOrder {
  id: number;
  producto: string;
  cliente: string;
  fecha: string;
  status: string;
  detailLink: string;
}

export interface DashboardAlert {
  type: 'warning' | 'error';
  message: string;
  count: number;
  link: string;
}

export interface QuickAction {
  label: string;
  description: string;
  link: string;
  iconKey: string;
}

export interface DashboardData {
  userName: string;
  kpis: DashboardKpi[];
  recentOrders: RecentOrder[];
  alerts: DashboardAlert[];
  quickActions: QuickAction[];
  loading: boolean;
}

interface DashboardUserRow {
  name: string;
  second_name: string;
}

interface OrderSummaryRow {
  id: number;
  status: string | null;
  created_at: string;
  product: { pt: string | null } | Array<{ pt: string | null }> | null;
  client: { name: string | null } | Array<{ name: string | null }> | null;
  programing_instructions?:
    | { status: string | null; assigned_date: string | null }
    | Array<{ status: string | null; assigned_date: string | null }>
    | null;
  execution_details?: { status: string | null } | Array<{ status: string | null }> | null;
  dispatch_validation?: { status: string | null } | Array<{ status: string | null }> | null;
}

interface ClientWorkerRow {
  client_id: string;
}

function mapRecentOrders(
  rows: OrderSummaryRow[],
  detailBuilder: (id: number) => string,
  getStatus: (row: OrderSummaryRow) => string = (row) => row.status ?? 'Pendiente'
): RecentOrder[] {
  const getSingle = <T,>(value: T | T[] | null | undefined): T | null => {
    if (Array.isArray(value)) return value[0] ?? null;
    return value ?? null;
  };

  return rows.map((row) => ({
    id: row.id,
    producto: getSingle(row.product)?.pt ?? '—',
    cliente: getSingle(row.client)?.name ?? '—',
    fecha: row.created_at,
    status: getStatus(row),
    detailLink: detailBuilder(row.id),
  }));
}

function getNestedStatus(
  value:
    | { status: string | null }
    | Array<{ status: string | null }>
    | null
    | undefined
): string | null {
  if (Array.isArray(value)) return value[0]?.status ?? null;
  return value?.status ?? null;
}

export function useDashboardData(): DashboardData {
  const { user, loading: authLoading } = useUser();
  const [data, setData] = useState<Omit<DashboardData, 'loading'>>({
    userName: '',
    kpis: [],
    recentOrders: [],
    alerts: [],
    quickActions: [],
  });
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (authLoading || !user) {
      if (!authLoading) setLoading(false);
      return;
    }

    const role = normalizeRoleName(user.role_name);

    async function fetchAll() {
      try {
        setLoading(true);

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const startOfWeekStr = startOfWeek.toISOString();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        // Fetch user display name
        const { data: userData } = await supabase
          .from('users')
          .select('name, second_name')
          .eq('id', user!.id)
          .single<DashboardUserRow>();

        const userName = userData
          ? `${userData.name} ${userData.second_name}`.trim()
          : user!.email ?? '';

        let kpis: DashboardKpi[] = [];
        let recentOrders: RecentOrder[] = [];
        const alerts: DashboardAlert[] = [];
        let quickActions: QuickAction[] = [];

        // ── order_manager ────────────────────────────────────────────
        if (role === 'admin') {
          const [usuariosActivosRes, clientesRes, ordenesTotalRes, despachosPendientesRes, recentRes] =
            await Promise.all([
              supabase.from('users').select('*', { count: 'exact', head: true }).eq('active', true),
              supabase.from('clients').select('*', { count: 'exact', head: true }),
              supabase.from('orders').select('*', { count: 'exact', head: true }),
              supabase.from('dispatch_validation').select('*', { count: 'exact', head: true }).eq('status', 'Pendiente'),
              supabase.from('orders')
                .select('id, status, created_at, product:product_id(pt), client:client_id(name)')
                .order('created_at', { ascending: false })
                .limit(5),
            ]);

          kpis = [
            { label: 'Usuarios activos', value: usuariosActivosRes.count ?? 0, sublabel: 'Acceso vigente', color: 'blue' },
            { label: 'Clientes registrados', value: clientesRes.count ?? 0, sublabel: 'Base disponible', color: 'slate' },
            { label: 'Ordenes totales', value: ordenesTotalRes.count ?? 0, sublabel: 'En la plataforma', color: 'emerald' },
            { label: 'Despachos pendientes', value: despachosPendientesRes.count ?? 0, sublabel: 'Por validar', color: 'orange', alert: (despachosPendientesRes.count ?? 0) > 0 },
          ];

          if ((despachosPendientesRes.count ?? 0) > 0) {
            alerts.push({
              type: 'warning',
              message: `${despachosPendientesRes.count} ${despachosPendientesRes.count === 1 ? 'despacho pendiente' : 'despachos pendientes'} de validacion`,
              count: despachosPendientesRes.count ?? 0,
              link: '/ternium/management',
            });
          }

          recentOrders = mapRecentOrders(
            (recentRes.data ?? []) as OrderSummaryRow[],
            (id) => `/ternium/gestion/orden/${id}`
          );

          quickActions = [
            { label: 'Gestionar usuarios', description: 'Administrar accesos y roles', link: '/ternium/usuarios', iconKey: 'users' },
            { label: 'Leaderboard', description: 'Ver rendimiento general', link: '/ternium/leaderboard', iconKey: 'trophy' },
            { label: 'Vista de operaciones', description: 'Supervisar flujo operativo', link: '/ternium/operaciones', iconKey: 'clipboard' },
          ];

        // ── order_manager ────────────────────────────────────────────
        } else if (role === 'order_manager') {
          const [pendingRes, acceptedWeekRes, contraOfferRes, monthRes, recentRes, rejectedOldRes] =
            await Promise.all([
              supabase.from('orders').select('*', { count: 'exact', head: true })
                .eq('status', 'Revision Operador'),
              supabase.from('orders').select('*', { count: 'exact', head: true })
                .eq('status', 'Aceptado')
                .gte('created_at', startOfWeekStr),
              supabase.from('orders').select('*', { count: 'exact', head: true })
                .eq('contra_offer', true)
                .eq('status', 'Revision Cliente'),
              supabase.from('orders').select('*', { count: 'exact', head: true })
                .gte('created_at', startOfMonth),
              supabase.from('orders')
                .select('id, status, created_at, product:product_id(pt), client:client_id(name)')
                .order('created_at', { ascending: false })
                .limit(5),
              supabase.from('orders').select('*', { count: 'exact', head: true })
                .eq('status', 'Rechazado')
                .lt('created_at', new Date(Date.now() - 3 * 86400000).toISOString()),
            ]);

          kpis = [
            { label: 'Pendientes de revisión', value: pendingRes.count ?? 0, sublabel: 'Revisión Operador', color: 'orange', alert: (pendingRes.count ?? 0) > 0 },
            { label: 'Aceptadas esta semana', value: acceptedWeekRes.count ?? 0, sublabel: 'Desde el lunes', color: 'emerald' },
            { label: 'Contraofertas activas', value: contraOfferRes.count ?? 0, sublabel: 'Sin responder', color: 'blue', alert: (contraOfferRes.count ?? 0) > 0 },
            { label: 'Órdenes este mes', value: monthRes.count ?? 0, sublabel: 'Total generadas', color: 'slate' },
          ];

          if ((rejectedOldRes.count ?? 0) > 0) {
            alerts.push({
              type: 'error',
              message: `${rejectedOldRes.count} ${rejectedOldRes.count === 1 ? 'orden rechazada lleva' : 'órdenes rechazadas llevan'} más de 3 días sin atención`,
              count: rejectedOldRes.count ?? 0,
              link: '/ternium/gestion',
            });
          }
          if ((contraOfferRes.count ?? 0) > 0) {
            alerts.push({
              type: 'warning',
              message: `${contraOfferRes.count} ${contraOfferRes.count === 1 ? 'contrapropuesta pendiente' : 'contrapropuestas pendientes'} de respuesta`,
              count: contraOfferRes.count ?? 0,
              link: '/ternium/gestion',
            });
          }

          recentOrders = mapRecentOrders(
            (recentRes.data ?? []) as OrderSummaryRow[],
            (id) => `/ternium/gestion/orden/${id}`
          );

          quickActions = [
            { label: 'Revisar pendientes', description: 'Ver órdenes en revisión', link: '/ternium/gestion', iconKey: 'clipboard' },
            { label: 'Crear nueva orden', description: 'Registrar un nuevo pedido', link: '/ternium/gestion/crearpedido', iconKey: 'plus' },
          ];

        // ── scheduler ────────────────────────────────────────────────
        } else if (role === 'scheduler') {
          const [sinAsignarRes, hoyRes, reasignadoRes, semanaRes, recentRes] =
            await Promise.all([
              supabase.from('programing_instructions').select('*', { count: 'exact', head: true })
                .eq('status', 'Sin asignar'),
              supabase.from('programing_instructions').select('*', { count: 'exact', head: true })
                .eq('assigned_date', todayStr)
                .neq('status', 'Sin asignar'),
              supabase.from('programing_instructions').select('*', { count: 'exact', head: true })
                .eq('status', 'Reasignado'),
              supabase.from('programing_instructions').select('*', { count: 'exact', head: true })
                .gte('assigned_date', startOfWeekStr.split('T')[0]),
              supabase.from('orders')
                .select('id, status, created_at, product:product_id(pt), client:client_id(name), programing_instructions:programing_instructions_id(status, assigned_date)')
                .eq('status', 'Aceptado')
                .order('created_at', { ascending: false })
                .limit(5),
            ]);

          kpis = [
            { label: 'Sin asignar', value: sinAsignarRes.count ?? 0, sublabel: 'Requieren programación', color: 'orange', alert: (sinAsignarRes.count ?? 0) > 0 },
            { label: 'Asignadas hoy', value: hoyRes.count ?? 0, sublabel: todayStr, color: 'emerald' },
            { label: 'Reasignaciones', value: reasignadoRes.count ?? 0, sublabel: 'Pendientes de ajuste', color: 'red', alert: (reasignadoRes.count ?? 0) > 0 },
            { label: 'Asignadas esta semana', value: semanaRes.count ?? 0, sublabel: 'Desde el lunes', color: 'slate' },
          ];

          if ((sinAsignarRes.count ?? 0) > 0) {
            alerts.push({
              type: 'warning',
              message: `${sinAsignarRes.count} ${sinAsignarRes.count === 1 ? 'orden sin asignar' : 'órdenes sin asignar'} en espera`,
              count: sinAsignarRes.count ?? 0,
              link: '/ternium/programacion',
            });
          }

          recentOrders = mapRecentOrders(
            (recentRes.data ?? []) as OrderSummaryRow[],
            (id) => `/ternium/programacion/editar/${id}`,
            (row) => getNestedStatus(row.programing_instructions) ?? 'Sin asignar'
          );

          quickActions = [
            { label: 'Ver programación', description: 'Gestionar asignaciones', link: '/ternium/programacion', iconKey: 'calendar' },
          ];

        // ── operations_manager ───────────────────────────────────────
        } else if (role === 'operations_manager') {
          const [activasRes, pendientesRes, rechazadasRes, completadasRes, recentRes] =
            await Promise.all([
              supabase.from('programing_instructions').select('*', { count: 'exact', head: true })
                .eq('status', 'Asignado'),
              supabase.from('execution_details').select('*', { count: 'exact', head: true })
                .eq('status', 'Pendiente'),
              supabase.from('execution_details').select('*', { count: 'exact', head: true })
                .eq('status', 'Rechazado'),
              supabase.from('execution_details').select('*', { count: 'exact', head: true })
                .eq('status', 'Aceptado'),
              supabase.from('orders')
                .select('id, status, created_at, product:product_id(pt), client:client_id(name), execution_details:execution_details_id(status)')
                .not('execution_details_id', 'is', null)
                .order('created_at', { ascending: false })
                .limit(5),
            ]);

          kpis = [
            { label: 'Ejecuciones activas', value: activasRes.count ?? 0, sublabel: 'Asignadas en planta', color: 'blue' },
            { label: 'Pendientes de validar', value: pendientesRes.count ?? 0, sublabel: 'Requieren revisión', color: 'orange', alert: (pendientesRes.count ?? 0) > 0 },
            { label: 'Rechazadas', value: rechazadasRes.count ?? 0, sublabel: 'Requieren corrección', color: 'red', alert: (rechazadasRes.count ?? 0) > 0 },
            { label: 'Completadas', value: completadasRes.count ?? 0, sublabel: 'Total aceptadas', color: 'emerald' },
          ];

          if ((rechazadasRes.count ?? 0) > 0) {
            alerts.push({
              type: 'error',
              message: `${rechazadasRes.count} ${rechazadasRes.count === 1 ? 'ejecución rechazada' : 'ejecuciones rechazadas'} requieren corrección`,
              count: rechazadasRes.count ?? 0,
              link: '/ternium/operaciones',
            });
          }

          recentOrders = mapRecentOrders(
            (recentRes.data ?? []) as OrderSummaryRow[],
            (id) => `/ternium/operaciones/orden/${id}`,
            (row) => getNestedStatus(row.execution_details) ?? 'Pendiente'
          );

          quickActions = [
            { label: 'Ver operaciones', description: 'Órdenes en ejecución', link: '/ternium/operaciones', iconKey: 'wrench' },
          ];

        // ── order_controller ─────────────────────────────────────────
        } else if (role === 'order_controller') {
          const [pendienteRes, aprobadosHoyRes, rechazadosSemanaRes, totalMesRes, recentRes] =
            await Promise.all([
              supabase.from('dispatch_validation').select('*', { count: 'exact', head: true })
                .eq('status', 'Pendiente'),
              supabase.from('dispatch_validation').select('*', { count: 'exact', head: true })
                .eq('status', 'Aceptado')
                .gte('approved_at', `${todayStr}T00:00:00`),
              supabase.from('dispatch_validation').select('*', { count: 'exact', head: true })
                .eq('status', 'Rechazado')
                .gte('updated_at', startOfWeekStr),
              supabase.from('dispatch_validation').select('*', { count: 'exact', head: true })
                .neq('status', 'Pendiente')
                .gte('approved_at', startOfMonth),
              supabase.from('orders')
                .select('id, status, created_at, product:product_id(pt), client:client_id(name), dispatch_validation:dispatch_validation_id(status)')
                .not('dispatch_validation_id', 'is', null)
                .order('created_at', { ascending: false })
                .limit(5),
            ]);

          kpis = [
            { label: 'Despachos pendientes', value: pendienteRes.count ?? 0, sublabel: 'Requieren validación', color: 'orange', alert: (pendienteRes.count ?? 0) > 0 },
            { label: 'Aprobados hoy', value: aprobadosHoyRes.count ?? 0, sublabel: 'Validados hoy', color: 'emerald' },
            { label: 'Rechazados esta semana', value: rechazadosSemanaRes.count ?? 0, sublabel: 'Desde el lunes', color: 'red', alert: (rechazadosSemanaRes.count ?? 0) > 0 },
            { label: 'Procesados este mes', value: totalMesRes.count ?? 0, sublabel: 'Total validados', color: 'slate' },
          ];

          if ((pendienteRes.count ?? 0) > 0) {
            alerts.push({
              type: 'warning',
              message: `${pendienteRes.count} ${pendienteRes.count === 1 ? 'despacho pendiente' : 'despachos pendientes'} de validación`,
              count: pendienteRes.count ?? 0,
              link: '/ternium/management',
            });
          }

          recentOrders = mapRecentOrders(
            (recentRes.data ?? []) as OrderSummaryRow[],
            (id) => `/ternium/management/orden/${id}`,
            (row) => getNestedStatus(row.dispatch_validation) ?? 'Pendiente'
          );

          quickActions = [
            { label: 'Validar despachos', description: 'Revisar órdenes listas', link: '/ternium/management', iconKey: 'checkCircle' },
          ];

        // ── client_manager ───────────────────────────────────────────
        } else if (role === 'client_manager') {
          const { data: cwData } = await supabase
            .from('client_workers')
            .select('client_id')
            .eq('user_id', user!.id);

          const clientIds = ((cwData ?? []) as ClientWorkerRow[]).map((row) => row.client_id);

          if (clientIds.length > 0) {
            const [activasRes, revisionRes, completadasRes, recentRes] = await Promise.all([
              supabase.from('orders').select('*', { count: 'exact', head: true })
                .in('client_id', clientIds)
                .not('status', 'eq', 'Rechazado'),
              supabase.from('orders').select('*', { count: 'exact', head: true })
                .in('client_id', clientIds)
                .in('status', ['Revision Operador', 'Revision Cliente']),
              supabase.from('orders').select('*', { count: 'exact', head: true })
                .in('client_id', clientIds)
                .eq('status', 'Aceptado')
                .not('shipping_info_id', 'is', null),
              supabase.from('orders')
                .select('id, status, created_at, product:product_id(pt), client:client_id(name)')
                .in('client_id', clientIds)
                .order('created_at', { ascending: false })
                .limit(5),
            ]);

            kpis = [
              { label: 'Órdenes activas', value: activasRes.count ?? 0, sublabel: 'Mis clientes', color: 'blue' },
              { label: 'En revisión', value: revisionRes.count ?? 0, sublabel: 'Pendientes', color: 'orange' },
              { label: 'Completadas', value: completadasRes.count ?? 0, sublabel: 'Total enviadas', color: 'emerald' },
            ];

            recentOrders = mapRecentOrders(
              (recentRes.data ?? []) as OrderSummaryRow[],
              (id) => `/ternium/clientes/orden/${id}`
            );
          } else {
            alerts.push({
              type: 'warning',
              message: 'Tu cuenta no tiene un cliente asignado todavia',
              count: 0,
              link: '/ternium/clientes',
            });
          }

          quickActions = [
            { label: 'Ver órdenes de clientes', description: 'Estado de mis clientes', link: '/ternium/clientes', iconKey: 'users' },
          ];

        // ── user_admin ───────────────────────────────────────────────
        } else if (role === 'user_admin') {
          const [usuariosActivosRes, usuariosInactivosRes, usuariosBajaRes, nuevosUsuariosMesRes] =
            await Promise.all([
              supabase.from('users').select('*', { count: 'exact', head: true }).eq('active', true),
              supabase.from('users').select('*', { count: 'exact', head: true }).eq('active', false).is('offboarded_at', null),
              supabase.from('users').select('*', { count: 'exact', head: true }).not('offboarded_at', 'is', null),
              supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
            ]);

          kpis = [
            { label: 'Usuarios activos', value: usuariosActivosRes.count ?? 0, sublabel: 'En el sistema', color: 'blue' },
            { label: 'Usuarios inactivos', value: usuariosInactivosRes.count ?? 0, sublabel: 'Desactivados temporalmente', color: 'orange', alert: (usuariosInactivosRes.count ?? 0) > 0 },
            { label: 'Usuarios de baja', value: usuariosBajaRes.count ?? 0, sublabel: 'Sin acceso al portal', color: 'red' },
            { label: 'Nuevos usuarios (mes)', value: nuevosUsuariosMesRes.count ?? 0, sublabel: 'Este mes', color: 'emerald' },
          ];

          quickActions = [
            { label: 'Gestionar usuarios', description: 'Ver y administrar cuentas', link: '/ternium/usuarios', iconKey: 'users' },
            { label: 'Crear usuario', description: 'Dar de alta un nuevo empleado', link: '/ternium/usuarios/crearusuario', iconKey: 'plus' },
          ];

        // ── dispatcher ───────────────────────────────────────────────
        } else if (role === 'dispatcher') {
          const [activosRes, entregadosMesRes, rechazadosRes, recentRes] = await Promise.all([
            supabase.from('shipping_info').select('*', { count: 'exact', head: true })
              .in('status', ['Pendiente', 'En ruta']),
            supabase.from('shipping_info').select('*', { count: 'exact', head: true })
              .eq('status', 'Entregado')
              .gte('updated_at', startOfMonth),
            supabase.from('shipping_info').select('*', { count: 'exact', head: true })
              .eq('status', 'Rechazado'),
            supabase.from('orders')
              .select('id, status, created_at, product:product_id(pt), client:client_id(name), shipping_info:shipping_info_id(status)')
              .not('shipping_info_id', 'is', null)
              .order('created_at', { ascending: false })
              .limit(5),
          ]);

          kpis = [
            { label: 'Envíos activos', value: activosRes.count ?? 0, sublabel: 'Pendiente + En ruta', color: 'orange', alert: (activosRes.count ?? 0) > 0 },
            { label: 'Entregados este mes', value: entregadosMesRes.count ?? 0, sublabel: 'Confirmados', color: 'emerald' },
            { label: 'Rechazados', value: rechazadosRes.count ?? 0, sublabel: 'Requieren revisión', color: 'red', alert: (rechazadosRes.count ?? 0) > 0 },
          ];

          if ((rechazadosRes.count ?? 0) > 0) {
            alerts.push({
              type: 'warning',
              message: `${rechazadosRes.count} ${rechazadosRes.count === 1 ? 'envío rechazado' : 'envíos rechazados'} pendiente de revisión`,
              count: rechazadosRes.count ?? 0,
              link: '/ternium/despacho',
            });
          }

          recentOrders = mapRecentOrders(
            (recentRes.data ?? []) as OrderSummaryRow[],
            (id) => `/ternium/despacho/orden/${id}`,
            (row) => getNestedStatus(row.dispatch_validation) ?? getNestedStatus(
              (row as unknown as { shipping_info?: { status: string | null } }).shipping_info
            ) ?? 'Pendiente'
          );

          quickActions = [
            { label: 'Ir a Despacho', description: 'Gestionar envíos y entregas', link: '/ternium/despacho', iconKey: 'truck' },
          ];
        }

        setData({ userName, kpis, recentOrders, alerts, quickActions });
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [user, authLoading, supabase]);

  return { ...data, loading };
}
