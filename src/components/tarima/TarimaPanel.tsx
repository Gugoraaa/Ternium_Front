'use client';

import dynamic from 'next/dynamic';
import { useTarimaSimulation } from '@/hooks/tarima/useTarimaSimulation';
import { getRiskColors } from '@/lib/tarima/validations';
import TarimaRiskBadge from './TarimaRiskBadge';
import TarimaLoadingFallback from './TarimaLoadingFallback';
import type { CoilOrientation, RawDbSpec } from '@/lib/tarima/types';

const TarimaViewer = dynamic(() => import('./TarimaViewer'), {
  ssr: false,
  loading: () => <TarimaLoadingFallback />,
});

interface TarimaPanelProps {
  spec: RawDbSpec | null | undefined;
  orientation: CoilOrientation;
  /** Optional title shown above the panel */
  label?: string;
  /** Hides detailed metric table when true */
  compact?: boolean;
}

/**
 * Full self-contained tarima panel: 3D viewer + metrics + risk badge.
 * Accepts raw DB spec fields (with optional type coercion).
 */
export default function TarimaPanel({
  spec,
  orientation,
  label,
  compact = false,
}: TarimaPanelProps) {
  const { validationResult, isIncomplete, inputErrors } = useTarimaSimulation({ spec, orientation });

  if (isIncomplete || !validationResult) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {label && (
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
            {label}
          </h3>
        )}
        {inputErrors.length > 0 ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-red-700 mb-3">
              Corrige la especificación para continuar
            </p>
            <ul className="space-y-2">
              {inputErrors.map((error) => (
                <li key={error} className="text-sm text-red-700">
                  • {error}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="h-[280px] bg-slate-50 rounded-xl flex flex-col items-center justify-center gap-2">
            <span className="text-2xl">📦</span>
            <p className="text-sm text-slate-400 font-medium">
              Completa las especificaciones para ver la simulación
            </p>
          </div>
        )}
      </div>
    );
  }

  const { riskLevel, violations, warnings, simulation } = validationResult;
  const colors = getRiskColors(riskLevel);
  const { spec: s, totalWeightTonnes, totalHeightMm, totalWidthMm, stackCount } = simulation;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
          <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest">
            {label ?? 'Simulación de Tarima'}
          </h3>
        </div>
        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
          {s.coilOrientation === 'vertical' ? 'Ojo Vertical' : 'Ojo Horizontal'}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* 3D Viewer */}
        <TarimaViewer simulation={simulation} riskLevel={riskLevel} height="300px" />

        {/* Risk badge */}
        <TarimaRiskBadge
          riskLevel={riskLevel}
          violations={violations}
          warnings={warnings}
        />

        {/* Metrics table */}
        {!compact && (
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Peso total" value={`${totalWeightTonnes} ton`} />
            <Metric label="Altura total" value={`${totalHeightMm.toFixed(0)} mm`} />
            <Metric label="Ancho total" value={`${totalWidthMm.toFixed(0)} mm`} />
            <Metric label={s.coilOrientation === 'vertical' ? 'Columnas' : 'Piezas en fila'} value={String(stackCount)} />
            <Metric label="Diám. exterior" value={`${s.outerDiameter} mm`} />
            <Metric label="Piezas" value={String(s.piecesPerPackage)} />
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 bg-slate-50 rounded-lg px-3 py-2">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-bold text-slate-800">{value}</span>
    </div>
  );
}
