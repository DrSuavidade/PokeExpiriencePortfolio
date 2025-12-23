import React, { useMemo } from "react";
import { BuildingBaseScene } from "../components/BuildingBaseScene";
import { useGLTF } from "@react-three/drei";
import { useGameStore } from "../state/gameStore";

export const SkillScene = () => {
  const setDialog = useGameStore((s) => s.setDialog);

  const interactions = useMemo(
    () => [
      {
        nodeName: "waypointFridge",
        label: "Check Fridge",
        radius: 2.0,
        onTrigger: () =>
          setDialog({
            open: true,
            title: "The Fridge",
            body: "It's full of energy drinks and leftover pizza. The true fuel of a developer.",
          }),
      },
      {
        nodeName: "waypointPlay",
        label: "Play Game",
        radius: 2.0,
        onTrigger: () =>
          setDialog({
            open: true,
            title: "Start Game?",
            body: "Do you want to play a small demo? This will open in a new tab.",
            onConfirm: () => {
              window.open("https://example.com/demo", "_blank");
            },
          }),
      },
    ],
    [setDialog]
  );

  return (
    <BuildingBaseScene
      modelPath="/models/GameHouse.glb"
      scale={0.5}
      interactions={interactions}
      fixedCamera={true}
      fixedCameraPos={[0, 8, 15]}
    />
  );
};

useGLTF.preload("/models/GameHouse.glb");
