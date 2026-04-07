import { TARIMA_CONSTANTS as C } from './constants';
import type { TarimaSpec, CoilPlacement, SimulationResult } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Layout algorithm — pure functions, no side effects.
// All positions are in mm relative to the pallet center (X=0, Z=0).
// Y=0 is the top surface of the wooden pallet base.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ojo VERTICAL: roll lies flat like a donut, hole pointing up.
 *   - Height per coil = spec.width (axial dimension)
 *   - Footprint radius = spec.outerDiameter / 2
 *   - Multiple pieces can be stacked in columns up to VERTICAL_MAX_HEIGHT_MM
 *   - Columns are arranged side by side along the X axis
 */
function computeVerticalLayout(spec: TarimaSpec): CoilPlacement[] {
  const coilHeight = spec.width;                    // mm — height of one flat coil
  const coilRadius = spec.outerDiameter / 2;       // mm
  const maxPerStack = Math.max(1, Math.floor(C.VERTICAL_MAX_HEIGHT_MM / coilHeight));
  const stackCount = Math.ceil(spec.piecesPerPackage / maxPerStack);

  const placements: CoilPlacement[] = [];
  let coilIndex = 0;

  for (let col = 0; col < stackCount; col++) {
    const xOffset = (col - (stackCount - 1) / 2) * (coilRadius * 2 + C.COIL_GAP_MM);
    const remaining = spec.piecesPerPackage - coilIndex;
    const inThisStack = Math.min(maxPerStack, remaining);

    for (let row = 0; row < inThisStack; row++) {
      placements.push({
        index: coilIndex,
        positionX: xOffset,
        positionY: row * coilHeight + coilHeight / 2, // center of this coil in Y
        positionZ: 0,
      });
      coilIndex++;
    }
  }

  return placements;
}

/**
 * Ojo HORIZONTAL: roll stands on its side like a tire, axis horizontal.
 *   - Height of each coil = spec.outerDiameter
 *   - Width consumed per coil along X axis = spec.width (axial dimension)
 *   - Single row only — if pieces don't fit in maximumPalletWidth, flagged as violation
 *   - Coils sit on saddle blocks (cuñas) at SADDLE_HEIGHT_MM above pallet
 */
function computeHorizontalLayout(spec: TarimaSpec): CoilPlacement[] {
  const effectiveMaxWidth =
    spec.maximumPalletWidth > 0
      ? spec.maximumPalletWidth
      : C.HORIZONTAL_DEFAULT_MAX_WIDTH_MM;

  const axialWidth = spec.width; // mm each coil consumes in the X direction
  const coilsPerRow = Math.max(1, Math.floor(effectiveMaxWidth / axialWidth));

  const placements: CoilPlacement[] = [];

  for (let col = 0; col < Math.min(coilsPerRow, spec.piecesPerPackage); col++) {
    placements.push({
      index: col,
      positionX: (col - (Math.min(coilsPerRow, spec.piecesPerPackage) - 1) / 2) * (axialWidth + C.COIL_GAP_MM),
      positionY: C.SADDLE_HEIGHT_MM + spec.outerDiameter / 2, // center of cylinder in Y
      positionZ: 0,
    });
  }

  return placements;
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Computes the full pallet layout for a given TarimaSpec.
 * Returns absolute mm coordinates for every coil.
 */
export function computeLayout(spec: TarimaSpec): SimulationResult {
  const isVertical = spec.coilOrientation === 'vertical';
  const placements = isVertical
    ? computeVerticalLayout(spec)
    : computeHorizontalLayout(spec);

  // ── Metric derivations ──────────────────────────────────────────────────────

  const totalWeightTonnes = spec.maximumShippingWeight;

  let totalHeightMm: number;
  let totalWidthMm: number;
  let stackCount: number;

  if (isVertical) {
    const maxPerStack = Math.max(1, Math.floor(C.VERTICAL_MAX_HEIGHT_MM / spec.width));
    stackCount = Math.ceil(spec.piecesPerPackage / maxPerStack);
    const tallestStack = Math.min(maxPerStack, spec.piecesPerPackage);
    totalHeightMm = tallestStack * spec.width;
    totalWidthMm = stackCount * spec.outerDiameter + Math.max(0, stackCount - 1) * C.COIL_GAP_MM;
  } else {
    const effectiveMaxWidth =
      spec.maximumPalletWidth > 0
        ? spec.maximumPalletWidth
        : C.HORIZONTAL_DEFAULT_MAX_WIDTH_MM;
    stackCount = Math.min(spec.piecesPerPackage, Math.max(1, Math.floor(effectiveMaxWidth / spec.width)));
    totalHeightMm = C.SADDLE_HEIGHT_MM + spec.outerDiameter;
    totalWidthMm = stackCount * spec.width + Math.max(0, stackCount - 1) * C.COIL_GAP_MM;
  }

  return {
    spec,
    placements,
    totalWeightTonnes,
    totalHeightMm,
    totalWidthMm,
    stackCount,
    hasSaddles: !isVertical,
  };
}
