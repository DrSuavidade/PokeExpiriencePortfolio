import React, { Suspense } from "react";
import GameBoyIntro from "./components/IntrOverlay";
import LoadingOverlay from "./components/LoadingOverlay";
import { useGameStore } from "./state/gameStore";
import { AudioManager } from "./components/AudioManager";

// Lazy-load heavy stuff so Three.js/r3f isn't in the initial bundle
const SceneRoot = React.lazy(() =>
  import("./engine/SceneRoot").then((m) => ({ default: m.SceneRoot }))
);
const UIOverlay = React.lazy(() =>
  import("./components/UIOverlay").then((m) => ({ default: m.UIOverlay }))
);

export default function App() {
  const introDone = useGameStore((s) => s.introDone);
  const setIntroDone = useGameStore((s) => s.setIntroDone);
  const isLoading = useGameStore((s) => s.isLoading);

  return (
    <div className="h-screen w-screen overflow-hidden bg-black relative">
      <AudioManager />
      {!introDone && <GameBoyIntro onComplete={() => setIntroDone(true)} />}

      {/* Only show loader once intro is done */}
      {introDone && isLoading && <LoadingOverlay isVisible />}

      {/* Do NOT mount Canvas/UI until intro is done */}
      {introDone && (
        <Suspense fallback={<LoadingOverlay isVisible />}>
          <SceneRoot />
          <UIOverlay />
        </Suspense>
      )}
    </div>
  );
}
