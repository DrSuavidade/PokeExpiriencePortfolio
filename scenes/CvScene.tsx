/// <reference types="@react-three/fiber" />
import React from "react";
import { BuildingBaseScene } from "../components/BuildingBaseScene";
import { useGLTF } from "@react-three/drei";

export const CvScene = () => {
  return <BuildingBaseScene modelPath="/models/CvTrial.glb" scale={0.5} />;
};

useGLTF.preload("/models/CvTrial.glb");
