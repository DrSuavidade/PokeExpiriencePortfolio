import React, { useEffect, useState, useMemo } from "react";
import { useGameStore } from "../state/gameStore";
import { buildings } from "../data/buildings";

export const BadgeNotification = () => {
  const notification = useGameStore((s) => s.badgeNotification);
  const [visible, setVisible] = useState(false);
  const [localDisplay, setLocalDisplay] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const badgeColor = useMemo(() => {
    if (!localDisplay) return "#eab308"; // Default gold
    const b = buildings.find((building) => building.id === localDisplay.id);
    return b?.color || "#eab308";
  }, [localDisplay]);

  useEffect(() => {
    if (notification) {
      setLocalDisplay(notification);
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!localDisplay) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        zIndex: 9999,
        pointerEvents: "none",
        transition: "all 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
        transform: visible ? "translateX(0)" : "translateX(-120%)",
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        className="pixel-font"
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
          color: "white",
          padding: "16px 24px",
          borderRadius: "8px",
          border: `2px solid ${badgeColor}`,
          boxShadow: `0 10px 25px rgba(0,0,0,0.5), inset 0 0 10px ${badgeColor}33`,
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
      >
        {/* Icon / Emblem Placeholder */}
        <div
          style={{
            width: "40px",
            height: "40px",
            background: badgeColor,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            boxShadow: `0 0 15px ${badgeColor}80`,
          }}
        >
          🏆
        </div>

        <div>
          <div
            style={{
              fontSize: "10px",
              color: badgeColor,
              marginBottom: "4px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Badge Earned!
          </div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            {localDisplay.name}
          </div>
        </div>
      </div>

      {/* Little shine effect */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
          animation: "shine 3s infinite",
          borderRadius: "8px",
        }}
      />

      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-15deg); }
          50% { transform: translateX(100%) skewX(-15deg); }
          100% { transform: translateX(100%) skewX(-15deg); }
        }
      `}</style>
    </div>
  );
};
