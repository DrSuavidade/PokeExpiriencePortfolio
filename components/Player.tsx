/// <reference types="@react-three/fiber" />
import React, { useRef, useEffect, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlayerProps {
  position?: [number, number, number];
  color?: string;
  speed?: number;
  bounds?: { x: number; z: number };
  cameraFollow?: boolean;
}

export const Player = forwardRef<THREE.Group, PlayerProps>(({ 
  position = [0, 0, 0], 
  color = 'white', 
  speed = 5,
  bounds = { x: 10, z: 10 },
  cameraFollow = false
}, ref) => {
  const internalRef = useRef<THREE.Group>(null);
  const playerRef = (ref as React.MutableRefObject<THREE.Group>) || internalRef;
  
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => keys.current[e.code] = true;
    const handleUp = (e: KeyboardEvent) => keys.current[e.code] = false;
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    }
  }, []);

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    const moveSpeed = speed * delta;
    const { x, z } = playerRef.current.position;
    let dx = 0;
    let dz = 0;

    if (keys.current['ArrowUp'] || keys.current['KeyW']) dz -= moveSpeed;
    if (keys.current['ArrowDown'] || keys.current['KeyS']) dz += moveSpeed;
    if (keys.current['ArrowLeft'] || keys.current['KeyA']) dx -= moveSpeed;
    if (keys.current['ArrowRight'] || keys.current['KeyD']) dx += moveSpeed;

    // Apply movement with bounds
    playerRef.current.position.x = THREE.MathUtils.clamp(x + dx, -bounds.x, bounds.x);
    playerRef.current.position.z = THREE.MathUtils.clamp(z + dz, -bounds.z, bounds.z);

    // Simple bobbing and rotation animation
    if (dx !== 0 || dz !== 0) {
        playerRef.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.1;
        playerRef.current.rotation.y = Math.atan2(-dx, -dz); 
    } else {
        playerRef.current.position.y = THREE.MathUtils.lerp(playerRef.current.position.y, 0, 0.1);
    }

    // Camera Follow Logic
    if (cameraFollow) {
       // Offset camera: High up and back
       const targetCamPos = new THREE.Vector3(playerRef.current.position.x, 8, playerRef.current.position.z + 10);
       state.camera.position.lerp(targetCamPos, 0.1);
       state.camera.lookAt(playerRef.current.position);
    }
  });

  return (
    <group ref={playerRef} position={position}>
       {/* Body */}
       <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
         <boxGeometry args={[0.6, 0.6, 0.6]} />
         <meshStandardMaterial color={color} />
       </mesh>
       {/* Eyes */}
       <mesh position={[0.15, 0.5, 0.31]}>
         <boxGeometry args={[0.1, 0.1, 0.05]} />
         <meshStandardMaterial color="black" />
       </mesh>
       <mesh position={[-0.15, 0.5, 0.31]}>
         <boxGeometry args={[0.1, 0.1, 0.05]} />
         <meshStandardMaterial color="black" />
       </mesh>
    </group>
  );
});