import React from "react";
import { useGameStore } from "../state/gameStore";
import { LandingScene } from "../scenes/LandingScene";
import { HomeRoomScene } from "../scenes/HomeRoomScene";
import { CityMapScene } from "../scenes/CityMapScene";
import { BuildingScene } from "../scenes/BuildingScene";
import { BattleScene } from "../scenes/BattleScene";
import { AboutScene } from "../scenes/AboutScene";
import { ProjectsScene } from "../scenes/ProjectsScene";
import { CvScene } from "../scenes/CvScene";
import { SkillScene } from "../scenes/SkillScene";

export const SceneManager = () => {
  const scene = useGameStore((state) => state.scene);

  switch (scene) {
    case "landing":
      return <LandingScene />;
    case "home":
      return <HomeRoomScene />;
    case "city":
      return <CityMapScene />;
    case "building":
      return <BuildingScene />;
    case "battle":
      return <BattleScene />;
    case "about":
      return <AboutScene />;
    case "projects":
      return <ProjectsScene />;
    case "cv":
      return <CvScene />;
    case "skill":
      return <SkillScene />;
    case "ending":
      return <LandingScene />; // Re-use landing for now or simple empty
    default:
      return <LandingScene />;
  }
};
