/// <reference types="@react-three/fiber" />
import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "../state/gameStore";
import { PlayerCharacter } from "../components/PlayerCharacter";
import type { Rect } from "../utils/collision2d";

type InteractionDef = {
  nodeName: string;
  label: string;
  radius: number;
  onTrigger: () => void;
};

interface BuildingBaseSceneProps {
  modelPath: string;
  scale?: number;
  interactions?: InteractionDef[];
  playerBounds?: { x: number; z: number };
  exitScene?: "city" | "home";
  exitWaypoint?: string;
}

export const BuildingBaseScene: React.FC<BuildingBaseSceneProps> = ({
  modelPath,
  scale = 0.5,
  interactions: customInteractions = [],
  playerBounds = { x: 10, z: 10 },
  exitScene = "city",
  exitWaypoint = "waypointRoom",
}) => {
  const setScene = useGameStore((s) => s.setScene);
  const setReturnWaypoint = useGameStore((s) => s.setReturnWaypoint);
  const setInteraction = useGameStore((s) => s.setInteraction);
  const dialog = useGameStore((s) => s.dialog);
  const activeBuildingId = useGameStore((s) => s.activeBuildingId);

  const playerRef = useRef<THREE.Group>(null);
  const activeActionRef = useRef<null | (() => void)>(null);

  const { scene: modelSrc } = useGLTF(modelPath);

  const { model, colliders, waypoints } = useMemo(() => {
    const cloned = modelSrc.clone(true);
    cloned.scale.setScalar(scale);
    cloned.updateMatrixWorld(true);

    const rects: Rect[] = [];
    const tmpBox = new THREE.Box3();
    const wps: Record<string, THREE.Vector3> = {};

    cloned.traverse((o: any) => {
      if (o?.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }

      const name = o.name || "";
      if (name.startsWith("COLL_")) {
        o.visible = false;
        o.castShadow = false;
        o.receiveShadow = false;
        tmpBox.setFromObject(o);
        rects.push({
          minX: tmpBox.min.x,
          maxX: tmpBox.max.x,
          minZ: tmpBox.min.z,
          maxZ: tmpBox.max.z,
        });
      }

      if (name.startsWith("waypoint")) {
        const v = new THREE.Vector3();
        o.getWorldPosition(v);
        wps[name] = v;
        if (o.isMesh) o.visible = false;
      }
    });

    return { model: cloned, colliders: rects, waypoints: wps };
  }, [modelSrc, scale]);

  const defaultInteractions: InteractionDef[] = useMemo(() => {
    const list: InteractionDef[] = [...customInteractions];

    // Look for exit waypoints
    const exitWpName = Object.keys(waypoints).find(
      (name) =>
        name.toLowerCase().includes("exit") ||
        name.toLowerCase().includes("stairs") ||
        name.toLowerCase().includes("door") ||
        name.toLowerCase().includes("room")
    );

    if (exitWpName) {
      list.push({
        nodeName: exitWpName,
        label: "Leave Building",
        radius: 2.0,
        onTrigger: () => {
          if (exitScene === "city" && activeBuildingId) {
            const cityWaypoint = `waypoint${
              activeBuildingId.charAt(0).toUpperCase() +
              activeBuildingId.slice(1)
            }`;
            setReturnWaypoint(cityWaypoint);
          }
          setScene(exitScene);
        },
      });
    } else {
      // Fallback: Add an interaction near the spawn point if no exit waypoint found
      list.push({
        nodeName: "fallbackExit",
        label: "Leave Building",
        radius: 2.5,
        onTrigger: () => {
          if (exitScene === "city" && activeBuildingId) {
            const cityWaypoint = `waypoint${
              activeBuildingId.charAt(0).toUpperCase() +
              activeBuildingId.slice(1)
            }`;
            setReturnWaypoint(cityWaypoint);
          }
          setScene(exitScene);
        },
      });
      // We'll need to manually set waypoints["fallbackExit"] if we use this
    }

    return list;
  }, [
    waypoints,
    customInteractions,
    exitScene,
    activeBuildingId,
    setReturnWaypoint,
    setScene,
  ]);

  const spawnPos = useMemo(() => {
    // Try to find an exit or entrance waypoint to spawn at
    const exitWpName = Object.keys(waypoints).find(
      (name) =>
        name.toLowerCase().includes("exit") ||
        name.toLowerCase().includes("stairs") ||
        name.toLowerCase().includes("door") ||
        name.toLowerCase().includes("room")
    );

    if (exitWpName && waypoints[exitWpName]) {
      const wp = waypoints[exitWpName];
      return [wp.x, 0, wp.z + 1.0] as [number, number, number];
    }

    // If we have a fallbackExit, we need a position for it.
    // Let's just spawn at [0,0,5] and put the fallback exit there
    if (!exitWpName) {
      waypoints["fallbackExit"] = new THREE.Vector3(0, 0, 5);
      return [0, 0, 4] as [number, number, number];
    }

    return [0, 0, 2] as [number, number, number];
  }, [waypoints]);

  useFrame((state) => {
    // Basic camera follow logic or fixed camera
    // For buildings, let's use a slightly fixed but following-ish camera like HomeRoom
    const playerPos = playerRef.current?.position;
    if (!playerPos) return;

    if (dialog.open) {
      setInteraction(null, null);
      activeActionRef.current = null;
      return;
    }

    // Camera
    const cameraTarget = new THREE.Vector3(
      playerPos.x,
      playerPos.y + 6,
      playerPos.z + 10
    );
    state.camera.position.lerp(cameraTarget, 0.1);
    state.camera.lookAt(playerPos.x, playerPos.y, playerPos.z);

    // Interaction checks
    let best: { def: InteractionDef; d: number } | null = null;
    for (const def of defaultInteractions) {
      const wp = waypoints[def.nodeName];
      if (!wp) continue;
      const d = playerPos.distanceTo(wp);
      if (d <= def.radius) {
        if (!best || d < best.d) best = { def, d };
      }
    }

    if (best) {
      setInteraction(best.def.label, best.def.onTrigger);
      activeActionRef.current = best.def.onTrigger;
    } else {
      setInteraction(null, null);
      activeActionRef.current = null;
    }
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={0.5} castShadow />
      <Environment preset="city" />
      <primitive object={model} />
      <PlayerCharacter
        ref={playerRef}
        position={spawnPos}
        bounds={playerBounds}
        speed={4}
        cameraFollow={false} // We handle camera in useFrame above
        radius={0.35}
        colliders={colliders}
        onInteract={() => activeActionRef.current?.()}
      />
    </>
  );
};
