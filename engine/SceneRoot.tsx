import React, { Suspense, memo } from "react";
import { Canvas } from "@react-three/fiber";
import { SceneManager } from "./SceneManager";

export const SceneRoot = memo(() => {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas shadows camera={{ fov: 45, position: [0, 5, 10] }}>
        <Suspense fallback={null}>
          <SceneManager />
        </Suspense>
      </Canvas>
    </div>
  );
});
