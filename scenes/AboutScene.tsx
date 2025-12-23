import React, { useMemo } from "react";
import { BuildingBaseScene } from "../components/BuildingBaseScene";
import { useGLTF } from "@react-three/drei";
import { useGameStore } from "../state/gameStore";

export const AboutScene = () => {
  const setDialog = useGameStore((s) => s.setDialog);

  const interactions = useMemo(
    () => [
      {
        nodeName: "waypointDesk",
        label: "Check Desk",
        radius: 2.0,
        onTrigger: () =>
          setDialog({
            open: true,
            title: "Work Station",
            body: "A clean desk for a focused mind. There are some sketches of 3D models here.",
          }),
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
    [setDialog]
  );

  return (
    <BuildingBaseScene
      modelPath="/models/AboutShed.glb"
      scale={0.5}
      interactions={interactions}
      fixedCamera={true}
      fixedCameraPos={[0, 7, 10]}
    />
  );
};

useGLTF.preload("/models/AboutShed.glb");
