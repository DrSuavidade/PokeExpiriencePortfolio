import React, { useMemo, useCallback, useRef } from "react";
import { BuildingBaseScene } from "../components/BuildingBaseScene";
import { useGLTF } from "@react-three/drei";
import { useGameStore } from "../state/gameStore";
import * as THREE from "three";

export const CvScene = () => {
  const setDialog = useGameStore((s) => s.setDialog);
  const setScene = useGameStore((s) => s.setScene);
  const papersRef = useRef<{ obj: THREE.Object3D; initialY: number }[]>([]);
  const lastModelRef = useRef<THREE.Group | null>(null);

  const handleFrame = useCallback(
    (model: THREE.Group, delta: number, elapsed: number) => {
      // Reset if model changed
      if (lastModelRef.current !== model) {
        papersRef.current = [];
        lastModelRef.current = model;
      }

      // Collect papers once per model instance
      if (papersRef.current.length === 0) {
        model.traverse((child) => {
          if (child.name.toLowerCase().includes("paper")) {
            papersRef.current.push({
              obj: child,
              initialY: child.position.y,
            });
          }
        });
      }

      // Animate them
      papersRef.current.forEach((p, i) => {
        // Float up/down
        p.obj.position.y = p.initialY + Math.sin(elapsed * 1.5 + i) * 0.1;
        // Gentle tilt/wobble
        p.obj.rotation.x = Math.sin(elapsed * 0.8 + i) * 0.05;
        p.obj.rotation.z = Math.cos(elapsed * 2.2 + i) * 0.05;
      });
    },
    []
  );

  const interactions = useMemo(
    () => [
      {
        nodeName: "waypointInfo",
        label: "View CV",
        radius: 2.0,
        onTrigger: () =>
          setDialog({
            open: true,
            title: "Resume / CV",
            body: "Do you want to download my full resume in PDF format?",
            onConfirm: () => {
              window.open("pdf/Resume.pdf", "_blank");
            },
          }),
      },
      {
        nodeName: "waypointCv",
        label: "Battle?",
        radius: 2.0,
        onTrigger: () =>
          setDialog({
            open: true,
            title: "CV Guardian",
            body: "You've found the CV waypoint! Do you seek knowledge... or a battle?",
            onConfirm: () => {
              setScene("battle");
            },
          }),
      },
    ],
    [setDialog, setScene]
  );

  const teleports: Record<string, any> = {
    waypointStairsUp1: { to: "waypointStairsDown1", instant: true },
    waypointStairsUp2: { to: "waypointStairsDown1", instant: true },
    waypointStairsDown1: { to: "waypointStairsUp1", instant: true },
  };

  return (
    <BuildingBaseScene
      modelPath="/models/CvTrial.glb"
      scale={0.5}
      interactions={interactions}
      teleports={teleports}
      floorHeight={2.9}
      onFrame={handleFrame}
    />
  );
};

useGLTF.preload("/models/CvTrial.glb");
