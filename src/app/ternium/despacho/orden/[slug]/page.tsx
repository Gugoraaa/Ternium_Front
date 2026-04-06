'use client';

import dynamic from 'next/dynamic';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft, FiCheckCircle, FiTruck } from 'react-icons/fi';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useDespachoDetail } from '@/hooks/despacho/useDespachoDetail';

// Load map with SSR disabled — Leaflet requires window
const DespachoMap = dynamic(() => import('@/components/despacho/DespachoMap'), { ssr: false });

export default function OrdenDespachoPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.slug as string;

  const { order, loading, saving, error, marcarEntregada } = useDespachoDetail(orderId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10">
        <LoadingSpinner size="large" message="Cargando orden de despacho..." fullScreen />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 text-sm">{error || 'No se encontró la orden'}</p>
            <button
              onClick={() => router.push('/ternium/despacho')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  const si = order.shipping_info;
  const isDelivered = si?.status === 'Aceptado';
  const isPending = si?.status === 'Pendiente';

  // Mock data (client-side only)
  const displayTar    = si?.tar    ?? `Tar-${String(order.id).padStart(4, '0')}`;
  const displayPlates = si?.plates ?? `PLC-${order.id}X`;
  const transporte    = 'Transportes del Valle S.A. de C.V.';

  const approvedAt = order.dispatch_validation?.approved_at
    ? new Date(order.dispatch_validation.approved_at).toLocaleDateString('es-MX', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '—';

  const shippedAt = si?.shipped_at
    ? new Date(si.shipped_at).toLocaleDateString('es-MX', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : null;

  const scheduledDate = si?.scheduled_departure_date
    ? new Date(si.scheduled_departure_date).toLocaleDateString('es-MX', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : '—';

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans text-slate-700">
      <div className="max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <button
          onClick={() => router.push('/ternium/despacho')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors text-sm"
        >
          <FiArrowLeft className="w-4 h-4" />
          Volver a Logística y Despacho
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Orden de Despacho
              </p>
              <h1 className="text-2xl font-extrabold text-[#1e293b] tracking-tight">
                OD-{String(order.id).padStart(4, '0')}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {order.client?.name} · {order.product?.pt}
              </p>
            </div>
            <ShippingStatusBadge status={si?.status ?? null} />
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
              Seguimiento de Ruta
            </h2>
          </div>
          <div className="h-[360px]">
            <DespachoMap />
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Datos de envío */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                Datos de Envío
              </h2>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <InfoCard label="Cliente" value={order.client?.name || '—'} />
              <InfoCard label="Producto (PT)" value={order.product?.pt || '—'} />
              <InfoCard label="Master" value={order.product?.master || '—'} />
              <InfoCard label="Empresa Transportista" value={transporte} />
              <InfoCard label="TAR" value={displayTar} />
              <InfoCard label="Placas" value={displayPlates} />
            </div>
          </div>

          {/* Fechas y estado */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                Fechas y Estado
              </h2>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <InfoCard label="Fecha Aprobación Despacho" value={approvedAt} />
              <InfoCard label="Fecha Salida Programada" value={scheduledDate} />
              <InfoCard
                label="Fecha Entrega"
                value={shippedAt || (isPending ? 'Pendiente de entrega' : '—')}
              />
              <InfoCard label="Estado de Envío" value={si?.status || '—'} />
            </div>
          </div>
        </div>

        {/* Acción */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-6">
            Estado de Entrega
          </h2>

          {isPending ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-slate-500 text-sm">
                Confirma la entrega una vez que el transporte haya llegado al destino.
              </p>
              <button
                onClick={marcarEntregada}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg hover:-translate-y-0.5 active:scale-95 text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <FiTruck size={16} />
                {saving ? 'Procesando...' : 'Marcar Orden Entregada'}
              </button>
            </div>
          ) : isDelivered ? (
            <div className="flex items-center gap-3">
              <FiCheckCircle className="text-green-600 shrink-0" size={20} />
              <span className="text-green-700 font-semibold text-sm">
                Orden entregada exitosamente
                {shippedAt && (
                  <span className="text-slate-400 font-normal ml-2 text-xs">· {shippedAt}</span>
                )}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-slate-500 text-sm">Esta orden no está disponible para entrega.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function ShippingStatusBadge({ status }: { status: string | null }) {
  const map: Record<string, { label: string; classes: string }> = {
    Pendiente: { label: 'En Tránsito', classes: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    Aceptado:  { label: 'Entregado',   classes: 'bg-green-100 text-green-700 border-green-200' },
    Rechazado: { label: 'Rechazado',   classes: 'bg-red-100 text-red-700 border-red-200' },
  };

  const cfg = status ? (map[status] ?? map['Pendiente']) : map['Pendiente'];

  return (
    <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-lg border ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center p-3 rounded-lg bg-[#fbfbfc] border border-slate-50">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-bold text-slate-800">{value}</span>
    </div>
  );
}
