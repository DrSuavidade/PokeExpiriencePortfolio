import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";

import { useGameStore } from "../state/gameStore";
import type { Rect } from "../utils/collision2d";
import { resolveXZ } from "../utils/collision2d";

type ActionName = "Idle" | "Walk" | "Interact";

type Props = {
  position?: [number, number, number];
  speed?: number;
  bounds?: { x: number; z: number };
  cameraFollow?: boolean;
  onInteract?: () => void;

  // ✅ new
  colliders?: Rect[];
  radius?: number; // player "collision radius" in world units
};

export const PlayerCharacter = forwardRef<THREE.Group, Props>(
  (
    {
      position = [0, 0, 0],
      speed = 3,
      bounds = { x: 10, z: 10 },
      cameraFollow = false,
      onInteract,
      colliders = [],
      radius = 0.35,
    },
    ref
  ) => {
    const internalRef = useRef<THREE.Group>(null);
    const groupRef =
      (ref as React.RefObject<THREE.Group | null>) || internalRef;

    const dialog = useGameStore((s) => s.dialog);

    const { scene, animations } = useGLTF("/models/Player.glb");
    const model = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { actions, mixer } = useAnimations(animations, groupRef);

    const keys = useRef<Record<string, boolean>>({});
    const [isInteracting, setIsInteracting] = useState(false);
    const currentAction = useRef<ActionName>("Idle");

    // Set initial position once
    useEffect(() => {
      if (!groupRef.current) return;
      groupRef.current.position.set(position[0], position[1], position[2]);
      groupRef.current.rotation.set(0, 0, 0);
    }, [position, groupRef]);

    // If dialog opens, stop interact state + clear keys
    useEffect(() => {
      if (dialog.open) {
        setIsInteracting(false);
        keys.current = {};
        if (currentAction.current !== "Idle") {
          // try to return to idle visually
          actions?.Idle?.reset().fadeIn(0.08).play();
          currentAction.current = "Idle";
        }
      }
    }, [dialog.open, actions]);

    // Keyboard listeners
    useEffect(() => {
      const down = (e: KeyboardEvent) => {
        keys.current[e.code] = true;

        if (e.code === "KeyE") {
          if (!isInteracting && !dialog.open) {
            setIsInteracting(true);
            onInteract?.(); // your waypoint action (opens dialog / changes scene)
          }
        }
      };
      const up = (e: KeyboardEvent) => (keys.current[e.code] = false);

      window.addEventListener("keydown", down);
      window.addEventListener("keyup", up);
      return () => {
        window.removeEventListener("keydown", down);
        window.removeEventListener("keyup", up);
      };
    }, [isInteracting, onInteract, dialog.open]);

    // Shadows
    useEffect(() => {
      model.traverse((o: any) => {
        if (o?.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
          o.frustumCulled = false;
        }
      });
    }, [model]);

    const play = (name: ActionName, fade = 0.12) => {
      if (!actions) return;
      const next = actions[name];
      if (!next) return;

      Object.values(actions).forEach((a) => a?.fadeOut(fade));
      next.reset().fadeIn(fade).play();
      currentAction.current = name;
    };

    // Configure loops + start Idle
    useEffect(() => {
      if (!actions) return;

      actions.Idle?.setLoop(THREE.LoopRepeat, Infinity);
      actions.Walk?.setLoop(THREE.LoopRepeat, Infinity);

      if (actions.Interact) {
        actions.Interact.setLoop(THREE.LoopOnce, 1);
        actions.Interact.clampWhenFinished = true;
      }

      play("Idle", 0);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actions]);

    // When Interact finishes -> unlock
    useEffect(() => {
      if (!mixer) return;

      const onFinished = (e: any) => {
        if (e.action === actions?.Interact) {
          setIsInteracting(false);
        }
      };

      mixer.addEventListener("finished", onFinished);
      return () => mixer.removeEventListener("finished", onFinished);
    }, [mixer, actions]);

    useFrame((state, dt) => {
      if (!groupRef.current) return;

      // Freeze while dialog open
      if (dialog.open) {
        if (currentAction.current !== "Idle") play("Idle", 0.12);
        return;
      }

      // Interact anim control
      if (isInteracting) {
        if (currentAction.current !== "Interact") play("Interact", 0.08);
        return;
      }

      const moveSpeed = speed * dt;

      let dx = 0;
      let dz = 0;

      if (keys.current["ArrowUp"] || keys.current["KeyW"]) dz -= moveSpeed;
      if (keys.current["ArrowDown"] || keys.current["KeyS"]) dz += moveSpeed;
      if (keys.current["ArrowLeft"] || keys.current["KeyA"]) dx -= moveSpeed;
      if (keys.current["ArrowRight"] || keys.current["KeyD"]) dx += moveSpeed;

      const moving = dx !== 0 || dz !== 0;

      // Animation state
      if (moving) {
        if (currentAction.current !== "Walk") play("Walk", 0.12);
      } else {
        if (currentAction.current !== "Idle") play("Idle", 0.12);
      }

      // Proposed move (with outer clamp)
      const prevX = groupRef.current.position.x;
      const prevZ = groupRef.current.position.z;

      let nextX = THREE.MathUtils.clamp(prevX + dx, -bounds.x, bounds.x);
      let nextZ = THREE.MathUtils.clamp(prevZ + dz, -bounds.z, bounds.z);

      // ✅ Collider resolution (slide)
      if (colliders.length > 0 && moving) {
        const res = resolveXZ(prevX, prevZ, nextX, nextZ, radius, colliders);
        nextX = res.x;
        nextZ = res.z;
      }

      groupRef.current.position.x = nextX;
      groupRef.current.position.z = nextZ;

      // Face travel direction
      if (moving) {
        groupRef.current.rotation.y = Math.atan2(-dx, -dz);
      }

      // Optional camera follow
      if (cameraFollow) {
        const targetCamPos = new THREE.Vector3(
          groupRef.current.position.x,
          8,
          groupRef.current.position.z + 10
        );
        state.camera.position.lerp(targetCamPos, 0.1);
        state.camera.lookAt(groupRef.current.position);
      }
    });

    return (
      <group ref={groupRef}>
        {/* Rotate the visual model 180° so movement forward matches */}
        <group rotation={[0, Math.PI, 0]}>
          <primitive object={model} />
        </group>
      </group>
    );
  }
);

useGLTF.preload("/models/Player.glb");
