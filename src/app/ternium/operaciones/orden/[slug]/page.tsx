'use client';

import { useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useOperacionDetail } from '@/hooks/operaciones/useOperacionDetail';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { type ExecutionDetailsStatus } from '@/types/operaciones';

type Tab = 'especificacion' | 'registro';

export default function OperacionDetailPage() {
  useRoleGuard('/ternium/operaciones');
  const router = useRouter();
  const params = useParams();
  const orderId = params.slug as string;

  const { order, loading, saving, error, saveExecutionDetails, validateEspecificacion } =
    useOperacionDetail(orderId);

  const [activeTab, setActiveTab] = useState<Tab>('especificacion');
  const [draftFormData, setDraftFormData] = useState<{
    weight: '' as string,
    shipping_packaging: '',
    note: '',
  } | null>(null);

  const formData = useMemo(
    () =>
      draftFormData ?? {
        weight: order?.execution_details?.weight?.toString() ?? '',
        shipping_packaging: order?.execution_details?.shipping_packaging ?? '',
        note: order?.execution_details?.note ?? '',
      },
    [draftFormData, order?.execution_details]
  );

  const isValidated = order?.execution_details?.status === 'Aceptado';

  const handleSave = async () => {
    if (formData.weight !== '' && parseFloat(formData.weight) < 1) {
      toast.error('El peso real debe ser al menos 1 ton');
      return;
    }
    const ok = await saveExecutionDetails({
      weight: formData.weight ? parseFloat(formData.weight) : null,
      shipping_packaging: formData.shipping_packaging,
      note: formData.note,
    });
    if (ok) setDraftFormData(null);
  };

  const handleValidate = async () => {
    const ok = await validateEspecificacion({
      weight: formData.weight ? parseFloat(formData.weight) : null,
      shipping_packaging: formData.shipping_packaging,
      note: formData.note,
    });
    if (ok) setDraftFormData(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10">
        <div className="max-w-5xl mx-auto">
          <LoadingSpinner size="large" message="Cargando orden..." fullScreen />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error || 'No se encontró la orden'}</p>
            <button
              onClick={() => router.push('/ternium/operaciones')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-bold"
            >
              Volver a Operaciones
            </button>
          </div>
        </div>
      </div>
    );
  }

  const specs = order.specs;
  const pi = order.programing_instructions;
  const si = order.shipping_info;

  const responsibleName = pi?.responsible_user
    ? `${pi.responsible_user.name} ${pi.responsible_user.second_name}`.trim()
    : '—';

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans text-slate-700">
      <div className="max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <button
          onClick={() => router.push('/ternium/operaciones')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors text-sm"
        >
          <FiArrowLeft className="w-4 h-4" />
          Volver a Operaciones
        </button>

        {/* Header card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Registro de Especificación
              </p>
              <h1 className="text-2xl font-extrabold text-[#1e293b] tracking-tight">
                ORD-{order.id}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {order.client?.name} · {order.product?.pt}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ExecutionStatusBadge status={order.execution_details?.status ?? null} />
            </div>
          </div>

          {/* Order meta */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Producto (PT)</p>
              <p className="font-semibold text-slate-800 text-sm">{order.product?.pt || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Master</p>
              <p className="font-semibold text-slate-800 text-sm">{order.product?.master || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Responsable</p>
              <p className="font-semibold text-slate-800 text-sm">{responsibleName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fecha Asignación</p>
              <p className="font-semibold text-slate-800 text-sm">
                {pi?.assigned_date
                  ? new Date(pi.assigned_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-6">
          {(['especificacion', 'registro'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-[#ff4301] text-[#ff4301]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'especificacion' ? 'Especificación' : 'Registro de Operación'}
            </button>
          ))}
        </div>

        {/* Tab: ESPECIFICACIÓN */}
        {activeTab === 'especificacion' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6">
              Resumen de Especificación
            </h2>
            {specs ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <SpecField label="Diámetro Interno" value={specs.inner_diameter} unit="mm" />
                <SpecField label="Diámetro Externo" value={specs.outer_diameter} unit="mm" />
                <SpecField label="Ancho" value={specs.width} unit="mm" />
                <SpecField label="Peso Mínimo" value={specs.minimum_shipping_weight} unit="ton" />
                <SpecField label="Peso Máximo" value={specs.maximum_shipping_weight} unit="ton" />
                <SpecField label="Piezas por Paquete" value={specs.pieces_per_package} unit="pzs" />
                <SpecField label="Ancho Máximo Tarima" value={specs.maximum_pallet_width} unit="mm" />
                <SpecField label="Embalaje" value={specs.shipping_packaging} />
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No hay especificaciones disponibles</p>
            )}
          </div>
        )}

        {/* Tab: REGISTRO DE OPERACIÓN */}
        {activeTab === 'registro' && (
          <div className="space-y-6">

            {/* Editable execution details */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6">
                Datos de Ejecución
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Peso Real (ton)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={formData.weight}
                    onChange={(e) => setDraftFormData({ ...formData, weight: e.target.value })}
                    disabled={isValidated}
                    placeholder="Ej: 12.5"
                    className="px-4 py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Tipo de Embalaje
                  </label>
                  <input
                    type="text"
                    value={formData.shipping_packaging}
                    onChange={(e) => setDraftFormData({ ...formData, shipping_packaging: e.target.value })}
                    disabled={isValidated}
                    placeholder="Ej: Paleta de madera"
                    className="px-4 py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Nota de Operación
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setDraftFormData({ ...formData, note: e.target.value })}
                    disabled={isValidated}
                    placeholder="Instrucciones especiales u observaciones..."
                    rows={3}
                    className="px-4 py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 transition-all outline-none resize-none disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                  />
                </div>
              </div>

              {!isValidated && (
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-sm disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Guardar datos'}
                  </button>
                </div>
              )}
            </div>

            {/* Shipping info (read-only) */}
            {si && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6">
                  Detalles de Envío
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <SpecField label="Placas" value={si.plates} />
                  <SpecField label="TAR" value={si.tar} />
                  <SpecField
                    label="Salida Programada"
                    value={
                      si.scheduled_departure_date
                        ? new Date(si.scheduled_departure_date).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : null
                    }
                  />
                  <SpecField
                    label="Fecha de Envío"
                    value={
                      si.shipped_at
                        ? new Date(si.shipped_at).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : null
                    }
                  />
                  <SpecField label="Estado Envío" value={si.status} />
                </div>
              </div>
            )}

            {/* Validate button */}
            <div className="flex justify-end">
              {isValidated ? (
                <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 text-sm font-bold px-6 py-3 rounded-xl">
                  <FiCheckCircle size={16} />
                  Especificación ya validada
                </span>
              ) : (
                <button
                  onClick={handleValidate}
                  disabled={saving}
                  className="px-8 py-3 bg-[#ff4301] hover:bg-[#e63d01] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {saving ? 'Validando...' : 'Especificación Validada'}
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

function ExecutionStatusBadge({ status }: { status: ExecutionDetailsStatus | null }) {
  const map: Record<ExecutionDetailsStatus, { label: string; classes: string }> = {
    Pendiente: { label: 'Pendiente', classes: 'bg-slate-100 text-slate-600' },
    Aceptado:  { label: 'Aceptado',  classes: 'bg-green-100 text-green-700' },
    Rechazado: { label: 'Rechazado', classes: 'bg-red-100 text-red-700' },
  };
  const cfg = status ? map[status] : map['Pendiente'];
  return (
    <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-lg border ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

function SpecField({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
}) {
  const display =
    value !== null && value !== undefined && value !== ''
      ? `${value}${unit ? ` ${unit}` : ''}`
      : '—';

  return (
    <div className="p-4 rounded-xl bg-[#fbfbfc] border border-slate-50">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-base font-bold text-slate-800">{display}</p>
    </div>
  );
}
