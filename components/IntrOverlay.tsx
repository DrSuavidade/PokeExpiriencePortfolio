import React, { useState, useEffect } from "react";
import "./css/GameBoyIntro.css";

const GameBoyIntro = ({ onComplete }) => {
  const [showMainText, setShowMainText] = useState(false);
  const [showSubText, setShowSubText] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timeline = [
      { delay: 500, action: () => setShowMainText(true) },
      { delay: 2000, action: () => setShowSubText(true) },
      { delay: 3500, action: () => setShowFlash(true) },
      {
        delay: 4000,
        action: () => {
          setShowFlash(false);
          setShowLogo(true);
        },
      },
      {
        delay: 6000,
        action: () => {
          setIsComplete(true);
          onComplete?.();
        },
      },
    ];

    const timers = timeline.map(({ delay, action }) =>
      setTimeout(action, delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (isComplete) return null;

  return (
    <div className="gameboy-intro">
      <div className="gameboy-screen">
        {/* Initial text reveal */}
        <div className={`main-text-container ${showMainText ? "visible" : ""}`}>
          <div className="scanning-line"></div>
          <h1 className="main-text">Pedro D Costa</h1>
        </div>

        {/* Sub text */}
        <div className={`sub-text-container ${showSubText ? "visible" : ""}`}>
          <h2 className="sub-text">Portfolio</h2>
        </div>

        {/* Flash effect */}
        <div className={`flash-screen ${showFlash ? "active" : ""}`}></div>

        {/* Logo with bouncing ball */}
        <div className={`logo-container ${showLogo ? "visible" : ""}`}>
          <div className="logo-text">
            <span className="letter">P</span>
            <span className="letter">o</span>
            <span className="letter">r</span>
            <span className="letter">t</span>
            <span className="letter">f</span>
            <span className="letter">o</span>
            <span className="letter">l</span>
            <span className="letter">i</span>
            <span className="letter">o</span>
          </div>
          <div className="bouncing-ball"></div>
        </div>
      </div>
    </div>
  );
};

export default GameBoyIntro;
