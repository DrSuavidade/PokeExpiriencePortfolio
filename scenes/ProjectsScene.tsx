/// <reference types="@react-three/fiber" />
import React from "react";
import { BuildingBaseScene } from "../components/BuildingBaseScene";
import { useGLTF } from "@react-three/drei";

export const ProjectsScene = () => {
  return (
    <BuildingBaseScene
      modelPath="/models/Galery.glb"
      scale={0.1} // Galery is huge (19MB), might need scaling
    />
  );
};

useGLTF.preload("/models/Galery.glb");
