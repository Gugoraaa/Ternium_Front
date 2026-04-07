'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import type { SimulationResult, RiskLevel } from '@/lib/tarima/types';
import TarimaScene from './TarimaScene';

interface TarimaViewerProps {
  simulation: SimulationResult;
  riskLevel: RiskLevel;
  /** CSS height for the canvas container */
  height?: string;
}

/**
 * R3F Canvas wrapper. Imported dynamically with SSR disabled at the callsite:
 *   const DynTarimaViewer = dynamic(() => import('./TarimaViewer'), { ssr: false })
 */
export default function TarimaViewer({
  simulation,
  riskLevel,
  height = '320px',
}: TarimaViewerProps) {
  return (
    <div style={{ height }} className="w-full rounded-xl overflow-hidden bg-slate-900">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[2.5, 2.2, 3]} fov={50} />
        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI * 0.82}
          minDistance={0.5}
          maxDistance={6}
        />
        <Suspense fallback={null}>
          <TarimaScene simulation={simulation} riskLevel={riskLevel} />
        </Suspense>
      </Canvas>
    </div>
  );
}
