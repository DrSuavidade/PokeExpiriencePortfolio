import { Monster } from '../types';

export const starters: Monster[] = [
  {
    id: "leafcub",
    name: "Leafcub",
    type: "Grass",
    description: "A gentle plant creature that loves sunlight.",
    color: "#4ade80",
    hp: 45,
    attack: 49,
    defense: 49,
    moves: ["Vine Whip", "Tackle"]
  },
  {
    id: "emberfox",
    name: "Emberfox",
    type: "Fire",
    description: "A small fox with a fiery tail.",
    color: "#f87171",
    hp: 39,
    attack: 52,
    defense: 43,
    moves: ["Ember", "Scratch"]
  },
  {
    id: "aquafin",
    name: "Aquafin",
    type: "Water",
    description: "A playful water spirit.",
    color: "#60a5fa",
    hp: 44,
    attack: 48,
    defense: 65,
    moves: ["Water Gun", "Tail Whip"]
  }
];