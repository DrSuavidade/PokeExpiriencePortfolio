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

        if (o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m: any) => {
            m.transparent = false;
            m.depthWrite = true;
            m.depthTest = true;
            if (m.alphaTest === 0) {
              // Only reset if needed, avoiding redundant updates
            } else {
              m.alphaTest = 0;
            }
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
  isBlocking,
  isMeditating,
  attackMultiplier,
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
      <ambientLight intensity={0.5} />
      <pointLight
        position={[10, 10, 10]}
        intensity={1.5}
        color="#88aaff"
        distance={25}
        decay={2}
      />
      <spotLight
        position={[-10, 10, -10]}
        intensity={2.5}
        angle={0.5}
        penumbra={1}
        color="#ffaa88"
        distance={25}
        decay={2}
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
          roughness={0.7}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#151515"
          metalness={0.5}
          mirror={0.5}
        />
      </mesh>

      <gridHelper args={[40, 40, "#555", "#222"]} position={[0, -1.95, 0]} />
      <fog attach="fog" args={["#000", 20, 45]} />

      {/* Platforms */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh position={[4, 0, 4]} rotation={[0, Math.PI / 4, 0]}>
          <cylinderGeometry args={[2.5, 2.5, 0.4, 32]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
        </mesh>
      </Float>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh position={[-4, 0, -4]} rotation={[0, Math.PI / 4, 0]}>
          <cylinderGeometry args={[2.5, 2.5, 0.4, 32]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
        </mesh>
      </Float>

      {/* Player Monster */}
      <group position={[4, 0.5, 4]} ref={playerRef}>
        <RenderModel
          path={playerModelPath}
          scale={1.2}
          rotation={[0, -Math.PI / 4 - Math.PI / 2, 0]}
        />

        {/* Meditation Glow */}
        {attackMultiplier > 1 && (
          <group>
            <pointLight intensity={10} distance={4} decay={2} color="#ff3333" />
            <mesh scale={1.2}>
              <sphereGeometry args={[2, 14, 14]} />
              <meshBasicMaterial color="#ff0000" transparent opacity={0.08} />
            </mesh>
          </group>
        )}

        {/* Blocking Shield */}
        {isBlocking && (
          <mesh position={[-1, 1, -1]} rotation={[0, Math.PI / 4, 0]}>
            <torusGeometry args={[1.5, 0.05, 16, 100]} />
            <meshBasicMaterial color="#4488ff" transparent opacity={0.8} />
            <mesh scale={[1, 1, 0.1]}>
              <sphereGeometry args={[1.5, 32, 32]} />
              <meshPhongMaterial
                color="#88ccff"
                transparent
                opacity={0.3}
                shininess={100}
              />
            </mesh>
          </mesh>
        )}

        <pointLight
          intensity={3}
          distance={8}
          decay={2}
          color={playerColor}
          position={[0, 1, 0]}
        />
      </group>

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
          decay={2}
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

  // Animation state
  const playerAttackAnimProgress = useRef(0);
  const enemyAttackAnimProgress = useRef(0);

  // Map starter ID to model path
  const playerModelPath = useMemo(() => {
    switch (starterId) {
      case "elcoon":
        return "/models/Racoon.opt.glb";
      case "slothie":
        return "/models/Slooth.opt.glb";
      case "tigguin":
        return "/models/Tiguin.opt.glb";
      default:
        return "/models/Racoon.opt.glb";
    }
  }, [starterId]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const { isBlocking, isMeditating, lastAction, attackMultiplier } =
      battleState;

    // Movement positions
    const playerBasePos = new THREE.Vector3(4, 0.5, 4);
    const enemyBasePos = new THREE.Vector3(-4, 0.5, -4);

    // Player Animation
    if (playerRef.current) {
      if (lastAction === "player-attack") {
        playerAttackAnimProgress.current += delta * 2.5;
        const p = Math.min(playerAttackAnimProgress.current, 1);
        const curve = Math.sin(p * Math.PI);

        const targetLunge = enemyBasePos
          .clone()
          .add(new THREE.Vector3(1.5, 0, 1.5));
        // Force the position to be relative to the curve to ensure return
        playerRef.current.position.copy(playerBasePos).lerp(targetLunge, curve);
      } else {
        playerAttackAnimProgress.current = 0;
        playerRef.current.position.y = 0.5 + Math.sin(t * 2) * 0.1;
        playerRef.current.position.x = playerBasePos.x;
        playerRef.current.position.z = playerBasePos.z;
        playerRef.current.rotation.z = Math.sin(t * 1.5) * 0.05;

        // Visual multipliers for states
        if (isBlocking) {
          playerRef.current.scale.setScalar(
            1.2 * (1 + Math.sin(t * 10) * 0.05)
          );
        } else if (isMeditating) {
          playerRef.current.position.y += Math.sin(t * 20) * 0.02;
          playerRef.current.scale.setScalar(1.2 * (1 + Math.sin(t * 5) * 0.02));
        } else {
          playerRef.current.scale.setScalar(1.2);
        }
      }
    }

    // Enemy Animation
    if (enemyRef.current) {
      if (lastAction === "enemy-attack") {
        enemyAttackAnimProgress.current += delta * 2.5;
        const p = Math.min(enemyAttackAnimProgress.current, 1);
        const curve = Math.sin(p * Math.PI);

        const targetLunge = playerBasePos
          .clone()
          .add(new THREE.Vector3(-1.5, 0, -1.5));
        enemyRef.current.position.copy(enemyBasePos).lerp(targetLunge, curve);
      } else {
        enemyAttackAnimProgress.current = 0;
        enemyRef.current.position.y = 0.5 + Math.sin(t * 1.8) * 0.1;
        enemyRef.current.position.x = enemyBasePos.x;
        enemyRef.current.position.z = enemyBasePos.z;
        enemyRef.current.rotation.z = Math.cos(t * 2) * 0.05;
        enemyRef.current.scale.setScalar(1);
      }
    }

    // Camera follow smoothing
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
        isBlocking={battleState.isBlocking}
        isMeditating={battleState.isMeditating}
        attackMultiplier={battleState.attackMultiplier}
      />
    </>
  );
};

useGLTF.preload("/models/Enemy.glb");
useGLTF.preload("/models/Racoon.opt.glb");
useGLTF.preload("/models/Slooth.opt.glb");
useGLTF.preload("/models/Tiguin.opt.glb");
