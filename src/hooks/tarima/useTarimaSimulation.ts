'use client';

import { useMemo } from 'react';
import { computeTarimaValidation, validateTarimaInputs } from '@/lib/tarima/validations';
import type { CoilOrientation, ValidationResult, RawDbSpec } from '@/lib/tarima/types';

interface UseTarimaSimulationOptions {
  spec: RawDbSpec | null | undefined;
  orientation: CoilOrientation | null | undefined;
}

interface UseTarimaSimulationReturn {
  validationResult: ValidationResult | null;
  /** True when spec is missing required fields for simulation */
  isIncomplete: boolean;
  inputErrors: string[];
}

/**
 * Connects raw DB spec fields to the tarima simulation engine.
 * Recalculates synchronously via useMemo whenever spec or orientation change.
 */
export function useTarimaSimulation({
  spec,
  orientation,
}: UseTarimaSimulationOptions): UseTarimaSimulationReturn {
  const inputErrors = useMemo(() => {
    if (!spec) return [];
    return validateTarimaInputs(spec);
  }, [spec]);

  const validationResult = useMemo(() => {
    if (!spec || !orientation || inputErrors.length > 0) return null;
    return computeTarimaValidation(spec, orientation);
  }, [spec, orientation, inputErrors]);

  return {
    validationResult,
    isIncomplete: validationResult === null,
    inputErrors,
  };
}
