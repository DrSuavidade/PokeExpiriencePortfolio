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
      <mesh position={[0, 0.5, 0.48]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
        <meshStandardMaterial color="#ddd" />
      </mesh>
    </group>
  );
};

const Tree = ({ position, scale = 1, rotation = [0, 0, 0] }: any) => {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.4, 2, 8]} />
        <meshStandardMaterial color="#4a3b2a" />
      </mesh>
      <mesh position={[0, 3, 0]} castShadow receiveShadow>
         <coneGeometry args={[1.5, 3, 8]} />
         <meshStandardMaterial color="#2d4c1e" />
      </mesh>
      <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
         <coneGeometry args={[1.2, 2.5, 8]} />
         <meshStandardMaterial color="#3d6c2e" />
      </mesh>
    </group>
  );
};

const Bush = ({ position, scale = 1 }: any) => {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial color="#2d4c1e" />
      </mesh>
      <mesh position={[0.3, 0.2, 0.2]} castShadow receiveShadow>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color="#3d6c2e" />
      </mesh>
      <mesh position={[-0.3, 0.2, -0.2]} castShadow receiveShadow>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshStandardMaterial color="#1d3c0e" />
      </mesh>
    </group>
  );
};

const Weed = ({ position, scale = 1, rotation = [0, 0, 0] }: any) => {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh position={[0, 0.2, 0]} rotation={[0.1, 0, 0.1]} castShadow>
        <coneGeometry args={[0.02, 0.4, 4]} />
        <meshStandardMaterial color="#4d7c3e" />
      </mesh>
      <mesh position={[0.05, 0.15, 0.05]} rotation={[-0.1, 0.2, -0.1]} castShadow>
        <coneGeometry args={[0.015, 0.3, 4]} />
        <meshStandardMaterial color="#3d6c2e" />
      </mesh>
    </group>
  );
};

export const LandingScene = () => {
  const chooseStarter = useGameStore((state) => state.chooseStarter);
  const [hovered, setHovered] = useState<string | null>(null);
  useCursor(!!hovered);

  const weedData = React.useMemo(() => {
    return [...Array(15)].map(() => ({
      position: [(Math.random() - 0.5) * 10, 0, (Math.random() - 0.5) * 10] as [number, number, number],
      scale: 0.5 + Math.random() * 0.5,
      rotation: [0, Math.random() * Math.PI, 0] as [number, number, number]
    }));
  }, []);

  return (
    <>
      <color attach="background" args={['#1a261b']} />
      <fog attach="fog" args={['#1a261b', 8, 20]} />
      
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
      <spotLight position={[0, 10, 0]} intensity={1} angle={0.5} penumbra={1} castShadow />
      <Environment preset="forest" />
      
      <group position={[0, -1, 0]}>
        {/* Dark Forest Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#1a261b" />
        </mesh>

        {/* Clearing */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, -1]}>
          <circleGeometry args={[6, 64]} />
          <meshStandardMaterial color="#3f6634" />
        </mesh>
        
        {/* Trees */}
        <group position={[0, 0, -2]}>
          <Tree position={[-5, 0, -2]} scale={1.2} />
          <Tree position={[-3, 0, -4]} scale={1.5} />
          <Tree position={[3, 0, -4]} scale={1.4} />
          <Tree position={[5, 0, -2]} scale={1.1} />
          <Tree position={[-7, 0, 1]} scale={1.3} />
          <Tree position={[7, 0, 1]} scale={1.2} />
        </group>

        {/* Bushes */}
        <group>
          <Bush position={[-4, 0, 2]} scale={0.8} />
          <Bush position={[4, 0, 2]} scale={0.7} />
          <Bush position={[-2, 0, -3]} scale={0.6} />
          <Bush position={[2, 0, -3]} scale={0.65} />
          <Bush position={[-6, 0, -1]} scale={0.9} />
          <Bush position={[6, 0, -1]} scale={0.85} />
        </group>

        {/* Weeds/Grass Patches */}
        <group>
          {weedData.map((data, i) => (
            <Weed 
              key={i} 
              position={data.position} 
              scale={data.scale}
              rotation={data.rotation}
            />
          ))}
        </group>

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

              <Text 
                visible={hovered === starter.id}
                position={[0, 2.5, 0]} 
                fontSize={0.3} 
                color="white" 
                anchorX="center" 
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000"
              >
                {starter.name}
              </Text>
            </group>
          ))}
        </Float>
        
        <ContactShadows opacity={0.4} scale={10} blur={2} far={4} />
      </group>
    </>
  );
};