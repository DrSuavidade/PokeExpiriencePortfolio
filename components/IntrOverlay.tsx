import React, { useEffect, useState } from "react";
// Import Howler to unlock audio context on click
import { Howler } from "howler";
import { useGameStore } from "../state/gameStore";

export interface GameBoyIntroProps {
  onComplete?: () => void;
}

const GameBoyIntro: React.FC<GameBoyIntroProps> = ({ onComplete }) => {
  // NEW: Wait for user interaction
  const introStarted = useGameStore((s) => s.introStarted);
  const setIntroStarted = useGameStore((s) => s.setIntroStarted);

  const [stage, setStage] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  const text = "PEDRO D COSTA";
  const letters = text.split("");
  const animatedLetters = text.replace(/\s/g, "").length;

  const FLY_DURATION_S = 0.85;
  const STAGGER_S = 0.12;

  const rainbowColors = [
    "#FF0055",
    "#FF9900",
    "#FFDD00",
    "#33FF00",
    "#0099FF",
    "#6633FF",
    "#CC00FF",
  ];

  // --- NEW: Handle Start Click ---
  const handleStart = () => {
    // 1. Unlock Audio Engine manually (Fixes silent audio)
    if (Howler.ctx && Howler.ctx.state === "suspended") {
      Howler.ctx.resume();
    }
    // 2. Start Animation
    setIntroStarted(true);
  };

  useEffect(() => {
    // NEW: Don't run sequence until started
    if (!introStarted) return;

    const sequence = async () => {
      await new Promise((r) => setTimeout(r, 100));
      setStage(1);

      const totalFlyMs = Math.round(
        (Math.max(animatedLetters - 1, 0) * STAGGER_S + FLY_DURATION_S) * 1000 +
          160
      );
      await new Promise((r) => setTimeout(r, totalFlyMs));
      setStage(2);

      await new Promise((r) => setTimeout(r, 2000));
      setStage(3);

      await new Promise((r) => setTimeout(r, 800));
      onComplete?.();
    };

    sequence();
  }, [onComplete, animatedLetters, FLY_DURATION_S, STAGGER_S, introStarted]);

  useEffect(() => {
    if (stage >= 2) setActiveCount(animatedLetters);
  }, [stage, animatedLetters]);

  useEffect(() => {
    if (stage !== 1) return;

    const stepMs = Math.max(10, Math.round(STAGGER_S * 1000));
    const start = performance.now();

    let timeoutId: number | null = null;
    let last = 0;

    const tick = () => {
      const now = performance.now();
      const shouldBe = Math.min(
        animatedLetters,
        1 + Math.floor((now - start) / stepMs)
      );

      if (shouldBe !== last) {
        last = shouldBe;
        setActiveCount(shouldBe);
      }

      if (last < animatedLetters) {
        const nextBoundary = start + last * stepMs;
        const delay = Math.max(0, nextBoundary - now);
        timeoutId = window.setTimeout(tick, delay);
      }
    };

    last = 1;
    setActiveCount(1);
    timeoutId = window.setTimeout(tick, stepMs);

    return () => {
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, [stage, animatedLetters, STAGGER_S]);

  return (
    <>
      <style>
        {`
          @keyframes gbaArcIn {
            0% {
              transform: translate3d(var(--sx, 110vw), var(--sy, -30vh), 0) scale(2.6) rotate(-12deg);
              opacity: 0;
              filter: blur(2px);
            }
            35% { opacity: 1; }
            60% {
              transform: translate3d(var(--mx, 10vw), var(--my, 10vh), 0) scale(1.14) rotate(4deg);
              filter: blur(0px);
            }
            82% { transform: translate3d(-10px, 6px, 0) scale(1.02) rotate(0deg); }
            100% {
              transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
              opacity: 1;
              filter: blur(0px);
            }
          }
          .gba-letter { display: inline-block; white-space: pre; will-change: transform, opacity, filter; }
          .gba-letter-space { width: 0.3em; }
          .blink { animation: blinker 1s linear infinite; }
          @keyframes blinker { 50% { opacity: 0; } }
        `}
      </style>

      {/* --- NEW: Start Screen Overlay --- */}
      {!introStarted && (
        <div
          onClick={handleStart}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black cursor-pointer"
        >
          <div className="text-center">
            <h1 className="text-white pixel-font text-2xl mb-4 text-yellow-400">
              PORTFOLIO QUEST
            </h1>
            <p className="text-white/50 pixel-font text-xs blink">
              CLICK TO START
            </p>
          </div>
        </div>
      )}

      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-700 ${
          stage === 3 ? "opacity-0" : "opacity-100"
        }`}
        style={{ pointerEvents: introStarted ? "auto" : "none" }} // Prevent interaction behind start screen
      >
        <div className="relative flex flex-col items-center justify-center w-full max-w-6xl px-4">
          <h1
            className="flex flex-wrap justify-center items-baseline text-5xl sm:text-7xl md:text-9xl tracking-tight leading-none mb-4 py-8"
            style={{ fontFamily: "'League Spartan', sans-serif" }}
          >
            {(() => {
              let nonSpace = 0;
              const items = letters.map((char, index) => {
                const animIndex = char === " " ? null : nonSpace++;
                return { char, index, animIndex };
              });
              const totalAnimated = Math.max(nonSpace, 1);

              return items.map(({ char, index, animIndex }) => {
                const isSpace = char === " ";
                const isActive =
                  !isSpace && animIndex != null && animIndex < activeCount;

                const t =
                  isSpace || animIndex == null
                    ? 0
                    : animIndex / Math.max(totalAnimated - 1, 1);
                const phase = t * Math.PI;

                const startX = "115vw";
                const startY = `${-34 + Math.sin(phase) * -10}vh`;
                const midX = `${14 + Math.cos(phase) * 6}vw`;
                const midY = `${10 + Math.sin(phase) * 14}vh`;

                const initialColor =
                  rainbowColors[index % rainbowColors.length];
                const finalColor = "#312e81";

                return (
                  <span
                    key={index}
                    className={`gba-letter ${
                      isSpace ? "gba-letter-space" : ""
                    }`}
                    style={{
                      color: stage >= 2 ? finalColor : initialColor,
                      ...(stage >= 1 && !isSpace && !isActive
                        ? ({
                            transform:
                              "translate3d(var(--sx, 110vw), var(--sy, -30vh), 0) scale(2.6) rotate(-12deg)",
                            opacity: 0,
                            filter: "blur(2px)",
                          } as React.CSSProperties)
                        : {}),
                      animation:
                        !isSpace && stage >= 1 && isActive
                          ? `gbaArcIn ${FLY_DURATION_S}s cubic-bezier(0.16, 0.84, 0.32, 1.12) both`
                          : "none",
                      transition: "color 0.8s ease-out",
                      textShadow:
                        stage >= 2
                          ? "2px 4px 0px rgba(0,0,0,0.1)"
                          : "4px 8px 0px rgba(0,0,0,0.05)",
                      ...(isSpace
                        ? {}
                        : ({
                            "--sx": startX,
                            "--sy": startY,
                            "--mx": midX,
                            "--my": midY,
                          } as React.CSSProperties)),
                    }}
                  >
                    {char}
                  </span>
                );
              });
            })()}
          </h1>

          <div
            className={`transition-all duration-500 ease-out transform ${
              stage >= 2
                ? "translate-y-0 opacity-100"
                : "-translate-y-4 opacity-0"
            }`}
          >
            <div className="flex items-center justify-center mt-2">
              <span
                className="px-4 py-1 text-sm sm:text-lg md:text-xl font-bold tracking-[0.3em] text-indigo-900/60 uppercase"
                style={{ fontFamily: "'Pretendo', sans-serif" }}
              >
                Portfolio
              </span>
            </div>
          </div>
        </div>

        <div
          className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-500 ${
            stage === 2 ? "opacity-40" : "opacity-0"
          }`}
        />
      </div>
    </>
  );
};

export default GameBoyIntro;
