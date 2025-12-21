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

// ✅ change if your file name/path differs
const TOWN_GLB = "/models/Town.glb";

// These are your “badge” houses (match the ids used in your store/progress)
const BADGE_IDS = ["about", "projects", "cv", "skill"] as const;
type BadgeId = (typeof BADGE_IDS)[number];

export const CityMapScene = () => {
  const enterBuilding = useGameStore((s) => s.enterBuilding);
  const setScene = useGameStore((s) => s.setScene);
  const setInteraction = useGameStore((s) => s.setInteraction);

  const dialog = useGameStore((s) => s.dialog);
  const setDialog = useGameStore((s) => s.setDialog);

  const defeatedNPCs = useGameStore((s) => s.progress.defeatedNPCs);

  const playerRef = useRef<THREE.Group>(null);
  const activeActionRef = useRef<null | (() => void)>(null);

  const { scene: townSrc } = useGLTF(TOWN_GLB);

  // ✅ Clone + (optional) scale + extract colliders + cache waypoint positions
  const {
    town,
    colliders,
    bounds,
    waypointPos,
    spawnPos,
  }: {
    town: THREE.Object3D;
    colliders: Rect[];
    bounds: { x: number; z: number };
    waypointPos: Record<string, THREE.Vector3>;
    spawnPos: [number, number, number];
  } = useMemo(() => {
    const cloned = townSrc.clone(true);

    // If your city size is off, change this (or set to 1)
    const TOWN_SCALE = 0.3;
    cloned.scale.setScalar(TOWN_SCALE);

    // Ensure world matrices are updated before reading Box3 / world positions
    cloned.updateMatrixWorld(true);

    // Extract collision rectangles from COLL_ meshes
    const rects: Rect[] = [];
    const tmpBox = new THREE.Box3();

    // Cache waypoint world positions once
    const wps: Record<string, THREE.Vector3> = {};

    // Shadows defaults + hide colliders/waypoints (so they don't render)
    cloned.traverse((o: any) => {
      if (o?.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }

      const n = typeof o?.name === "string" ? o.name : "";

      // Colliders
      if (n.startsWith("COLL_")) {
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

      // Waypoints (your Blender empties may export as objects; some people use small cubes)
      // If your waypoints are meshes, hide them too:
      if (n.startsWith("waypoint")) {
        // cache position
        const v = new THREE.Vector3();
        o.getWorldPosition(v);
        wps[n] = v;

        // hide if it's a visible mesh
        if (o?.isMesh) {
          o.visible = false;
          o.castShadow = false;
          o.receiveShadow = false;
        }
      }
    });

    // Auto bounds from the whole town (for clamp fallback)
    const worldBox = new THREE.Box3().setFromObject(cloned);
    const maxX = Math.max(Math.abs(worldBox.min.x), Math.abs(worldBox.max.x));
    const maxZ = Math.max(Math.abs(worldBox.min.z), Math.abs(worldBox.max.z));
    const computedBounds = { x: maxX + 2, z: maxZ + 2 };

    // Spawn near waypointRoom if it exists
    const roomWp = wps["waypointRoom"];
    const spawn: [number, number, number] = roomWp
      ? [roomWp.x, roomWp.y, roomWp.z + 1.0]
      : [0, 0, 6];

    return {
      town: cloned,
      colliders: rects,
      bounds: computedBounds,
      waypointPos: wps,
      spawnPos: spawn,
    };
  }, [townSrc]);

  const allBadgesDone = BADGE_IDS.every((id) => !!defeatedNPCs[id]);

  // ✅ Define all interactions based on waypoint names
  const interactions: InteractionDef[] = useMemo(
    () => [
      // --- Info signs (just textboxes) ---
      {
        nodeName: "waypointInfoAbout",
        label: "Read Sign",
        radius: 2.0,
        onTrigger: () =>
          setDialog({
            open: true,
            title: "Info",
            body: "About House — learn who I am and how I work.",
          }),
      },
      {
        nodeName: "waypointInfoProjects",
        label: "Read Sign",
        radius: 2.0,
        onTrigger: () =>
          setDialog({
            open: true,
            title: "Info",
            body: "Projects Lab — explore my best work and how I build games.",
          }),
      },
      {
        nodeName: "waypointInfoSkill",
        label: "Read Sign",
        radius: 2.0,
        onTrigger: () =>
          setDialog({
            open: true,
            title: "Info",
            body: "Skills House — what tools I use and what I’m strongest at.",
          }),
      },

      // --- Building entries (badges) ---
      {
        nodeName: "waypointAbout",
        label: "Enter About House",
        radius: 2.4,
        onTrigger: () => enterBuilding("about"),
      },
      {
        nodeName: "waypointProjects",
        label: "Enter Projects Lab",
        radius: 2.4,
        onTrigger: () => enterBuilding("projects"),
      },
      {
        nodeName: "waypointSkill",
        label: "Enter Skills House",
        radius: 2.4,
        onTrigger: () => enterBuilding("skill"),
      },
      {
        nodeName: "waypointCv",
        label: "Enter CV Tower",
        radius: 2.4,
        onTrigger: () => enterBuilding("cv"),
      },

      // --- Return to room ---
      {
        nodeName: "waypointRoom",
        label: "Go Back Home",
        radius: 2.4,
        onTrigger: () => setScene("home"),
      },

      // --- City exit (gated by badges) ---
      {
        nodeName: "waypointEnd",
        label: "Leave City",
        radius: 2.6,
        onTrigger: () => {
          if (!allBadgesDone) {
            setDialog({
              open: true,
              title: "Exit",
              body: "You are not ready. keep getting stronger",
            });
            return;
          }

          // ✅ If you already have an ending scene, jump there:
          // (Later we can add a fade-to-white transition if you want.)
          setScene("ending");
        },
      },
    ],
    [enterBuilding, setScene, setDialog, allBadgesDone]
  );

  // ✅ Nearest interaction logic (same as HomeRoomScene)
  useFrame(() => {
    const playerPos = playerRef.current?.position;
    if (!playerPos) return;

    // If dialog is open, don't offer interactions
    if (dialog.open) {
      setInteraction(null, null);
      activeActionRef.current = null;
      return;
    }

    let best: { def: InteractionDef; d: number } | null = null;

    for (const def of interactions) {
      const wp = waypointPos[def.nodeName];
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

  // Simple badge indicators above house waypoints
  const badgeMarkers = useMemo(() => {
    const items: { id: BadgeId; pos: THREE.Vector3 }[] = [];

    const map: Record<BadgeId, string> = {
      about: "waypointAbout",
      projects: "waypointProjects",
      skill: "waypointSkill",
      cv: "waypointCv",
    };

    (BADGE_IDS as readonly BadgeId[]).forEach((id) => {
      const wpName = map[id];
      const p = waypointPos[wpName];
      if (!p) return;
      items.push({ id, pos: p.clone() });
    });

    return items;
  }, [waypointPos]);

  return (
    <>
      <ambientLight intensity={0.75} />

      <directionalLight
        position={[-8, 12, -6]}
        intensity={0.65}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0005}
        shadow-normalBias={0.03}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      <Environment preset="city" />

      {/* Town model (COLL_ + waypoints are hidden inside) */}
      <primitive object={town} />

      {/* Badge completion markers */}
      {badgeMarkers.map(({ id, pos }) => {
        const done = !!defeatedNPCs[id];
        if (!done) return null;
        return (
          <mesh key={id} position={[pos.x, pos.y + 1.2, pos.z]}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshBasicMaterial color="#4ade80" />
          </mesh>
        );
      })}

      <PlayerCharacter
        ref={playerRef}
        position={spawnPos}
        bounds={bounds}
        speed={4}
        cameraFollow={true}
        radius={0.35}
        colliders={colliders}
        onInteract={() => activeActionRef.current?.()}
      />
    </>
  );
};

useGLTF.preload(TOWN_GLB);
