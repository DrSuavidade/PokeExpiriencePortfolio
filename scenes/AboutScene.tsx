/// <reference types="@react-three/fiber" />
import React from "react";
import { BuildingBaseScene } from "../components/BuildingBaseScene";
import { useGLTF } from "@react-three/drei";

export const AboutScene = () => {
  return <BuildingBaseScene modelPath="/models/AboutShed.glb" scale={0.5} />;
};

useGLTF.preload("/models/AboutShed.glb");
