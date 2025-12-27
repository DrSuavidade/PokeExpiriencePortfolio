import React, { useMemo } from "react";
import { BuildingBaseScene } from "../components/BuildingBaseScene";
import { useGLTF } from "@react-three/drei";
import { useGameStore } from "../state/gameStore";

export const ProjectsScene = () => {
  const setDialog = useGameStore((s) => s.setDialog);
  const setPuzzleOpen = useGameStore((s) => s.setPuzzleOpen);
  const defeatedNPCs = useGameStore((s) => s.progress.defeatedNPCs);

  const interactions = useMemo(
    () => [
      // --- Info Waypoints ---
      {
        nodeName: "waypointInfo",
        label: "Projects Terminal",
        radius: 1.8,
        onTrigger: () => {
          if (defeatedNPCs["projects"]) {
            setDialog({
              open: true,
              title: "Badge Earned",
              body: "You have already completed the puzzle and earned the Projects Badge.",
            });
          } else {
            setPuzzleOpen(true);
          }
        },
      },
      {
        nodeName: "waypointInfo2",
        label: "Read Info",
        radius: 1.8,
        onTrigger: () =>
          setDialog({
            open: true,
            title: "Technical Stack",
            body: "To build this experience I used React, Three.js, and TypeScript.",
          }),
      },
      {
        nodeName: "waypointInfo3",
        label: "Read Info",
        radius: 1.8,
        onTrigger: () =>
          setDialog({
            open: true,
            title: "Contributions",
            body: "Helped with an among us mod with more than 5M weekly views.",
          }),
      },

      // --- Exhibit Waypoints ---
      {
        nodeName: "waypointModel",
        label: "Inspect Model",
        radius: 1.8,
        onTrigger: () =>
          setDialog({
            open: true,
            title: "3D Projects",
            body: "To see more, look at the old portfolio upstairs.",
          }),
      },
      {
        nodeName: "waypointArchitect",
        label: "Inspect Architecture",
        radius: 1.8,
        onTrigger: () =>
          setDialog({
            open: true,
            title: "Architectural Design",
            body: "Combining spatial awareness with digital interactivity.",
          }),
      },

      // --- Project Links (Confirm to Open) ---
      ...[
        "Git",
        "Portfolio",
        "Play",
        "Video1",
        "Video2",
        "Viseu",
        "Art",
        "Ar",
        "Bundlr",
      ].map((id) => ({
        nodeName: `waypoint${id}`,
        label: id === "Ar" ? "Open AR" : `Open ${id}`,
        radius: 2.0,
        onTrigger: () =>
          setDialog({
            open: true,
            title: `Open External Link?`,
            body: `Do you want to see the ${id} project? This will open a new window.`,
            onConfirm: () => {
              const links: Record<string, string> = {
                Git: "https://github.com/DrSuavidade",
                Portfolio: "https://pedrodcostaportfolio.onrender.com/",
                Play: "https://drive.google.com/file/d/1wTTMSXjCj_lcpETv-mxrPCS_3g066D6I/view",
                Video1:
                  "https://drive.google.com/file/d/1kbA0kgXoS3ZrUGcD-LjP7TUWapffaZGA/view",
                Video2: "https://www.youtube.com/watch?v=4fCb-7U_IJI",
                Viseu: "https://avscouts.onrender.com/login",
                Art: "https://drive.google.com/file/d/1KWQkvEbcv9feTh1SE-AkszvRRSxJ55Me/view",
                Ar: "https://github.com/DrSuavidade/EstagioIPV-V4Y/blob/main/EntregaFinal/Relat%C3%B3rioEstagio_pv26240.pdf",
                Bundlr: "https://bundlr.pt/",
              };
              window.open(links[id] || "#", "_blank");
            },
          }),
      })),
    ],
    [setDialog]
  );

  const teleports = {
    waypointStairsUp1: "waypointStairsDown1",
    waypointStairsDown1: "waypointStairsUp1",
    waypointStairsUp2: "waypointStairsDown2",
    waypointStairsDown2: "waypointStairsUp2",
  } as Record<string, string>;

  return (
    <BuildingBaseScene
      modelPath="/models/Galery.glb"
      scale={0.1} // Huge model
      interactions={interactions}
      teleports={teleports}
      playerBounds={{ x: 50, z: 50 }} // Larger bounds for the gallery
    />
  );
};

useGLTF.preload("/models/Galery.glb");
