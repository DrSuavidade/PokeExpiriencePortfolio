import React, { useMemo } from "react";
import { BuildingBaseScene } from "../components/BuildingBaseScene";
import { useGLTF } from "@react-three/drei";
import { useGameStore } from "../state/gameStore";

export const ProjectsScene = () => {
  const setDialog = useGameStore((s) => s.setDialog);

  const interactions = useMemo(
    () => [
      // --- Info Waypoints ---
      {
        nodeName: "waypointInfo",
        label: "Read Info",
        radius: 1.8,
        onTrigger: () =>
          setDialog({
            open: true,
            title: "Gallery Info",
            body: "Welcome to the Projects Gallery. Here you can find my latest work in 3D and Web development.",
          }),
      },
      {
        nodeName: "waypointInfo2",
        label: "Read Info",
        radius: 1.8,
        onTrigger: () =>
          setDialog({
            open: true,
            title: "Technical Stack",
            body: "I use React, Three.js, and TypeScript to build immersive experiences.",
          }),
      },
      {
        nodeName: "waypointInfo3",
        label: "Read Info",
        radius: 1.8,
        onTrigger: () =>
          setDialog({
            open: true,
            title: "Future Plans",
            body: "Coming soon: More interactive components and VR support.",
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
            body: "These models represent my work in procedural generation and animation.",
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
                Git: "https://github.com",
                Portfolio: "https://portfolio.com",
                Play: "https://play.com",
                Video1: "https://youtube.com",
                Video2: "https://vimeo.com",
                Viseu: "https://viseu.pt",
                Art: "https://artstation.com",
                Ar: "https://ar-experience.com",
                Bundlr: "https://bundlr.network",
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
