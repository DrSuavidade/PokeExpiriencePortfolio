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
  introDone: boolean;
  setIntroDone: (done: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Dialog System
  dialog: {
    open: boolean;
    title?: string;
    body?: string;
  };
  // Return positioning
  returnWaypoint?: string;
  setReturnWaypoint: (wp: string | undefined) => void;

  setDialog: (dialog: { open: boolean; title?: string; body?: string }) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  scene: "landing",
  starter: undefined,
  activeBuildingId: undefined,
  menuOpen: false,
  progress: { defeatedNPCs: {}, unlockedSecret: false },

  interactionText: null,
  interactAction: null,
  introDone: false,
  setIntroDone: (done) => set({ introDone: done }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  dialog: { open: false },
  setDialog: (dialog) => set({ dialog }),

  returnWaypoint: undefined,
  setReturnWaypoint: (wp) => set({ returnWaypoint: wp }),

  setScene: (scene) => {
    set({ isLoading: true });
    setTimeout(() => {
      set({ scene, interactionText: null, interactAction: null });
      setTimeout(() => set({ isLoading: false }), 800);
    }, 600);
  },

  chooseStarter: (starter) => {
    set({ isLoading: true });
    setTimeout(() => {
      set({ starter, scene: "home" });
      setTimeout(() => set({ isLoading: false }), 800);
    }, 600);
  },

  enterBuilding: (buildingId) => {
    set({ isLoading: true });
    setTimeout(() => {
      set({ activeBuildingId: buildingId, scene: "building", interactionText: null, interactAction: null });
      setTimeout(() => set({ isLoading: false }), 800);
    }, 600);
  },

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

  resetGame: () => {
    set({ isLoading: true });
    setTimeout(() => {
      set({
        scene: "landing",
        starter: undefined,
        activeBuildingId: undefined,
        menuOpen: false,
        progress: { defeatedNPCs: {}, unlockedSecret: false },
        interactionText: null,
        interactAction: null
      });
      setTimeout(() => set({ isLoading: false }), 800);
    }, 600);
  }
}));