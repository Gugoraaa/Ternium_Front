'use client';

import { TARIMA_CONSTANTS as C } from '@/lib/tarima/constants';
import { getRiskColors } from '@/lib/tarima/validations';
import type { SimulationResult, RiskLevel } from '@/lib/tarima/types';
import TarimaCoilVertical from './TarimaCoilVertical';
import TarimaCoilHorizontal from './TarimaCoilHorizontal';

const SCALE = 0.001;

interface TarimaSceneProps {
  simulation: SimulationResult;
  riskLevel: RiskLevel;
}

/**
 * Three.js scene graph: wooden pallet base + all coil meshes + lighting.
 * Must be rendered inside a <Canvas> from @react-three/fiber.
 */
export default function TarimaScene({ simulation, riskLevel }: TarimaSceneProps) {
  const { spec, placements } = simulation;
  const isVertical = spec.coilOrientation === 'vertical';
  const coilColor = getRiskColors(riskLevel).threeHex;

  const palletH = C.PALLET_HEIGHT_MM * SCALE;

  // One wooden base per stack.
  // Vertical: each unique positionX is one column (stack of coils).
  // Horizontal: each placement is its own stack (single coil per position).
  const stackXPosMm = isVertical
    ? [...new Set(placements.map((p) => p.positionX))]
    : placements.map((p) => p.positionX);

  // Base footprint per stack
  const baseW = (isVertical ? spec.outerDiameter : spec.width) * SCALE;
  const baseD = spec.outerDiameter * SCALE;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 5, -3]} intensity={0.4} />

      {/* Per-stack wooden bases */}
      {stackXPosMm.map((xMm, i) => (
        <group key={i} position={[xMm * SCALE, 0, 0]}>
          {/* Main wooden block */}
          <mesh position={[0, -palletH / 2, 0]} receiveShadow>
            <boxGeometry args={[baseW, palletH, baseD]} />
            <meshStandardMaterial color="#8B6914" roughness={0.85} metalness={0.05} />
          </mesh>
          {/* Plank texture lines (decorative) */}
          {[-0.3, 0, 0.3].map((zOffset) => (
            <mesh key={zOffset} position={[0, -palletH / 2, zOffset * baseD]} receiveShadow>
              <boxGeometry args={[baseW, palletH + 0.002, baseD * 0.15]} />
              <meshStandardMaterial color="#6B4F0F" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Coils */}
      {placements.map((placement) =>
        isVertical ? (
          <TarimaCoilVertical
            key={placement.index}
            placement={placement}
            outerRadius={spec.outerDiameter / 2}
            innerRadius={spec.innerDiameter / 2}
            height={spec.width}
            color={coilColor}
          />
        ) : (
          <TarimaCoilHorizontal
            key={placement.index}
            placement={placement}
            outerRadius={spec.outerDiameter / 2}
            innerRadius={spec.innerDiameter / 2}
            axialWidth={spec.width}
            color={coilColor}
          />
        )
      )}

      {/* Grid helper for orientation reference */}
      <gridHelper args={[2, 10, '#cbd5e1', '#e2e8f0']} position={[0, -palletH - 0.001, 0]} />
    </>
  );
}
