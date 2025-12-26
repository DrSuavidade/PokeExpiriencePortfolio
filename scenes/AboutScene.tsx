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
      if (cameraMode !== "desk") return;

      if (e.key === "Escape") {
        setCameraMode("normal");
        setDialog({ open: false });
        useGameStore.getState().setLetterOpen(false);
      } else if (e.key === " " || e.key.toLowerCase() === "e") {
        const { dialog, letterOpen, setLetterOpen } = useGameStore.getState();
        if (dialog.open) {
          setDialog({ open: false });
        } else if (letterOpen) {
          setLetterOpen(false);
        } else {
          setCameraMode("normal");
        }
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
            body: "Click in the items on the table to know more. Click ESC to exit the desk.",
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
