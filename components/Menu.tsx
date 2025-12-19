import React from 'react';
import { useGameStore } from '../state/gameStore';

export const Menu = () => {
    const { toggleMenu, menuOpen, starter, progress } = useGameStore();

    return (
        <div className="relative">
            <button 
                onClick={() => toggleMenu()}
                className="w-12 h-12 bg-white border-2 border-black rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition"
            >
                <div className="space-y-1">
                    <div className="w-6 h-0.5 bg-black"></div>
                    <div className="w-6 h-0.5 bg-black"></div>
                    <div className="w-6 h-0.5 bg-black"></div>
                </div>
            </button>

            {menuOpen && (
                <div className="absolute top-14 right-0 w-64 bg-white border-2 border-black rounded shadow-xl p-4 pixel-font text-xs">
                    <h3 className="font-bold border-b border-gray-200 pb-2 mb-2">MENU</h3>
                    
                    <div className="mb-4">
                        <p className="text-gray-500 mb-1">Companion</p>
                        <p className="font-bold capitalize">{starter}</p>
                    </div>

                    <div className="mb-4">
                        <p className="text-gray-500 mb-1">Badges</p>
                        <p>{Object.values(progress.defeatedNPCs).filter(Boolean).length} / 4</p>
                    </div>

                    <div className="space-y-2 mt-4">
                        <a href="https://github.com" target="_blank" rel="noreferrer" className="block p-2 bg-gray-100 hover:bg-gray-200 text-center rounded">
                            GitHub
                        </a>
                        <a href="mailto:test@test.com" className="block p-2 bg-gray-100 hover:bg-gray-200 text-center rounded">
                            Contact
                        </a>
                    </div>
                </div>
            )}
        </div>
    )
}