import { Monster } from '../types';

export const starters: Monster[] = [
  {
    id: "slothie",
    name: "Slothie",
    type: "Grass",
    description: "A gentle plant creature that loves sunlight.",
    color: "#dcd481",
    hp: 45,
    attack: 49,
    defense: 49,
    moves: ["Vine Whip", "Tackle"]
  },
  {
    id: "tigguin",
    name: "Tigguin",
    type: "Fire",
    description: "A small fox with a fiery tail.",
    color: "#f59e0b",
    hp: 39,
    attack: 52,
    defense: 43,
    moves: ["Ember", "Scratch"]
  },
  {
    id: "elcoon",
    name: "Elcoon",
    type: "Water",
    description: "A playful water spirit.",
    color: "#7e7e7e",
    hp: 44,
    attack: 48,
    defense: 65,
    moves: ["Water Gun", "Tail Whip"]
  }
];
