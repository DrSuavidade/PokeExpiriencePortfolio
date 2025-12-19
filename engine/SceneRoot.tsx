import React, { Suspense } from 'react';
import { Canvas } from "@react-three/fiber";
import { SceneManager } from "./SceneManager";
import { Loader } from "@react-three/drei";

export function SceneRoot() {
  return (
    <>
      <div className="fixed inset-0 z-0">
        <Canvas shadows camera={{ fov: 45, position: [0, 5, 10] }}>
          <Suspense fallback={null}>
            <SceneManager />
          </Suspense>
        </Canvas>
      </div>
      <Loader />
    </>
  );
}