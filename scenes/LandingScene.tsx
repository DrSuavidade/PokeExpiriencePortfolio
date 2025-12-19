/// <reference types="@react-three/fiber" />
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Environment, Text, useCursor, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { starters } from '../data/monsters';
import { useGameStore } from '../state/gameStore';

const Pokeball = ({ position, color, onClick, isHovered }: any) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      if (isHovered) {
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position[1] + 0.5, 0.1);
      } else {
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position[1], 0.1);
      }
    }
  });

  return (
    <group ref={meshRef} position={position} onClick={onClick}>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={isHovered ? color : "#ffffff"} metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.51, 0.05, 16, 100]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0, 0.5, 0.48]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#ddd" />
      </mesh>
    </group>
  );
};

export const LandingScene = () => {
  const chooseStarter = useGameStore((state) => state.chooseStarter);
  const [hovered, setHovered] = useState<string | null>(null);
  useCursor(!!hovered);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <Environment preset="forest" />
      
      <group position={[0, -1, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#3f6634" />
        </mesh>
        
        {/* Bag Placeholder */}
        <mesh position={[0, 0.5, -2]} castShadow>
          <boxGeometry args={[2, 1.5, 1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        
        {/* Starters */}
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          {starters.map((starter, index) => (
            <group key={starter.id} position={[(index - 1) * 2.5, 0, 0]}>
              <Pokeball 
                position={[0, 0.5, 0]} 
                color={starter.color}
                onClick={() => chooseStarter(starter.id)}
                isHovered={hovered === starter.id}
              />
              <mesh 
                 onPointerOver={() => setHovered(starter.id)}
                 onPointerOut={() => setHovered(null)}
                 visible={false}
              >
                 <boxGeometry args={[1.5, 2, 1.5]} />
              </mesh>

              {hovered === starter.id && (
                <Text 
                  position={[0, 2, 0]} 
                  fontSize={0.3} 
                  color="white" 
                  anchorX="center" 
                  anchorY="middle"
                  outlineWidth={0.02}
                  outlineColor="#000"
                >
                  {starter.name}
                </Text>
              )}
            </group>
          ))}
        </Float>
        
        <ContactShadows opacity={0.4} scale={10} blur={2} far={4} />
      </group>
    </>
  );
};