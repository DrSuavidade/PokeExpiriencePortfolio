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

export const HomeRoomScene = () => {
  const setScene = useGameStore((s) => s.setScene);
  const setReturnWaypoint = useGameStore((s) => s.setReturnWaypoint);
  const setInteraction = useGameStore((s) => s.setInteraction);
  const dialog = useGameStore((s) => s.dialog);
  const setDialog = useGameStore((s) => s.setDialog);
  const returnWaypoint = useGameStore((s) => s.returnWaypoint);

  const playerRef = useRef<THREE.Group>(null);
  const activeActionRef = useRef<null | (() => void)>(null);
  const prevInteractionRef = useRef<string | null>(null);

  const { scene: roomSrc } = useGLTF("/models/Room.glb");

  // ✅ clone + scale + extract colliders once
  const { room, colliders } = useMemo(() => {
    const cloned = roomSrc.clone(true);

    const ROOM_SCALE = 0.5;
    cloned.scale.setScalar(ROOM_SCALE);

    // make sure world matrices are correct before Box3
    cloned.updateMatrixWorld(true);

    const rects: Rect[] = [];
    const tmpBox = new THREE.Box3();

    cloned.traverse((o: any) => {
      // default shadows on room meshes
      if (o?.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }

      if (typeof o?.name === "string" && o.name.startsWith("COLL_")) {
        // hide collider meshes (but keep them for bounds)
        o.visible = false;
        o.castShadow = false;
        o.receiveShadow = false;

        // world AABB
        tmpBox.setFromObject(o);

        rects.push({
          minX: tmpBox.min.x,
          maxX: tmpBox.max.x,
          minZ: tmpBox.min.z,
          maxZ: tmpBox.max.z,
        });
      }
    });

    return { room: cloned, colliders: rects };
  }, [roomSrc]);

  const spawnPos = useMemo(() => {
    // If we're re-entering from the city, spawn at the stairs
    if (returnWaypoint === "waypointStairs") {
      const obj = room.getObjectByName("waypointStairs");
      if (obj) {
        const v = new THREE.Vector3();
        obj.getWorldPosition(v);
        // Slightly offset so we aren't immediately triggering the interaction again
        // Force y to 0 to ensure player is on the floor
        return [v.x, 0, v.z + 1.2] as [number, number, number];
      }
    }
    // Default spawn (the first time)
    return [0, 0, 2] as [number, number, number];
  }, [room, returnWaypoint]);
  const playerBounds = React.useMemo(() => ({ x: 5.3, z: 5.3 }), []);

  const getWaypointWorldPos = (nodeName: string) => {
    const obj = room.getObjectByName(nodeName);
    if (!obj) return null;
    const v = new THREE.Vector3();
    obj.getWorldPosition(v);
    return v;
  };

  const interactions: InteractionDef[] = useMemo(
    () => [
      {
        nodeName: "waypointBed",
        label: "Check Bed",
        radius: 1.8,
        onTrigger: () =>
          setDialog({
            open: true,
            title: "Bed",
            body: "Get up and stop procrastinating!!",
          }),
      },
      {
        nodeName: "waypointDesk",
        label: "Check Desk",
        radius: 1.8,
        onTrigger: () =>
          setDialog({
            open: true,
            title: "Desk",
            body: "Some books and a bunch of perfumes. For now lets leave them alone",
          }),
      },
      {
        nodeName: "waypointSkate",
        label: "Look at Skate",
        radius: 1.8,
        onTrigger: () =>
          setDialog({
            open: true,
            title: "Skateboard",
            body: "You want to skate, but there are more important things to do now",
          }),
      },
      {
        nodeName: "waypointEducation",
        label: "Education Info",
        radius: 1.8,
        onTrigger: () =>
          setDialog({
            open: true,
            title: "Education",
            body: "BSc in Technology & Multimedia Design, MSc in Architecture and C1 English",
          }),
      },
      {
        nodeName: "waypointStairs",
        label: "Go Downstairs",
        radius: 2.2,
        onTrigger: () => {
          setReturnWaypoint("waypointRoom");
          setScene("city");
        },
      },
    ],
    [setScene, setDialog, setReturnWaypoint]
  );

  useFrame((state) => {
    // 1. Smoothly transition camera to fixed room view
    const targetPos = new THREE.Vector3(0, 5, 10);
    state.camera.position.lerp(targetPos, 0.1);
    state.camera.lookAt(0, 0, 0);

    // 2. Interaction logic
    const playerPos = playerRef.current?.position;
    if (!playerPos) return;

    if (dialog.open) {
      if (prevInteractionRef.current !== null) {
        setInteraction(null, null);
        prevInteractionRef.current = null;
      }
      activeActionRef.current = null;
      return;
    }

    let best: { def: InteractionDef; d: number } | null = null;

    for (const def of interactions) {
      const wp = getWaypointWorldPos(def.nodeName);
      if (!wp) continue;

      const d = playerPos.distanceTo(wp);
      if (d <= def.radius) {
        if (!best || d < best.d) best = { def, d };
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
      <ambientLight intensity={0.9} />

      <directionalLight
        position={[-5, 10, -5]}
        intensity={0.35}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0005}
        shadow-normalBias={0.03}
        shadow-camera-near={1}
        shadow-camera-far={25}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      <pointLight position={[0, 4, 0]} intensity={0.6} distance={20} />

      <Environment preset="apartment" />

      {/* Room model (colliders are inside but hidden) */}
      <primitive object={room} />

      <PlayerCharacter
        ref={playerRef}
        position={spawnPos}
        bounds={playerBounds}
        speed={4}
        cameraFollow={false}
        radius={0.35}
        colliders={colliders}
        onInteract={() => activeActionRef.current?.()}
      />
    </>
  );
};

useGLTF.preload("/models/Room.glb");
