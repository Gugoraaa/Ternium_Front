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

interface TarimaComparisonPanelProps {
  originalSpec: RawDbSpec | null | undefined;
  originalOrientation: CoilOrientation;
  offerSpec: RawDbSpec | null | undefined;
  offerOrientation: CoilOrientation;
}

/**
 * Side-by-side 3D comparison: original specs vs counter-offer specs.
 * Shows delta indicators for key metrics.
 */
export default function TarimaComparisonPanel({
  originalSpec,
  originalOrientation,
  offerSpec,
  offerOrientation,
}: TarimaComparisonPanelProps) {
  const original = useTarimaSimulation({ spec: originalSpec, orientation: originalOrientation });
  const offer = useTarimaSimulation({ spec: offerSpec, orientation: offerOrientation });

  const hasEither = !original.isIncomplete || !offer.isIncomplete;

  if (!hasEither) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
          Comparación de tarimas — Original vs Contraoferta
        </h3>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ORIGINAL */}
        <ComparisonColumn
          label="Especificación Original"
          result={original.validationResult}
          accentClass="border-slate-300"
        />

        {/* OFFER */}
        <ComparisonColumn
          label="Propuesta del Cliente"
          result={offer.validationResult}
          accentClass="border-blue-300"
        />
      </div>

      {/* Delta summary row */}
      {original.validationResult && offer.validationResult && (
        <div className="px-5 pb-5">
          <DeltaRow
            label="Peso"
            originalValue={original.validationResult.simulation.totalWeightTonnes}
            offerValue={offer.validationResult.simulation.totalWeightTonnes}
            unit="ton"
            lowerIsBetter
          />
          <DeltaRow
            label="Altura"
            originalValue={original.validationResult.simulation.totalHeightMm}
            offerValue={offer.validationResult.simulation.totalHeightMm}
            unit="mm"
            lowerIsBetter
          />
          <DeltaRow
            label="Ancho"
            originalValue={original.validationResult.simulation.totalWidthMm}
            offerValue={offer.validationResult.simulation.totalWidthMm}
            unit="mm"
            lowerIsBetter
          />
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ComparisonColumn({
  label,
  result,
  accentClass,
}: {
  label: string;
  result: ReturnType<typeof useTarimaSimulation>['validationResult'];
  accentClass: string;
}) {
  if (!result) {
    return (
      <div className={`rounded-xl border-2 ${accentClass} p-4 space-y-3`}>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="h-48 bg-slate-50 rounded-lg flex items-center justify-center">
          <p className="text-xs text-slate-400">Sin datos</p>
        </div>
      </div>
    );
  }

  const { riskLevel, violations, warnings, simulation } = result;

  return (
    <div className={`rounded-xl border-2 ${accentClass} p-4 space-y-3`}>
      <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <TarimaViewer simulation={simulation} riskLevel={riskLevel} height="220px" />
      <TarimaRiskBadge riskLevel={riskLevel} violations={violations} warnings={warnings} />
    </div>
  );
}

function DeltaRow({
  label,
  originalValue,
  offerValue,
  unit,
  lowerIsBetter,
}: {
  label: string;
  originalValue: number;
  offerValue: number;
  unit: string;
  lowerIsBetter: boolean;
}) {
  const delta = offerValue - originalValue;
  const improved = lowerIsBetter ? delta < 0 : delta > 0;
  const worsened = lowerIsBetter ? delta > 0 : delta < 0;

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-600">
          {originalValue.toFixed(1)} {unit}
        </span>
        <span className="text-slate-300">→</span>
        <span className="text-xs text-slate-600">
          {offerValue.toFixed(1)} {unit}
        </span>
        {delta !== 0 && (
          <span
            className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
              improved
                ? 'bg-emerald-100 text-emerald-700'
                : worsened
                ? 'bg-red-100 text-red-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {delta > 0 ? '+' : ''}
            {delta.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );
}
