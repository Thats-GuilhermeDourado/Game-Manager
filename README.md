
# Campaign Manager

### *A Real-Time Virtual Tabletop with 3D Dice, AI-Generated NPCs, and a Tactical Card Combat System*

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.11-FFCA28?logo=firebase)](https://firebase.google.com/)
[![Three.js](https://img.shields.io/badge/Three.js-0.183-000000?logo=three.js)](https://threejs.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-1.48-4285F4?logo=google)](https://ai.google.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

---

## 📖 Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Firestore Data Model](#firestore-data-model)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Combat System Deep Dive](#combat-system-deep-dive)
- [Future Roadmap](#future-roadmap)
- [License](#license)

---

## Overview

**D&D Campaign Manager** is a full-stack web application that reimagines how tabletop RPGs are played. It combines real-time collaboration, immersive 3D graphics, and AI assistance into a single, cohesive experience.

Built for both Dungeon Masters and players, the system handles everything from character creation and inventory management to tactical combat with physics-based 3D dice rolling and AI-generated content.

**Time to first roll:** Under 30 seconds from login.

---

## Live Demo

> 🔗 **Deployed at:** [dnd-campaign-manager.vercel.app](https://dnd-campaign-manager.vercel.app) *(replace with your actual URL)*

**Test Credentials:**
- Login with any Google account
- Create a character → Join a campaign → Start combat

---

## Key Features

### 🎮 For Players
| Feature | Description |
|---------|-------------|
| **Character Creation** | Choose from 8 races, 12 classes, distribute attributes with real-time modifier calculation |
| **Auto-calculated Sheets** | HP, AC, Initiative, Passive Perception, Spell Save DC — all computed automatically |
| **Real-time Inventory** | Add/remove items, equip gear, track gold with live sync across all devices |
| **Spellbook & Grimoire** | Learn spells, prepare slots, track usage per long rest |
| **Achievement System** | Unlock bronze/silver/gold/platinum achievements, display top 3 on profile |

### 🏰 For Dungeon Masters
| Feature | Description |
|---------|-------------|
| **Campaign Management** | Create campaigns, generate invite codes, manage players |
| **Bestiary** | Unlock/lock monsters, add private notes per creature |
| **NPC Generator** | Create custom NPCs with AI-generated descriptions |
| **Quest System** | Create, track, and complete main/side/rumor quests |
| **Merchant Events** | Spawn traveling merchants with unique inventories |
| **Group Management** | Distribute XP/gold to entire party, trigger group short/long rests |

### ⚔️ Combat System (Card-Based Tactical RPG)
| Feature | Description |
|---------|-------------|
| **Class-Based Decks** | Each class (Fighter, Wizard, Cleric, Rogue) has unique cards |
| **Bonus Pool Selection** | Choose 5 additional cards before combat starts |
| **Initiative Roll** | Everyone rolls d20 + DEX modifier, order determines turn sequence |
| **Simultaneous Selection** | All players choose action + target at the same time |
| **Reaction System** | Interrupt enemy actions with reaction cards (Shield, Counterspell, Riposte) |
| **Synergy Mechanic** | Cards glow when combo conditions are met (e.g., Fire + Oil = Explosion) |
| **Status Effects** | Poisoned, Burning, Stunned, Silenced, Ethereal, Possessed — each with unique rules |
| **3D Dice Physics** | Realistic rolling with collision detection using Cannon.es |

### 🤖 AI Integration (Google Gemini)
| Feature | Description |
|---------|-------------|
| **AI Assistant** | Chatbot trained on D&D 5e rules — ask anything about gameplay |
| **NPC Generation** | Create fully fleshed NPCs with descriptions and unique bonuses |
| **Combo Suggestions** | AI analyzes two characters and suggests tactical synergies |
| **Story Generation** | Generate rumors, quest hooks, and monster lore on demand |

### 📊 Data Visualization
| Feature | Description |
|---------|-------------|
| **Knowledge Graph** | D3.js network visualization connecting scrolls, monsters, and notes |
| **Relationship Mapping** | Visualize how NPCs, locations, and items interconnect |

### 🎨 UI/UX Highlights
- **Glassmorphism Design** — Frosted glass effects with gold accents
- **Framer Motion Animations** — Smooth tab transitions, card hover effects, combat screen shakes
- **Responsive Layout** — Works on desktop and tablet (mobile-ready layout)
- **Sonner Toasts** — Non-intrusive notifications for all game actions
- **Custom Scrollbar** — Themed to match the dark fantasy aesthetic

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI library with concurrent rendering |
| **TypeScript** | Type safety and better IDE support |
| **Vite** | Build tool with HMR and optimized production builds |
| **Tailwind CSS 4** | Utility-first styling with custom theme |
| **Framer Motion** | Animation library for micro-interactions |
| **React Router v7** | Client-side routing |
| **Lucide React** | Consistent icon set |

### 3D & Graphics
| Technology | Purpose |
|------------|---------|
| **Three.js** | 3D rendering engine for dice |
| **Cannon.es** | Physics engine for realistic dice collisions |
| **D3.js** | Force-directed graph for knowledge visualization |

### Backend & Database
| Technology | Purpose |
|------------|---------|
| **Firebase Auth** | Google OAuth authentication |
| **Firestore** | NoSQL real-time database |
| **Express** | Node.js server for API endpoints |

### AI & Utilities
| Technology | Purpose |
|------------|---------|
| **Google Gemini API** | Text generation for NPCs, stories, and rules Q&A |
| **Fuse.js** | Fuzzy search for bestiary and NPC lists |
| **date-fns** | Date formatting and manipulation |
| **React Markdown** | Render formatted text in scrolls |
| **use-sound** | Audio feedback for dice rolls, hits, and UI actions |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (React)                           │
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
```

### State Management Pattern

The app uses **React Context API** with a single `CharacterContext` provider that:

1. Listens to Firestore `onSnapshot()` for real-time updates
2. Automatically recalculates derived stats (HP, AC, spell slots) when attributes change
3. Provides optimistic updates with rollback on error
4. Handles all Firebase CRUD operations with centralized error handling

```tsx
// Example: Real-time character sync
useEffect(() => {
  const q = query(collection(db, "users", user.uid, "characters"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const chars = snapshot.docs.map(doc => automateCalculations(doc.data()));
    setCharacters(chars);
  });
  return unsubscribe;
}, [user]);
```

---

## Firestore Data Model

### Character Document (`/users/{userId}/characters/{charId}`)

```typescript
interface Character {
  id: string;
  userId: string;
  name: string;
  race: string;           // "Humano", "Elfo", "Anão", etc.
  charClass: string;      // "Guerreiro", "Mago", "Clérigo", etc.
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

## Installation

### Prerequisites
- Node.js 20+
- npm or yarn
- Firebase project (with Authentication and Firestore enabled)
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
│       ├── DiceTray.tsx    # 3D dice roller with physics
│       ├── DiceRoller.tsx  # Simple 2D dice roller
│       └── GlassCard.tsx
├── contexts/
│   ├── AuthContext.tsx     # Authentication state
│   └── CharacterContext.tsx  # MAIN context (game logic, Firestore) — 50KB
├── data/
│   ├── combatCards.ts      # All 70+ cards with effects, synergies
│   ├── monsters.ts         # Bestiary data
│   ├── spells.ts           # Spell library
│   ├── races_classes.ts    # Race/class definitions
│   └── items.ts            # Item database
├── hooks/
│   ├── useSound.ts         # Audio feedback hook
│   └── useFirestore.ts
├── services/
│   ├── firebase.ts         # Firebase initialization
│   └── geminiService.ts    # AI API wrapper
├── lib/
│   └── utils.ts            # cn() for Tailwind merging
├── App.tsx                 # Routing entry point
└── index.css               # Global styles + Tailwind theme
```

---

## Combat System Deep Dive

The combat system is the most complex feature. Here's how it works:

### Phase 1: Deck Selection
Players choose **5 cards** from a pool of 20+ bonus cards (toughness, meditation, dual wielder, etc.). These form their "bonus pool" for the fight.

### Phase 2: Initiative
Each participant rolls `d20 + DEX modifier`. The order determines the execution sequence.

### Phase 3: Preparation (Simultaneous Selection)
Every player selects **1 action** and **1 target** at the same time. This eliminates downtime — no waiting for slow players.

### Phase 4: Execution
Actions resolve in initiative order. The system:
1. Checks for **reaction triggers** (e.g., "Shield" when attacked)
2. Rolls attack (d20 + modifiers)
3. Checks **keywords** (Elusive, Ethereal, Incorporeal, Amedrontador)
4. Calculates damage with **synergy bonuses** (e.g., +1d6 if target is Burning)
5. Applies **status effects** (Poisoned, Stunned, Silenced)
6. Updates HP and checks for death
7. Advances turn or ends round

### Card Example: Firebolt (Wizard)

```typescript
{
  id: 'wizard-firebolt',
  name: 'Raio de Fogo',
  type: 'action',
  category: 'spell',
  range: '120 ft',
  effect: 'Lança um feixe de fogo no inimigo.',
  value: '1d10',
  damageType: 'Fogo',
  keywords: ['Queimadura (12)'],
  synergy: {
    tag: 'Óleo',
    bonus: 'Explosão',
    description: 'Causa explosão em área se o alvo estiver coberto de Óleo.'
  }
}
```

### Reaction System

When a player is attacked, if they have a **reaction card** in hand, the system pauses execution and prompts:

> *"Goblin attacks you with Scimitar! Use Shield? [Yes] [No]"*

This creates tactical depth similar to Magic: The Gathering or Legends of Runeterra.

---

## Future Roadmap

| Feature | Status | ETA |
|---------|--------|-----|
| Hex Grid Map Exploration | 🚧 In Progress | Q2 2025 |
| Guild System (Raids, Quests) | ✅ Completed | - |
| Merchant Events | ✅ Completed | - |
| Achievement System | ✅ Completed | - |
| Mobile Responsive Layout | ✅ Completed | - |
| WebRTC Voice Chat | 📋 Planned | Q3 2025 |
| Dynamic Music System | 📋 Planned | Q3 2025 |
| Fog of War on Maps | 📋 Planned | Q4 2025 |
| Export Character to PDF | 📋 Planned | Q4 2025 |
| PvP Arena Mode | 💡 Idea | TBD |

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- D&D 5e SRD for rules reference
- Google Gemini for AI capabilities
- Three.js community for 3D dice inspiration
- All playtesters who broke the combat system (and helped fix it)

---

**Built with ☕ and love by Guilherme Dourado Silva**  
