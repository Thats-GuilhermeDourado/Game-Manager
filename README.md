
# 🎲 D&D Campaign Manager

<img width="1919" height="882" alt="image" src="https://github.com/user-attachments/assets/0dedd313-2810-4e84-b5c9-e3804966b310" />

### *A Real-Time Virtual Tabletop with 3D Dice, AI-Generated NPCs, and a Tactical Card Combat System*

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.11-FFCA28?logo=firebase)](https://firebase.google.com/)
[![Three.js](https://img.shields.io/badge/Three.js-0.183-000000?logo=three.js)](https://threejs.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-1.48-4285F4?logo=google)](https://ai.google.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)

---

## 📖 Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Firestore Data Model](#firestore-data-model)
- [Combat System Deep Dive](#combat-system-deep-dive)
- [AI Integration](#ai-integration)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Future Roadmap](#future-roadmap)

---

## Overview

**D&D Campaign Manager** is a full-stack web application that reimagines how tabletop RPGs are played. It combines real-time collaboration, immersive graphics, and AI assistance into a single, cohesive experience.

Built for both Dungeon Masters and players, the system handles everything from character creation and inventory management to tactical combat with physics-based dice rolling and AI-generated content.

> **Time to first roll:** Under 30 seconds from login.

<img width="1916" height="895" alt="image" src="https://github.com/user-attachments/assets/ee692328-2a50-46b5-ae95-9c172c9a348c" />


---

## Live Demo

> 🔗 **Deployed at:** https://ais-dev-h5p4uwfrqeke3ctvv4jhzu-280765735839.europe-west1.run.app/auth

**Test Credentials:**
- Login with any Google account
- Create a character → Join a campaign 

---

## Key Features

### 🎮 For Players

| Feature | Description |
|---------|-------------|
| **Character Creation** | Choose from 10 races, 12 classes, distribute attributes with real-time modifier calculation |
| **Auto-calculated Sheets** | HP, AC, Initiative, Passive Perception, Spell Save DC. All computed automatically |
| **Real-time Inventory** | Add/remove items, equip gear, track gold with live sync across all devices |
| **Spellbook & Grimoire** | Learn spells, prepare slots, track usage per long rest |
| **Achievement System** | Unlock bronze/silver/gold/platinum achievements, display top 3 on profile |

### 🏰 For Dungeon Masters

| Feature | Description |
|---------|-------------|
| **Campaign Management** | Create campaigns, generate invite codes, manage players |
| **Bestiary** | Unlock/lock monsters, add private notes per creature |
| **NPC Generator** | Create custom NPCs with AI-generated descriptions (Gemini) |
| **Quest System** | Create, track, and complete main/side/rumor quests |
| **Merchant Events** | Spawn traveling merchants with unique inventories |
| **Group Management** | Distribute XP/gold to entire party, trigger group short/long rests |

### ⚔️ Combat System (Card-Based Tactical RPG)

| Feature | Description |
|---------|-------------|
| **Class-Based Decks** | Each class (Fighter, Wizard, Cleric, Rogue) has unique cards |
| **Bonus Pool Selection** | Choose 5 additional cards before combat starts |
| **Initiative Roll** | Everyone rolls d20 + DEX modifier, order determines turn sequence |
| **Simultaneous Selection** | All players choose action + target at the same time (zero downtime) |
| **Reaction System** | Interrupt enemy actions with reaction cards (Shield, Counterspell, Riposte) |
| **Synergy Mechanic** | Cards glow when combo conditions are met (e.g., Fire + Oil = Explosion) |
| **Status Effects** | Poisoned, Burning, Stunned, Silenced, Ethereal, Possessed — each with unique rules |
| **3D Dice Physics** | Realistic rolling with collision detection (Cannon.es + Three.js) |

### 🤖 AI Integration (Google Gemini)

| Feature | Description |
|---------|-------------|
| **AI Assistant** | Chatbot trained on D&D 5e rules — ask anything about gameplay |
| **NPC Generation** | Create fully fleshed NPCs with descriptions and unique bonuses |
| **Combo Suggestions** | AI analyzes two characters and suggests tactical synergies |
| **Story Generation** | Generate rumors, quest hooks, and monster lore on demand |

### 📊 Data Visualization

<img width="1294" height="758" alt="image" src="https://github.com/user-attachments/assets/58888a79-ccfe-4884-a7a8-003c29dc9d76" />

| Feature | Description |
|---------|-------------|
| **Knowledge Graph** | D3.js force-directed network visualization connecting scrolls, monsters, and notes |
| **Relationship Mapping** | Visualize how NPCs, locations, and items interconnect |

### 🎨 UI/UX Highlights

- **Glassmorphism Design** — Frosted glass effects (`backdrop-blur`) with gold accents
- **Framer Motion Animations** — Smooth tab transitions, card hover effects, combat screen shakes
- **Responsive Layout** — Works on desktop and tablet
- **Sonner Toasts** — Non-intrusive notifications for all game actions
- **Custom Audio** — `use-sound` for dice rolls, hits, crits, and UI feedback

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 19** | UI library with concurrent rendering |
| **TypeScript** | Type safety and better IDE support |
| **Vite 6** | Build tool with HMR and optimized production builds |
| **Tailwind CSS 4** | Utility-first styling with custom glassmorphism theme |
| **Framer Motion** | Animation library for micro-interactions |
| **React Router v7** | Client-side routing |
| **Lucide React** | Consistent icon set |

### 3D & Graphics

| Technology | Purpose |
|------------|---------|
| **Three.js** | 3D rendering engine for dice and future map exploration |
| **Cannon.es** | Physics engine for realistic dice collisions and bounces |
| **@3d-dice/dice-box** | Specialized dice rolling library with high-quality assets |
| **D3.js** | Force-directed graph for knowledge visualization |

### Backend & Database

| Technology | Purpose |
|------------|---------|
| **Firebase Auth** | Google OAuth authentication |
| **Firestore** | NoSQL real-time database with Security Rules |
| **Express** | Node.js server for API endpoints (AI proxy, batch operations) |

### AI & Utilities

| Technology | Purpose |
|------------|---------|
| **Google Gemini API** | Text generation for NPCs, stories, and rules Q&A |
| **Fuse.js** | Fuzzy search for bestiary and NPC lists (typo-tolerant) |
| **date-fns** | Date formatting and manipulation |
| **React Markdown** | Render formatted text in scrolls and AI responses |
| **use-sound** | Audio feedback for dice rolls, hits, and UI actions |
| **clsx + tailwind-merge** | Dynamic className management |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (React + Vite)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Auth UI   │  │  Dashboard  │  │    Combat Game (3D)      │  │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘  │
│         │                │                       │               │
│  ┌──────▼────────────────▼───────────────────────▼────────────┐  │
│  │                    CharacterContext                         │  │
│  │         (Global State: user, character, campaign)          │  │
│  └───────────────────────────┬────────────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │     Firebase SDK     │
                    │  (Realtime Updates)  │
                    └──────────┬──────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                         Firestore                                │
│  /users/{uid}/characters/         ← Character data              │
│  /campaigns/{cid}/                 ← Campaign state              │
│  /campaigns/{cid}/npcs/            ← NPCs                        │
│  /campaigns/{cid}/scrolls/         ← Player-written scrolls      │
│  /campaigns/{cid}/activeRolls/     ← Live dice rolls             │
│  /friendships/                     ← Social connections          │
│  /guilds/                          ← Guild management            │
└──────────────────────────────────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │     Express API      │
                    │  (Gemini Proxy)      │
                    └──────────────────────┘
```

### State Management Pattern

The app uses **React Context API** with a single `CharacterContext` provider that:

1. Listens to Firestore `onSnapshot()` for real-time updates
2. Automatically recalculates derived stats (HP, AC, spell slots) when attributes change
3. Provides optimistic updates with rollback on error
4. Handles all Firebase CRUD operations with centralized error handling

```typescript
// Real-time character sync with automatic recalculation
useEffect(() => {
  const q = query(
    collection(db, "users", user.uid, "characters"),
    where("deleted", "!=", true)
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const chars = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        hp: calculateMaxHp(data.attributes.con, data.level, data.charClass),
        ac: calculateArmorClass(data.armor, data.attributes.dex),
        spellSaveDC: 8 + data.proficiencyBonus + data.attributes[data.spellcastingAbility]
      };
    });
    setCharacters(chars);
  });
  
  return unsubscribe;
}, [user]);
```

---

## Firestore Data Model

### Character Document (`/users/{userId}/characters/{charId}`)

<img width="1385" height="744" alt="image" src="https://github.com/user-attachments/assets/06593e31-773a-4b0c-ac8b-d7d66b7d81d2" />

```typescript
interface Character {
  id: string;
  userId: string;
  name: string;
  race: string;           // "Human", "Elf", "Dwarf", "Halfling", etc.
  charClass: string;      // "Fighter", "Wizard", "Cleric", "Rogue"
  level: number;
  xp: number;
  hp: { current: number; max: number; temp?: number };
  ac: number;
  attributes: {
    str: number; dex: number; con: number;
    int: number; wis: number; cha: number;
  };
  skills: Record<string, boolean>;  // proficiency flags
  inventory: Array<Item>;
  gold: number;
  spells: string[];        // Spell IDs
  spellcasting?: {
    ability: string;
    saveDC: number;
    slots: Record<string, { current: number; max: number }>;
    prepared: string[];
  };
  profile?: {
    backgroundStyle: 'dark' | 'sunset' | 'forest' | 'ocean';
    featuredAchievements: string[];
    customImage?: string;
  };
  updatedAt: Timestamp;
  deleted?: boolean;
}

```

### Campaign Document (`/campaigns/{campaignId}`)

```typescript
interface Campaign {
  id: string;
  name: string;
  dmId: string;           // User ID of Dungeon Master
  inviteCode: string;     // 6-character join code
  players: string[];      // Array of user IDs
  characterRefs: Array<{ userId: string; charId: string }>;
  combat?: CombatState;   // Active combat (if any)
  quests?: Quest[];
  bestiary?: { unlockedMonsters: string[] };
  merchantEvent?: MerchantEvent;
  notifications?: Notification[];
}
```

### Combat State (Embedded in Campaign)

```typescript
interface CombatState {
  active: boolean;
  phase: 'deck_selection' | 'initiative' | 'preparation' | 'execution' | 'ended';
  round: number;
  turn: number;
  order: Participant[];    // Players + Monsters in initiative order
  selectedActions: Record<string, { actionId: string; targetId?: string }>;
  deckSelections: Record<string, string[]>;  // Chosen bonus cards
  history: CombatLog[];
  result?: 'victory' | 'defeat';
}
```

---

## Combat System Deep Dive

<img width="1919" height="890" alt="image" src="https://github.com/user-attachments/assets/b306c86c-bbe2-47dc-8866-eb3c2f470b56" />

The combat system is the most complex feature. Here's how it works:

### Phase 1: Deck Selection
Players choose **5 cards** from a pool of 20+ bonus cards (Toughness, Meditation, Dual Wielder, etc.). These form their "bonus pool" for the fight.

### Phase 2: Initiative
Each participant rolls `d20 + DEX modifier`. The order determines the execution sequence.

### Phase 3: Preparation (Simultaneous Selection)
Every player selects **1 action** and **1 target** at the same time. This eliminates downtime — no waiting for slow players.

### Phase 4: Execution
Actions resolve in initiative order. The system:

1. Checks for **reaction triggers** (e.g., "Shield" when attacked)
2. Rolls attack (d20 + modifiers)
3. Checks **keywords** (Elusive, Ethereal, Incorporeal, Frightening)
4. Calculates damage with **synergy bonuses** (e.g., +1d6 if target is Burning)
5. Applies **status effects** (Poisoned, Stunned, Silenced)
6. Updates HP and checks for death
7. Advances turn or ends round

### Card Example: Firebolt (Wizard)

```typescript
{
  id: 'wizard-firebolt',
  name: 'Firebolt',
  type: 'action',
  category: 'spell',
  range: '120 ft',
  effect: 'Launch a beam of fire at an enemy.',
  value: '1d10',
  damageType: 'Fire',
  keywords: ['Burn (12)'],
  synergy: {
    tag: 'Oil',
    bonus: 'Explosion',
    description: 'Causes area explosion if target is covered in Oil.'
  }
}
```

### Reaction System

When a player is attacked, if they have a **reaction card** in hand, the system pauses execution and prompts:

> *"Goblin attacks you with Scimitar! Use Shield? [Yes] [No]"*

This creates tactical depth similar to Magic: The Gathering or Legends of Runeterra.

---

## AI Integration

### Gemini API Implementation

The app uses **Google Generative AI (`@google/genai`)** for four distinct features:

```typescript
// services/geminiService.ts
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateNPC(theme: string, level: number) {
  const prompt = `
    Create a D&D 5e NPC with:
    - Name (unique, fantasy-style)
    - Race and Class
    - Physical description (2-3 sentences)
    - Personality trait, Ideal, Bond, Flaw
    - Unique combat bonus (e.g., "+2 to hit against dragons")
    Level: ${level}
    Theme: ${theme}
  `;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: prompt
  });
  
  return parseNPCResponse(response.text);
}
```

**AI Features:**
- **Rules Q&A:** Context-aware responses based on D&D 5e SRD
- **NPC Generation:** Unique stat blocks, descriptions, and roleplay hooks
- **Combo Suggestions:** "If you use Grease, the Wizard can follow with Fireball for +2d6"
- **Story Generation:** Rumors, quest hooks, and lore based on campaign context

---

## Installation

### Prerequisites
- Node.js 20+
- npm or yarn
- Firebase project (Authentication + Firestore enabled)
- Google Gemini API key

### Steps

```bash
# Clone the repository
git clone https://github.com/yourusername/dnd-campaign-manager.git
cd dnd-campaign-manager

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase and Gemini credentials

