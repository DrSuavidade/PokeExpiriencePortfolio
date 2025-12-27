import React, { useEffect, useState, useCallback } from "react";
import { useGameStore } from "../state/gameStore";
import { starters } from "../data/monsters";
import { buildings } from "../data/buildings";

type MenuView = "main" | "pokemon" | "card" | "badges" | "map";

export const Menu = () => {
  const {
    toggleMenu,
    menuOpen,
    starter,
    progress,
    consoleOpen,
    dialog,
    letterOpen,
    setScene,
    enterBuilding,
  } = useGameStore();
  const [view, setView] = useState<MenuView>("main");
  const [hoveredIdx, setHoveredIdx] = useState(0);

  const myMonster = starters.find((s) => s.id === starter);
  const badgesCount = Object.values(progress.defeatedNPCs).filter(
    Boolean
  ).length;

  const iconMap: Record<string, string> = {
    slothie: "/images/icons/slothIcon.png",
    tigguin: "/images/icons/tiguinIcon.png",
    elcoon: "/images/icons/racoonIcon.png",
  };

  const cardBgMap: Record<string, string> = {
    slothie: "/images/icons/CardSloth.png",
    tigguin: "/images/icons/CardTinguin.png",
    elcoon: "/images/icons/CardRacoon.png",
  };

  const mainItems = [
    { label: "POKéMON", onClick: () => setView("pokemon") },
    { label: "TRAINER CARD", onClick: () => setView("card") },
    { label: "TOWN MAP", onClick: () => setView("map") },
    { label: "BADGES", onClick: () => setView("badges") },
    { label: "EXIT", onClick: () => toggleMenu(false) },
  ];

  const handleSelect = useCallback(() => {
    if (view === "main") {
      mainItems[hoveredIdx].onClick();
    }
  }, [view, hoveredIdx, mainItems]);

  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Priority: Console > Dialog > Letter
      if (consoleOpen || dialog.open || letterOpen) return;

      if (e.key === "Escape") {
        if (menuOpen && view !== "main") {
          setView("main");
          setHoveredIdx(0);
        } else {
          toggleMenu();
        }
        return;
      }

      if (!menuOpen) return;

      if (view === "main") {
        if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
          setHoveredIdx((prev) => (prev + 1) % mainItems.length);
        } else if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
          setHoveredIdx(
            (prev) => (prev - 1 + mainItems.length) % mainItems.length
          );
        } else if (e.key === "Enter" || e.key === " ") {
          handleSelect();
        }
      } else {
        // In subviews, return to main list with confirmation keys
        if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
          setView("main");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    menuOpen,
    view,
    toggleMenu,
    consoleOpen,
    dialog.open,
    letterOpen,
    handleSelect,
    mainItems,
  ]);

  // Reset when menu opens/closes
  useEffect(() => {
    if (!menuOpen) {
      setView("main");
      setHoveredIdx(0);
    }
  }, [menuOpen]);

  const renderContent = () => {
    switch (view) {
      case "pokemon":
        return (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b-2 border-[#78C850] pb-2">
              <span className="pixel-font text-xs text-[#78C850]">PARTY</span>
              <button
                onClick={() => setView("main")}
                className="pixel-font text-[10px] text-gray-400 hover:text-black"
              >
                BACK
              </button>
            </div>
            {myMonster ? (
              <div className="relative group/party">
                {/* Monster Icon Overlay */}
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-16 h-16 z-10 pointer-events-none drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)]">
                  <img
                    src={iconMap[myMonster.id]}
                    alt={myMonster.name}
                    className="w-full h-full object-contain pixelated"
                  />
                </div>

                <div className="flex flex-col gap-2 p-2 pl-10 bg-gray-50 rounded border-2 border-gray-200">
                  <div className="flex justify-between">
                    <span className="pixel-font text-xs font-bold">
                      {myMonster.name.toUpperCase()}
                    </span>
                    <span className="pixel-font text-[10px] text-blue-500">
                      Lv. 5
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-full"></div>
                  </div>
                  <div className="flex justify-between text-[8px] pixel-font">
                    <span>
                      HP: {myMonster.hp}/{myMonster.hp}
                    </span>
                    <span>{myMonster.type}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="pixel-font text-[10px] text-gray-500">
                NO POKéMON YET
              </p>
            )}
            <p className="text-[8px] pixel-font text-center opacity-50 mt-2">
              ESC to exit
            </p>
          </div>
        );
      case "card":
        return (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b-2 border-[#5080C8] pb-2">
              <span className="pixel-font text-xs text-[#5080C8]">
                TRAINER CARD
              </span>
              <button
                onClick={() => setView("main")}
                className="pixel-font text-[10px] text-gray-400 hover:text-black"
              >
                BACK
              </button>
            </div>
            <div
              className="aspect-[1.6/1] rounded-lg border-2 border-black p-3 flex flex-col justify-between shadow-inner relative overflow-hidden bg-cover bg-center"
              style={{
                backgroundColor: myMonster?.color || "#f8d030",
                backgroundImage: starter
                  ? `url(${cardBgMap[starter]})`
                  : `linear-gradient(135deg, ${
                      myMonster?.color || "#f8d030"
                    } 0%, rgba(255,255,255,0.2) 100%)`,
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="pixel-font text-[10px] text-white drop-shadow-md">
                    NAME: PEDRO DC
                  </span>
                  <span className="pixel-font text-[8px] text-white/80">
                    IDNo. 941226
                  </span>
                </div>
                <div className="w-8 h-8 bg-white/20 rounded-full border border-white/40 flex items-center justify-center">
                  <span className="pixel-font text-[10px] text-white">PC</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 border-t border-white/20 pt-2">
                <span className="pixel-font text-[8px] text-white/90">
                  MONEY: ¥999,999
                </span>
                <span className="pixel-font text-[8px] text-white/90">
                  MONSTERS: {myMonster ? 1 : 0}/3
                </span>
              </div>
            </div>
            <p className="text-[8px] pixel-font text-center opacity-50">
              ESC to exit
            </p>
          </div>
        );
      case "badges":
        return (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b-2 border-[#C85050] pb-2">
              <span className="pixel-font text-xs text-[#C85050]">BADGES</span>
              <button
                onClick={() => setView("main")}
                className="pixel-font text-[10px] text-gray-400 hover:text-black"
              >
                BACK
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 p-2">
              {["about", "projects", "cv", "skill"].map((id) => {
                const hasBadge = !!progress.defeatedNPCs[id];
                const building = buildings.find((b) => b.id === id);
                const color = building?.color || "#f8d030";

                return (
                  <div
                    key={id}
                    className={`aspect-square rounded-full border-2 flex flex-col items-center justify-center gap-1 transition-all duration-500 ${
                      hasBadge
                        ? "shadow-[0_0_15px_rgba(0,0,0,0.2)] scale-105"
                        : "bg-gray-100 border-gray-300 opacity-20 grayscale"
                    }`}
                    style={
                      hasBadge
                        ? {
                            backgroundColor: color,
                            borderColor: "white",
                            boxShadow: `0 0 10px ${color}80, inset 0 0 8px rgba(255,255,255,0.4)`,
                          }
                        : {}
                    }
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        hasBadge ? "bg-white/30" : "bg-gray-300"
                      }`}
                    >
                      {hasBadge && (
                        <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_5px_white]" />
                      )}
                    </div>
                    <span
                      className={`pixel-font text-[6px] uppercase font-bold ${
                        hasBadge ? "text-white drop-shadow-sm" : "text-gray-400"
                      }`}
                    >
                      {id}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="pixel-font text-[8px] text-center text-gray-400">
              {badgesCount}/4 COLLECTED
            </p>
          </div>
        );
      case "map":
        return (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center border-b-2 border-[#FFA500] pb-2">
              <span className="pixel-font text-xs text-[#FFA500]">
                TOWN MAP
              </span>
              <button
                onClick={() => setView("main")}
                className="pixel-font text-[10px] text-gray-400 hover:text-black"
              >
                BACK
              </button>
            </div>

            <div className="relative aspect-[16/9] w-full bg-[#1a1a1a] rounded border-2 border-black/20 overflow-hidden shadow-inner font-sans">
              <img
                src="/images/map/MapBase.png"
                className="w-full h-full object-cover opacity-90"
                alt="Map"
              />

              {/* Home / Room */}
              <div
                onClick={() => {
                  setScene("home");
                  toggleMenu(false);
                }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-125 z-10 group"
                style={{ top: "66%", left: "32%" }}
              >
                <img
                  src="/images/map/bed.png"
                  className="w-20 h-20 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] pixelated"
                />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600/90 text-[10px] text-white px-3 py-1 rounded-sm opacity-0 group-hover:opacity-100 whitespace-nowrap pixel-font uppercase shadow-xl transition-opacity border-2 border-white pointer-events-none">
                  TRAVEL
                </span>
              </div>

              {/* Projects */}
              <div
                onClick={() => {
                  enterBuilding("projects");
                  toggleMenu(false);
                }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-125 z-10 group"
                style={{ top: "75%", left: "77%" }}
              >
                <img
                  src="/images/map/projects.png"
                  className="w-20 h-20 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] pixelated"
                />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600/90 text-[10px] text-white px-3 py-1 rounded-sm opacity-0 group-hover:opacity-100 whitespace-nowrap pixel-font uppercase shadow-xl transition-opacity border-2 border-white pointer-events-none">
                  TRAVEL
                </span>
              </div>

              {/* CV */}
              <div
                onClick={() => {
                  enterBuilding("cv");
                  toggleMenu(false);
                }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-125 z-10 group"
                style={{ top: "22%", left: "33%" }}
              >
                <img
                  src="/images/map/cv.png"
                  className="w-20 h-20 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] pixelated"
                />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600/90 text-[10px] text-white px-3 py-1 rounded-sm opacity-0 group-hover:opacity-100 whitespace-nowrap pixel-font uppercase shadow-xl transition-opacity border-2 border-white pointer-events-none">
                  TRAVEL
                </span>
              </div>

              {/* About */}
              <div
                onClick={() => {
                  enterBuilding("about");
                  toggleMenu(false);
                }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-125 z-10 group"
                style={{ top: "66%", left: "48%" }}
              >
                <img
                  src="/images/map/about.png"
                  className="w-20 h-20 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] pixelated"
                />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600/90 text-[10px] text-white px-3 py-1 rounded-sm opacity-0 group-hover:opacity-100 whitespace-nowrap pixel-font uppercase shadow-xl transition-opacity border-2 border-white pointer-events-none">
                  TRAVEL
                </span>
              </div>

              {/* Skills / Game */}
              <div
                onClick={() => {
                  enterBuilding("skill");
                  toggleMenu(false);
                }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-125 z-10 group"
                style={{ top: "23%", left: "58%" }}
              >
                <img
                  src="/images/map/game.png"
                  className="w-20 h-20 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] pixelated"
                />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600/90 text-[10px] text-white px-3 py-1 rounded-sm opacity-0 group-hover:opacity-100 whitespace-nowrap pixel-font uppercase shadow-xl transition-opacity border-2 border-white pointer-events-none">
                  TRAVEL
                </span>
              </div>
            </div>

            <p className="text-[7px] pixel-font text-center opacity-70 uppercase leading-relaxed text-gray-500">
              Fly to any location instantly
            </p>
          </div>
        );
      case "main":
      default:
        return (
          <div className="flex flex-col gap-4">
            {mainItems.map((item, idx) => (
              <button
                key={item.label}
                onMouseEnter={() => setHoveredIdx(idx)}
                onClick={item.onClick}
                className="flex items-center gap-4 text-left group"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  {hoveredIdx === idx && (
                    <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[12px] border-l-[#505050]"></div>
                  )}
                </div>
                <span
                  className={`pixel-font text-base text-[#4a4a4a] group-hover:text-black transition-colors ${
                    hoveredIdx === idx ? "scale-105 transform origin-left" : ""
                  }`}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="relative pointer-events-auto">
      <button
        onClick={() => toggleMenu()}
        className="w-12 h-12 bg-white border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-105 active:scale-95 transition-transform"
      >
        <div className="space-y-1">
          <div className="w-6 h-1 bg-black"></div>
          <div className="w-6 h-1 bg-black"></div>
          <div className="w-6 h-1 bg-black"></div>
        </div>
      </button>

      {menuOpen && (
        <div
          className={`fixed z-[400] flex flex-col transition-all duration-500 ease-in-out ${
            view === "map"
              ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] max-w-6xl h-auto"
              : "right-4 top-1/2 -translate-y-1/2 w-80"
          }`}
        >
          {/* Pokemon Style Menu Box */}
          <div className="bg-white border-[6px] border-[#383838] p-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] rounded-sm relative overflow-hidden">
            {/* Decorative Green Inner Border like Emerald */}
            <div
              className={`border-[2px] p-4 flex flex-col gap-4 transition-colors duration-300 ${
                view === "pokemon"
                  ? "border-[#78C850]"
                  : view === "card"
                  ? "border-[#5080C8]"
                  : view === "badges"
                  ? "border-[#C85050]"
                  : view === "map"
                  ? "border-[#FFA500]"
                  : "border-[#78C850]"
              }`}
            >
              {renderContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
