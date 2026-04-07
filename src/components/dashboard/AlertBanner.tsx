import Link from 'next/link';
import type { DashboardAlert } from '@/hooks/dashboard/useDashboardData';
import { MdWarningAmber, MdErrorOutline } from 'react-icons/md';

interface AlertBannerProps {
  alerts: DashboardAlert[];
}

export default function AlertBanner({ alerts }: AlertBannerProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mb-6">
      {alerts.map((alert, i) => {
        const isError = alert.type === 'error';
        return (
          <Link
            key={i}
            href={alert.link}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-opacity hover:opacity-80 ${
              isError
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            {isError
              ? <MdErrorOutline size={18} className="shrink-0" />
              : <MdWarningAmber size={18} className="shrink-0" />
            }
            <span>{alert.message}</span>
            <span className="ml-auto text-xs font-bold opacity-60">Ver →</span>
          </Link>
        );
      })}
    </div>
  );
}
