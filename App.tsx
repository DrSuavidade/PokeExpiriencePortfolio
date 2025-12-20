import React from "react";
import { SceneRoot } from "./engine/SceneRoot";
import { UIOverlay } from "./components/UIOverlay";
import GameBoyIntro from "./components/IntrOverlay";
import { useGameStore } from "./state/gameStore";

export default function App() {
  const introDone = useGameStore((s) => s.introDone);
  const setIntroDone = useGameStore((s) => s.setIntroDone);

  return (
    <div className="h-screen w-screen overflow-hidden bg-black relative">
      {!introDone && <GameBoyIntro onComplete={() => setIntroDone(true)} />}
      <div style={{ visibility: introDone ? "visible" : "hidden" }}>
        <SceneRoot />
        <UIOverlay />
      </div>
    </div>
  );
}
