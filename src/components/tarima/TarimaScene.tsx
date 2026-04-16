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
  const palletWidthMm = Math.max(
    isVertical ? simulation.totalWidthMm : spec.maximumPalletWidth || simulation.totalWidthMm,
    C.PALLET_LENGTH_MM
  );
  const palletDepthMm = Math.max(spec.outerDiameter + C.COIL_GAP_MM * 2, C.PALLET_WIDTH_MM);
  const palletWidth = palletWidthMm * SCALE;
  const palletDepth = palletDepthMm * SCALE;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 5, -3]} intensity={0.4} />

      {/* Stable wooden pallet base */}
      <mesh position={[0, -palletH / 2, 0]} receiveShadow>
        <boxGeometry args={[palletWidth, palletH, palletDepth]} />
        <meshStandardMaterial color="#8B6914" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Plank texture lines (decorative) */}
      {[-0.35, 0, 0.35].map((zOffset) => (
        <mesh key={zOffset} position={[0, -palletH / 2, zOffset * palletDepth]} receiveShadow>
          <boxGeometry args={[palletWidth, palletH + 0.002, palletDepth * 0.12]} />
          <meshStandardMaterial color="#6B4F0F" roughness={0.9} />
        </mesh>
      ))}

      {/* Saddles for horizontal coils */}
      {!isVertical &&
        placements.map((placement) => (
          <group key={`saddle-${placement.index}`} position={[placement.positionX * SCALE, 0, 0]}>
            <mesh position={[0, C.SADDLE_HEIGHT_MM * SCALE / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[spec.width * SCALE, C.SADDLE_HEIGHT_MM * SCALE, C.SADDLE_WIDTH_MM * SCALE]} />
              <meshStandardMaterial color="#7C5A12" roughness={0.95} metalness={0.02} />
            </mesh>
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
