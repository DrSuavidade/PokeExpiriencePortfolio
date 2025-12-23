import React, { useMemo } from "react";
import { BuildingBaseScene } from "../components/BuildingBaseScene";
import { useGLTF } from "@react-three/drei";
import { useGameStore } from "../state/gameStore";

export const CvScene = () => {
  const setDialog = useGameStore((s) => s.setDialog);
  const setScene = useGameStore((s) => s.setScene);

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
              window.open("/cv.pdf", "_blank");
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
    />
  );
};

useGLTF.preload("/models/CvTrial.glb");
