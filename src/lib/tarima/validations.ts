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
  TarimaSubmissionGuard,
} from './types';

export const TARIMA_INPUT_LIMITS = {
  INNER_DIAMETER_MM: { min: 1, max: 2000 },
  OUTER_DIAMETER_MM: { min: 1, max: 4000 },
  WIDTH_MM: { min: 1, max: 3000 },
  SHIPPING_WEIGHT_TONNES: { min: 0.01, max: 100 },
  PIECES_PER_PACKAGE: { min: 1, max: 100 },
  MAXIMUM_PALLET_WIDTH_MM: { min: 1, max: 6000 },
} as const;

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

function isPresent(v: number | string | null | undefined): boolean {
  return v !== null && v !== undefined && v !== '';
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

export function validateTarimaInputs(raw: RawDbSpec): string[] {
  const errors: string[] = [];
  const innerDiameter = toNum(raw.inner_diameter);
  const outerDiameter = toNum(raw.outer_diameter);
  const width = toNum(raw.width);
  const minimumShippingWeight = toNum(raw.minimum_shipping_weight);
  const maximumShippingWeight = toNum(raw.maximum_shipping_weight);
  const piecesPerPackage = toNum(raw.pieces_per_package);
  const maximumPalletWidth = toNum(raw.maximum_pallet_width);

  if (!isPresent(raw.inner_diameter) || innerDiameter < TARIMA_INPUT_LIMITS.INNER_DIAMETER_MM.min) {
    errors.push(`El diámetro interno debe ser mayor o igual a ${TARIMA_INPUT_LIMITS.INNER_DIAMETER_MM.min} mm.`);
  } else if (innerDiameter > TARIMA_INPUT_LIMITS.INNER_DIAMETER_MM.max) {
    errors.push(`El diámetro interno no puede exceder ${TARIMA_INPUT_LIMITS.INNER_DIAMETER_MM.max} mm.`);
  }

  if (!isPresent(raw.outer_diameter) || outerDiameter < TARIMA_INPUT_LIMITS.OUTER_DIAMETER_MM.min) {
    errors.push(`El diámetro externo debe ser mayor o igual a ${TARIMA_INPUT_LIMITS.OUTER_DIAMETER_MM.min} mm.`);
  } else if (outerDiameter > TARIMA_INPUT_LIMITS.OUTER_DIAMETER_MM.max) {
    errors.push(`El diámetro externo no puede exceder ${TARIMA_INPUT_LIMITS.OUTER_DIAMETER_MM.max} mm.`);
  }

  if (innerDiameter > 0 && outerDiameter > 0 && outerDiameter <= innerDiameter) {
    errors.push('El diámetro externo debe ser mayor al diámetro interno.');
  }

  if (!isPresent(raw.width) || width < TARIMA_INPUT_LIMITS.WIDTH_MM.min) {
    errors.push(`El ancho debe ser mayor o igual a ${TARIMA_INPUT_LIMITS.WIDTH_MM.min} mm.`);
  } else if (width > TARIMA_INPUT_LIMITS.WIDTH_MM.max) {
    errors.push(`El ancho no puede exceder ${TARIMA_INPUT_LIMITS.WIDTH_MM.max} mm.`);
  }

  if (isPresent(raw.minimum_shipping_weight)) {
    if (minimumShippingWeight < TARIMA_INPUT_LIMITS.SHIPPING_WEIGHT_TONNES.min) {
      errors.push(`El peso mínimo debe ser mayor o igual a ${TARIMA_INPUT_LIMITS.SHIPPING_WEIGHT_TONNES.min} ton.`);
    } else if (minimumShippingWeight > TARIMA_INPUT_LIMITS.SHIPPING_WEIGHT_TONNES.max) {
      errors.push(`El peso mínimo no puede exceder ${TARIMA_INPUT_LIMITS.SHIPPING_WEIGHT_TONNES.max} ton.`);
    }
  }

  if (!isPresent(raw.maximum_shipping_weight) || maximumShippingWeight < TARIMA_INPUT_LIMITS.SHIPPING_WEIGHT_TONNES.min) {
    errors.push(`El peso máximo debe ser mayor o igual a ${TARIMA_INPUT_LIMITS.SHIPPING_WEIGHT_TONNES.min} ton.`);
  } else if (maximumShippingWeight > TARIMA_INPUT_LIMITS.SHIPPING_WEIGHT_TONNES.max) {
    errors.push(`El peso máximo no puede exceder ${TARIMA_INPUT_LIMITS.SHIPPING_WEIGHT_TONNES.max} ton.`);
  }

  if (minimumShippingWeight > 0 && maximumShippingWeight > 0 && maximumShippingWeight < minimumShippingWeight) {
    errors.push('El peso máximo debe ser mayor o igual al peso mínimo.');
  }

  if (!isPresent(raw.pieces_per_package) || piecesPerPackage < TARIMA_INPUT_LIMITS.PIECES_PER_PACKAGE.min || !Number.isInteger(piecesPerPackage)) {
    errors.push(`Las piezas por paquete deben ser un entero mayor o igual a ${TARIMA_INPUT_LIMITS.PIECES_PER_PACKAGE.min}.`);
  } else if (piecesPerPackage > TARIMA_INPUT_LIMITS.PIECES_PER_PACKAGE.max) {
    errors.push(`Las piezas por paquete no pueden exceder ${TARIMA_INPUT_LIMITS.PIECES_PER_PACKAGE.max}.`);
  }

  if (isPresent(raw.maximum_pallet_width) && maximumPalletWidth !== 0) {
    if (maximumPalletWidth < TARIMA_INPUT_LIMITS.MAXIMUM_PALLET_WIDTH_MM.min) {
      errors.push(`El ancho máximo de tarima debe ser mayor o igual a ${TARIMA_INPUT_LIMITS.MAXIMUM_PALLET_WIDTH_MM.min} mm.`);
    } else if (maximumPalletWidth > TARIMA_INPUT_LIMITS.MAXIMUM_PALLET_WIDTH_MM.max) {
      errors.push(`El ancho máximo de tarima no puede exceder ${TARIMA_INPUT_LIMITS.MAXIMUM_PALLET_WIDTH_MM.max} mm.`);
    }
  }

  return errors;
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
  const inputErrors = validateTarimaInputs(raw);
  if (inputErrors.length > 0) return null;

  const spec = normalizeTarimaSpec(raw, orientation);
  if (!spec) return null;
  const simulation = computeLayout(spec);
  return validateTarima(simulation);
}

export function getTarimaSubmissionGuard(
  raw: RawDbSpec,
  orientation: CoilOrientation
): TarimaSubmissionGuard {
  const hardErrors = validateTarimaInputs(raw);
  const validationResult = hardErrors.length > 0 ? null : computeTarimaValidation(raw, orientation);

  if (!validationResult) {
    return {
      canSubmit: hardErrors.length === 0,
      hardErrors,
      warnings: [],
      validationResult: null,
    };
  }

  return {
    canSubmit: validationResult.violations.length === 0 && hardErrors.length === 0,
    hardErrors: [...hardErrors, ...validationResult.violations.map((violation) => violation.message)],
    warnings: validationResult.warnings.map((warning) => warning.message),
    validationResult,
  };
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
