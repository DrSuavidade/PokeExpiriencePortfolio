import { Building } from '../types';

export const buildings: Building[] = [
  {
    id: "projects",
    label: "Projects Lab",
    position: [-3, 0, -2],
    color: "#ef4444", // Redish
    npcName: "Lead Dev Rival",
    description: "A high-tech facility where experiments happen.",
    content: {
      title: "Projects Laboratory",
      body: "Here are some of the key experiments currently running in production:",
      items: [
        "AI Content Generator - React/Node/Gemini",
        "E-Commerce Dashboard - Next.js/Stripe",
        "Real-time Chat App - Socket.io/Redis",
        "3D Portfolio Quest - Three.js/R3F"
      ]
    }
  },
  {
    id: "cv",
    label: "CV Tower",
    position: [3, 0, -2],
    color: "#3b82f6", // Blueish
    npcName: "HR Guardian",
    description: "A tall archive containing history and records.",
    content: {
      title: "Curriculum Vitae Tower",
      body: "Accessing personnel records...",
      items: [
        "Senior Frontend Engineer @ Tech Corp (2020-Present)",
        "Full Stack Developer @ Startup Inc (2018-2020)",
        "BS Computer Science @ University of Tech",
        "Skills: React, TypeScript, Node.js, WebGL"
      ]
    }
  },
  {
    id: "about",
    label: "About House",
    position: [0, 0, 3],
    color: "#eab308", // Yellowish
    npcName: "Wise Sage",
    description: "A cozy cottage with a smoking chimney.",
    content: {
      title: "The About House",
      body: "Welcome! I am a passionate developer who loves bridging the gap between design and engineering. When I'm not coding, I'm likely hiking or playing RPGs.",
      items: []
    }
  },
  {
    id: "skill",
    label: "Skill Arena",
    position: [-2, 0, 4], // Nearby projects
    color: "#22c55e", // Greenish
    npcName: "Grandmaster",
    description: "A futuristic training ground for digital masters.",
    content: {
      title: "Skill Mastery Arena",
      body: "Show your dedication to the craft. 1 minute of focus is required to earn the mark of mastery.",
      items: [
        "React Mastery",
        "3D Rendering Prowess",
        "State Management Zen",
        "Logic & Algorithms"
      ]
    }
  },
  {
    id: "contact",
    label: "Contact Post",
    position: [4, 0, 3],
    color: "#a855f7", // Purpleish
    npcName: "Messenger",
    description: "A small outpost for sending messages.",
    content: {
      title: "Contact Outpost",
      body: "Open channels for communication:",
      items: [
        "Email: dev@example.com",
        "LinkedIn: /in/developer",
        "GitHub: @developer",
        "Twitter: @dev_tweets"
      ]
    }
  }
];