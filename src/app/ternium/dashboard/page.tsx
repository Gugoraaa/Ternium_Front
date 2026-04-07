'use client';

import { useUser } from '@/context/AuthContext';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import LoadingSpinner from '@/components/LoadingSpinner';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import KpiCard from '@/components/dashboard/KpiCard';
import AlertBanner from '@/components/dashboard/AlertBanner';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentOrdersMini from '@/components/dashboard/RecentOrdersMini';

const roleMoudleMap: Record<string, { link: string; label: string }> = {
  order_manager:     { link: '/ternium/gestion',      label: 'Gestión' },
  scheduler:         { link: '/ternium/programacion', label: 'Programación' },
  operations_manager:{ link: '/ternium/operaciones',  label: 'Operaciones' },
  order_controller:  { link: '/ternium/management',   label: 'Management' },
  client_manager:    { link: '/ternium/clientes',     label: 'Clientes' },
  user_admin:        { link: '/ternium/usuarios',     label: 'Usuarios' },
  admin:             { link: '/ternium/gestion',      label: 'Gestión' },
};

export default function DashboardPage() {
  useRoleGuard('/ternium/dashboard');
  const { user } = useUser();
  const { userName, kpis, recentOrders, alerts, quickActions, loading } = useDashboardData();

  const role = user?.role_name ?? '';
  const module = roleMoudleMap[role] ?? { link: '/ternium/gestion', label: 'Gestión' };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f8fafc] to-[#edf0f7] p-6 lg:p-10">
        <LoadingSpinner size="large" message="Cargando dashboard..." fullScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f8fafc] to-[#edf0f7] p-6 lg:p-10 font-sans text-slate-700">
      <div className="max-w-7xl mx-auto">

        <WelcomeHeader userName={userName} role={role} />

        <AlertBanner alerts={alerts} />

        {kpis.length > 0 && (
          <div className={`grid gap-4 mb-6 ${kpis.length === 4 ? 'grid-cols-2 lg:grid-cols-4' : kpis.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {kpis.map((kpi, i) => (
              <KpiCard key={i} kpi={kpi} />
            ))}
          </div>
        )}

        <QuickActions actions={quickActions} />

        <RecentOrdersMini
          orders={recentOrders}
          moduleLink={module.link}
          moduleLabel={module.label}
        />

      </div>
    </div>
  );
}
