'use client';

import { useMemo } from 'react';
import { computeTarimaValidation } from '@/lib/tarima/validations';
import type { CoilOrientation, ValidationResult, RawDbSpec } from '@/lib/tarima/types';

interface UseTarimaSimulationOptions {
  spec: RawDbSpec | null | undefined;
  orientation: CoilOrientation | null | undefined;
}

interface UseTarimaSimulationReturn {
  validationResult: ValidationResult | null;
  /** True when spec is missing required fields for simulation */
  isIncomplete: boolean;
}

/**
 * Connects raw DB spec fields to the tarima simulation engine.
 * Recalculates synchronously via useMemo whenever spec or orientation change.
 */
export function useTarimaSimulation({
  spec,
  orientation,
}: UseTarimaSimulationOptions): UseTarimaSimulationReturn {
  const validationResult = useMemo(() => {
    if (!spec || !orientation) return null;
    return computeTarimaValidation(spec, orientation);
  }, [spec, orientation]);

  return {
    validationResult,
    isIncomplete: validationResult === null,
  };
}
