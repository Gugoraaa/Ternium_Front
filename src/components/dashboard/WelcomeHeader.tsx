'use client';

import { getRoleLabel, normalizeRoleName } from '@/lib/permissions';

const roleColorMap: Record<string, string> = {
  order_manager: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  scheduler: 'bg-pink-50 text-pink-700 border-pink-100',
  operations_manager: 'bg-blue-50 text-blue-700 border-blue-100',
  order_controller: 'bg-purple-50 text-purple-700 border-purple-100',
  client_manager: 'bg-orange-50 text-orange-700 border-orange-100',
  user_admin: 'bg-slate-100 text-slate-700 border-slate-200',
  admin: 'bg-red-50 text-red-700 border-red-100',
  dispatcher: 'bg-amber-50 text-amber-700 border-amber-100',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function formatDate(): string {
  return new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface WelcomeHeaderProps {
  userName: string;
  role: string;
}

export default function WelcomeHeader({ userName, role }: WelcomeHeaderProps) {
  const normalizedRole = normalizeRoleName(role);
  const roleInfo = {
    label: getRoleLabel(role),
    color: normalizedRole ? roleColorMap[normalizedRole] ?? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-100 text-slate-700 border-slate-200',
  };
  const firstName = userName.split(' ')[0];

  return (
    <header className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className={`inline-flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 rounded-full border mb-3 ${roleInfo.color}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {roleInfo.label.toUpperCase()}
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}, {firstName}.
          </h1>
          <p className="text-slate-500 mt-1.5">
            Aquí está el resumen de tu día.
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-medium text-slate-400 capitalize">{formatDate()}</p>
        </div>
      </div>
    </header>
  );
}
