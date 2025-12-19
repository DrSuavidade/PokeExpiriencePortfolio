export type SceneId =
  | "landing"
  | "home"
  | "city"
  | "building"
  | "battle"
  | "ending";

export type StarterId = "emberfox" | "leafcub" | "aquafin";

export interface Monster {
  id: StarterId;
  name: string;
  type: "Fire" | "Grass" | "Water";
  description: string;
  color: string;
  hp: number;
  attack: number;
  defense: number;
  moves: string[];
}

export interface Building {
  id: string;
  label: string;
  position: [number, number, number];
  color: string;
  npcName: string;
  description: string;
  content: {
    title: string;
    body: string;
    items?: string[];
  };
}

export interface Progress {
  defeatedNPCs: Record<string, boolean>;
  unlockedSecret: boolean;
}