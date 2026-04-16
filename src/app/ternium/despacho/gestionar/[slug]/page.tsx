'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useDespachoDetail } from '@/hooks/despacho/useDespachoDetail';
import { useRoleGuard } from '@/hooks/useRoleGuard';

export default function GestionarDespachoPage() {
  useRoleGuard('/ternium/despacho');
  const router = useRouter();
  const params = useParams();
  const orderId = params.slug as string;

  const { order, loading, saving, error, generarOrden } = useDespachoDetail(orderId);

  useEffect(() => {
    if (!loading && order && order.shipping_info?.status && order.shipping_info.status !== 'Pendiente') {
      router.replace('/ternium/despacho');
    }
  }, [loading, order, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10">
        <LoadingSpinner size="large" message="Cargando orden..." fullScreen />
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

  if (!order.shipping_info?.id || (order.shipping_info.status && order.shipping_info.status !== 'Pendiente')) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-700 text-sm">Esta orden no tiene información de envío asignada.</p>
            <button
              onClick={() => router.push('/ternium/despacho')}
              className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-bold hover:bg-yellow-700 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  const si = order.shipping_info;
  const ed = order.execution_details;
  const specs = order.specs;

  const displayTar = si.tar ?? '—';
  const displayPlates = si.plates ?? '—';

  // Technical data (real)
  const pesoNeto = ed?.weight ?? specs?.minimum_shipping_weight ?? null;
  const totalPiezas = specs?.pieces_per_package ?? null;

  const scheduledDate = si.scheduled_departure_date
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
                Generación de Despacho
              </p>
              <h1 className="text-2xl font-extrabold text-[#1e293b] tracking-tight">
                ORD-{order.id}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {order.client?.name} · {order.product?.pt}
              </p>
            </div>
            <span className="inline-flex px-3 py-1.5 text-xs font-bold rounded-lg border bg-yellow-100 text-yellow-700 border-yellow-200">
              Pendiente
            </span>
          </div>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Left: Configuración de entrega */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                Configuración de Entrega
              </h2>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <InfoRow label="Empresa Transportista" value="—" />
              <InfoRow label="Guía de Remisión" value="—" />
              <InfoRow label="TAR" value={displayTar} />
              <InfoRow label="Placas" value={displayPlates} />
              <InfoRow label="Fecha Salida Programada" value={scheduledDate} />
              <InfoRow label="Producto (PT)" value={order.product?.pt || '—'} />
              <InfoRow label="Master" value={order.product?.master || '—'} />
            </div>
          </div>

          {/* Right: Confirmación técnica (real) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                Confirmación Técnica
              </h2>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <InfoRow
                label="Peso Neto (ton)"
                value={pesoNeto != null ? `${pesoNeto} ton` : '—'}
              />
              <InfoRow
                label="Total Piezas"
                value={totalPiezas != null ? `${totalPiezas} pzs` : '—'}
              />
              <InfoRow
                label="Embalaje"
                value={ed?.shipping_packaging || specs?.shipping_packaging || '—'}
              />
              <InfoRow
                label="Peso Mín. Especificado (ton)"
                value={specs?.minimum_shipping_weight != null ? `${specs.minimum_shipping_weight} ton` : '—'}
              />
              <InfoRow
                label="Peso Máx. Especificado (ton)"
                value={specs?.maximum_shipping_weight != null ? `${specs.maximum_shipping_weight} ton` : '—'}
              />
              <InfoRow
                label="Ancho Máx. Tarima"
                value={specs?.maximum_pallet_width != null ? `${specs.maximum_pallet_width} mm` : '—'}
              />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex justify-end">
          <button
            onClick={async () => {
              const ok = await generarOrden();
              if (ok) router.push(`/ternium/despacho/orden/${order.id}`);
            }}
            disabled={saving}
            className="px-8 py-3 bg-[#ff4301] hover:bg-[#e63d01] text-white font-bold rounded-xl transition-all shadow-lg hover:-translate-y-0.5 active:scale-95 text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {saving ? 'Generando...' : 'Generar Orden de Despacho'}
          </button>
        </div>

      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between items-center p-3 rounded-lg bg-[#fbfbfc] border border-slate-50">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-bold text-slate-800">{value}</span>
    </div>
  );
}
