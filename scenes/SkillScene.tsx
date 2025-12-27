import React, { useMemo } from "react";
import { BuildingBaseScene } from "../components/BuildingBaseScene";
import { useGLTF } from "@react-three/drei";
import { useGameStore } from "../state/gameStore";

export const SkillScene = () => {
  const setDialog = useGameStore((s) => s.setDialog);
  const setConsoleOpen = useGameStore((s) => s.setConsoleOpen);

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
            body: "Nothing but energy drinks, smoked salmon and cottage cheese. The true fuel of a developer.",
          }),
      },
      {
        nodeName: "waypointPlay",
        label: "Play Game",
        radius: 2.0,
        onTrigger: () => setConsoleOpen(true),
      },
    ],
    [setDialog]
  );

  return (
    <BuildingBaseScene
      modelPath="/models/GameHouse2.glb"
      scale={0.5}
      interactions={interactions}
      fixedCamera={true}
      fixedCameraPos={[0, 6, 11]}
    />
  );
};

useGLTF.preload("/models/GameHouse2.glb");
