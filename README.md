# Portfolio Quest ⚔️

A gamified 3D portfolio website inspired by classic monster-taming RPGs. Built with **React**, **Three.js (via React Three Fiber)**, and **Zustand**.

## 🎮 Experience Overview

This application transforms the traditional portfolio into an interactive adventure:

1.  **Starter Selection**: Begin by choosing one of three elemental companions (Fire, Grass, Water).
2.  **Home Base**: Start in your room, where you access the virtual world via your computer.
3.  **City Exploration**: Roam a 3D city map to find different buildings representing portfolio sections:
    *   **Projects Lab**: View technical projects.
    *   **CV Tower**: Review work history and skills.
    *   **About House**: Personal bio.
    *   **Contact Outpost**: Social links.
4.  **Battle System**: Engage in turn-based battles with "NPCs" (representing professional challenges) to unlock content.

## 🕹️ Controls

*   **Movement**: `W`, `A`, `S`, `D` or `Arrow Keys`
*   **Interact**: `E` or `Space` (When near a building or object)
*   **Menu**: Click the hamburger icon in the top right.

## 🛠️ Tech Stack

*   **Core**: React 18
*   **3D Engine**: @react-three/fiber (Three.js)
*   **3D Helpers**: @react-three/drei
*   **State Management**: Zustand
*   **Styling**: TailwindCSS
*   **Font**: 'Press Start 2P' (Google Fonts)

## 📂 Project Structure

*   **`engine/`**: Core 3D setup (`SceneRoot`, `SceneManager`).
*   **`scenes/`**: Individual game states (`Landing`, `Home`, `City`, `Battle`, `Building`).
*   **`components/`**: Reusable UI and 3D objects (`Player`, `UIOverlay`, `Menu`).
*   **`state/`**: Global game state store (`gameStore.ts`).
*   **`data/`**: Static data definitions for monsters and buildings.

## 🚀 Running the Project

This project uses ES Modules and can be run directly in modern environments that support import maps (like the provided setup) or bundled via Vite/Webpack.

1.  Ensure all files are placed in the root directory.
2.  Open `index.html` in a modern browser (via a local server to avoid CORS issues with texture loading if applicable, though this version uses procedural materials).

## 🎨 Customization

*   **Modify Content**: Edit `data/buildings.ts` to update portfolio text, projects, and NPC dialogue.
*   **Change Monsters**: Edit `data/monsters.ts` to create new starters.
*   **Adjust Visuals**: Colors and geometries are defined procedurally within the scene components.

---

*Level up your hiring potential!* 🚀
