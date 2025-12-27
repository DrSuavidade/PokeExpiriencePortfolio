import React, { useState, useEffect, useRef, useMemo } from "react";
import { useGameStore } from "../state/gameStore";

// Constants for the 4x4 inner board in a 6x6 grid
const GRID_SIZE = 6;
const BOARD_OFFSET = 1;
const INNER_SIZE = 4;
const TILE_SIZE = 80;
const GAP_SIZE = 4;
const PUZZLE_IMAGE_URL = "/images/tablet.png";

interface Position {
  x: number;
  y: number;
}

interface PuzzlePieceData {
  id: number;
  currentPosition: Position;
  solvedPosition: Position;
  rotation: number;
  isPlaced: boolean;
}

const isInnerBoard = (pos: Position): boolean => {
  return (
    pos.x >= BOARD_OFFSET &&
    pos.x < BOARD_OFFSET + INNER_SIZE &&
    pos.y >= BOARD_OFFSET &&
    pos.y < BOARD_OFFSET + INNER_SIZE
  );
};

const generateShuffledPuzzle = (): PuzzlePieceData[] => {
  const pieces: PuzzlePieceData[] = [];
  const borderSlots: Position[] = [];

  for (let x = 0; x < GRID_SIZE; x++) {
    borderSlots.push({ x, y: 0 });
    borderSlots.push({ x, y: GRID_SIZE - 1 });
  }
  for (let y = 1; y < GRID_SIZE - 1; y++) {
    borderSlots.push({ x: 0, y });
    borderSlots.push({ x: GRID_SIZE - 1, y });
  }

  borderSlots.sort(() => Math.random() - 0.5);

  let id = 0;
  for (let y = 0; y < INNER_SIZE; y++) {
    for (let x = 0; x < INNER_SIZE; x++) {
      const slot = borderSlots[id];
      pieces.push({
        id: id++,
        currentPosition: slot,
        solvedPosition: { x, y },
        rotation: Math.floor(Math.random() * 4) * 90,
        isPlaced: false,
      });
    }
  }
  return pieces;
};

