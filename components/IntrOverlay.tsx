import React, { useEffect, useState } from "react";

export interface GameBoyIntroProps {
  onComplete?: () => void;
}

const GameBoyIntro: React.FC<GameBoyIntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0); // 0: Init, 1: Fly-in, 2: Color Consolidate + Subtext, 3: Fade out
  // True stagger control: how many non-space letters have been triggered
  const [activeCount, setActiveCount] = useState(0);

  const text = "PEDRO D COSTA";
  const letters = text.split("");
  const animatedLetters = text.replace(/\s/g, "").length;

  // --- Animation tuning ---
  const FLY_DURATION_S = 0.85;
  const STAGGER_S = 0.12;

  // GBA-ish rainbow palette
  const rainbowColors = [
    "#FF0055",
    "#FF9900",
    "#FFDD00",
    "#33FF00",
    "#0099FF",
    "#6633FF",
    "#CC00FF",
  ];

  useEffect(() => {
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
  }, [onComplete, animatedLetters, FLY_DURATION_S, STAGGER_S]);

  // If we reached later stages, make sure every letter is visible no matter what.
  useEffect(() => {
    if (stage >= 2) setActiveCount(animatedLetters);
  }, [stage, animatedLetters]);

  // ✅ TRUE stagger: activate 1 more character every STAGGER interval
  // ✅ TRUE stagger that never "sticks" on lag: uses rAF + time-based catch-up
  useEffect(() => {
    if (stage !== 1) return;

    const stepMs = Math.max(10, Math.round(STAGGER_S * 1000));
    const start = performance.now();

    let rafId = 0;

    const tick = (now: number) => {
      // 1 letter immediately, then +1 every stepMs, catching up after lag
      const elapsed = now - start;
      const shouldBe = Math.min(
        animatedLetters,
        1 + Math.floor(elapsed / stepMs)
      );

      setActiveCount((prev) => (prev < shouldBe ? shouldBe : prev));

      if (shouldBe < animatedLetters) {
        rafId = requestAnimationFrame(tick);
      }
    };

    // start
    setActiveCount(1);
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
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

          .gba-letter {
            display: inline-block;
            white-space: pre;
            will-change: transform, opacity, filter;
          }

          .gba-letter-space { width: 0.3em; }
        `}
      </style>

      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-700 ${
          stage === 3 ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="relative flex flex-col items-center justify-center w-full max-w-6xl px-4">
          <h1
            className="flex flex-wrap justify-center items-baseline text-5xl sm:text-7xl md:text-9xl tracking-tight leading-none mb-4 py-8"
            style={{ fontFamily: "'Future Bold', sans-serif" }}
          >
            {(() => {
              // assign a stable index only to non-space chars
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

                // vary arc a bit per letter
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

                      // keep not-yet-active letters hidden + off-screen
                      ...(stage >= 1 && !isSpace && !isActive
                        ? ({
                            transform:
                              "translate3d(var(--sx, 110vw), var(--sy, -30vh), 0) scale(2.6) rotate(-12deg)",
                            opacity: 0,
                            filter: "blur(2px)",
                          } as React.CSSProperties)
                        : {}),

                      // animate only when activated
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
