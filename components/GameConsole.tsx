import React, { useState } from "react";
import { useGameStore } from "../state/gameStore";

const games = [
  {
    id: "sempre_a_subir",
    title: "Sempre a Subir",
    description: "A never-ending parkour challenge.",
    image: "/images/games/v1.png",
    link: "https://oioi-rho.vercel.app/",
  },
  {
    id: "galactic_chess",
    title: "Galactic Chess",
    description: "A chess game set in space.",
    image: "/images/games/v2.png",
    link: "https://github.com/rodrigopina113/ChessGame",
  },
  {
    id: "another_game_with_lasers",
    title: "Game with Lasers",
    description: "A game where you control a laser-powered ship.",
    image: "/images/games/v3.png",
    link: "https://goiabastudios.itch.io/another-game-with-lasers-demo",
  },
];

export const GameConsole = () => {
  const [index, setIndex] = useState(0);
  const setConsoleOpen = useGameStore((s) => s.setConsoleOpen);
  const setDialog = useGameStore((s) => s.setDialog);

  const next = () => setIndex((i) => (i + 1) % games.length);
  const prev = () => setIndex((i) => (i - 1 + games.length) % games.length);

  const handleSelect = () => {
    const game = games[index];
    setDialog({
      open: true,
      title: `Play ${game.title}?`,
      body: `This will open "${game.title}" in a new tab. Ready for launch?`,
      onConfirm: () => {
        window.open(game.link, "_blank");
        setConsoleOpen(false);
      },
    });
  };

  // Skill Badge Timer (1 min)
  React.useEffect(() => {
    const awardBadge = useGameStore.getState().awardBadge;
    const timer = setTimeout(() => {
      awardBadge("skill");
    }, 60000); // 1 minute

    return () => clearTimeout(timer);
  }, []);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if dialog is already open
      const dialogOpen = useGameStore.getState().dialog.open;
      if (dialogOpen) return;

      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          prev();
          break;
        case "ArrowRight":
        case "d":
        case "D":
          next();
          break;
        case "Enter":
        case " ":
          handleSelect();
          break;
        case "Escape":
          setConsoleOpen(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, handleSelect]); // Re-bind when index changes to ensure handleSelect has right context

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md bg-black/40">
      {/* TV Frame */}
      <div className="relative w-full max-w-5xl aspect-video bg-[#1a1a1a] rounded-[2rem] border-[12px] border-[#333] shadow-2xl flex flex-col overflow-hidden scanlines animate-flicker">
        {/* Glow Effect */}
        <div className="absolute inset-0 z-0 bg-blue-500/5 mix-blend-screen" />

        {/* Close Button (X) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setConsoleOpen(false);
          }}
          className="absolute top-6 left-8 z-30 w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full border-4 border-white flex items-center justify-center font-bold pixel-font shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all hover:scale-110 active:scale-95"
          title="Close Console"
        >
          X
        </button>

        {/* Screen Content */}
        <div className="relative flex-1 flex flex-col items-center justify-center p-8 z-0">
          <div className="flex items-center justify-between w-full h-full gap-8">
            {/* Left BTN */}
            <button
              onClick={prev}
              className="p-4 bg-white/10 hover:bg-white/20 rounded-full text-white text-4xl pixel-font transition-transform active:scale-95"
            >
              &lt;
            </button>

            {/* Carousel Item */}
            <div
              className="flex-1 flex flex-col items-center animate-fade-in cursor-pointer group"
              key={games[index].id}
              onClick={handleSelect}
            >
              <div className="w-full max-w-md aspect-square rounded-lg overflow-hidden border-4 border-white/20 shadow-xl mb-6 transform group-hover:scale-105 transition-transform duration-500 relative">
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors z-10" />
                <img
                  src={games[index].image}
                  alt={games[index].title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-4xl text-yellow-400 pixel-font mb-2 uppercase tracking-tight group-hover:text-yellow-300 transition-colors">
                {games[index].title}
              </h2>
              <p className="text-white/70 text-center max-w-md text-sm leading-relaxed mb-8 font-sans uppercase tracking-widest">
                {games[index].description}
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect();
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-12 py-4 rounded-xl border-4 border-white pixel-font text-xl transition-all hover:scale-110 shadow-[0_0_20px_rgba(34,197,94,0.5)]"
              >
                SELECT GAME
              </button>
            </div>

            {/* Right BTN */}
            <button
              onClick={next}
              className="p-4 bg-white/10 hover:bg-white/20 rounded-full text-white text-4xl pixel-font transition-transform active:scale-95"
            >
              &gt;
            </button>
          </div>
        </div>

        {/* Console Details */}
        <div className="h-12 bg-[#222] border-t-4 border-[#333] flex items-center justify-between px-8 text-[#555] text-xs pixel-font italic">
          <span>NEO-GEO PORTOFOLIO STATION v1.0</span>
          <div className="flex gap-4">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <button
              onClick={() => setConsoleOpen(false)}
              className="hover:text-white transition-colors"
            >
              EXIT [ESC]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
