import React, { useEffect, useState } from "react";
import { X, Linkedin, Mail, Github, ExternalLink } from "lucide-react";
import { useGameStore } from "../state/gameStore";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StampProps {
  icon: any;
  label: string;
  href: string;
  color: string;
  price: string;
  rotation: number;
}

const Stamp: React.FC<StampProps> = ({
  icon: Icon,
  label,
  href,
  color,
  price,
  rotation,
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block transition-all duration-300 ease-out hover:z-20 focus:outline-none"
      style={{
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <div
        className={cn(
          "relative w-24 h-32 sm:w-28 sm:h-36 shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-2 group-hover:shadow-xl",
          "p-1.5 flex flex-col items-center justify-between rounded-sm",
          color
        )}
      >
        {/* Perforation Simulation */}
        <div className="absolute inset-0 border-[6px] border-dotted border-white/40 pointer-events-none box-content -m-[3px]" />

        {/* Inner Content Area */}
        <div className="w-full h-full border border-white/20 flex flex-col items-center justify-between p-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/5 pointer-events-none" />

          {/* Header */}
          <div className="w-full flex justify-between items-start z-10 text-white/90">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
              AIR MAIL
            </span>
            <span className="text-xs font-bold font-mono">{price}</span>
          </div>

          {/* Main Icon */}
          <div className="flex-1 flex items-center justify-center z-10 text-white">
            <Icon
              className="w-10 h-10 sm:w-12 h-12 drop-shadow-md"
              strokeWidth={1.5}
            />
          </div>

          {/* Label */}
          <div className="z-10 text-center text-white">
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono block leading-tight">
              {label}
            </span>
          </div>

          {/* Postmark Decoration */}
          <div className="absolute -bottom-4 -right-4 w-16 h-16 border-2 border-black/10 rounded-full pointer-events-none transform -rotate-12" />
        </div>
      </div>

      {/* Tooltip */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30">
        <span className="bg-black text-white text-[10px] py-1 px-2 rounded uppercase tracking-tighter whitespace-nowrap shadow-lg">
          Visit {label}
        </span>
      </div>
    </a>
  );
};

const WaxSeal: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group absolute top-6 right-6 z-50 w-14 h-14 flex items-center justify-center focus:outline-none transition-transform hover:scale-110 active:scale-95"
      aria-label="Close Letter"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 text-red-900 drop-shadow-lg"
          fill="currentColor"
        >
          <path d="M50 5 C 60 5, 65 10, 70 8 C 78 5, 85 15, 88 20 C 95 30, 92 40, 95 50 C 98 60, 90 70, 88 75 C 85 85, 75 92, 65 94 C 55 96, 45 92, 35 94 C 25 96, 15 90, 10 80 C 5 70, 8 60, 5 50 C 2 40, 8 30, 12 20 C 18 10, 30 5, 35 8 C 40 10, 45 5, 50 5 Z" />
        </svg>
        <div className="absolute inset-3 border-2 border-red-950/30 rounded-full" />
        <X className="w-7 h-7 text-red-100 relative z-10" strokeWidth={3} />
        <div className="absolute top-3 left-4 w-4 h-3 bg-white/20 rounded-full blur-[1px] transform -rotate-45" />
      </div>
    </button>
  );
};

export const LetterInterface: React.FC = () => {
  const { letterOpen, setLetterOpen } = useGameStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (letterOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 50);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [letterOpen]);

  if (!isVisible) return null;

  const stamps = [
    {
      icon: Linkedin,
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/pedro-ddaa-costa/",
      color: "bg-[#0a66c2]",
      price: "1ST",
      rotation: -5,
    },
    {
      icon: Github,
      label: "GitHub",
      href: "https://github.com/DrSuavidade",
      color: "bg-[#24292e]",
      price: "2ND",
      rotation: 8,
    },
    {
      icon: Mail,
      label: "Contact",
      href: "https://mail.google.com/mail/?view=cm&to=caaddp@gmail.com",
      color: "bg-[#ea4335]",
      price: "3RD",
      rotation: -3,
    },
  ];

  return (
    <div
      className={cn(
        "fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-500 perspective-[1000px]",
        isAnimating ? "bg-black/40" : "bg-black/0"
      )}
      onClick={() => setLetterOpen(false)}
    >
      <div
        className={cn(
          "relative w-full max-w-2xl bg-[#fdfcf0] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] origin-bottom",
          isAnimating
            ? "translate-y-0 scale-100 opacity-100 rotate-0"
            : "translate-y-32 scale-75 opacity-0 rotate-6"
        )}
        style={{
          backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Airmail Border */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[repeating-linear-gradient(45deg,#e53e3e,#e53e3e_15px,#fdfcf0_15px,#fdfcf0_30px,#3182ce_30px,#3182ce_45px,#fdfcf0_45px,#fdfcf0_60px)]" />

        <WaxSeal onClick={() => setLetterOpen(false)} />

        <div className="p-10 sm:p-14 md:p-16 flex flex-col min-h-[500px]">
          {/* Letter Header */}
          <header className="mb-10 border-b border-black/10 pb-6 flex justify-between items-start">
            <div className="font-mono text-[10px] text-black/60 uppercase tracking-widest space-y-1">
              <p>FROM: PEDRO D. COSTA</p>
              <p>WORLDWIDE OPPORTUNITIES</p>
              <p>REF: caaddp@gmail.com</p>
            </div>

            <div className="w-16 h-16 border-2 border-dashed border-black/10 rounded-full flex flex-col items-center justify-center rotate-12 opacity-30">
              <span className="text-[10px] font-mono leading-none">POST</span>
              <span className="text-[10px] font-mono leading-none">PAID</span>
            </div>
          </header>

          {/* Letter Content */}
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl font-serif text-black/90 italic">
              Hello friend,
            </h2>
            <div className="font-serif text-lg sm:text-xl text-black/80 leading-relaxed max-w-md">
              <p>
                Whether you want to build something amazing, check my previous
                work, or just exchange ideas, I'm just a stamp away.
              </p>
              <p className="mt-4">Pick a destination below to set sail!</p>
            </div>
          </div>

          {/* Stamps Section */}
          <div className="mt-12 pt-8 border-t border-black/5">
            <p className="font-mono text-[9px] text-center text-black/40 uppercase tracking-[0.3em] mb-8">
              Select Postage for Contact
            </p>
            <div className="flex flex-wrap justify-center gap-8 sm:gap-12 pb-2">
              {stamps.map((stamp, i) => (
                <Stamp key={i} {...stamp} />
              ))}
            </div>
          </div>

          <div className="mt-10 text-center opacity-20">
            <p className="font-mono text-[8px] uppercase tracking-widest">
              Digital Correspondence Service © 2025
            </p>
          </div>
        </div>

        {/* Shadow Casting Fold Simulation */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.05)]" />
      </div>
    </div>
  );
};