# Start development server
npm run dev

# Build for production
npm run build
npm run start
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration (from Firebase Console)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Optional: Disable HMR for AI Studio
DISABLE_HMR=false
```

---

## Project Structure

```
src/
├── components/
│   ├── campaign/           # Combat system, maps, campaign management
│   │   ├── CombatGame.tsx  # Full-screen tactical combat (15KB)
│   │   ├── CombatSetupModal.tsx
│   │   └── WorldMap.tsx
│   ├── character/          # Character sheets, creation, inventory
│   │   ├── CharacterSheet.tsx  # Main character view (25KB)
│   │   └── CharacterCreate.tsx
│   ├── layout/             # Navigation, sidebar, global elements
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── ui/                 # Reusable components
│       ├── DiceTray.tsx    # 3D dice roller with Cannon.es physics
│       ├── DiceRoller.tsx  # Simple 2D dice roller
│       └── GlassCard.tsx
├── contexts/
│   ├── AuthContext.tsx     # Authentication state
│   └── CharacterContext.tsx  # MAIN context (game logic, Firestore) — 50KB
├── data/
│   ├── combatCards.ts      # 70+ cards with effects and synergies
│   ├── monsters.ts         # Bestiary data
│   ├── spells.ts           # Spell library
│   ├── races_classes.ts    # Race/class definitions
│   └── items.ts            # Item database
├── hooks/
│   ├── useSound.ts         # Audio feedback hook (use-sound)
│   └── useFirestore.ts
├── services/
│   ├── firebase.ts         # Firebase initialization
│   └── geminiService.ts    # Gemini AI API wrapper
├── lib/
│   └── utils.ts            # cn() for Tailwind merging (clsx + tailwind-merge)
├── App.tsx                 # Routing entry point (React Router v7)
└── index.css               # Global styles + Tailwind theme
```

---

## Future Roadmap

| Feature | Status | ETA |
|---------|--------|-----|
| Hex Grid Map Exploration | 🚧 In Progress 
| Guild System (Raids, Quests) | ✅ Completed | - |
| Merchant Events | ✅ Completed 
| Achievement System | ✅ Completed 
| Mobile Responsive Layout | ✅ Completed 
| WebRTC Voice Chat | 📋 Planned | Q3 2025 |
| Dynamic Music System (location-based) | 📋 Planned 
| Fog of War on Maps | 📋 Planned 
| Export Character to PDF | 📋 Planned 
| PvP Arena Mode | 💡 Idea 

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- D&D 5e SRD for rules reference
- Google Gemini for AI capabilities
- Three.js + Cannon.es community for 3D dice inspiration
- All playtesters who broke the combat system (and helped fix it)

---

**Built with ☕ and precision by Guilherme Dourado Silva**
