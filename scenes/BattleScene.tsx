/// <reference types="@react-three/fiber" />
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, Float, Stars, OrbitControls } from '@react-three/drei';
import { useGameStore } from '../state/gameStore';
import { starters } from '../data/monsters';
import { buildings } from '../data/buildings';

export const BattleScene = () => {
  const starterId = useGameStore(s => s.starter);
  const buildingId = useGameStore(s => s.activeBuildingId);
  
  const myMonster = starters.find(s => s.id === starterId);
  const enemyBuilding = buildings.find(b => b.id === buildingId);

  const playerRef = useRef<any>(null);
  const enemyRef = useRef<any>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if(playerRef.current) playerRef.current.position.y = -1 + Math.sin(t * 2) * 0.1;
    if(enemyRef.current) enemyRef.current.position.y = -0.5 + Math.sin(t * 1.5) * 0.1;
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[5, 2, 5]} fov={50} />
      <OrbitControlsWrapper />
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="night" />

      {/* Platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial color="#1e293b" />
        <gridHelper args={[16, 16, 0x475569, 0x0f172a]} rotation={[-Math.PI/2, 0, 0]} />
      </mesh>

      {/* Player Monster (Back view approximation) */}
      <group position={[3, -1, 3]} rotation={[0, Math.PI + Math.PI/4, 0]} ref={playerRef}>
        <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={myMonster?.color || "white"} />
        </mesh>
      </group>

      {/* Enemy NPC/Monster */}
      <group position={[-3, -0.5, -3]} rotation={[0, Math.PI/4, 0]} ref={enemyRef}>
         <mesh>
            <coneGeometry args={[0.8, 1.5, 32]} />
            <meshStandardMaterial color={enemyBuilding?.color || "red"} />
         </mesh>
         <mesh position={[0, 1, 0]}>
            <sphereGeometry args={[0.5]} />
            <meshStandardMaterial color="#ccc" />
         </mesh>
      </group>
    </>
  );
};

// Simple rotation to look at center
const OrbitControlsWrapper = () => {
    return <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        minPolarAngle={Math.PI/3} 
        maxPolarAngle={Math.PI/2.5}
        autoRotate={false}
    />
}