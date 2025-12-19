import React from 'react';
import { SceneRoot } from './engine/SceneRoot';
import { UIOverlay } from './components/UIOverlay';

export default function App() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-black relative">
      <SceneRoot />
      <UIOverlay />
    </div>
  );
}