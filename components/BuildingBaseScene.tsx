import React, { useMemo, useRef, useLayoutEffect, useState } from "react";
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
  teleports?: Record<
    string,
    string | { to: string; midpoints?: string[]; instant?: boolean }
  >;
  fixedCamera?: boolean;
  fixedCameraPos?: [number, number, number];
  floorHeight?: number;
}

export const BuildingBaseScene: React.FC<BuildingBaseSceneProps> = ({
  modelPath,
  scale = 0.5,
  interactions: customInteractions = [],
  playerBounds = { x: 10, z: 10 },
  exitScene = "city",
  exitWaypoint = "waypointRoom",
  teleports = {},
  fixedCamera = false,
  fixedCameraPos = [0, 5, 10],
  floorHeight = 3.2,
}) => {
  const setScene = useGameStore((s) => s.setScene);
  const setReturnWaypoint = useGameStore((s) => s.setReturnWaypoint);
  const setInteraction = useGameStore((s) => s.setInteraction);
  const dialog = useGameStore((s) => s.dialog);
  const activeBuildingId = useGameStore((s) => s.activeBuildingId);

  const playerRef = useRef<THREE.Group>(null);
  const activeActionRef = useRef<null | (() => void)>(null);

  // Optimization: Reusable vectors and refs to avoid GC spikes
  const _cameraTarget = useRef(new THREE.Vector3());
  const _tempVec = useRef(new THREE.Vector3());

  const [transition, setTransition] = useState<{
    path: THREE.Vector3[];
    segmentIndex: number;
    rotation: number;
  } | null>(null);
  const transitionProgress = useRef(0);
  const SEGMENT_DURATION = 0.6; // Duration per segment

  const { scene: modelSrc } = useGLTF(modelPath);

  const { model, colliders, waypoints } = useMemo(() => {
    const cloned = modelSrc.clone(true);
    cloned.scale.setScalar(scale);
    cloned.updateMatrixWorld(true);

    const rects: Rect[] = [];
    const tmpBox = new THREE.Box3();
    const wps: Record<string, THREE.Vector3> = {};

    cloned.traverse((o: any) => {
      const name = o.name || "";
      const lowerName = name.toLowerCase();

      if (o?.isMesh) {
        // Selective shadows for performance (critical for big scenes like Gallery)
        const isFloor =
          lowerName.includes("floor") || lowerName.includes("ground");
        o.castShadow = false; // Buildings usually don't need to cast shadows on themselves
        o.receiveShadow = isFloor;

        // Fix for rendering issues (transparency, depth sorting)
        if (o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m: any) => {
            m.transparent = false;
            m.depthWrite = true;
            m.depthTest = true;
            m.alphaTest = 0;
            // Removed m.needsUpdate = true to prevent redundant re-compilations
          });
        }
      }

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
        name.toLowerCase().includes("entry") ||
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

    // Add teleport interactions
    Object.entries(teleports).forEach(([fromWp, target]) => {
      // Allow custom interactions to override teleports if they share the same nodeName
      if (customInteractions.find((i) => i.nodeName === fromWp)) return;

      if (waypoints[fromWp]) {
        const toWpName = typeof target === "string" ? target : target.to;
        const midNames =
          typeof target === "string" ? [] : target.midpoints || [];
        const isInstant = typeof target === "string" ? false : !!target.instant;

        list.push({
          nodeName: fromWp,
          label: fromWp.toLowerCase().includes("stairs")
            ? "Use Stairs"
            : "Interact",
          radius: 2.0,
          onTrigger: () => {
            const nodes = [fromWp, ...midNames, toWpName];
            const pathPoints: THREE.Vector3[] = [];

            nodes.forEach((name) => {
              const wp = waypoints[name];
              if (wp) {
                // Apply floor height logic only to waypoints with "down" in name (upper floor)
                const isHigh = name.toLowerCase().includes("down");
                const y = isHigh ? floorHeight : wp.y || 0;
                pathPoints.push(new THREE.Vector3(wp.x, y, wp.z));
              }
            });

            if (pathPoints.length < 2) return;

            if (isInstant) {
              const last = pathPoints[pathPoints.length - 1];
              if (playerRef.current) playerRef.current.position.copy(last);
              return;
            }

            if (playerRef.current) {
              const startPos = playerRef.current.position.clone();
              pathPoints[0].copy(startPos); // Start from actual current pos

              transitionProgress.current = 0;
              const dx = pathPoints[1].x - pathPoints[0].x;
              const dz = pathPoints[1].z - pathPoints[0].z;
              setTransition({
                path: pathPoints,
                segmentIndex: 0,
                rotation: Math.atan2(-dx, -dz),
              });
            }
          },
        });
      }
    });

    return list;
  }, [
    waypoints,
    customInteractions,
    exitScene,
    activeBuildingId,
    setReturnWaypoint,
    setScene,
    teleports,
    floorHeight,
  ]);

  const spawnPos: [number, number, number] = useMemo(() => {
    // Try to find an exit or entrance waypoint to spawn at
    const exitWpName = Object.keys(waypoints).find(
      (name) =>
        name.toLowerCase().includes("exit") ||
        name.toLowerCase().includes("stairs") ||
        name.toLowerCase().includes("door") ||
        name.toLowerCase().includes("entry") ||
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
  }, [waypoints, activeBuildingId]);

  // Snap camera on mount
  useLayoutEffect(() => {
    if (playerRef.current) {
      // We can't easily access the fiber state here without useThree,
      // but we can at least ensure the scene is ready.
    }
  }, []);

  const firstFrameRef = useRef(true);
  const prevInteractionRef = useRef<string | null>(null);

  useFrame((state, delta) => {
    // Basic camera follow logic or fixed camera
    // For buildings, let's use a slightly fixed but following-ish camera like HomeRoom
    const playerPos = playerRef.current?.position;
    if (!playerPos) return;

    // 0. Handle transition
    if (transition) {
      transitionProgress.current += delta / SEGMENT_DURATION;
      const alpha = THREE.MathUtils.clamp(transitionProgress.current, 0, 1);

      const p1 = transition.path[transition.segmentIndex];
      const p2 = transition.path[transition.segmentIndex + 1];

      _tempVec.current.lerpVectors(p1, p2, alpha);

      if (playerRef.current) {
        playerRef.current.position.copy(_tempVec.current);
      }

      if (alpha >= 1) {
        if (transition.segmentIndex + 2 < transition.path.length) {
          // Move to next segment
          const nextIdx = transition.segmentIndex + 1;
          const nextP1 = transition.path[nextIdx];
          const nextP2 = transition.path[nextIdx + 1];
          const dx = nextP2.x - nextP1.x;
          const dz = nextP2.z - nextP1.z;

          transitionProgress.current = 0;
          setTransition({
            ...transition,
            segmentIndex: nextIdx,
            rotation: Math.atan2(-dx, -dz),
          });
        } else {
          setTransition(null);
        }
      }
      // Continue to camera and interaction logic so they stay updated during transition
    }

    if (dialog.open) {
      if (prevInteractionRef.current !== null) {
        setInteraction(null, null);
        prevInteractionRef.current = null;
      }
      activeActionRef.current = null;
      return;
    }

    // Camera
    if (fixedCamera) {
      _cameraTarget.current.set(
        fixedCameraPos[0],
        fixedCameraPos[1],
        fixedCameraPos[2]
      );
    } else {
      _cameraTarget.current.set(playerPos.x, playerPos.y + 6, playerPos.z + 10);
    }

    if (firstFrameRef.current) {
      state.camera.position.copy(_cameraTarget.current);
      if (fixedCamera) {
        state.camera.lookAt(0, 0, 0);
      } else {
        state.camera.lookAt(playerPos.x, playerPos.y, playerPos.z);
      }
      firstFrameRef.current = false;
    } else {
      state.camera.position.lerp(_cameraTarget.current, 0.1);
      if (fixedCamera) {
        state.camera.lookAt(0, 0, 0);
      } else {
        state.camera.lookAt(playerPos.x, playerPos.y, playerPos.z);
      }
    }

    // Interaction checks - skip if transitioning
    let best: { def: InteractionDef; d: number } | null = null;
    if (!transition) {
      for (const def of defaultInteractions) {
        const wp = waypoints[def.nodeName];
        if (!wp) continue;
        const d = playerPos.distanceTo(wp);
        if (d <= def.radius) {
          if (!best || d < best.d) best = { def, d };
        }
      }
    }

    if (best) {
      if (prevInteractionRef.current !== best.def.label) {
        setInteraction(best.def.label, best.def.onTrigger);
        prevInteractionRef.current = best.def.label;
      }
      activeActionRef.current = best.def.onTrigger;
    } else {
      if (prevInteractionRef.current !== null) {
        setInteraction(null, null);
        prevInteractionRef.current = null;
      }
      activeActionRef.current = null;
    }
  });

  return (
    <>
      <color attach="background" args={["black"]} />
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
        forceWalk={!!transition}
        rotationY={transition?.rotation}
      />
    </>
  );
};
