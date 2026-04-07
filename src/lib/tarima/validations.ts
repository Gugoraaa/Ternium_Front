import { TARIMA_CONSTANTS as C } from './constants';
import { computeLayout } from './simulation';
import type {
  TarimaSpec,
  RawDbSpec,
  CoilOrientation,
  RiskLevel,
  RiskColors,
  SimulationResult,
  ValidationResult,
  ValidationViolation,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function toNum(v: number | string | null | undefined): number {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function pct(actual: number, limit: number): number {
  if (limit === 0) return 0;
  return Math.round((actual / limit) * 10000) / 100; // two decimals
}

function makeViolation(
  field: string,
  actual: number,
  limit: number,
  message: string
): ValidationViolation {
  return { field, actualValue: actual, limitValue: limit, percentage: pct(actual, limit), message };
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalization
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a raw DB row (specs OR order_offers_specs) into a clean TarimaSpec.
 * Returns null if required dimensions are missing.
 */
export function normalizeTarimaSpec(
  raw: RawDbSpec,
  orientation: CoilOrientation
): TarimaSpec | null {
  const innerDiameter = toNum(raw.inner_diameter);
  const outerDiameter = toNum(raw.outer_diameter);
  const width = toNum(raw.width);
  const maximumShippingWeight = toNum(raw.maximum_shipping_weight);
  const piecesPerPackage = toNum(raw.pieces_per_package) || 1;
  const maximumPalletWidth = toNum(raw.maximum_pallet_width);

  // Cannot simulate without the fundamental coil geometry
  if (outerDiameter <= 0 || width <= 0) return null;

  return {
    innerDiameter,
    outerDiameter,
    width,
    maximumShippingWeight,
    piecesPerPackage,
    maximumPalletWidth,
    shippingPackaging: raw.shipping_packaging ?? '',
    coilOrientation: orientation,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation engine
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates a SimulationResult against all business rules.
 * Returns a ValidationResult with risk level, violations, and warnings.
 */
export function validateTarima(simulation: SimulationResult): ValidationResult {
  const { spec } = simulation;
  const isVertical = spec.coilOrientation === 'vertical';

  const violations: ValidationViolation[] = [];
  const warnings: ValidationViolation[] = [];

  // ── Weight check ────────────────────────────────────────────────────────────
  const weightLimit = isVertical
    ? C.VERTICAL_MAX_WEIGHT_TONNES
    : C.HORIZONTAL_MAX_WEIGHT_TONNES;

  const weightPct = pct(simulation.totalWeightTonnes, weightLimit);

  if (weightPct > 100) {
    violations.push(
      makeViolation(
        'totalWeightTonnes',
        simulation.totalWeightTonnes,
        weightLimit,
        isVertical
          ? `Peso excede el máximo permitido en tarima vertical (${weightLimit} ton)`
          : `Peso excede la capacidad de la grúa (${weightLimit} ton)`
      )
    );
  } else if (weightPct >= C.WARNING_THRESHOLD * 100) {
    warnings.push(
      makeViolation(
        'totalWeightTonnes',
        simulation.totalWeightTonnes,
        weightLimit,
        `Peso cercano al límite (${simulation.totalWeightTonnes} / ${weightLimit} ton)`
      )
    );
  }

  // ── Height check (vertical only) ────────────────────────────────────────────
  if (isVertical) {
    const heightPct = pct(simulation.totalHeightMm, C.VERTICAL_MAX_HEIGHT_MM);

    if (heightPct > 100) {
      violations.push(
        makeViolation(
          'totalHeightMm',
          simulation.totalHeightMm,
          C.VERTICAL_MAX_HEIGHT_MM,
          `Altura excede la altura máxima permitida (${C.VERTICAL_MAX_HEIGHT_MM} mm)`
        )
      );
    } else if (heightPct >= C.WARNING_THRESHOLD * 100) {
      warnings.push(
        makeViolation(
          'totalHeightMm',
          simulation.totalHeightMm,
          C.VERTICAL_MAX_HEIGHT_MM,
          `Altura cercana al límite de seguridad (${simulation.totalHeightMm} mm / ${C.VERTICAL_MAX_HEIGHT_MM} mm)`
        )
      );
    }
  }

  // ── Width check (horizontal only) ───────────────────────────────────────────
  if (!isVertical) {
    const effectiveMaxWidth =
      spec.maximumPalletWidth > 0
        ? spec.maximumPalletWidth
        : C.HORIZONTAL_DEFAULT_MAX_WIDTH_MM;

    const widthPct = pct(simulation.totalWidthMm, effectiveMaxWidth);

    // Also check if not all pieces fit in a single row
    const coilsPerRow = Math.max(1, Math.floor(effectiveMaxWidth / spec.width));
    if (spec.piecesPerPackage > coilsPerRow) {
      violations.push(
        makeViolation(
          'piecesPerPackage',
          spec.piecesPerPackage,
          coilsPerRow,
          `No todas las piezas caben en una fila (${spec.piecesPerPackage} piezas > ${coilsPerRow} espacios disponibles)`
        )
      );
    } else if (widthPct > 100) {
      violations.push(
        makeViolation(
          'totalWidthMm',
          simulation.totalWidthMm,
          effectiveMaxWidth,
          `Ancho total excede el ancho máximo de tarima (${effectiveMaxWidth} mm)`
        )
      );
    } else if (widthPct >= C.WARNING_THRESHOLD * 100) {
      warnings.push(
        makeViolation(
          'totalWidthMm',
          simulation.totalWidthMm,
          effectiveMaxWidth,
          `Ancho cercano al límite de tarima (${simulation.totalWidthMm} mm / ${effectiveMaxWidth} mm)`
        )
      );
    }
  }

  // ── Determine risk level ────────────────────────────────────────────────────
  let riskLevel: RiskLevel;
  if (violations.length > 0) {
    riskLevel = 'NO_PERMITIDO';
  } else if (warnings.length > 0) {
    // If any warning is ≥ 95%, escalate to RIESGOSO
    const hasHighWarning = warnings.some((w) => w.percentage >= 95);
    riskLevel = hasHighWarning ? 'RIESGOSO' : 'OBSERVACION';
  } else {
    riskLevel = 'SEGURO';
  }

  return { riskLevel, violations, warnings, simulation };
}

// ─────────────────────────────────────────────────────────────────────────────
// Convenience entry point
// ─────────────────────────────────────────────────────────────────────────────

/**
 * normalize → simulate → validate in one call.
 * Returns null if the spec is incomplete (missing required dimensions).
 */
export function computeTarimaValidation(
  raw: RawDbSpec,
  orientation: CoilOrientation
): ValidationResult | null {
  const spec = normalizeTarimaSpec(raw, orientation);
  if (!spec) return null;
  const simulation = computeLayout(spec);
  return validateTarima(simulation);
}

// ─────────────────────────────────────────────────────────────────────────────
// UI helpers — kept here so they co-locate with the domain logic
// ─────────────────────────────────────────────────────────────────────────────

export function getRiskColors(level: RiskLevel): RiskColors {
  switch (level) {
    case 'SEGURO':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-400',
        dot: 'bg-emerald-500',
        threeHex: '#22c55e',
        label: 'Seguro',
      };
    case 'OBSERVACION':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-400',
        dot: 'bg-amber-500',
        threeHex: '#f59e0b',
        label: 'Observación',
      };
    case 'RIESGOSO':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-400',
        dot: 'bg-orange-500',
        threeHex: '#f97316',
        label: 'Riesgoso',
      };
    case 'NO_PERMITIDO':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-400',
        dot: 'bg-red-500',
        threeHex: '#ef4444',
        label: 'No Permitido',
      };
  }
}
