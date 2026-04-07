import Link from 'next/link';
import type { RecentOrder } from '@/hooks/dashboard/useDashboardData';

const statusStyle: Record<string, string> = {
  'Revision Operador': 'bg-orange-50 text-orange-600 border-orange-100',
  'Revision Cliente':  'bg-blue-50 text-blue-600 border-blue-100',
  'Aceptado':          'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Rechazado':         'bg-red-50 text-red-600 border-red-100',
  'Sin asignar':       'bg-slate-100 text-slate-600 border-slate-200',
  'Asignado':          'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Reasignado':        'bg-amber-50 text-amber-700 border-amber-100',
  'Pendiente':         'bg-slate-100 text-slate-600 border-slate-200',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  return `Hace ${Math.floor(hrs / 24)}d`;
}

interface RecentOrdersMiniProps {
  orders: RecentOrder[];
  moduleLink: string;
  moduleLabel: string;
}

export default function RecentOrdersMini({ orders, moduleLink, moduleLabel }: RecentOrdersMiniProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.06)] overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-bold text-slate-800 text-sm">Actividad reciente</h2>
        <Link
          href={moduleLink}
          className="text-[11px] font-bold text-[#ff4301] hover:underline"
        >
          Ver todo en {moduleLabel} →
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="px-6 py-10 text-center text-slate-400 text-sm">
          No hay actividad reciente.
        </div>
      ) : (
        <table className="w-full text-left">
          <thead className="bg-gradient-to-r from-slate-50 to-[#f8fafc] border-b border-slate-100">
            <tr className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Producto</th>
              <th className="px-6 py-3">Cliente</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3 text-right">Hace</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.map((order) => {
              const style = statusStyle[order.status] ?? 'bg-slate-100 text-slate-600 border-slate-200';
              return (
                <tr key={order.id} className="hover:bg-[#fff6f2] transition-colors duration-150 group">
                  <td className="px-6 py-3.5">
                    <Link
                      href={order.detailLink}
                      className="font-bold text-sm text-[#ff4301] hover:underline"
                    >
                      #{order.id}
                    </Link>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-slate-600 font-mono">{order.producto}</td>
                  <td className="px-6 py-3.5 text-sm text-slate-500">{order.cliente}</td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold border ${style}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right text-[11px] text-slate-400 font-medium">
                    {timeAgo(order.fecha)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
