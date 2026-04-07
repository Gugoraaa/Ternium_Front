import type { DashboardKpi } from '@/hooks/dashboard/useDashboardData';

const colorMap = {
  orange: {
    bg: 'bg-[#ff4301]/8',
    border: 'border-[#ff4301]/20',
    value: 'text-[#ff4301]',
    dot: 'bg-[#ff4301]',
    label: 'text-[#ff4301]/70',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    value: 'text-emerald-700',
    dot: 'bg-emerald-500',
    label: 'text-emerald-600/70',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    value: 'text-blue-700',
    dot: 'bg-blue-500',
    label: 'text-blue-600/70',
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-100',
    value: 'text-red-700',
    dot: 'bg-red-500',
    label: 'text-red-600/70',
  },
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    value: 'text-slate-700',
    dot: 'bg-slate-400',
    label: 'text-slate-500',
  },
};

interface KpiCardProps {
  kpi: DashboardKpi;
}

export default function KpiCard({ kpi }: KpiCardProps) {
  const c = colorMap[kpi.color];

  return (
    <div className={`relative bg-white rounded-2xl border ${c.border} shadow-[0_2px_12px_rgba(15,23,42,0.06)] p-6 flex flex-col gap-3 overflow-hidden`}>
      {kpi.alert && kpi.value > 0 && (
        <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4301] opacity-60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff4301]" />
        </span>
      )}

      <div className={`inline-flex items-center gap-1.5 self-start ${c.bg} ${c.label} text-[10px] font-bold px-2.5 py-1 rounded-full border ${c.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        {kpi.sublabel.toUpperCase()}
      </div>

      <div>
        <span className={`text-4xl font-extrabold tracking-tight ${c.value}`}>
          {kpi.value.toLocaleString('es-MX')}
        </span>
      </div>

      <p className="text-sm font-medium text-slate-500 leading-tight">{kpi.label}</p>
    </div>
  );
}
