'use client';

interface StatusPillProps {
  status: string;
  className?: string;
}

export default function StatusPill({ status, className = '' }: StatusPillProps) {
  const styles: Record<string, { pill: string; dot: string }> = {
    'Revision Operador': {
      pill: 'bg-orange-50 text-orange-600 border border-orange-200',
      dot: 'bg-orange-500',
    },
    'Aceptado': {
      pill: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      dot: 'bg-emerald-500',
    },
    'Rechazado': {
      pill: 'bg-red-50 text-red-600 border border-red-200',
      dot: 'bg-red-500',
    },
    'Revision Cliente': {
      pill: 'bg-blue-50 text-blue-600 border border-blue-200',
      dot: 'bg-blue-500',
    },
  };

  const cfg = styles[status] ?? {
    pill: 'bg-slate-50 text-slate-600 border border-slate-200',
    dot: 'bg-slate-400',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-semibold shrink-0 min-w-fit ${cfg.pill} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${cfg.dot}`} />
      {status}
    </div>
  );
}
