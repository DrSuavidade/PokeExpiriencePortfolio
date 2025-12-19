/// <reference types="@react-three/fiber" />
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../state/gameStore';
import { Player } from '../components/Player';
import { starters } from '../data/monsters';

export const HomeRoomScene = () => {
  const setScene = useGameStore(s => s.setScene);
  const setInteraction = useGameStore(s => s.setInteraction);
  const starterId = useGameStore(s => s.starter);
  const myMonster = starters.find(s => s.id === starterId);

  const playerRef = useRef<THREE.Group>(null);
  const computerPos = new THREE.Vector3(0, 0, -3);

  useFrame(() => {
    if (playerRef.current) {
        const dist = playerRef.current.position.distanceTo(computerPos);
        if (dist < 2.5) {
            setInteraction("Access City Link", () => setScene('city'));
        } else {
            setInteraction(null, null);
        }
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 5, 0]} intensity={1} />
      <Environment preset="apartment" />

      <Player 
        ref={playerRef} 
        position={[0, 0, 2]} 
        color={myMonster?.color} 
        bounds={{x: 4.5, z: 4.5}}
        cameraFollow={false} // Small room, static camera is fine
      />

      {/* Room Structure */}
      <group>
         {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#e2c799" />
        </mesh>
        {/* Walls */}
        <mesh position={[0, 4, -5]}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#fcebd0" />
        </mesh>
        <mesh position={[-5, 4, 0]} rotation={[0, Math.PI/2, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#fcebd0" />
        </mesh>
      </group>

      {/* PC Setup (The Portal to City) */}
      <group position={[0, 0, -3]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[3, 1, 1.5]} />
          <meshStandardMaterial color="#555" />
        </mesh>
        <mesh position={[0, 1.5, -0.2]}>
          <boxGeometry args={[1.5, 1, 0.1]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        {/* Screen */}
        <mesh position={[0, 1.5, -0.14]}>
          <planeGeometry args={[1.4, 0.9]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>
        <Text position={[0, 1.5, -0.13]} fontSize={0.15} color="white">
          Enter City
        </Text>
        
        {/* Fallback Click */}
        <mesh 
          position={[0, 1, 0]} 
          onClick={() => setScene('city')}
          visible={false}
        >
          <boxGeometry args={[3, 3, 3]} />
        </mesh>
      </group>

      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
         <Text 
            position={[0, 2.5, -3]} 
            fontSize={0.3} 
            color="black"
            textAlign="center"
         >
            Welcome home!{"\n"}Walk to the Computer to explore.
         </Text>
      </Float>
    </>
  );
};