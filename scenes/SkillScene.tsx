/// <reference types="@react-three/fiber" />
import React from "react";
import { BuildingBaseScene } from "../components/BuildingBaseScene";
import { useGLTF } from "@react-three/drei";

export const SkillScene = () => {
  return <BuildingBaseScene modelPath="/models/GameHouse.glb" scale={0.5} />;
};

useGLTF.preload("/models/GameHouse.glb");
