import React, { useState, useEffect } from "react";
import { Mail, Linkedin } from "lucide-react";
import { useGameStore } from "../state/gameStore";
import { starters } from "../data/monsters";
import { buildings } from "../data/buildings";
import { Menu } from "./Menu";
import { GameConsole } from "./GameConsole";
import { LetterInterface } from "./LetterInterface";
import { BattleHUD } from "./BattleHUD";
import { BadgeNotification } from "./BadgeNotification";
import { ProjectsPuzzle } from "./ProjectsPuzzle";

export const UIOverlay = () => {
  const {
    scene,
    starter,
    activeBuildingId,
    setScene,
    progress,
    resetGame,
    interactionText,
    interactAction,
    dialog,
    setDialog,
    consoleOpen,
    setConsoleOpen,
    resetBattle,
    puzzleOpen,
    setPuzzleOpen,
  } = useGameStore();
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [battleTurn, setBattleTurn] = useState(0);

  // Close dialog on 'e', 'Space' or any key if needed? Maybe just explicit close.
  // The user had "(click to close)".

  const dialogueBox = dialog.open && (
    <div className="fixed bottom-10 left-0 right-0 z-[300] flex flex-col items-center pointer-events-none">
      <div
        onClick={() => {
          dialog.onClose?.();
          setDialog({ ...dialog, open: false });
        }}
        className="bg-black/70 backdrop-blur text-white p-6 rounded-xl border-4 border-white pixel-font text-center max-w-2xl w-full mx-4 pointer-events-auto cursor-pointer"
      >
        {dialog.title && (
          <h1 className="text-2xl mb-2 text-yellow-400 uppercase">
            {dialog.title}
          </h1>
        )}

        <div className="text-sm leading-relaxed">{dialog.body}</div>

        {dialog.onConfirm ? (
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => {
                dialog.onConfirm?.();
                setDialog({ open: false });
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-lg border-2 border-white uppercase tracking-wider transition-transform hover:scale-105 pointer-events-auto"
            >
              Yes
            </button>
            <button
              onClick={() => setDialog({ open: false })}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded-lg border-2 border-white uppercase tracking-wider transition-transform hover:scale-105 pointer-events-auto"
            >
              No
            </button>
          </div>
        ) : (
          <div className="opacity-50 text-[10px] mt-4 uppercase tracking-widest">
            (click or space to close)
          </div>
        )}
      </div>
    </div>
  );

  // Keyboard listener for interactions and closing dialogs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If dialog is open, close it with E or Space
      if (
        dialog.open &&
        (e.key === "e" || e.key === "E" || e.code === "Space")
      ) {
        dialog.onClose?.();
        setDialog({ ...dialog, open: false });
        return;
      }

      // Close console with Escape
      if (consoleOpen && e.key === "Escape") {
        setConsoleOpen(false);
        return;
      }

      // Close puzzle with Escape
      if (puzzleOpen && e.key === "Escape") {
        setPuzzleOpen(false);
        return;
      }

      // Otherwise trigger world interaction
      if (
        (e.key === "e" || e.key === "E" || e.code === "Space") &&
        interactAction
      ) {
        interactAction();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    interactAction,
    dialog.open,
    setDialog,
    consoleOpen,
    setConsoleOpen,
    puzzleOpen,
    setPuzzleOpen,
  ]);

  // --- GENERAL HUD (Interaction Prompt) ---
  const interactionPrompt = interactionText && (
    <div className="fixed bottom-24 left-0 right-0 z-50 flex justify-center pointer-events-none animate-bounce">
      <div className="bg-black/80 text-white px-6 py-3 rounded-full border-2 border-white pixel-font shadow-lg flex items-center gap-3">
        <span className="bg-white text-black w-6 h-6 rounded flex items-center justify-center font-bold text-xs">
          E
        </span>
        {interactionText}
      </div>
    </div>
  );

  // --- SCENE CONTENT ---
  let sceneContent = null;

  if (scene === "landing") {
    sceneContent = (
      <>
        {/* Radial Vignette Overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background:
              "radial-gradient(circle, transparent 40%, rgba(0,0,0,0.7) 100%)",
          }}
        />
        <div className="fixed bottom-10 left-0 right-0 z-10 flex flex-col items-center pointer-events-none">
          <div className="bg-black/70 backdrop-blur text-white p-6 rounded-xl border-4 border-white pixel-font text-center max-w-2xl w-full mx-4 pointer-events-auto">
            <h1 className="text-2xl mb-4 text-yellow-400">PORTFOLIO QUEST</h1>
            <p className="text-sm leading-relaxed">
              Welcome, traveler. <br />
              Click a sphere to choose your companion and begin the journey.
            </p>
          </div>
        </div>
      </>
    );
  } else if (
    scene === "home" ||
    scene === "about" ||
    scene === "projects" ||
    scene === "cv" ||
    scene === "skill"
  ) {
    sceneContent = (
      <>
        {interactionPrompt}
        <div className="fixed top-4 right-4 z-10">
          <Menu />
        </div>
        <div className="fixed bottom-4 left-4 z-10 text-white/50 text-xs pixel-font">
          WASD / Arrows to Move
        </div>
      </>
    );
  } else if (scene === "city") {
    sceneContent = (
      <>
        {interactionPrompt}
        <div className="fixed top-4 left-4 z-10 bg-black/50 p-2 rounded text-white pixel-font text-xs">
          Map: City Center
        </div>
        <div className="fixed top-4 right-4 z-10">
          <Menu />
        </div>
        <div className="fixed bottom-4 left-4 z-10 text-white/70 text-xs pixel-font">
          WASD to Move • Walk to buildings
        </div>
      </>
    );
  } else if (scene === "building") {
    const building = buildings.find((b) => b.id === activeBuildingId);
    if (building) {
      const isDefeated = progress.defeatedNPCs[building.id];
      sceneContent = (
        <div className="fixed inset-0 z-20 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white text-black w-full max-w-4xl h-[80vh] rounded-lg shadow-2xl flex flex-col overflow-hidden relative">
            {/* Header */}
            <div className="bg-gray-900 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold pixel-font">
                {building.content.title}
              </h2>
              <button
                onClick={() => setScene("city")}
                className="text-gray-400 hover:text-white"
              >
                ESC
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto font-sans">
              <p className="text-lg mb-6 leading-relaxed">
                {building.content.body}
              </p>
              <ul className="space-y-3">
                {building.content.items?.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center p-3 bg-gray-100 rounded"
                  >
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer / NPC Interaction */}
            <div className="bg-gray-100 p-6 border-t border-gray-300 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl`}
                  style={{ backgroundColor: building.color }}
                >
                  NPC
                </div>
                <div>
                  <p className="font-bold">{building.npcName}</p>
                  <p className="text-sm text-gray-600">
                    {isDefeated
                      ? "Impressed by your skills."
                      : "I challenge you to a duel!"}
                  </p>
                </div>
              </div>

              {!isDefeated ? (
                <button
                  onClick={() => {
                    resetBattle();
                    setScene("battle");
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded pixel-font shadow-lg transform transition hover:scale-105"
                >
                  BATTLE!
                </button>
              ) : (
                <div className="text-green-600 font-bold pixel-font">
                  DEFEATED
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  } else if (scene === "ending") {
    sceneContent = (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white p-8 text-center animate-fade-in">
        <h1 className="text-4xl text-yellow-400 pixel-font mb-8">
          You've reached the end
        </h1>
        <p className="max-w-xl text-lg mb-2 leading-relaxed">
          But the journey is just starting...
        </p>
        <p className="max-w-xl text-lg mb-8 leading-relaxed">
          Want to be a part of it?
        </p>
        <div className="bg-white/10 p-8 rounded-lg mb-8 backdrop-blur">
          <h2 className="text-xl font-bold mb-6">Feel free to contact me</h2>
          <div className="flex justify-center gap-8">
            <a
              href="https://mail.google.com/mail/?view=cm&to=caaddp@gmail.com"
              target="_blank"
              className="text-white hover:text-yellow-400 transition-colors transform hover:scale-110"
              title="Email me"
            >
              <Mail size={48} strokeWidth={1.5} />
            </a>
            <a
              href="https://www.linkedin.com/in/pedro-ddaa-costa/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-yellow-400 transition-colors transform hover:scale-110"
              title="LinkedIn Profile"
            >
              <Linkedin size={48} strokeWidth={1.5} />
            </a>
          </div>
        </div>
        <button
          onClick={resetGame}
          className="px-8 py-4 bg-white text-black pixel-font hover:scale-105 transition"
        >
          PLAY AGAIN
        </button>
      </div>
    );
  }

  return (
    <>
      {sceneContent}
      {dialogueBox}
      {consoleOpen && <GameConsole />}
      {scene === "battle" && <BattleHUD />}
      <LetterInterface />
      <BadgeNotification />
      <ProjectsPuzzle />
    </>
  );
};
