/** To remove - PlayerCharacter is the new file */
/// <reference types="@react-three/fiber" />
import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";

type ActionName = "Idle" | "Walk" | "Interact";

export type PlayerProps = {
  position?: [number, number, number];
  speed?: number;
  bounds?: { x: number; z: number };

  /** If true, camera follows the player (City scene) */
  cameraFollow?: boolean;
  /** Camera tuning */
  cameraHeight?: number;
  cameraDistance?: number;
  cameraLerp?: number;

  /** Optional hook for interaction events */
  onInteract?: () => void;
};

export const Player = forwardRef<THREE.Group, PlayerProps>(
  (
    {
      position = [0, 0, 0],
      speed = 5,
      bounds = { x: 10, z: 10 },

      cameraFollow = false,
      cameraHeight = 8,
      cameraDistance = 10,
      cameraLerp = 0.12,

      onInteract,
    },
    ref
  ) => {
    const internalRef = useRef<THREE.Group>(null);
    const playerRootRef =
      (ref as React.MutableRefObject<THREE.Group | null>) ?? internalRef;

    // keyboard state (same style as your old cube Player)
    const keys = useRef<Record<string, boolean>>({});

    useEffect(() => {
      const down = (e: KeyboardEvent) => (keys.current[e.code] = true);
      const up = (e: KeyboardEvent) => (keys.current[e.code] = false);
      window.addEventListener("keydown", down);
      window.addEventListener("keyup", up);
      return () => {
        window.removeEventListener("keydown", down);
        window.removeEventListener("keyup", up);
      };
    }, []);

    // Load GLB
    const { scene, animations } = useGLTF("/models/Player.glb");

    // Clone so HMR/StrictMode doesn’t mutate cached gltf
    const model = useMemo(() => scene.clone(true), [scene]);

    // We bind animations to a dedicated group (the visual model container)
    const visualRef = useRef<THREE.Group>(null);
    const { actions, mixer } = useAnimations(animations, visualRef);

    const [isInteracting, setIsInteracting] = useState(false);
    const [current, setCurrent] = useState<ActionName>("Idle");

    // Setup shadows + avoid frustum pop
    useEffect(() => {
      model.traverse((o: any) => {
        if (o?.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
          o.frustumCulled = false;
        }
      });
    }, [model]);

    // Initial placement
    useEffect(() => {
      if (!playerRootRef.current) return;
      playerRootRef.current.position.set(position[0], position[1], position[2]);
    }, [position, playerRootRef]);

    // Configure animation loops + start idle
    useEffect(() => {
      if (!actions) return;

      actions.Idle?.setLoop(THREE.LoopRepeat, Infinity);
      actions.Walk?.setLoop(THREE.LoopRepeat, Infinity);

      if (actions.Interact) {
        actions.Interact.setLoop(THREE.LoopOnce, 1);
        actions.Interact.clampWhenFinished = true;
      }

      actions.Idle?.reset().play();
      setCurrent("Idle");
    }, [actions]);

    // When Interact finishes, unlock
    useEffect(() => {
      if (!mixer || !actions?.Interact) return;

      const onFinished = (e: any) => {
        if (e.action === actions.Interact) setIsInteracting(false);
      };

      mixer.addEventListener("finished", onFinished);
      return () => mixer.removeEventListener("finished", onFinished);
    }, [mixer, actions]);

    const fadeTo = (name: ActionName, fade = 0.12) => {
      if (!actions) return;
      const next = actions[name];
      if (!next) return;

      (Object.keys(actions) as ActionName[]).forEach((k) => {
        if (k !== name) actions[k]?.fadeOut(fade);
      });

      next.reset().fadeIn(fade).play();
      setCurrent(name);
    };

    // Main loop: movement + facing + camera follow + animation selection
    useFrame((state, delta) => {
      const root = playerRootRef.current;
      if (!root) return;

      const moveSpeed = speed * delta;

      // Interact (E) — one-shot, optional freeze
      if (!isInteracting && (keys.current["KeyE"] || keys.current["Enter"])) {
        if (actions?.Interact) {
          setIsInteracting(true);
          fadeTo("Interact", 0.08);
          onInteract?.();
        }
      }

      // Movement (optional: freeze while interacting)
      let dx = 0;
      let dz = 0;

      if (!isInteracting) {
        if (keys.current["ArrowUp"] || keys.current["KeyW"]) dz -= moveSpeed;
        if (keys.current["ArrowDown"] || keys.current["KeyS"]) dz += moveSpeed;
        if (keys.current["ArrowLeft"] || keys.current["KeyA"]) dx -= moveSpeed;
        if (keys.current["ArrowRight"] || keys.current["KeyD"]) dx += moveSpeed;

        if (dx !== 0 || dz !== 0) {
          // Move within bounds
          root.position.x = THREE.MathUtils.clamp(
            root.position.x + dx,
            -bounds.x,
            bounds.x
          );
          root.position.z = THREE.MathUtils.clamp(
            root.position.z + dz,
            -bounds.z,
            bounds.z
          );

          // Face direction of travel
          root.rotation.y = Math.atan2(-dx, -dz);

          // Walk anim
          if (current !== "Walk" && !isInteracting && actions?.Walk) {
            fadeTo("Walk", 0.12);
          }
        } else {
          // Idle anim
          if (current !== "Idle" && !isInteracting && actions?.Idle) {
            fadeTo("Idle", 0.12);
          }
        }
      }

      // Camera follow (City)
      if (cameraFollow) {
        const targetCamPos = new THREE.Vector3(
          root.position.x,
          cameraHeight,
          root.position.z + cameraDistance
        );

        state.camera.position.lerp(targetCamPos, cameraLerp);
        state.camera.lookAt(
          root.position.x,
          root.position.y + 1,
          root.position.z
        );
      }
    });

    return (
      <group ref={playerRootRef as any}>
        {/* 
          Fix 180º “walking backwards”:
          rotate ONLY the visual model, not the movement root.
        */}
        <group ref={visualRef} rotation={[0, Math.PI, 0]}>
          <primitive object={model} />
        </group>
      </group>
    );
  }
);

useGLTF.preload("/models/Player.glb");
