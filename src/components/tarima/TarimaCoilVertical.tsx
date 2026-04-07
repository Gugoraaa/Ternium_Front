'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import type { CoilPlacement } from '@/lib/tarima/types';

const SCALE = 0.001; // 1 mm = 0.001 scene units

interface TarimaCoilVerticalProps {
  placement: CoilPlacement;
  outerRadius: number;  // mm
  innerRadius: number;  // mm
  height: number;       // mm (= spec.width)
  color: string;        // hex
}

/**
 * Renders a single ojo-vertical coil as a torus (donut) shape.
 * The torus lies flat (axis pointing up, Y direction).
 */
export default function TarimaCoilVertical({
  placement,
  outerRadius,
  innerRadius,
  height,
  color,
}: TarimaCoilVerticalProps) {
  const tubeRadius = useMemo(() => (outerRadius - innerRadius) / 2, [outerRadius, innerRadius]);
  const torusRadius = useMemo(() => innerRadius + tubeRadius, [innerRadius, tubeRadius]);

  // Clamp tube radius to avoid degenerate geometry
  const safeTubeRadius = Math.max(tubeRadius * SCALE, 0.01);
  const safeTorusRadius = Math.max(torusRadius * SCALE, safeTubeRadius + 0.005);

  return (
    <group
      position={[
        placement.positionX * SCALE,
        placement.positionY * SCALE,
        placement.positionZ * SCALE,
      ]}
    >
      {/* Main coil body — torus lying flat */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[safeTorusRadius, safeTubeRadius, 12, 32]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Subtle flat disc cap to fill the center hole visually */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry
          args={[innerRadius * SCALE * 0.95, innerRadius * SCALE * 0.95, height * SCALE * 0.05, 24]}
        />
        <meshStandardMaterial color="#555555" metalness={0.5} roughness={0.6} />
      </mesh>
    </group>
  );
}
