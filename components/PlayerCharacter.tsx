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
  colliders?: Rect[];
  radius?: number;
  forceWalk?: boolean;
  rotationY?: number;
  initialRotationY?: number;
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
      forceWalk = false,
      rotationY,
      initialRotationY,
    },
    ref
  ) => {
    // ✅ Outer group: movement & camera follow target
    const controllerRef = useRef<THREE.Group>(null);

    // ✅ Inner group: animations live here
    const modelRootRef = useRef<THREE.Group>(null);

    // Forward ref -> outer group
    useEffect(() => {
      if (!ref) return;
      if (typeof ref === "function") ref(controllerRef.current);
      else (ref as any).current = controllerRef.current;
    }, [ref]);

    const { scene, animations } = useGLTF("/models/Player.glb");
    const model = useMemo(() => SkeletonUtils.clone(scene), [scene]);

    // ✅ Bind mixer/actions to the INNER model group
    const { actions, mixer } = useAnimations(animations, modelRootRef);

    const keys = useRef<Record<string, boolean>>({});
    const [isInteracting, setIsInteracting] = useState(false);
    const { menuOpen, consoleOpen, dialog, letterOpen } = useGameStore();
    const currentAction = useRef<ActionName>("Idle");

    // Optimization: Reusable vectors to avoid GC spikes
    const _targetPos = useRef(new THREE.Vector3());
    const _camLookAt = useRef(new THREE.Vector3());

    // Set initial position once on mount
    useEffect(() => {
      if (!controllerRef.current) return;
      controllerRef.current.position.set(position[0], position[1], position[2]);

      const startRot =
        rotationY !== undefined
          ? rotationY
          : initialRotationY !== undefined
          ? initialRotationY
          : 0;
      controllerRef.current.rotation.set(0, startRot, 0);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Dialog open -> stop input
    useEffect(() => {
      if (dialog.open) {
        setIsInteracting(false);
        keys.current = {};
        if (currentAction.current !== "Idle") {
          actions?.Idle?.reset().fadeIn(0.08).play();
          currentAction.current = "Idle";
        }
      }
    }, [dialog.open, actions]);

    // Keyboard listeners
    useEffect(() => {
      const down = (e: KeyboardEvent) => {
        keys.current[e.code] = true;
        if (e.code === "KeyE" || e.code === "Space") {
          const isOverlaid =
            dialog.open || menuOpen || consoleOpen || letterOpen;
          if (!isInteracting && !isOverlaid) {
            keys.current = {}; // Stop movement
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
    }, [
      isInteracting,
      onInteract,
      dialog.open,
      menuOpen,
      consoleOpen,
      letterOpen,
    ]);

    // Shadows
    useEffect(() => {
      model.traverse((o: any) => {
        if (o?.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
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
        if (e.action === actions?.Interact) setIsInteracting(false);
      };
      mixer.addEventListener("finished", onFinished);
      return () => mixer.removeEventListener("finished", onFinished);
    }, [mixer, actions]);

    useFrame((state, delta) => {
      const ctrl = controllerRef.current;
      if (!ctrl) return;

      // Freeze while dialog, menu, console or letter open
      if (dialog.open || menuOpen || consoleOpen || letterOpen) {
        if (currentAction.current !== "Idle") play("Idle", 0.12);
        return;
      }

      // Interact anim control
      if (isInteracting) {
        if (currentAction.current !== "Interact") play("Interact", 0.08);
        return;
      }

      const moveSpeed = speed * delta;

      let dx = 0;
      let dz = 0;

      if (keys.current["ArrowUp"] || keys.current["KeyW"]) dz -= moveSpeed;
      if (keys.current["ArrowDown"] || keys.current["KeyS"]) dz += moveSpeed;
      if (keys.current["ArrowLeft"] || keys.current["KeyA"]) dx -= moveSpeed;
      if (keys.current["ArrowRight"] || keys.current["KeyD"]) dx += moveSpeed;

      const moving = dx !== 0 || dz !== 0 || forceWalk;

      if (moving) {
        if (currentAction.current !== "Walk") play("Walk", 0.12);
      } else {
        if (currentAction.current !== "Idle") play("Idle", 0.12);
      }

      const prevX = ctrl.position.x;
      const prevZ = ctrl.position.z;

      let nextX = THREE.MathUtils.clamp(prevX + dx, -bounds.x, bounds.x);
      let nextZ = THREE.MathUtils.clamp(prevZ + dz, -bounds.z, bounds.z);

      if (colliders.length > 0 && moving) {
        const res = resolveXZ(prevX, prevZ, nextX, nextZ, radius, colliders);
        nextX = res.x;
        nextZ = res.z;
      }

      ctrl.position.x = nextX;
      ctrl.position.z = nextZ;

      if (moving) {
        if (forceWalk && rotationY !== undefined) {
          ctrl.rotation.y = rotationY;
        } else if (dx !== 0 || dz !== 0) {
          ctrl.rotation.y = Math.atan2(-dx, -dz);
        }
      }

      // ✅ frame-rate independent smoothing for camera follow
      if (cameraFollow) {
        const followAlpha = 1 - Math.pow(0.001, delta); // smooth regardless of FPS
        _targetPos.current.set(ctrl.position.x, 8, ctrl.position.z + 10);
        _camLookAt.current.set(
          ctrl.position.x,
          ctrl.position.y,
          ctrl.position.z
        );

        state.camera.position.lerp(_targetPos.current, followAlpha);
        state.camera.lookAt(_camLookAt.current);
      }
    });

    return (
      <group ref={controllerRef}>
        <group ref={modelRootRef} rotation={[0, Math.PI, 0]}>
          <primitive object={model} />
        </group>
      </group>
    );
  }
);

useGLTF.preload("/models/Player.glb");
