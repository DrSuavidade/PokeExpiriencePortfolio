import { create } from "zustand";
import { SceneId, StarterId, Progress } from "../types";

interface GameState {
  scene: SceneId;
  starter?: StarterId;
  activeBuildingId?: string;
  menuOpen: boolean;
  progress: Progress;
  
  // Interaction System
  interactionText: string | null;
  interactAction: (() => void) | null;

  // Actions
  setScene: (scene: SceneId) => void;
  chooseStarter: (starter: StarterId) => void;
  enterBuilding: (buildingId: string) => void;
  markDefeated: (buildingId: string) => void;
  toggleMenu: (open?: boolean) => void;
  setInteraction: (text: string | null, action: (() => void) | null) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  scene: "landing",
  starter: undefined,
  activeBuildingId: undefined,
  menuOpen: false,
  progress: { defeatedNPCs: {}, unlockedSecret: false },
  
  interactionText: null,
  interactAction: null,

  setScene: (scene) => set({ scene, interactionText: null, interactAction: null }),
  
  chooseStarter: (starter) => set({ starter, scene: "home" }),
  
  enterBuilding: (buildingId) => set({ activeBuildingId: buildingId, scene: "building", interactionText: null, interactAction: null }),
  
  markDefeated: (buildingId) => {
    const { progress } = get();
    const newDefeated = { ...progress.defeatedNPCs, [buildingId]: true };
    const defeatedCount = Object.values(newDefeated).filter(Boolean).length;
    // Example: unlock secret after 3 buildings
    const unlockedSecret = defeatedCount >= 3; 
    
    set({ 
      progress: { 
        defeatedNPCs: newDefeated, 
        unlockedSecret 
      } 
    });
  },
  
  toggleMenu: (open) => set((state) => ({ menuOpen: open ?? !state.menuOpen })),
  
  setInteraction: (text, action) => set({ interactionText: text, interactAction: action }),
  
  resetGame: () => set({
    scene: "landing",
    starter: undefined,
    activeBuildingId: undefined,
    menuOpen: false,
    progress: { defeatedNPCs: {}, unlockedSecret: false },
    interactionText: null,
    interactAction: null
  })
}));