const PuzzlePiece: React.FC<{
  piece: PuzzlePieceData;
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  style?: React.CSSProperties;
}> = ({ piece, isDragging, onPointerDown, style }) => {
  const bgX = -(piece.solvedPosition.x * TILE_SIZE);
  const bgY = -(piece.solvedPosition.y * TILE_SIZE);

  return (
    <div
      onPointerDown={onPointerDown}
      className={`absolute cursor-pointer select-none transition-transform duration-100 ${
        isDragging ? "z-50 scale-110" : "z-10 hover:brightness-125"
      }`}
      style={{
        ...style,
        width: TILE_SIZE,
        height: TILE_SIZE,
        backgroundImage: `url(${PUZZLE_IMAGE_URL})`,
        backgroundSize: `${TILE_SIZE * 4}px ${TILE_SIZE * 4}px`,
        backgroundPosition: `${bgX}px ${bgY}px`,
        transform: `rotate(${piece.rotation}deg) scale(${
          isDragging ? 1.1 : 1
        })`,
        filter: isDragging
          ? "brightness(1.5) contrast(1.2) hue-rotate(180deg) saturate(1.5) drop-shadow(0 0 15px cyan)"
          : "brightness(1.1) contrast(1.2) hue-rotate(180deg) saturate(0.8)",
        border: "1px solid rgba(0, 243, 255, 0.6)",
        boxShadow: isDragging
          ? "0 0 20px rgba(0, 243, 255, 0.8), inset 0 0 10px rgba(0, 243, 255, 0.4)"
          : "inset 0 0 5px rgba(0, 243, 255, 0.1)",
        borderRadius: "4px",
        touchAction: "none",
        opacity: isDragging ? 0.95 : 0.85,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 243, 255, 0.2) 3px)`,
        }}
      />
    </div>
  );
};

export const ProjectsPuzzle: React.FC = () => {
  const { awardBadge, setPuzzleOpen, puzzleOpen } = useGameStore();
  const [pieces, setPieces] = useState<PuzzlePieceData[]>([]);
  const [draggedPieceId, setDraggedPieceId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isWon, setIsWon] = useState(false);

  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!puzzleOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;

      // Consume this ESC so the global "open menu" handler doesn't run.
      e.preventDefault();
      e.stopPropagation();
      (e as any).stopImmediatePropagation?.();

      setPuzzleOpen(false);
    };

    // Capture phase so we run before other listeners
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [puzzleOpen, setPuzzleOpen]);

  useEffect(() => {
    if (puzzleOpen) {
      setPieces(generateShuffledPuzzle());
      setIsWon(false);
    }
  }, [puzzleOpen]);

  const handlePointerDown = (e: React.PointerEvent, pieceId: number) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    setDraggedPieceId(pieceId);
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragPosition({
      x: e.clientX - (e.clientX - rect.left),
      y: e.clientY - (e.clientY - rect.top),
    });
    target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggedPieceId === null) return;
    setDragPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggedPieceId === null) return;
    const target = e.target as HTMLElement;
    target.releasePointerCapture(e.pointerId);

    if (boardRef.current) {
      const boardRect = boardRef.current.getBoundingClientRect();
      const pieceCenterX = e.clientX - dragOffset.x + TILE_SIZE / 2;
      const pieceCenterY = e.clientY - dragOffset.y + TILE_SIZE / 2;

      const relativeX = pieceCenterX - boardRect.left;
      const relativeY = pieceCenterY - boardRect.top;

      const gridX = Math.floor(relativeX / (TILE_SIZE + GAP_SIZE));
      const gridY = Math.floor(relativeY / (TILE_SIZE + GAP_SIZE));

      const piece = pieces.find((p) => p.id === draggedPieceId);
      if (piece) {
        const validX = Math.max(0, Math.min(gridX, GRID_SIZE - 1));
        const validY = Math.max(0, Math.min(gridY, GRID_SIZE - 1));

        if (
          validX === piece.currentPosition.x &&
          validY === piece.currentPosition.y
        ) {
          // Rotate
          setPieces((prev) =>
            prev.map((p) =>
              p.id === draggedPieceId
                ? { ...p, rotation: (p.rotation + 90) % 360 }
                : p
            )
          );
        } else {
          // Move or Swap
          setPieces((prev) => {
            const occupiedBy = prev.find(
              (p) =>
                p.id !== draggedPieceId &&
                p.currentPosition.x === validX &&
                p.currentPosition.y === validY
            );
            return prev.map((p) => {
              if (p.id === draggedPieceId)
                return {
                  ...p,
                  currentPosition: { x: validX, y: validY },
                  isPlaced: isInnerBoard({ x: validX, y: validY }),
                };
              if (occupiedBy && p.id === occupiedBy.id)
                return {
                  ...p,
                  currentPosition: piece.currentPosition,
                  isPlaced: isInnerBoard(piece.currentPosition),
                };
              return p;
            });
          });
        }
      }
    }

    setDraggedPieceId(null);
    setDragPosition(null);
  };

  useEffect(() => {
    if (pieces.length === 0) return;
    const allCorrect = pieces.every(
      (p) =>
        p.isPlaced &&
        p.rotation === 0 &&
        p.currentPosition.x === p.solvedPosition.x + BOARD_OFFSET &&
        p.currentPosition.y === p.solvedPosition.y + BOARD_OFFSET
    );
    if (allCorrect) {
      setIsWon(true);
      setTimeout(() => {
        awardBadge("projects");
        setPuzzleOpen(false);
      }, 2500);
    }
  }, [pieces, awardBadge, setPuzzleOpen]);

  if (!puzzleOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#02040a]/90 backdrop-blur-md p-4 select-none touch-none overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <button
        onClick={() => setPuzzleOpen(false)}
        className="absolute top-8 right-8 text-[#00f3ff] pixel-font hover:text-white transition-colors z-20"
      >
        CLOSE [ESC]
      </button>

      <div className="relative z-10 mb-8 text-center space-y-2">
        <h1 className="text-3xl md:text-5xl text-[#00f3ff] tracking-widest uppercase drop-shadow-[0_0_15px_rgba(0,243,255,0.5)] font-black">
          PROJECTS ARCHIVE
        </h1>
        <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-[#00f3ff]/70 font-mono">
          <span className="animate-pulse">●</span>
          <span>SYSTEM INTEGRITY: {isWon ? "DECRYPTED" : "ENCRYPTED"}</span>
        </div>
      </div>

      <div className="relative p-6 rounded-xl border border-[#00f3ff]/30 bg-[#051020]/80 shadow-[0_0_50px_rgba(0,243,255,0.2)]">
        <div
          ref={boardRef}
          className="relative"
          style={{
            width: GRID_SIZE * (TILE_SIZE + GAP_SIZE),
            height: GRID_SIZE * (TILE_SIZE + GAP_SIZE),
          }}
        >
          {/* Grid implementation */}
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isInner = isInnerBoard({ x, y });
            return (
              <div
                key={`slot-${x}-${y}`}
                className="absolute"
                style={{
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  left: x * (TILE_SIZE + GAP_SIZE),
                  top: y * (TILE_SIZE + GAP_SIZE),
                  backgroundColor: isInner
                    ? "rgba(0, 243, 255, 0.05)"
                    : "rgba(255, 255, 255, 0.02)",
                  border: isInner
                    ? "1px solid rgba(0, 243, 255, 0.2)"
                    : "1px dashed rgba(0, 243, 255, 0.1)",
                  borderRadius: "4px",
                }}
              />
            );
          })}

          {pieces.map((piece) => {
            const isDragging = draggedPieceId === piece.id;
            const stylePosition =
              isDragging && dragPosition
                ? {
                    left:
                      dragPosition.x -
                      (boardRef.current?.getBoundingClientRect().left || 0),
                    top:
                      dragPosition.y -
                      (boardRef.current?.getBoundingClientRect().top || 0),
                  }
                : {
                    left: piece.currentPosition.x * (TILE_SIZE + GAP_SIZE),
                    top: piece.currentPosition.y * (TILE_SIZE + GAP_SIZE),
                  };
            return (
              <PuzzlePiece
                key={piece.id}
                piece={piece}
                isDragging={isDragging}
                onPointerDown={(e) => handlePointerDown(e, piece.id)}
                style={stylePosition}
              />
            );
          })}
        </div>
      </div>

      {isWon && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50 bg-[#00f3ff]/10">
          <div className="text-center">
            <div className="text-6xl md:text-8xl text-[#00f3ff] font-black drop-shadow-[0_0_25px_#00f3ff] animate-pulse">
              FILES DECRYPTED
            </div>
            <div className="text-[#00f3ff] tracking-[1em] text-sm mt-4 font-bold">
              PROJECTS BADGE EARNED!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
