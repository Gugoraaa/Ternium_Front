import type { OrderStatus } from "@/types/orders";

export default function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    'Revision Operador': 'bg-blue-50 text-blue-700 border border-blue-100',
    'Aceptado':          'bg-emerald-50 text-emerald-700 border border-emerald-100',
    'Rechazado':         'bg-red-50 text-red-600 border border-red-100',
    'Revision Cliente':  'bg-amber-50 text-amber-700 border border-amber-100',
  };

  return (
    <span className={`mx-auto block w-fit px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide ${styles[status]}`}>
      {status}
    </span>
  );
}
