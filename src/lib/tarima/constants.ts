export const TARIMA_CONSTANTS = {
  // ── Ojo Vertical ────────────────────────────────────────────────────────────
  /** Max weight per pallet (tonnes) for vertical orientation */
  VERTICAL_MAX_WEIGHT_TONNES: 6,
  /** Max height (mm) a vertical stack may reach — equivalent to average person height */
  VERTICAL_MAX_HEIGHT_MM: 1700,

  // ── Ojo Horizontal ──────────────────────────────────────────────────────────
  /** Max weight per pallet (tonnes) for horizontal orientation — crane capacity */
  HORIZONTAL_MAX_WEIGHT_TONNES: 20,
  /** Default max width (mm) when specs.maximum_pallet_width is null */
  HORIZONTAL_DEFAULT_MAX_WIDTH_MM: 1500,

  // ── Warning threshold ────────────────────────────────────────────────────────
  /** Ratio at which OBSERVACION level triggers (e.g. 0.80 = 80% of the limit) */
  WARNING_THRESHOLD: 0.80,
  /** Ratio at which RIESGOSO level triggers before hard NO_PERMITIDO */
  RISKY_THRESHOLD: 1.0,

  // ── Pallet physical dimensions (euro-pallet) ─────────────────────────────────
  PALLET_LENGTH_MM: 1200,
  PALLET_WIDTH_MM: 1000,
  PALLET_HEIGHT_MM: 150,

  // ── Horizontal saddle/cradle (cuña) ──────────────────────────────────────────
  SADDLE_HEIGHT_MM: 100,
  SADDLE_WIDTH_MM: 150,

  // ── Layout gaps ───────────────────────────────────────────────────────────────
  /** Lateral gap (mm) between coils in the same arrangement */
  COIL_GAP_MM: 20,

  // ── Packaging-to-orientation hints (extend as mapping is confirmed) ───────────
  /**
   * Known mappings from shipping_packaging code → orientation.
   * Partial map — codes not listed here have no implicit orientation.
   */
  PACKAGING_ORIENTATION_HINTS: {} as Record<string, 'vertical' | 'horizontal'>,
} as const;
