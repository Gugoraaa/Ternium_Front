import Link from 'next/link';
import type { QuickAction } from '@/hooks/dashboard/useDashboardData';
import { FiPlus, FiCalendar, FiClipboard, FiUsers, FiCheckCircle, FiTool } from 'react-icons/fi';

const iconMap: Record<string, React.ReactNode> = {
  plus:        <FiPlus size={20} />,
  calendar:    <FiCalendar size={20} />,
  clipboard:   <FiClipboard size={20} />,
  users:       <FiUsers size={20} />,
  checkCircle: <FiCheckCircle size={20} />,
  wrench:      <FiTool size={20} />,
};

interface QuickActionsProps {
  actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  if (actions.length === 0) return null;

  return (
    <div className="mb-6">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Accesos rápidos</p>
      <div className="flex flex-wrap gap-3">
        {actions.map((action) => (
          <Link
            key={action.link}
            href={action.link}
            className="flex items-center gap-3 bg-white border border-slate-200 hover:border-[#ff4301]/40 hover:shadow-[0_4px_16px_rgba(255,67,1,0.1)] rounded-xl px-5 py-3.5 transition-all group"
          >
            <span className="text-slate-400 group-hover:text-[#ff4301] transition-colors">
              {iconMap[action.iconKey] ?? <FiClipboard size={20} />}
            </span>
            <div>
              <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors leading-tight">
                {action.label}
              </p>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
