import { create } from "zustand";
import { SceneId, StarterId, Progress } from "../types";

interface GameState {
  scene: SceneId;
  previousScene: SceneId | null;
  starter?: StarterId;
  activeBuildingId?: string;
  menuOpen: boolean;
  progress: Progress;
  battleState: {
    playerHp: number;
    enemyHp: number;
    isTurn: boolean;
    message: string;
    isVictory: boolean;
    isBlocking: boolean;
    isMeditating: boolean;
    attackMultiplier: number;
    lastAction: "player-attack" | "enemy-attack" | null;
  };

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
    onConfirm?: () => void;
    onClose?: () => void;
  };
  returnWaypoint?: string;
  setReturnWaypoint: (wp: string | undefined) => void;
  consoleOpen: boolean;
  setConsoleOpen: (open: boolean) => void;

  setDialog: (dialog: {
    open: boolean;
    title?: string;
    body?: string;
    onConfirm?: () => void;
    onClose?: () => void;
  }) => void;
  letterOpen: boolean;
  setLetterOpen: (open: boolean) => void;
  // Battle Actions
  updateBattle: (update: Partial<GameState["battleState"]>) => void;
  resetBattle: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  scene: "landing",
  previousScene: null,
  starter: undefined,
  activeBuildingId: undefined,
  menuOpen: false,
  progress: { defeatedNPCs: {}, unlockedSecret: false },
  battleState: {
    playerHp: 100,
    enemyHp: 100,
    isTurn: true,
    message: "A wild Guardian appears!",
    isVictory: false,
    isBlocking: false,
    isMeditating: false,
    attackMultiplier: 1,
    lastAction: null,
  },

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
  consoleOpen: false,
  setConsoleOpen: (open) => set({ consoleOpen: open }),
  letterOpen: false,
  setLetterOpen: (open) => set({ letterOpen: open }),

  setScene: (scene) => {
    const { scene: currentScene } = get();
    set({ isLoading: true });
    setTimeout(() => {
      set({
        scene,
        previousScene: currentScene,
        interactionText: null,
        interactAction: null
      });
      setTimeout(() => set({ isLoading: false }), 800);
    }, 600);
  },

  chooseStarter: (starter) => {
    const { scene: currentScene } = get();
    set({ isLoading: true });
    setTimeout(() => {
      set({ starter, scene: "home", previousScene: currentScene });
      setTimeout(() => set({ isLoading: false }), 800);
    }, 600);
  },

  enterBuilding: (buildingId) => {
    const { scene: currentScene } = get();
    set({ isLoading: true });
    setTimeout(() => {
      set({
        activeBuildingId: buildingId,
        scene: buildingId as SceneId,
        previousScene: currentScene,
        interactionText: null,
        interactAction: null
      });
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

  updateBattle: (update) => set((s) => ({ battleState: { ...s.battleState, ...update } })),
  resetBattle: () => set({
    battleState: {
      playerHp: 100,
      enemyHp: 100,
      isTurn: true,
      message: "A wild Guardian appears!",
      isVictory: false,
      isBlocking: false,
      isMeditating: false,
      attackMultiplier: 1,
      lastAction: null,
    }
  }),

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