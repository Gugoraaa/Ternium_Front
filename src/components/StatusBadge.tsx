import type { OrderStatus } from "@/types/orders";


export default function StatusBadge({ status }: { status: OrderStatus }) {
  const styles = {
    'Revision Operador': 'bg-blue-100 text-blue-700',
    'Aceptado': 'bg-green-100 text-green-700',
    'Rechazado': 'bg-red-100 text-red-700',
    'Revision Cliente': 'bg-yellow-100 text-yellow-700'
  };

  return (
    <span className={`mx-auto block w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${styles[status]}`}>
      {status}
    </span>
  );
};