import React from "react";
import { useGameStore } from "../state/gameStore";
import type { SceneId } from "../types";

// Helper: lazy-load named exports as default components
function lazyNamed<T extends React.ComponentType<any>>(
  loader: () => Promise<any>,
  exportName: string
) {
  return React.lazy(async () => {
    const mod = await loader();
    return { default: mod[exportName] as T };
  });
}

const LandingScene = lazyNamed(
  () => import("../scenes/LandingScene"),
  "LandingScene"
);
const HomeRoomScene = lazyNamed(
  () => import("../scenes/HomeRoomScene"),
  "HomeRoomScene"
);
const CityMapScene = lazyNamed(
  () => import("../scenes/CityMapScene"),
  "CityMapScene"
);
const BuildingScene = lazyNamed(
  () => import("../scenes/BuildingScene"),
  "BuildingScene"
);
const BattleScene = lazyNamed(
  () => import("../scenes/BattleScene"),
  "BattleScene"
);
const AboutScene = lazyNamed(
  () => import("../scenes/AboutScene"),
  "AboutScene"
);
const ProjectsScene = lazyNamed(
  () => import("../scenes/ProjectsScene"),
  "ProjectsScene"
);
const CvScene = lazyNamed(() => import("../scenes/CvScene"), "CvScene");
const SkillScene = lazyNamed(
  () => import("../scenes/SkillScene"),
  "SkillScene"
);

const sceneMap: Record<
  SceneId,
  React.LazyExoticComponent<React.ComponentType<any>>
> = {
  landing: LandingScene,
  home: HomeRoomScene,
  city: CityMapScene,
  building: BuildingScene,
  battle: BattleScene,
  about: AboutScene,
  projects: ProjectsScene,
  cv: CvScene,
  skill: SkillScene,
  ending: LandingScene,
};

export const SceneManager = () => {
  const scene = useGameStore((state) => state.scene);
  const Scene = sceneMap[scene] ?? LandingScene;
  return <Scene />;
};
