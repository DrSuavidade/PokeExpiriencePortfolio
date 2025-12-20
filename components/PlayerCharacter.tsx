import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
// IMPORTANT: correct clone for skinned meshes
import { SkeletonUtils } from "three-stdlib";

type ActionName = "Idle" | "Walk" | "Interact";

type Props = {
  position?: [number, number, number];
  speed?: number;
  bounds?: { x: number; z: number };
  cameraFollow?: boolean;
  onInteract?: () => void;
};

export const PlayerCharacter = forwardRef<THREE.Group, Props>(
  (
    {
      position = [0, 0, 0],
      speed = 3,
      bounds = { x: 10, z: 10 },
      cameraFollow = false,
      onInteract,
    },
    ref
  ) => {
    const internalRef = useRef<THREE.Group>(null);
    const groupRef =
      (ref as React.MutableRefObject<THREE.Group | null>) || internalRef;

    // ✅ FIX: correct path/casing for your file: public/models/Player.glb
    const { scene, animations } = useGLTF("/models/Player.glb");

    // ✅ FIX: SkeletonUtils.clone is safe for rigged/skinned models
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

    // Keyboard listeners (same style as your old cube Player.tsx)
    useEffect(() => {
      const down = (e: KeyboardEvent) => {
        keys.current[e.code] = true;

        if (e.code === "KeyE") {
          // trigger interact one-shot
          if (!isInteracting) {
            setIsInteracting(true);
            onInteract?.();
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
    }, [isInteracting, onInteract]);

    const play = (name: ActionName, fade = 0.12) => {
      if (!actions) return;
      const next = actions[name];
      if (!next) return;

      // fade out others
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

    // When Interact finishes -> unlock + return to Idle/Walk
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

      // Interact animation control
      if (isInteracting) {
        if (currentAction.current !== "Interact") {
          play("Interact", 0.08);
        }
        return; // optional: freeze movement while interacting
      }

      // Movement input
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

      // Apply movement + bounds
      const x = groupRef.current.position.x;
      const z = groupRef.current.position.z;

      groupRef.current.position.x = THREE.MathUtils.clamp(
        x + dx,
        -bounds.x,
        bounds.x
      );
      groupRef.current.position.z = THREE.MathUtils.clamp(
        z + dz,
        -bounds.z,
        bounds.z
      );

      // Face travel direction (Pokemon-like)
      if (moving) {
        groupRef.current.rotation.y = Math.atan2(-dx, -dz);
      }

      // Optional camera follow (you can keep false in HomeRoom)
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
