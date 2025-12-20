/// <reference types="@react-three/fiber" />
import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Environment,
  Text,
  useCursor,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "../state/gameStore";
import { buildings } from "../data/buildings";
import { PlayerCharacter } from "../components/PlayerCharacter";
import { starters } from "../data/monsters";

const BuildingMesh = ({ data, onClick }: any) => {
  const [hovered, setHover] = useState(false);
  useCursor(hovered);

  const isCompleted = useGameStore((s) => s.progress.defeatedNPCs[data.id]);

  return (
    <group position={data.position}>
      {/* Building Body */}
      <mesh
        position={[0, 1, 0]}
        onClick={onClick}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <boxGeometry args={[1.5, 2, 1.5]} />
        <meshStandardMaterial color={hovered ? "#ffffff" : data.color} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 2.5, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.2, 1, 4]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 3.5, 0]}
        fontSize={0.4}
        color="white"
        outlineWidth={0.04}
        outlineColor="black"
        anchorX="center"
        anchorY="bottom"
      >
        {data.label}
      </Text>

      {/* Status Indicator */}
      {isCompleted && (
        <mesh position={[0.6, 2, 0.6]}>
          <sphereGeometry args={[0.3]} />
          <meshBasicMaterial color="#4ade80" />
        </mesh>
      )}
    </group>
  );
};

export const CityMapScene = () => {
  const enterBuilding = useGameStore((s) => s.enterBuilding);
  const setInteraction = useGameStore((s) => s.setInteraction);
  const setScene = useGameStore((s) => s.setScene);
  const unlockedSecret = useGameStore((s) => s.progress.unlockedSecret);
  const starterId = useGameStore((s) => s.starter);
  const myMonster = starters.find((s) => s.id === starterId);

  const playerRef = useRef<THREE.Group>(null);
  const secretPos = new THREE.Vector3(0, 0, -8);

  useFrame(() => {
    if (playerRef.current) {
      const playerPos = playerRef.current.position;
      let activeInteraction = false;

      // Check Buildings
      for (const b of buildings) {
        const bPos = new THREE.Vector3(...b.position);
        if (playerPos.distanceTo(bPos) < 2.5) {
          setInteraction(`Enter ${b.label}`, () => enterBuilding(b.id));
          activeInteraction = true;
          break;
        }
      }

      // Check Secret
      if (!activeInteraction && unlockedSecret) {
        if (playerPos.distanceTo(secretPos) < 2.5) {
          setInteraction("???", () => setScene("ending"));
          activeInteraction = true;
        }
      }

      if (!activeInteraction) {
        setInteraction(null, null);
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[-5, 10, -5]} intensity={1} castShadow />
      <Environment preset="city" />

      <PlayerCharacter
        ref={playerRef}
        position={[0, 0, 6]}
        bounds={{ x: 4.5, z: 4.5 }}
        cameraFollow={true}
      />

      {/* Ground */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.1, 0]}
        receiveShadow
      >
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Grid helper for visuals */}
      <gridHelper args={[50, 50, 0x000000, 0x111111]} />

      {/* Buildings */}
      {buildings.map((b) => (
        <BuildingMesh key={b.id} data={b} onClick={() => enterBuilding(b.id)} />
      ))}

      {/* Secret Area */}
      {unlockedSecret && (
        <group position={[0, 0, -8]}>
          <Text
            position={[0, 2, 0]}
            color="#fbbf24"
            fontSize={0.5}
            outlineWidth={0.05}
            outlineColor="black"
          >
            SECRET PATH
          </Text>
          <mesh position={[0, 1, 0]}>
            <torusKnotGeometry args={[1, 0.3, 100, 16]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#fbbf24"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      )}

      <ContactShadows scale={40} blur={2} opacity={0.5} />
    </>
  );
};
