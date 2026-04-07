'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/context/AuthContext';

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

    const role = user.role_name ?? '';

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
          .single();

        const userName = userData
          ? `${userData.name} ${userData.second_name}`.trim()
          : user!.email ?? '';

        let kpis: DashboardKpi[] = [];
        let recentOrders: RecentOrder[] = [];
        const alerts: DashboardAlert[] = [];
        let quickActions: QuickAction[] = [];

        // ── order_manager ────────────────────────────────────────────
        if (role === 'order_manager' || role === 'admin') {
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
            { label: 'Contraoffertas activas', value: contraOfferRes.count ?? 0, sublabel: 'Sin responder', color: 'blue', alert: (contraOfferRes.count ?? 0) > 0 },
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

          recentOrders = (recentRes.data ?? []).map((o: any) => ({
            id: o.id,
            producto: o.product?.pt ?? '—',
            cliente: o.client?.name ?? '—',
            fecha: o.created_at,
            status: o.status,
            detailLink: `/ternium/gestion/orden/${o.id}`,
          }));

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

          recentOrders = (recentRes.data ?? []).map((o: any) => ({
            id: o.id,
            producto: o.product?.pt ?? '—',
            cliente: o.client?.name ?? '—',
            fecha: o.created_at,
            status: o.programing_instructions?.status ?? 'Sin asignar',
            detailLink: `/ternium/programacion/editar/${o.id}`,
          }));

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

          recentOrders = (recentRes.data ?? []).map((o: any) => ({
            id: o.id,
            producto: o.product?.pt ?? '—',
            cliente: o.client?.name ?? '—',
            fecha: o.created_at,
            status: o.execution_details?.status ?? 'Pendiente',
            detailLink: `/ternium/operaciones/orden/${o.id}`,
          }));

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

          recentOrders = (recentRes.data ?? []).map((o: any) => ({
            id: o.id,
            producto: o.product?.pt ?? '—',
            cliente: o.client?.name ?? '—',
            fecha: o.created_at,
            status: o.dispatch_validation?.status ?? 'Pendiente',
            detailLink: `/ternium/management/orden/${o.id}`,
          }));

          quickActions = [
            { label: 'Validar despachos', description: 'Revisar órdenes listas', link: '/ternium/management', iconKey: 'checkCircle' },
          ];

        // ── client_manager ───────────────────────────────────────────
        } else if (role === 'client_manager') {
          const { data: cwData } = await supabase
            .from('client_workers')
            .select('client_id')
            .eq('user_id', user!.id);

          const clientIds = (cwData ?? []).map((r: any) => r.client_id);

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

            recentOrders = (recentRes.data ?? []).map((o: any) => ({
              id: o.id,
              producto: o.product?.pt ?? '—',
              cliente: o.client?.name ?? '—',
              fecha: o.created_at,
              status: o.status,
              detailLink: `/ternium/clientes/orden/${o.id}`,
            }));
          }

          quickActions = [
            { label: 'Ver órdenes de clientes', description: 'Estado de mis clientes', link: '/ternium/clientes', iconKey: 'users' },
          ];

        // ── user_admin ───────────────────────────────────────────────
        } else if (role === 'user_admin') {
          const [usuariosActivosRes, ordenesTotalRes, pendienteRevisionRes, nuevosUsuariosMesRes, recentRes] =
            await Promise.all([
              supabase.from('users').select('*', { count: 'exact', head: true }).eq('active', true),
              supabase.from('orders').select('*', { count: 'exact', head: true }),
              supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'Revision Operador'),
              supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
              supabase.from('orders')
                .select('id, status, created_at, product:product_id(pt), client:client_id(name)')
                .order('created_at', { ascending: false })
                .limit(5),
            ]);

          kpis = [
            { label: 'Usuarios activos', value: usuariosActivosRes.count ?? 0, sublabel: 'En el sistema', color: 'blue' },
            { label: 'Total de órdenes', value: ordenesTotalRes.count ?? 0, sublabel: 'En la plataforma', color: 'slate' },
            { label: 'Pendientes de revisión', value: pendienteRevisionRes.count ?? 0, sublabel: 'Sin atender', color: 'orange', alert: (pendienteRevisionRes.count ?? 0) > 0 },
            { label: 'Nuevos usuarios (mes)', value: nuevosUsuariosMesRes.count ?? 0, sublabel: 'Este mes', color: 'emerald' },
          ];

          recentOrders = (recentRes.data ?? []).map((o: any) => ({
            id: o.id,
            producto: o.product?.pt ?? '—',
            cliente: o.client?.name ?? '—',
            fecha: o.created_at,
            status: o.status,
            detailLink: `/ternium/gestion/orden/${o.id}`,
          }));

          quickActions = [
            { label: 'Gestionar usuarios', description: 'Ver y administrar cuentas', link: '/ternium/usuarios', iconKey: 'users' },
            { label: 'Crear usuario', description: 'Dar de alta un nuevo empleado', link: '/ternium/usuarios/crearusuario', iconKey: 'plus' },
          ];
        }

        setData({ userName, kpis, recentOrders, alerts, quickActions });
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [user, authLoading]);

  return { ...data, loading };
}
