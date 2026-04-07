'use client';

import { TARIMA_CONSTANTS as C } from '@/lib/tarima/constants';
import type { CoilPlacement } from '@/lib/tarima/types';

const SCALE = 0.001;

interface TarimaCoilHorizontalProps {
  placement: CoilPlacement;
  outerRadius: number;   // mm
  innerRadius: number;   // mm
  axialWidth: number;    // mm (= spec.width, how wide the cylinder is)
  color: string;         // hex
}

/**
 * Renders a single ojo-horizontal coil as a cylinder on its side,
 * plus two small saddle/cuña blocks underneath.
 */
export default function TarimaCoilHorizontal({
  placement,
  outerRadius,
  innerRadius,
  axialWidth,
  color,
}: TarimaCoilHorizontalProps) {
  const sW = C.SADDLE_WIDTH_MM * SCALE;
  const sH = C.SADDLE_HEIGHT_MM * SCALE;
  const saddleY = -(outerRadius + C.SADDLE_HEIGHT_MM / 2) * SCALE;

  return (
    <group
      position={[
        placement.positionX * SCALE,
        placement.positionY * SCALE,
        placement.positionZ * SCALE,
      ]}
    >
      {/* Outer cylinder (the coil body) rotated so axis is along X */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry
          args={[outerRadius * SCALE, outerRadius * SCALE, axialWidth * SCALE, 32]}
        />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Inner hole (cut-out look via a darker inner cylinder) */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry
          args={[innerRadius * SCALE * 0.98, innerRadius * SCALE * 0.98, axialWidth * SCALE + 0.002, 24]}
        />
        <meshStandardMaterial color="#222222" metalness={0.3} roughness={0.8} />
      </mesh>

      {/* Left saddle/cuña */}
      <mesh position={[-axialWidth * SCALE * 0.28, saddleY, 0]}>
        <boxGeometry args={[sW, sH, sW]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.9} />
      </mesh>

      {/* Right saddle/cuña */}
      <mesh position={[axialWidth * SCALE * 0.28, saddleY, 0]}>
        <boxGeometry args={[sW, sH, sW]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.9} />
      </mesh>
    </group>
  );
}
