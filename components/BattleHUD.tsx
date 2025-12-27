import React, { useEffect } from "react";
import { useGameStore } from "../state/gameStore";
import { starters } from "../data/monsters";
import { buildings } from "../data/buildings";

export const BattleHUD = () => {
  const {
    starter: starterId,
    activeBuildingId: buildingId,
    battleState,
    updateBattle,
    markDefeated,
    setScene,
    setDialog,
  } = useGameStore();

  const myMonster = starters.find((s) => s.id === starterId);
  const enemyBuilding = buildings.find((b) => b.id === buildingId);

  const {
    playerHp,
    enemyHp,
    isTurn,
    message,
    isVictory,
    isBlocking,
    isMeditating,
    attackMultiplier,
  } = battleState;

  const triggerEnemyTurn = (
    playerWasBlocking: boolean,
    playerWasMeditating: boolean
  ) => {
    setTimeout(() => {
      if (battleState.isVictory) return;

      updateBattle({
        message: `${enemyBuilding?.label || "Guardian"} attacks!`,
      });

      let eDmg = 15 + Math.floor(Math.random() * 10);

      if (playerWasBlocking) {
        eDmg = 0;
        updateBattle({
          message: `${myMonster?.name || "Player"} BLOCKED the attack!`,
        });
      } else if (playerWasMeditating) {
        eDmg = Math.floor(eDmg / 2);
        updateBattle({
          message: `${
            myMonster?.name || "Player"
          } took half damage while meditating!`,
        });
      }

      setTimeout(() => {
        updateBattle({
          playerHp: Math.max(0, playerHp - eDmg),
          isTurn: true,
          isBlocking: false,
        });

        setTimeout(
          () =>
            updateBattle({
              message: `What will ${myMonster?.name || "Player"} do?`,
            }),
          1500
        );
      }, 1000);
    }, 1000);
  };

  const handleAttack = () => {
    if (!isTurn || isVictory) return;

    updateBattle({
      isTurn: false,
      isBlocking: false,
      message: `${myMonster?.name || "Player"} used TACKLE!${
        attackMultiplier > 1 ? " (POWERED UP)" : ""
      }`,
    });

    setTimeout(() => {
      let dmg = (25 + Math.floor(Math.random() * 15)) * attackMultiplier;
      const newEnemyHp = Math.max(0, enemyHp - dmg);

      updateBattle({
        enemyHp: newEnemyHp,
        attackMultiplier: 1,
        isMeditating: false,
      });

      if (newEnemyHp <= 0) {
        updateBattle({
          message: `The Guardian was defeated!`,
          isVictory: true,
        });
        setTimeout(() => triggerVictory(), 2000);
      } else {
        triggerEnemyTurn(false, false);
      }
    }, 500);
  };

  const handleBlock = () => {
    if (!isTurn || isVictory) return;
    updateBattle({
      isTurn: false,
      isBlocking: true,
      isMeditating: false,
      attackMultiplier: 1,
      message: `${myMonster?.name || "Player"} is bracing for impact!`,
    });
    triggerEnemyTurn(true, false);
  };

  const handleMeditate = () => {
    if (!isTurn || isVictory) return;
    updateBattle({
      isTurn: false,
      isBlocking: false,
      isMeditating: true,
      attackMultiplier: 2,
      message: `${
        myMonster?.name || "Player"
      } is meditating... strength is flowing!`,
    });
    triggerEnemyTurn(false, true);
  };

  const triggerVictory = () => {
    if (buildingId) markDefeated(buildingId);
    useGameStore.getState().setReturnWaypoint("waypointCv");
    setDialog({
      open: true,
      title: "VICTORY!",
      body: `You defeated the ${
        enemyBuilding?.label || "Guardian"
      } and earned your reward! Returning to the tower...`,
      onClose: () => {
        setScene(buildingId as any);
      },
    });
  };

  return (
    <div className="absolute inset-0 w-full h-full font-sans flex flex-col justify-between items-stretch p-12 select-none pointer-events-none z-50">
      {/* Top: Enemy Info */}
      <div className="self-start flex flex-col gap-2 bg-black/60 backdrop-blur-md border-2 border-white/20 p-4 rounded-xl shadow-2xl min-w-[280px] pointer-events-auto">
        <div className="flex justify-between items-end">
          <span className="pixel-font text-white text-lg uppercase tracking-wider">
            {enemyBuilding?.label || "GUARDIAN"}
          </span>
          <span className="pixel-font text-blue-400 text-xs">Lv. 10</span>
        </div>
        <div className="w-full h-3 bg-gray-800 rounded-full border border-white/20 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-green-500 transition-all duration-500"
            style={{ width: `${enemyHp}%` }}
          />
        </div>
        <div className="flex justify-end">
          <span className="pixel-font text-white/50 text-[10px]">
            HP: {enemyHp}/100
          </span>
        </div>
      </div>

      {/* Bottom Area */}
      <div className="flex flex-col gap-6">
        {/* Player Info (Floats Right) */}
        <div className="self-end flex flex-col gap-2 bg-black/60 backdrop-blur-md border-2 border-white/20 p-4 rounded-xl shadow-2xl min-w-[280px] pointer-events-auto">
          <div className="flex justify-between items-end">
            <span className="pixel-font text-white text-lg uppercase tracking-wider">
              {myMonster?.name || "PLAYER"}
            </span>
            <span className="pixel-font text-blue-400 text-xs">Lv. 5</span>
          </div>
          <div className="w-full h-3 bg-gray-800 rounded-full border border-white/20 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-green-500 transition-all duration-500"
              style={{ width: `${playerHp}%` }}
            />
          </div>
          <div className="flex justify-end">
            <span className="pixel-font text-white/50 text-[10px]">
              HP: {playerHp}/100
            </span>
          </div>
        </div>

        {/* Battle Menu / Textbox */}
        <div className="w-full bg-[#1a1a1a] border-4 border-[#444] rounded-lg p-6 flex items-center justify-between shadow-[0_0_50px_rgba(0,0,0,0.5)] pointer-events-auto">
          <div className="flex-1">
            <p className="pixel-font text-white text-xl leading-relaxed animate-pulse">
              {message}
            </p>
          </div>

          {!isVictory && (
            <div className="grid grid-cols-2 gap-4 min-w-[300px]">
              <button
                onClick={handleAttack}
                disabled={!isTurn}
                className={`p-4 border-4 border-white/10 rounded-sm pixel-font text-white transition-all transform hover:scale-105 active:scale-95 ${
                  isTurn
                    ? "bg-orange-600 hover:bg-orange-500 hover:border-white shadow-[0_0_15px_rgba(234,88,12,0.4)]"
                    : "bg-gray-800 opacity-50 cursor-not-allowed"
                }`}
              >
                TACKLE
              </button>
              <button
                onClick={handleBlock}
                disabled={!isTurn}
                className={`p-4 border-4 border-white/10 rounded-sm pixel-font text-white transition-all transform hover:scale-105 active:scale-95 ${
                  isTurn
                    ? "bg-blue-600 hover:bg-blue-500 hover:border-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    : "bg-gray-800 opacity-50 cursor-not-allowed"
                }`}
              >
                BLOCK
              </button>
              <button
                onClick={handleMeditate}
                disabled={!isTurn}
                className={`p-4 border-4 border-white/10 rounded-sm pixel-font text-white transition-all transform hover:scale-105 active:scale-95 ${
                  isTurn
                    ? "bg-purple-600 hover:bg-purple-500 hover:border-white shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                    : "bg-gray-800 opacity-50 cursor-not-allowed"
                }`}
              >
                MEDITATE
              </button>
              <button
                onClick={() => setScene(buildingId as any)}
                className="p-4 bg-red-600 hover:bg-red-500 border-4 border-white/10 hover:border-white rounded-sm pixel-font text-white transition-all transform hover:scale-105 active:scale-95"
              >
                RUN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
