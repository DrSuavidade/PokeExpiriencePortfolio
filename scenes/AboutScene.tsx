import React, { useMemo, useState, useEffect } from "react";
import { BuildingBaseScene } from "../components/BuildingBaseScene";
import { useGLTF } from "@react-three/drei";
import { useGameStore } from "../state/gameStore";

export const AboutScene = () => {
  const setDialog = useGameStore((s) => s.setDialog);
  const [cameraMode, setCameraMode] = useState<"normal" | "desk">("normal");

  // Handle ESC key to exit desk view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "Escape" || e.key === " " || e.key.toLowerCase() === "e") &&
        cameraMode === "desk"
      ) {
        setCameraMode("normal");
        setDialog({ open: false });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cameraMode, setDialog]);

  const interactions = useMemo(
    () => [
      {
        nodeName: "waypointDesk",
        label: "Check Desk",
        radius: 2.0,
        onTrigger: () => {
          setCameraMode("desk");
          setDialog({
            open: true,
            title: "Work Station",
            body: "A clean desk for a focused mind. There are some sketches of 3D models here. Press ESC to return.",
          });
        },
      },
      {
        nodeName: "waypointBoxes",
        label: "Examine Boxes",
        radius: 2.0,
        onTrigger: () =>
          setDialog({
            open: true,
            title: "Old Storage",
            body: "Boxes full of old electronics and books. The foundations of learning.",
          }),
      },
    ],
    [setDialog, setCameraMode]
  );

  return (
    <BuildingBaseScene
      modelPath="/models/AboutShed.glb"
      scale={0.5}
      interactions={interactions}
      fixedCamera={true}
      fixedCameraPos={[0, 7, 10]}
      initialRotationY={Math.PI / 2}
      cameraMode={cameraMode}
    />
  );
};

useGLTF.preload("/models/AboutShed.glb");
