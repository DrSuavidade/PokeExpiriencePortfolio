import React from 'react';
import { useGameStore } from '../state/gameStore';
import { LandingScene } from '../scenes/LandingScene';
import { HomeRoomScene } from '../scenes/HomeRoomScene';
import { CityMapScene } from '../scenes/CityMapScene';
import { BuildingScene } from '../scenes/BuildingScene';
import { BattleScene } from '../scenes/BattleScene';

export const SceneManager = () => {
  const scene = useGameStore((state) => state.scene);

  switch (scene) {
    case "landing": return <LandingScene />;
    case "home": return <HomeRoomScene />;
    case "city": return <CityMapScene />;
    case "building": return <BuildingScene />;
    case "battle": return <BattleScene />;
    case "ending": return <LandingScene />; // Re-use landing for now or simple empty
    default: return <LandingScene />;
  }
};