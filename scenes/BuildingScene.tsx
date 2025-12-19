/// <reference types="@react-three/fiber" />
import React from 'react';
import { Environment } from '@react-three/drei';
import { useGameStore } from '../state/gameStore';

export const BuildingScene = () => {
  // We don't render much 3D here, mostly the UI Overlay will handle the content.
  // But we render a background to indicate being "inside".
  
  const activeBuildingId = useGameStore(s => s.activeBuildingId);

  return (
    <>
      <ambientLight intensity={0.8} />
      <Environment preset="studio" />
      
      <group>
        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        
        {/* Back Wall with gentle particles or objects could go here */}
        <mesh position={[0, 0, -5]}>
          <planeGeometry args={[20, 10]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      </group>
    </>
  );
};