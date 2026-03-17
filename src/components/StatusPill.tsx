'use client';

interface StatusPillProps {
  status: string;
  className?: string;
}

export default function StatusPill({ status, className = '' }: StatusPillProps) {
  function getStatusColor(status: string) {
    const statusColors: Record<string, string> = {
      'Revision Operador': 'bg-orange-50 text-orange-600 border-orange-100',
      'Aceptado': 'bg-green-50 text-green-600 border-green-100',
      'Rechazado': 'bg-red-50 text-red-600 border-red-100',
      'Revision Cliente': 'bg-blue-50 text-blue-600 border-blue-100'
    };
    return statusColors[status] || 'bg-gray-50 text-gray-600 border-gray-100';
  }

  return (
    <div className={`${getStatusColor(status || '')} text-[11px] font-bold px-4 py-1.5 rounded-full border flex items-center gap-2 shrink-0 min-w-fit justify-center mx-auto ${className}`}>
      <span className="w-2 h-2 bg-current rounded-full animate-pulse"></span> 
      {status}
    </div>
  );
}
