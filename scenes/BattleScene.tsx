import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import {
  PerspectiveCamera,
  Environment,
  MeshReflectorMaterial,
  Float,
  useGLTF,
  Center,
} from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "../state/gameStore";
import { starters } from "../data/monsters";
import { buildings } from "../data/buildings";

// Helper for rendering GLB models safely
const RenderModel = ({
  path,
  scale = 1,
  rotation = [0, 0, 0],
  position = [0, 0, 0],
}: any) => {
  const gltf = useGLTF(path) as any;
  const cloned = useMemo(() => {
    const c = gltf.scene.clone();
    c.traverse((o: any) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;

        // Fix: Force depth writing and testing to solve "elements in back appearing in front" issues
        if (o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m: any) => {
            m.transparent = false;
            m.depthWrite = true;
            m.depthTest = true;
            m.alphaTest = 0;
            m.needsUpdate = true;
          });
        }
      }
    });
    return c;
  }, [gltf]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Center top>
        <primitive object={cloned} />
      </Center>
    </group>
  );
};

const THREE_BattleContent = ({
  playerRef,
  enemyRef,
  playerModelPath,
  enemyModelPath,
  playerColor,
  enemyColor,
}: any) => {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 5, 15]}
        fov={30}
        near={0.1}
        far={200}
        onUpdate={(c) => c.lookAt(0, 0, 0)}
      />
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} intensity={2.5} color="#88aaff" />
      <spotLight
        position={[-10, 10, -10]}
        intensity={2.5}
        angle={0.5}
        penumbra={1}
        color="#ffaa88"
      />

      <Environment preset="city" />

      {/* Ground / Arena */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[100, 100]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#151515"
          metalness={0.5}
          mirror={1}
        />
      </mesh>

      {/* Arena Grid */}
      <gridHelper args={[40, 40, "#555", "#222"]} position={[0, -1.95, 0]} />

      {/* Atmosphere */}
      <fog attach="fog" args={["#000", 20, 45]} />

      {/* Player Side Platform */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh position={[4, 0, 4]} rotation={[0, Math.PI / 4, 0]}>
          <cylinderGeometry args={[2.5, 2.5, 0.4, 32]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
        </mesh>
      </Float>

      {/* Player Monster */}
      <group position={[4, 0.5, 4]} ref={playerRef}>
        <RenderModel
          path={playerModelPath}
          scale={1}
          rotation={[0, -Math.PI / 4 - Math.PI / 2, 0]}
        />
        <pointLight
          intensity={3}
          distance={8}
          color={playerColor}
          position={[0, 1, 0]}
        />
      </group>

      {/* Enemy Side Platform */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh position={[-4, 0, -4]} rotation={[0, Math.PI / 4, 0]}>
          <cylinderGeometry args={[2.5, 2.5, 0.4, 32]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
        </mesh>
      </Float>

      {/* Enemy Monster */}
      <group position={[-4, 0.5, -4]} ref={enemyRef}>
        <RenderModel
          path={enemyModelPath}
          scale={1.5}
          rotation={[0, Math.PI * 0.75 - Math.PI / 2, 0]}
        />
        <pointLight
          intensity={3}
          distance={8}
          color={enemyColor}
          position={[0, 1, 0]}
        />
      </group>

      {/* Background Decorative Particles */}
      <group>
        {[...Array(20)].map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 40,
              Math.random() * 10,
              (Math.random() - 0.5) * 40,
            ]}
          >
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshBasicMaterial color="#fff" transparent opacity={0.3} />
          </mesh>
        ))}
      </group>
    </>
  );
};

export const BattleScene = () => {
  const starterId = useGameStore((s) => s.starter);
  const buildingId = useGameStore((s) => s.activeBuildingId);
  const battleState = useGameStore((s) => s.battleState);

  const myMonsterData = starters.find((s) => s.id === starterId);
  const enemyBuilding = buildings.find((b) => b.id === buildingId);

  // Refs for animation
  const playerRef = useRef<THREE.Group>(null);
  const enemyRef = useRef<THREE.Group>(null);

  // Map starter ID to model path
  const playerModelPath = useMemo(() => {
    switch (starterId) {
      case "elcoon":
        return "/models/Racoon.glb";
      case "slothie":
        return "/models/Slooth.glb";
      case "tigguin":
        return "/models/Tiguin.glb";
      default:
        return "/models/Racoon.glb";
    }
  }, [starterId]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const { isBlocking, isMeditating } = battleState;

    // Idle wobbles
    if (playerRef.current) {
      playerRef.current.position.y = 0.5 + Math.sin(t * 2) * 0.1;
      playerRef.current.rotation.z = Math.sin(t * 1.5) * 0.05;

      // Visual feedback for block/meditate
      if (isBlocking) {
        playerRef.current.scale.setScalar(1 + Math.sin(t * 10) * 0.05);
      } else {
        playerRef.current.scale.setScalar(1);
      }

      if (isMeditating) {
        playerRef.current.position.y += Math.sin(t * 20) * 0.02;
      }
    }

    if (enemyRef.current) {
      enemyRef.current.position.y = 0.5 + Math.sin(t * 1.8) * 0.1;
      enemyRef.current.rotation.z = Math.cos(t * 2) * 0.05;
    }

    // ✅ Fix: Manual camera update to solve "not rendering right" / lerp issues
    // Smoothing that matches the rest of the game
    const followAlpha = 1 - Math.pow(0.001, delta);
    const targetCamPos = new THREE.Vector3(0, 5, 15);
    state.camera.position.lerp(targetCamPos, followAlpha);
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <THREE_BattleContent
        playerRef={playerRef}
        enemyRef={enemyRef}
        playerModelPath={playerModelPath}
        enemyModelPath="/models/Enemy.glb"
        playerColor={myMonsterData?.color}
        enemyColor={enemyBuilding?.color}
      />
    </>
  );
};

// Preload models for immediate loading
useGLTF.preload("/models/Enemy.glb");
useGLTF.preload("/models/Racoon.glb");
useGLTF.preload("/models/Slooth.glb");
useGLTF.preload("/models/Tiguin.glb");
