// ─────────────────────────────────────────────────────────────────────────────
// Domain types for the tarima (pallet) simulation engine.
// Pure TypeScript — no React, no Three.js imports.
// ─────────────────────────────────────────────────────────────────────────────

export type CoilOrientation = 'vertical' | 'horizontal';

/** Ordered by ascending severity */
export type RiskLevel = 'SEGURO' | 'OBSERVACION' | 'RIESGOSO' | 'NO_PERMITIDO';

/**
 * Normalized input for the simulation engine.
 * All dimensions in mm, weight in tonnes.
 * Derived from specs / order_offers_specs rows after coercion.
 */
export interface TarimaSpec {
  innerDiameter: number;           // mm — inner hole radius × 2
  outerDiameter: number;           // mm — outer radius × 2
  width: number;                   // mm — axial dimension (steel strip width)
  maximumShippingWeight: number;   // tonnes — validated directly against limits
  piecesPerPackage: number;        // count of rolls in this pallet load
  maximumPalletWidth: number;      // mm — constraint from specs; 0 = use default
  shippingPackaging: string;       // e.g. "EC52", "EC60" — display only
  coilOrientation: CoilOrientation;
}

/** Absolute 3D position of a single coil in mm, relative to pallet center */
export interface CoilPlacement {
  index: number;
  positionX: number;
  positionY: number;
  positionZ: number;
}

/** Output of the layout algorithm */
export interface SimulationResult {
  spec: TarimaSpec;
  placements: CoilPlacement[];
  totalWeightTonnes: number;
  totalHeightMm: number;   // height of tallest point above pallet surface
  totalWidthMm: number;    // total lateral spread of all coils
  stackCount: number;      // number of vertical stacks (vertical mode) or columns (horizontal)
  hasSaddles: boolean;     // true when horizontal — needs cuñas in scene
}

/** A single rule violation or near-violation */
export interface ValidationViolation {
  field: string;
  actualValue: number;
  limitValue: number;
  /** actualValue / limitValue × 100 */
  percentage: number;
  /** Human-readable explanation in Spanish */
  message: string;
}

/** Final output of the validation engine */
export interface ValidationResult {
  riskLevel: RiskLevel;
  /** Hard violations — limit exceeded */
  violations: ValidationViolation[];
  /** Near-limit warnings — 80–100% of limit */
  warnings: ValidationViolation[];
  simulation: SimulationResult;
}

/** Result used by forms/actions to decide if submit must be blocked */
export interface TarimaSubmissionGuard {
  canSubmit: boolean;
  hardErrors: string[];
  warnings: string[];
  validationResult: ValidationResult | null;
}

/** Raw spec shape from DB — handles type inconsistencies between tables */
export interface RawDbSpec {
  inner_diameter?: number | string | null;
  outer_diameter?: number | string | null;
  width?: number | null;
  minimum_shipping_weight?: number | null;
  maximum_shipping_weight?: number | null;
  pieces_per_package?: number | null;
  maximum_pallet_width?: number | null;
  shipping_packaging?: string | null;
  /** DB stores as plain string; engine coerces to CoilOrientation */
  coil_orientation?: string | null;
}

/** Tailwind color tokens per risk level, plus a Three.js hex color */
export interface RiskColors {
  bg: string;
  text: string;
  border: string;
  dot: string;
  /** hex for Three.js MeshStandardMaterial.color */
  threeHex: string;
  label: string;
}
