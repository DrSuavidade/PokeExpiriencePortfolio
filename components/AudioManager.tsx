import React, { useEffect, useRef } from "react";
import { Howl, Howler } from "howler";
import { useGameStore } from "../state/gameStore";

const FADE_DURATION = 1000;
const VOLUME = 0.3;

const MUSIC_MAP: Record<string, string> = {
  intro: "/audio/intro.mp3",
  home: "/audio/cozy.mp3",
  about: "/audio/cozy.mp3",
  skill: "/audio/cozy.mp3",
  city: "/audio/city.mp3",
  landing: "/audio/city.mp3",
  cv: "/audio/lab.mp3",
  projects: "/audio/lab.mp3",
  battle: "/audio/battle.mp3",
  ending: "/audio/ending.mp3",
};

export const AudioManager = () => {
  const scene = useGameStore((s) => s.scene);
  const introDone = useGameStore((s) => s.introDone);
  const introStarted = useGameStore((s) => s.introStarted);

  const currentSoundRef = useRef<Howl | null>(null);
  const currentTrackNameRef = useRef<string | null>(null);

  useEffect(() => {
    Howler.volume(VOLUME);
  }, []);

  const targetTrack = React.useMemo(() => {
    if (!introStarted) return null;
    if (!introDone) return MUSIC_MAP.intro;
    if (scene === "ending") return MUSIC_MAP.ending;
    return MUSIC_MAP[scene] || MUSIC_MAP.city;
  }, [scene, introDone, introStarted]);

  useEffect(() => {
    if (!targetTrack && !currentTrackNameRef.current) return;
    if (currentTrackNameRef.current === targetTrack) return;

    // Fade out old track
    if (currentSoundRef.current) {
      const oldSound = currentSoundRef.current;
      oldSound.fade(VOLUME, 0, FADE_DURATION);
      setTimeout(() => {
        oldSound.stop();
        oldSound.unload();
      }, FADE_DURATION);
    }

    // Play new track
    if (targetTrack) {
      const newSound = new Howl({
        src: [targetTrack],
        // FIX: Don't loop 'intro' or 'ending'
        loop:
          targetTrack !== MUSIC_MAP.ending && targetTrack !== MUSIC_MAP.intro,
        volume: 0,
        html5: true,
      });

      newSound.play();
      newSound.fade(0, VOLUME, FADE_DURATION);

      currentSoundRef.current = newSound;
      currentTrackNameRef.current = targetTrack;
    }
  }, [targetTrack]);

  return null;
};

export const playSfx = (name: "click" | "success") => {
  const sfxMap = {
    click: "/audio/click.mp3",
    success: "/audio/success.mp3",
  };
  const sound = new Howl({ src: [sfxMap[name]], volume: 0.6 });
  sound.play();
};
