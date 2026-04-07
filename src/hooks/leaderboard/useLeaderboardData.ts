'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

export type Period = 'week' | 'month' | 'all';

export interface LeaderboardEntry {
  userId: string;
  name: string;
  roleName: string;
  total: number;
  accepted: number;
  rejected: number;
  reasignaciones: number;
  compositeScore: number;
  rank: number;
}

export interface LeaderboardData {
  trabajadores: LeaderboardEntry[];  // programing_instructions.responsible
  gestores: LeaderboardEntry[];      // orders.reviewed_by
  loading: boolean;
}

function getDateFilter(period: Period): string | null {
  if (period === 'all') return null;
  const now = new Date();
  const days = period === 'week' ? 7 : 30;
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

function calcTrabajadorScore(total: number, reasignaciones: number): number {
  if (total === 0) return 0;
  const reasignRate = reasignaciones / total;
  return Math.round((total * 1.0 + (1 - reasignRate) * 10) * 100) / 100;
}

function calcGestorScore(total: number, accepted: number): number {
  if (total === 0) return 0;
  const acceptRate = accepted / total;
  return Math.round((total * 1.0 + acceptRate * 5) * 100) / 100;
}

export function useLeaderboardData(period: Period): LeaderboardData {
  const [trabajadores, setTrabajadores] = useState<LeaderboardEntry[]>([]);
  const [gestores, setGestores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        setLoading(true);
        const dateFilter = getDateFilter(period);

        // Fetch all users with their roles (for name resolution)
        const { data: usersData } = await supabase
          .from('users')
          .select('id, name, second_name, role_id, roles(name)')
          .eq('active', true);

        const userMap = new Map<string, { name: string; roleName: string }>();
        (usersData ?? []).forEach((u: any) => {
          userMap.set(u.id, {
            name: `${u.name} ${u.second_name}`.trim(),
            roleName: u.roles?.name ?? '—',
          });
        });

        // ── Trabajadores: programing_instructions.responsible ──────────
        let trabQuery = supabase
          .from('programing_instructions')
          .select('responsible, status, assigned_date')
          .not('responsible', 'is', null);

        if (dateFilter) {
          trabQuery = trabQuery.gte('assigned_date', dateFilter.split('T')[0]);
        }

        const { data: trabData } = await trabQuery;

        // Aggregate by responsible
        const trabMap = new Map<string, { total: number; reasignaciones: number }>();
        (trabData ?? []).forEach((r: any) => {
          const uid = r.responsible;
          if (!uid) return;
          const prev = trabMap.get(uid) ?? { total: 0, reasignaciones: 0 };
          trabMap.set(uid, {
            total: prev.total + 1,
            reasignaciones: prev.reasignaciones + (r.status === 'Reasignado' ? 1 : 0),
          });
        });

        const trabEntries: LeaderboardEntry[] = Array.from(trabMap.entries())
          .map(([userId, stats]) => {
            const user = userMap.get(userId);
            return {
              userId,
              name: user?.name ?? 'Usuario desconocido',
              roleName: user?.roleName ?? '—',
              total: stats.total,
              accepted: stats.total - stats.reasignaciones,
              rejected: 0,
              reasignaciones: stats.reasignaciones,
              compositeScore: calcTrabajadorScore(stats.total, stats.reasignaciones),
              rank: 0,
            };
          })
          .sort((a, b) => b.compositeScore - a.compositeScore)
          .map((e, i) => ({ ...e, rank: i + 1 }));

        // ── Gestores: orders.reviewed_by ──────────────────────────────
        let gestQuery = supabase
          .from('orders')
          .select('reviewed_by, status, created_at')
          .not('reviewed_by', 'is', null)
          .eq('reviewed', true);

        if (dateFilter) {
          gestQuery = gestQuery.gte('created_at', dateFilter);
        }

        const { data: gestData } = await gestQuery;

        // Aggregate by reviewed_by
        const gestMap = new Map<string, { total: number; accepted: number; rejected: number }>();
        (gestData ?? []).forEach((r: any) => {
          const uid = r.reviewed_by;
          if (!uid) return;
          const prev = gestMap.get(uid) ?? { total: 0, accepted: 0, rejected: 0 };
          gestMap.set(uid, {
            total: prev.total + 1,
            accepted: prev.accepted + (r.status === 'Aceptado' ? 1 : 0),
            rejected: prev.rejected + (r.status === 'Rechazado' ? 1 : 0),
          });
        });

        const gestEntries: LeaderboardEntry[] = Array.from(gestMap.entries())
          .map(([userId, stats]) => {
            const user = userMap.get(userId);
            return {
              userId,
              name: user?.name ?? 'Usuario desconocido',
              roleName: user?.roleName ?? '—',
              total: stats.total,
              accepted: stats.accepted,
              rejected: stats.rejected,
              reasignaciones: 0,
              compositeScore: calcGestorScore(stats.total, stats.accepted),
              rank: 0,
            };
          })
          .sort((a, b) => b.compositeScore - a.compositeScore)
          .map((e, i) => ({ ...e, rank: i + 1 }));

        if (!cancelled) {
          setTrabajadores(trabEntries);
          setGestores(gestEntries);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [period]);

  return { trabajadores, gestores, loading };
}
