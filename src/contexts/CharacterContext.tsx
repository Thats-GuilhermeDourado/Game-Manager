import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { 
  calculateModifier, 
  getLevelFromXP, 
  CLASSES, 
  RACES, 
  SPELL_SLOTS_TABLE,
  getAttr,
  calculateAC,
  calculateInitiative,
  calculatePassivePerception
} from "../data/rules";
import { auth, db } from "../services/firebase";
import { toast } from "sonner";
import { Achievement, TOA_ACHIEVEMENTS } from "../data/achievements";
import { onAuthStateChanged, User, signOut, updateProfile } from "firebase/auth";
import { spells } from "../data/spells";
import { 
  doc, 
  collection, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  getDoc,
  getDocs, 
  collectionGroup,
  Timestamp,
  or,
  arrayUnion,
  deleteDoc,
  deleteField,
  orderBy,
  limit,
  serverTimestamp
} from "firebase/firestore";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  
  toast.error("Erro de conexão com o servidor", {
    description: "Não foi possível completar a ação. Verifique sua internet.",
    action: {
      label: "Tentar novamente",
      onClick: () => window.location.reload(),
    },
  });

  throw new Error(JSON.stringify(errInfo));
};

const sanitizeData = (data: any): any => {
  if (data === null) return null;
  if (data === undefined) return undefined;
  if (typeof data !== 'object' || data instanceof Date || data instanceof Timestamp) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeData).filter(v => v !== undefined);
  }
  const sanitized: any = {};
  for (const key in data) {
    const val = sanitizeData(data[key]);
    if (val !== undefined) {
      sanitized[key] = val;
    }
  }
  return sanitized;
};

import { CombatCard, BASE_CARDS, MONSTER_CARDS, CONSUMABLE_CARDS, COMMON_CARDS, POOL_CARDS } from "../data/combatCards";

export interface Campaign {
  id: string;
  name: string;
  dmId: string;
  inviteCode: string;
  players: string[];
  characterRefs: { userId: string; charId: string }[];
  formation?: Record<string, { x: number; y: number; role: string }>;
  settings?: {
    restrictedRaces?: string[];
    restrictedClasses?: string[];
    restrictedSpells?: string[];
  };
  bestiary?: {
    unlockedMonsters: string[];
  };
  activeVoting?: {
    id: string;
    type: 'guide_selection';
    title: string;
    options: {
      id: string;
      name: string;
      image: string;
      description: string;
      bonus: string;
    }[];
    votes: Record<string, string>; // userId -> optionId
    status: 'open' | 'closed';
    createdAt: number;
  };
  notifications?: {
    id: string;
    type: 'voting' | 'info' | 'alert';
    message: string;
    timestamp: number;
    data?: any;
  }[];
  combat?: {
    active: boolean;
    turn: number;
    round: number;
    order: {
      id: string;
      name: string;
      initiative: number;
      type: 'player' | 'monster' | 'npc';
      hp?: { current: number; max: number };
      imageUrl?: string;
      ac?: number;
      cr?: string;
      monsterType?: string;
      conditions?: string[];
      defending?: boolean;
      deck?: CombatCard[];
      stamina?: { current: number; max: number };
      mana?: { current: number; max: number };
      hand?: CombatCard[];
      bonusPool?: CombatCard[];
      selectedActions?: {
        mainActionId?: string;
        mainTargetId?: string;
        bonusActionId?: string;
        bonusTargetId?: string;
      };
      attributes?: any;
      keywords?: string[];
      charClass?: string;
      spellcasting?: any;
    }[];
    initiatives?: Record<string, number>;
    selectedActions?: Record<string, { 
      mainActionId?: string; 
      mainTargetId?: string; 
      bonusActionId?: string; 
      bonusTargetId?: string;
    }>; // participantId -> selection
    deckSelections?: Record<string, string[]>; // participantId -> cardIds
    phase: 'setup' | 'initiative' | 'deck_selection' | 'preparation' | 'execution' | 'combat' | 'ended';
    result?: 'victory' | 'defeat';
    savingThrowPrompt?: {
      participantId: string;
      attribute: string;
      dc: number;
      message: string;
      conditionToRemove?: string;
    };
    reactionPrompt?: {
      participantId: string;
      triggeringActorId: string;
      message: string;
      availableReactions: CombatCard[];
    };
    history: {
      id: string;
      type: 'attack' | 'damage' | 'spell' | 'death' | 'heal' | 'skip' | 'info';
      message: string;
      timestamp: number;
      actorId: string;
      targetId?: string;
      value?: number;
      isCritical?: boolean;
      isMiss?: boolean;
      diceRoll?: { d20: number; mod: number; total: number; targetAC: number };
    }[];
  };
  quests?: {
    id: string;
    title: string;
    description: string;
    status: 'active' | 'completed' | 'failed';
    type: 'main' | 'side' | 'rumor';
    createdAt: number;
  }[];
  achievements?: Achievement[];
  merchantEvent?: {
    active: boolean;
    npcName: string;
    npcImage: string;
    inventory: {
      itemKey: string;
      sold: boolean;
    }[];
  };
}

export interface NPC {
  id: string;
  name: string;
  race: string;
  charClass: string;
  role: string;
  description?: string;
  appearance?: string;
  campaignId: string;
}

export interface Scroll {
  id: string;
  name: string;
  content: string;
  campaignId: string;
  authorIds: string[];
  lastEditedBy: string;
  updatedAt: any;
  links?: string[];
  deleted?: boolean;
  style?: {
    fontSize?: string;
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
}

export interface MonsterNote {
  id: string;
  monsterId: string;
  campaignId: string;
  authorId: string;
  content: string;
  updatedAt: any;
}

export interface Friendship {
  id: string;
  charIds: string[];
  status: 'pending' | 'accepted';
  createdAt: any;
}

export interface Guild {
  id: string;
  name: string;
  leaderId: string;
  memberRefs: { userId: string; charId: string; rank: 'Recruta' | 'Membro' | 'Veterano' | 'Oficial' | 'Líder' }[];
  level: number;
  reputation: number;
  specialization?: string;
  resources: {
    gold: number;
    items: any[];
    base?: string;
  };
  economy: {
    vault: number;
    taxRate: number;
    investments: any[];
  };
  dailyQuests: any[];
  notes: string[];
  createdAt: any;
}

export interface GuildMessage {
  id: string;
  guildId: string;
  senderId: string;
  senderName: string;
  senderCharId: string;
  content: string;
  createdAt: any;
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  race: string;
  charClass: string;
  subclass?: string;
  level: number;
  xp: number;
  hp: { 
    current: number; 
    max: number;
    temp?: number;
  };
  ac: number;
  speed?: number;
  initiative?: number;
  passivePerception?: number;
  proficiencyBonus?: number;
  attributes: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
    [key: string]: number; // Allow for other naming conventions like Strength, etc.
  };
  skills: Record<string, boolean>;
  inventory: any[];
  gold: number;
  spells: string[];
  spellcasting?: {
    ability: string;
    saveDC: number;
    attackBonus: number;
    slots: Record<string, { current: number; max: number }>;
    prepared: string[]; // IDs of prepared spells
    spells: any[]; // Learned spells (for Known/Spellbook)
    type?: 'Prepared' | 'Known' | 'Spellbook';
  };
  background: string;
  alignment: string;
  region?: string;
  appearance?: string;
  languages?: string[];
  personality?: {
    traits: string;
    ideals: string;
    bonds: string;
    flaws: string;
  };
  history?: string;
  guildId?: string;
  profile?: {
    backgroundStyle: 'dark' | 'sunset' | 'forest' | 'ocean';
    highlightedItemId?: string;
    showGuild: boolean;
    showRegion?: boolean;
    showProficiencies?: boolean;
    showMagicSchoolSymbol?: boolean;
    achievements?: { id: string; unlockedAt: number }[];
    featuredAchievements?: string[];
    bio?: string;
    customImage?: string;
  };
  magicSchool?: string;
  updatedAt: any;
  deleted?: boolean;
}

interface CharacterContextType {
  currentCharacter: Character | null;
  characters: Character[];
  allCharacters: Character[];
  campaignCharacters: Character[];
  currentCampaign: Campaign | null;
  userCampaigns: Campaign[];
  friendships: Friendship[];
  guilds: Guild[];
  npcs: NPC[];
  monsterNotes: MonsterNote[];
  scrolls: Scroll[];
  loading: boolean;
  error: string | null;
  user: User | null;
  saveCharacter: (updates: Partial<Character>) => Promise<void>;
  createCharacter: (charData: Partial<Character>) => Promise<string>;
  setCurrentCharacter: (char: Character | null) => void;
  loadCharacter: (charId: string, userId?: string) => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  addXPToCharacter: (charId: string, amount: number) => Promise<void>;
  addGoldToCharacter: (charId: string, amount: number) => Promise<void>;
  deleteCharacter: (charId: string) => Promise<void>;
  distributeGroupXP: (amount: number) => Promise<void>;
  distributeGroupGold: (amount: number) => Promise<void>;
  groupRest: (type: 'short' | 'long') => Promise<void>;
  rollAttributes: () => Record<string, number>;
  rollStartingGold: (charClass: string) => number;
  giveItemToCharacter: (charId: string, item: any) => Promise<void>;
  longRest: () => Promise<void>;
  logout: () => Promise<void>;
  createCampaign: (name: string) => Promise<string>;
  joinCampaign: (inviteCode: string, charId: string) => Promise<boolean>;
  setCurrentCampaign: (campaign: Campaign | null) => void;
  sendFriendRequest: (toCharId: string) => Promise<void>;
  acceptFriendRequest: (friendshipId: string) => Promise<void>;
  createGuild: (name: string) => Promise<void>;
  joinGuild: (guildId: string) => Promise<void>;
  leaveGuild: (guildId: string) => Promise<void>;
  updateGuildRank: (guildId: string, charId: string, newRank: Guild['memberRefs'][0]['rank']) => Promise<void>;
  depositToGuildVault: (guildId: string, amount: number) => Promise<void>;
  withdrawFromGuildVault: (guildId: string, amount: number) => Promise<void>;
  addGuildNote: (guildId: string, note: string) => Promise<void>;
  getAICombos: (friendChar: Character) => Promise<string>;
  createScroll: (name: string, campaignId: string, authorIds: string[]) => Promise<void>;
  updateScroll: (scrollId: string, content: string, links?: string[], style?: Scroll['style']) => Promise<void>;
  deleteScroll: (scrollId: string) => Promise<void>;
  tradeItem: (toCharId: string, itemId: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  createNPC: (npcData: Partial<NPC>) => Promise<void>;
  updateNPC: (npcId: string, updates: Partial<NPC>) => Promise<void>;
  deleteNPC: (npcId: string) => Promise<void>;
  deleteCampaign: (campaignId: string) => Promise<void>;
  leaveCampaign: (campaignId: string) => Promise<void>;
  saveFormation: (formation: Record<string, { x: number; y: number; role: string }>) => Promise<void>;
  unlockMonster: (monsterId: string) => Promise<void>;
  lockMonster: (monsterId: string) => Promise<void>;
  saveMonsterNote: (monsterId: string, content: string) => Promise<void>;
  startGuideSelection: () => Promise<void>;
  submitVote: (votingId: string, optionId: string) => Promise<void>;
  closeVoting: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  startCombat: (participants: any[]) => Promise<void>;
  submitInitiative: (participantId: string, roll: number) => Promise<void>;
  finalizeInitiative: () => Promise<void>;
  finalizeDeckSelection: (participantId: string, selectedPoolCardIds: string[]) => Promise<void>;
  selectCombatAction: (participantId: string, actionId: string, type: 'main' | 'bonus', targetId?: string) => Promise<void>;
  submitReaction: (participantId: string, cardId: string | null) => Promise<void>;
  submitSavingThrow: (participantId: string, roll: number) => Promise<void>;
  startExecutionPhase: () => Promise<void>;
  executeNextAction: () => Promise<void>;
  endRound: () => Promise<void>;
  cancelCombatAction: (participantId: string) => Promise<void>;
  endCombat: () => Promise<void>;
  nextTurn: () => Promise<void>;
  updateCombatOrder: (order: Campaign['combat']['order']) => Promise<void>;
  addCombatLog: (log: Omit<Campaign['combat']['history'][0], 'id' | 'timestamp'>) => Promise<void>;
  applyCombatDamage: (targetId: string, amount: number, isHeal?: boolean) => Promise<void>;
  toggleDefend: (participantId: string) => Promise<void>;
  addQuest: (quest: Partial<Campaign['quests'][0]>) => Promise<void>;
  updateQuest: (questId: string, updates: Partial<Campaign['quests'][0]>) => Promise<void>;
  deleteQuest: (questId: string) => Promise<void>;
  grantAchievement: (charId: string, achievementId: string) => Promise<void>;
  setFeaturedAchievements: (charId: string, achievementIds: string[]) => Promise<void>;
  initializeCampaignAchievements: (campaignId: string) => Promise<void>;
  startMerchantEvent: () => Promise<void>;
  closeMerchantEvent: () => Promise<void>;
  buyFromMerchant: (itemKey: string) => Promise<void>;
  setMagicSchool: (school: string) => Promise<void>;
  openDiceTray: (config: { onRollComplete?: (result: number) => void; initialDc?: number; initialAttr?: string }) => void;
  closeDiceTray: () => void;
  diceTrayConfig: { isOpen: boolean; onRollComplete?: (result: number) => void; initialDc?: number; initialAttr?: string } | null;
  sendGuildMessage: (guildId: string, content: string) => Promise<void>;
  guildMessages: Record<string, GuildMessage[]>;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) throw new Error("useCharacter must be used within a CharacterProvider");
  return context;
};

const automateCalculations = (char: Character): Character => {
  const levelData = getLevelFromXP(char.xp || 0);
  const level = levelData.level;
  const conScore = getAttr(char.attributes, 'con');
  const conMod = calculateModifier(conScore);
  const classData = CLASSES[char.charClass as keyof typeof CLASSES];
  const maxHP = (classData?.hitDie || 8) + conMod + (level - 1) * (Math.floor((classData?.hitDie || 8) / 2) + 1 + conMod);
  
  // Determine spellcasting type and slots
  let spellcastingType: 'Prepared' | 'Known' | 'Spellbook' | undefined = char.spellcasting?.type;
  let slotsCategory: string | null = null;

  if (char.charClass) {
    const className = char.charClass.toLowerCase();
    if (['clérigo', 'druida', 'paladino', 'cleric', 'druid', 'paladin'].includes(className)) {
      spellcastingType = spellcastingType || 'Prepared';
      slotsCategory = ['paladino', 'paladin'].includes(className) ? 'HalfCaster' : 'FullCaster';
    } else if (['bardo', 'feiticeiro', 'bruxo', 'ranger', 'bard', 'sorcerer', 'warlock'].includes(className)) {
      spellcastingType = spellcastingType || 'Known';
      slotsCategory = ['ranger', 'patrulheiro'].includes(className) ? 'HalfCaster' : (['bruxo', 'warlock'].includes(className) ? 'Warlock' : 'FullCaster');
    } else if (['mago', 'wizard'].includes(className)) {
      spellcastingType = spellcastingType || 'Spellbook';
      slotsCategory = 'FullCaster';
    }
  }

  // Calculate slots
  const calculatedSlots: Record<string, { current: number; max: number }> = {};
  if (slotsCategory && SPELL_SLOTS_TABLE[slotsCategory]) {
    const levelSlots = SPELL_SLOTS_TABLE[slotsCategory][level] || {};
    Object.entries(levelSlots).forEach(([circle, max]) => {
      const current = Math.min(char.spellcasting?.slots?.[circle]?.current ?? max, max);
      calculatedSlots[circle] = { current, max };
    });
  }

  const spellcasting = char.spellcasting ? {
    ...char.spellcasting,
    spells: char.spellcasting?.spells || [],
    type: spellcastingType,
    slots: calculatedSlots
  } : (spellcastingType ? {
    ability: classData?.primaryAbility || 'Charisma',
    saveDC: 8 + (levelData.proficiency || 2) + calculateModifier(getAttr(char.attributes, (classData?.primaryAbility || 'cha').toLowerCase().slice(0, 3))),
    attackBonus: (levelData.proficiency || 2) + calculateModifier(getAttr(char.attributes, (classData?.primaryAbility || 'cha').toLowerCase().slice(0, 3))),
    slots: calculatedSlots,
    prepared: char.spellcasting?.prepared || [],
    spells: char.spellcasting?.spells || [],
    type: spellcastingType
  } : undefined);
  
  const raceData = RACES[char.race as keyof typeof RACES];
  const speed = char.speed || (raceData as any)?.speed || 30;
  const languages = char.languages || (raceData as any)?.languages || ["Comum"];

  return {
    ...char,
    level,
    proficiencyBonus: levelData.proficiency,
    hp: { 
      current: Math.min(char.hp?.current ?? maxHP, maxHP), 
      max: maxHP 
    },
    ac: calculateAC(char),
    initiative: calculateInitiative(char),
    passivePerception: calculatePassivePerception(char),
    speed,
    languages,
    spellcasting
  };
};

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [campaignCharacters, setCampaignCharacters] = useState<Character[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
  const [userCampaigns, setUserCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(localStorage.getItem('selectedCampaignId'));
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [guildMessages, setGuildMessages] = useState<Record<string, GuildMessage[]>>({});
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [monsterNotes, setMonsterNotes] = useState<MonsterNote[]>([]);
  const [scrolls, setScrolls] = useState<Scroll[]>([]);
  const [diceTrayConfig, setDiceTrayConfig] = useState<{ isOpen: boolean; onRollComplete?: (result: number) => void; initialDc?: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const openDiceTray = (config: { onRollComplete?: (result: number) => void; initialDc?: number; initialAttr?: string }) => {
    setDiceTrayConfig({ ...config, isOpen: true });
  };

  const closeDiceTray = () => {
    setDiceTrayConfig(null);
  };
  useEffect(() => {
    if (!user || guilds.length === 0) {
      setGuildMessages({});
      return;
    }

    const unsubscribes = guilds.map(guild => {
      const q = query(
        collection(db, "guilds", guild.id, "messages"),
        orderBy("createdAt", "asc"),
        limit(100)
      );

      return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as GuildMessage));
        
        setGuildMessages(prev => ({
          ...prev,
          [guild.id]: messages
        }));
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [user, guilds]);

  const sendGuildMessage = async (guildId: string, content: string) => {
    if (!user || !currentCharacter) return;

    try {
      await addDoc(collection(db, "guilds", guildId, "messages"), {
        guildId,
        senderId: user.uid,
        senderName: currentCharacter.name,
        senderCharId: currentCharacter.id,
        content,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `guilds/${guildId}/messages`);
    }
  };

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setCharacters([]);
        setCurrentCharacter(null);
        setCurrentCampaign(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "characters"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chars = snapshot.docs
        .filter(doc => !doc.data().deleted)
        .map(doc => {
          const data = doc.data();
          return automateCalculations({ id: doc.id, userId: user.uid, ...data } as Character);
        });
      setCharacters(chars);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/characters`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUserCampaigns([]);
      return;
    }
    const q = query(
      collection(db, "campaigns"), 
      or(where("players", "array-contains", user.uid), where("dmId", "==", user.uid))
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const campaigns = snapshot.docs
        .filter(doc => !doc.data().deleted)
        .map(doc => ({ id: doc.id, ...doc.data() } as Campaign));
      setUserCampaigns(campaigns);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "campaigns");
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (selectedCampaignId) {
      const found = userCampaigns.find(c => c.id === selectedCampaignId);
      if (found) {
        setCurrentCampaign(found);
      } else if (userCampaigns.length > 0 && (!currentCampaign || currentCampaign.id !== selectedCampaignId)) {
        // Only clear if we have a list and the selected ID is truly missing 
        // AND we don't have a matching campaign set manually (e.g. just joined)
        setCurrentCampaign(null);
        setSelectedCampaignId(null);
        localStorage.removeItem('selectedCampaignId');
      }
    } else {
      setCurrentCampaign(null);
    }
  }, [selectedCampaignId, userCampaigns]);

  // Keep currentCampaign in sync with the userCampaigns array
  useEffect(() => {
    if (currentCampaign && userCampaigns.length > 0) {
      const updated = userCampaigns.find(c => c.id === currentCampaign.id);
      if (updated && updated !== currentCampaign) {
        setCurrentCampaign(updated);
      }
    }
  }, [userCampaigns, currentCampaign?.id]);

  useEffect(() => {
    if (loading || !user) return;

    const savedId = localStorage.getItem('selectedCharacterId');
    const savedUserId = localStorage.getItem('selectedCharacterUserId');

    if (!savedId) return;

    // If it's one of our own characters, it's already in 'characters' state
    const found = characters.find(c => c.id === savedId);
    if (found) {
      setCurrentCharacter(found);
      return;
    }

    // If it's an external character, fetch it
    if (savedUserId && savedUserId !== user.uid) {
      const fetchExternal = async () => {
        try {
          const charRef = doc(db, "users", savedUserId, "characters", savedId);
          const charSnap = await getDoc(charRef);
          if (charSnap.exists()) {
            const otherChar = automateCalculations({ 
              id: charSnap.id, 
              userId: savedUserId, 
              ...charSnap.data() 
            } as Character);
            setCurrentCharacter(otherChar);
          }
        } catch (e) {
          console.error("Error loading external character on init:", e);
        }
      };
      fetchExternal();
    }
  }, [loading, user, characters]);

  // Keep currentCharacter in sync with the characters array
  useEffect(() => {
    if (currentCharacter && characters.length > 0) {
      const updated = characters.find(c => c.id === currentCharacter.id);
      if (updated && updated !== currentCharacter) {
        setCurrentCharacter(updated);
      }
    }
  }, [characters, currentCharacter?.id]);

  useEffect(() => {
    if (!user) {
      setAllCharacters([]);
      return;
    }

    const unsubChars = onSnapshot(collectionGroup(db, "characters"), (snapshot) => {
      const allChars = snapshot.docs
        .filter(doc => !doc.data().deleted)
        .map(doc => {
          const data = doc.data();
          const pathSegments = doc.ref.path.split('/');
          // Path is users/{userId}/characters/{charId}
          // segments: ["users", "{userId}", "characters", "{charId}"]
          const userId = pathSegments[1] || "";
          return automateCalculations({ id: doc.id, userId, ...data } as Character);
        });
      setAllCharacters(allChars);
    }, (err) => {
      console.warn("CollectionGroup 'characters' access restricted or index missing:", err.message);
      // We don't call handleFirestoreError here to avoid showing a blocking toast for a background feature
      setAllCharacters([]);
    });

    return () => unsubChars();
  }, [user]);

  useEffect(() => {
    if (!currentCampaign) {
      setCampaignCharacters([]);
      setNpcs([]);
      return;
    }

    const characterRefs = currentCampaign.characterRefs || [];
    const filtered = allCharacters.filter(c => 
      characterRefs.some(ref => ref.charId === c.id)
    );
    setCampaignCharacters(filtered);

    const unsubNpcs = onSnapshot(collection(db, "campaigns", currentCampaign.id, "npcs"), (snapshot) => {
      setNpcs(snapshot.docs.filter(d => !d.data().deleted).map(doc => ({ id: doc.id, ...doc.data() } as NPC)));
    }, (err) => {
      if (auth.currentUser) {
        handleFirestoreError(err, OperationType.LIST, `campaigns/${currentCampaign.id}/npcs`);
      }
    });

    const unsubNotes = onSnapshot(collection(db, "campaigns", currentCampaign.id, "monsterNotes"), (snapshot) => {
      setMonsterNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MonsterNote)));
    }, (err) => {
      if (auth.currentUser) {
        handleFirestoreError(err, OperationType.LIST, `campaigns/${currentCampaign.id}/monsterNotes`);
      }
    });

    const unsubScrolls = onSnapshot(collection(db, "campaigns", currentCampaign.id, "scrolls"), (snapshot) => {
      setScrolls(snapshot.docs
        .filter(doc => !doc.data().deleted)
        .map(doc => ({ id: doc.id, ...doc.data() } as Scroll)));
    }, (err) => {
      if (auth.currentUser) {
        handleFirestoreError(err, OperationType.LIST, `campaigns/${currentCampaign.id}/scrolls`);
      }
    });

    return () => {
      unsubNpcs();
      unsubNotes();
      unsubScrolls();
    };
  }, [currentCampaign?.id, allCharacters]);

  useEffect(() => {
    if (!currentCharacter) {
      setFriendships([]);
      return;
    }
    const q = query(collection(db, "friendships"), where("charIds", "array-contains", currentCharacter.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFriendships(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Friendship)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "friendships");
    });
    return () => unsubscribe();
  }, [currentCharacter?.id]);

  useEffect(() => {
    if (!user) {
      setGuilds([]);
      return;
    }
    const q = query(collection(db, "guilds"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGuilds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Guild)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "guilds");
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!currentCharacter && allCharacters.length > 0) {
      const savedId = localStorage.getItem('selectedCharacterId');
      if (savedId) {
        const found = allCharacters.find(c => c.id === savedId);
        if (found) setCurrentCharacter(found);
      }
    }
  }, [allCharacters, currentCharacter]);

  const saveCharacter = async (updates: Partial<Character>) => {
    if (!user || !currentCharacter) return;
    try {
      const charRef = doc(db, "users", user.uid, "characters", currentCharacter.id);
      const updatedChar = automateCalculations({ ...currentCharacter, ...updates } as Character);
      
      // Optimistic update
      setCurrentCharacter(updatedChar);
      setCharacters(prev => prev.map(c => c.id === updatedChar.id ? updatedChar : c));
      setAllCharacters(prev => prev.map(c => c.id === updatedChar.id ? updatedChar : c));

      const { id, ...dataToSave } = updatedChar;
      const cleanUpdates = sanitizeData({ ...dataToSave, updatedAt: new Date() });
      await updateDoc(charRef, cleanUpdates);
      
      if (updates.xp !== undefined) {
        toast.success(`XP Atualizado!`, {
          description: `Você agora tem ${updatedChar.xp} XP.`
        });
      } else if (updates.gold !== undefined) {
        toast.success(`Ouro Atualizado!`, {
          description: `Total: ${updatedChar.gold} PO.`
        });
      } else if (updates.inventory !== undefined) {
        toast.success(`Inventário Atualizado!`);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/characters/${currentCharacter.id}`);
    }
  };

  const createCharacter = async (charData: Partial<Character>) => {
    if (!user) throw new Error("User not authenticated");
    try {
      const charRef = collection(db, "users", user.uid, "characters");
      const baseChar: Character = {
        id: "",
        userId: user.uid,
        name: charData.name || "Unnamed Hero",
        race: charData.race || "Humano",
        charClass: charData.charClass || "Guerreiro",
        level: 1,
        xp: 0,
        hp: { current: 10, max: 10 },
        ac: 10,
        attributes: charData.attributes || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        skills: charData.skills || {},
        inventory: charData.inventory || [],
        gold: charData.gold || 0,
        spells: charData.spells || [],
        background: charData.background || "",
        alignment: charData.alignment || "N",
        updatedAt: new Date(),
        ...charData
      };
      
      const automatedChar = automateCalculations(baseChar);
      const { id, ...newCharData } = automatedChar;
      const docRef = await addDoc(charRef, sanitizeData({ ...newCharData, updatedAt: new Date() }));
      toast.success("Personagem criado com sucesso!", {
        description: `Bem-vindo à aventura, ${charData.name}!`
      });
      return docRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/characters`);
      return "";
    }
  };

  const loadCharacter = async (charId: string, userId?: string) => {
    if (!user) return;
    
    // Try to find in local lists first
    let found = characters.find(c => c.id === charId) || 
                campaignCharacters.find(c => c.id === charId) ||
                allCharacters.find(c => c.id === charId);
    
    const targetUserId = userId || (found?.userId);

    if (!found && targetUserId) {
      try {
        const charRef = doc(db, "users", targetUserId, "characters", charId);
        const charSnap = await getDoc(charRef);
        if (charSnap.exists()) {
          found = { id: charSnap.id, userId: targetUserId, ...charSnap.data() } as Character;
        }
      } catch (e) {
        console.error("Error fetching character for profile view:", e);
      }
    }

    if (found) {
      const automated = automateCalculations(found);
      setCurrentCharacter(automated);
      localStorage.setItem('selectedCharacterId', charId);
      if (targetUserId) {
        localStorage.setItem('selectedCharacterUserId', targetUserId);
      } else {
        localStorage.removeItem('selectedCharacterUserId');
      }
    }
  };

  const addXP = async (amount: number) => {
    if (!currentCharacter) return;
    const newXP = currentCharacter.xp + amount;
    await saveCharacter({ xp: newXP });
  };

  const deleteCharacter = async (charId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid, "characters", charId), sanitizeData({ deleted: true }));
      if (currentCharacter?.id === charId) {
        setCurrentCharacter(null);
        localStorage.removeItem('selectedCharacterId');
      }
      toast.success("Personagem deletado com sucesso!");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/characters/${charId}`);
    }
  };

  const distributeGroupXP = async (amount: number) => {
    if (!currentCampaign) return;
    try {
      for (const ref of currentCampaign.characterRefs) {
        if (!ref.userId) continue;
        const charRef = doc(db, "users", ref.userId, "characters", ref.charId);
        const charSnap = await getDoc(charRef);
        if (charSnap.exists()) {
          const charData = charSnap.data() as Character;
          await updateDoc(charRef, sanitizeData({ xp: (charData.xp || 0) + amount, updatedAt: new Date() }));
        }
      }
      toast.success(`XP Distribuído!`, {
        description: `${amount} XP para cada herói da campanha.`
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "group xp distribution");
    }
  };

  const distributeGroupGold = async (amount: number) => {
    if (!currentCampaign) return;
    try {
      for (const ref of currentCampaign.characterRefs) {
        if (!ref.userId) continue;
        const charRef = doc(db, "users", ref.userId, "characters", ref.charId);
        const charSnap = await getDoc(charRef);
        if (charSnap.exists()) {
          const charData = charSnap.data() as Character;
          await updateDoc(charRef, sanitizeData({ gold: (charData.gold || 0) + amount, updatedAt: new Date() }));
        }
      }
      toast.success(`Ouro Distribuído!`, {
        description: `${amount} PO para cada herói.`
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "group gold distribution");
    }
  };

  const groupRest = async (type: 'short' | 'long') => {
    if (!currentCampaign) return;
    try {
      for (const ref of currentCampaign.characterRefs) {
        if (!ref.userId) continue;
        const charRef = doc(db, "users", ref.userId, "characters", ref.charId);
        const charSnap = await getDoc(charRef);
        if (charSnap.exists()) {
          const charData = charSnap.data() as Character;
          const automated = automateCalculations(charData);
          
          let updates: any = { updatedAt: new Date() };
          
          if (type === 'long') {
            updates['hp.current'] = automated.hp.max;
            if (automated.spellcasting?.slots) {
              const recoveredSlots = { ...automated.spellcasting.slots };
              Object.keys(recoveredSlots).forEach(circle => {
                if (recoveredSlots[circle]) {
                  recoveredSlots[circle].current = recoveredSlots[circle].max;
                }
              });
              updates['spellcasting.slots'] = recoveredSlots;
            }
          } else {
            updates['hp.current'] = Math.min(automated.hp.max, (charData.hp?.current || 0) + 10);
          }
          
          await updateDoc(charRef, sanitizeData(updates));
        }
      }
      toast.success(type === 'long' ? "Descanso Longo Concluído!" : "Descanso Curto Concluído!", {
        description: type === 'long' ? "HP e espaços de magia recuperados para todo o grupo." : "HP parcialmente recuperado."
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "group rest");
    }
  };

  const longRest = async () => {
    if (!currentCharacter) return;
    try {
      const automated = automateCalculations(currentCharacter);
      const updates: any = {
        'hp.current': automated.hp.max,
        updatedAt: new Date()
      };

      if (automated.spellcasting?.slots) {
        const recoveredSlots = { ...automated.spellcasting.slots };
        Object.keys(recoveredSlots).forEach(circle => {
          if (recoveredSlots[circle]) {
            recoveredSlots[circle].current = recoveredSlots[circle].max;
          }
        });
        updates['spellcasting.slots'] = recoveredSlots;
      }

      await saveCharacter(updates);
      toast.success("Descanso Longo Concluído!", {
        description: "Seu HP e espaços de magia foram totalmente recuperados."
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user?.uid}/characters/${currentCharacter.id}`);
    }
  };

  const rollAttributes = () => {
    const roll = () => {
      const dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      return dice.sort((a, b) => b - a).slice(0, 3).reduce((a, b) => a + b, 0);
    };
    return { str: roll(), dex: roll(), con: roll(), int: roll(), wis: roll(), cha: roll() };
  };

  const rollStartingGold = (charClass: string) => {
    const rolls = charClass === 'Fighter' || charClass === 'Paladin' || charClass === 'Ranger' ? 5 : 4;
    return Array.from({ length: rolls }, () => Math.floor(Math.random() * 4) + 1).reduce((a, b) => a + b, 0) * 10;
  };

  const giveItemToCharacter = async (charId: string, item: any) => {
    try {
      if (!charId) throw new Error("Character ID is missing");
      if (!item) throw new Error("Item data is missing");

      const character = campaignCharacters.find(c => c.id === charId) || characters.find(c => c.id === charId);
      if (!character) throw new Error(`Character not found in current context (ID: ${charId})`);
      
      // CRITICAL: Ensure userId is a non-empty string
      const userId = character.userId;
      if (!userId || typeof userId !== 'string' || userId.trim() === "") {
        console.error("Invalid userId for character:", character);
        throw new Error(`Character userId is invalid or missing for character ${charId}. Character data: ${JSON.stringify(character)}`);
      }
      
      const charRef = doc(db, "users", userId, "characters", charId);
      const itemId = item?.id || Math.random().toString(36).substring(2, 9);
      
      const newItem = { 
        ...item, 
        id: `${itemId}-${Date.now()}`, 
        acquiredAt: new Date() 
      };

      // Optimistic update
      const updatedInventory = [...(character.inventory || []), newItem];
      if (currentCharacter?.id === charId) {
        setCurrentCharacter({ ...currentCharacter, inventory: updatedInventory });
      }
      setCharacters(prev => prev.map(c => c.id === charId ? { ...c, inventory: updatedInventory } : c));
      setAllCharacters(prev => prev.map(c => c.id === charId ? { ...c, inventory: updatedInventory } : c));

      // Sanitize the entire update object
      const updateData = sanitizeData({
        inventory: updatedInventory,
        updatedAt: new Date()
      });

      if (!updateData) throw new Error("Sanitized update data is empty or invalid");

      await updateDoc(charRef, updateData);
      toast.success(`Item Enviado!`, {
        description: `${item.name} foi adicionado ao inventário de ${character.name}.`
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `give item to ${charId}`);
    }
  };

  const addXPToCharacter = async (charId: string, amount: number) => {
    if (isNaN(amount)) return;
    try {
      const character = campaignCharacters.find(c => c.id === charId) || characters.find(c => c.id === charId);
      if (!character) throw new Error("Character not found in current context");
      if (!character.userId) throw new Error("Character userId is missing");

      const newXP = (character.xp || 0) + amount;
      
      // Optimistic update
      if (currentCharacter?.id === charId) {
        setCurrentCharacter(automateCalculations({ ...currentCharacter, xp: newXP }));
      }
      setCharacters(prev => prev.map(c => c.id === charId ? automateCalculations({ ...c, xp: newXP }) : c));
      setAllCharacters(prev => prev.map(c => c.id === charId ? automateCalculations({ ...c, xp: newXP }) : c));

      const charRef = doc(db, "users", character.userId, "characters", charId);
      await updateDoc(charRef, sanitizeData({ xp: newXP, updatedAt: new Date() }));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `add xp to ${charId}`);
    }
  };

  const addGoldToCharacter = async (charId: string, amount: number) => {
    if (isNaN(amount)) return;
    try {
      const character = campaignCharacters.find(c => c.id === charId) || characters.find(c => c.id === charId);
      if (!character) throw new Error("Character not found in current context");
      if (!character.userId) throw new Error("Character userId is missing");

      const newGold = (character.gold || 0) + amount;

      // Optimistic update
      if (currentCharacter?.id === charId) {
        setCurrentCharacter({ ...currentCharacter, gold: newGold });
      }
      setCharacters(prev => prev.map(c => c.id === charId ? { ...c, gold: newGold } : c));
      setAllCharacters(prev => prev.map(c => c.id === charId ? { ...c, gold: newGold } : c));

      const charRef = doc(db, "users", character.userId, "characters", charId);
      await updateDoc(charRef, sanitizeData({ gold: newGold, updatedAt: new Date() }));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `add gold to ${charId}`);
    }
  };

  const selectCampaign = (campaign: Campaign | null) => {
    setCurrentCampaign(campaign);
    if (campaign) {
      setSelectedCampaignId(campaign.id);
      localStorage.setItem('selectedCampaignId', campaign.id);
    } else {
      setSelectedCampaignId(null);
      localStorage.removeItem('selectedCampaignId');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('selectedCharacterId');
      localStorage.removeItem('selectedCampaignId');
      setCurrentCharacter(null);
      setCharacters([]);
      setCurrentCampaign(null);
      setSelectedCampaignId(null);
      setCampaignCharacters([]);
    } catch (err) {
      console.error("Erro ao sair:", err);
    }
  };

  const createCampaign = async (name: string) => {
    if (!user) return "";
    try {
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const characterRefs = currentCharacter ? [{ userId: user.uid, charId: currentCharacter.id }] : [];
      const newCampaign = sanitizeData({
        name,
        dmId: user.uid,
        inviteCode,
        players: [user.uid],
        characterRefs,
        createdAt: new Date()
      });
      const docRef = await addDoc(collection(db, "campaigns"), newCampaign);
      
      // Set as current campaign
      selectCampaign({ id: docRef.id, ...newCampaign } as Campaign);
      
      return inviteCode;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "campaigns");
      return "";
    }
  };

  const joinCampaign = async (inviteCode: string, charId: string) => {
    if (!user) return false;
    try {
      const q = query(collection(db, "campaigns"), where("inviteCode", "==", inviteCode));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const campaignDoc = querySnapshot.docs[0];
        const campaignData = campaignDoc.data() as Campaign;
        
        const currentPlayers = campaignData.players || [];
        const players = currentPlayers.includes(user.uid) 
          ? currentPlayers 
          : [...currentPlayers, user.uid];
          
        const currentRefs = campaignData.characterRefs || [];
        const characterRefs = currentRefs.some(ref => ref.userId === user.uid)
          ? currentRefs.map(ref => ref.userId === user.uid ? { userId: user.uid, charId } : ref)
          : [...currentRefs, { userId: user.uid, charId }];

        await updateDoc(campaignDoc.ref, sanitizeData({
          players,
          characterRefs
        }));
        
        // Set as current campaign
        selectCampaign({ id: campaignDoc.id, ...campaignData, players, characterRefs });
        return true;
      }
      return false;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "campaigns (join)");
      return false;
    }
  };

  const sendFriendRequest = async (toCharId: string) => {
    if (!currentCharacter) return;
    try {
      await addDoc(collection(db, "friendships"), {
        charIds: [currentCharacter.id, toCharId],
        status: 'pending',
        createdAt: new Date()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "friendships");
    }
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    try {
      await updateDoc(doc(db, "friendships", friendshipId), sanitizeData({ status: 'accepted' }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `friendships/${friendshipId}`);
    }
  };

  const createGuild = async (name: string) => {
    console.log("Iniciando criação de guilda:", name);
    if (!currentCharacter || !user) {
      console.error("Erro: Personagem ou Usuário não encontrado", { currentCharacter, user });
      return;
    }
    try {
      const guildData = sanitizeData({
        name,
        leaderId: currentCharacter.id,
        memberRefs: [{ userId: user.uid, charId: currentCharacter.id, rank: 'Líder' }],
        level: 1,
        reputation: 0,
        specialization: 'Equilibrada',
        resources: {
          gold: 0,
          items: [],
          base: 'Acampamento Inicial'
        },
        economy: {
          vault: 0,
          taxRate: 0.1,
          investments: []
        },
        dailyQuests: [
          { id: 'q1', title: 'Explorar Arredores', type: 'Explorar', status: 'available', reward: 100 },
          { id: 'q2', title: 'Caçar Ameaça Local', type: 'Caçar Boss', status: 'available', reward: 250 }
        ],
        notes: [],
        createdAt: new Date()
      });
      const docRef = await addDoc(collection(db, "guilds"), guildData);
      await saveCharacter({ guildId: docRef.id });
      toast.success("Guilda Criada!", {
        description: `O legado de ${name} começou!`
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "guilds");
    }
  };

  const joinGuild = async (guildId: string) => {
    if (!currentCharacter || !user) return;
    try {
      const guildRef = doc(db, "guilds", guildId);
      const guildSnap = await getDoc(guildRef);
      if (!guildSnap.exists()) return;
      
      const guildData = guildSnap.data() as Guild;
      if (guildData.memberRefs.some(m => m.charId === currentCharacter.id)) return;

      await updateDoc(guildRef, sanitizeData({
        memberRefs: arrayUnion({ userId: user.uid, charId: currentCharacter.id, rank: 'Recruta' })
      }));
      await saveCharacter({ guildId });
      toast.success("Bem-vindo à Guilda!", {
        description: `Você agora faz parte de ${guildData.name}.`
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `guilds/${guildId}`);
    }
  };

  const leaveGuild = async (guildId: string) => {
    if (!currentCharacter || !user) return;
    try {
      const guildRef = doc(db, "guilds", guildId);
      const guildSnap = await getDoc(guildRef);
      if (!guildSnap.exists()) return;

      const guildData = guildSnap.data() as Guild;
      const newMembers = guildData.memberRefs.filter(m => m.charId !== currentCharacter.id);

      await updateDoc(guildRef, sanitizeData({
        memberRefs: newMembers
      }));
      
      // Use deleteField to remove the guildId from character
      const charRef = doc(db, "users", user.uid, "characters", currentCharacter.id);
      await updateDoc(charRef, sanitizeData({
        guildId: deleteField()
      }));

      toast.success("Você saiu da guilda", {
        description: `Você não faz mais parte de ${guildData.name}.`
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `guilds/${guildId}`);
    }
  };

  const updateGuildRank = async (guildId: string, charId: string, newRank: Guild['memberRefs'][0]['rank']) => {
    const guild = guilds.find(g => g.id === guildId);
    if (!guild) return;
    try {
      const newMembers = guild.memberRefs.map(m => 
        m.charId === charId ? { ...m, rank: newRank } : m
      );
      await updateDoc(doc(db, "guilds", guildId), sanitizeData({ memberRefs: newMembers }));
      toast.success("Rank Atualizado!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `guilds/${guildId}`);
    }
  };

  const depositToGuildVault = async (guildId: string, amount: number) => {
    if (!currentCharacter || currentCharacter.gold < amount) {
      toast.error("Ouro insuficiente!");
      return;
    }
    try {
      const guildRef = doc(db, "guilds", guildId);
      const guild = guilds.find(g => g.id === guildId);
      if (!guild) return;

      await saveCharacter({ gold: currentCharacter.gold - amount });
      await updateDoc(guildRef, sanitizeData({ 'economy.vault': (guild.economy?.vault || 0) + amount }));
      toast.success(`Depositado ${amount} PO no cofre da guilda.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `guilds/${guildId}`);
    }
  };

  const withdrawFromGuildVault = async (guildId: string, amount: number) => {
    const guild = guilds.find(g => g.id === guildId);
    if (!guild || (guild.economy?.vault || 0) < amount) {
      toast.error("Cofre insuficiente!");
      return;
    }
    try {
      await saveCharacter({ gold: (currentCharacter?.gold || 0) + amount });
      await updateDoc(doc(db, "guilds", guildId), sanitizeData({ 'economy.vault': guild.economy.vault - amount }));
      toast.success(`Retirado ${amount} PO do cofre da guilda.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `guilds/${guildId}`);
    }
  };

  const addGuildNote = async (guildId: string, note: string) => {
    try {
      await updateDoc(doc(db, "guilds", guildId), sanitizeData({
        notes: arrayUnion(note)
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `guilds/${guildId}`);
    }
  };

  const getAICombos = async (friendChar: Character) => {
    if (!currentCharacter) return "Selecione um personagem primeiro.";
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analise as fichas de dois personagens de D&D 5e e sugira 3 combos estratégicos em dupla.
        Personagem 1: ${currentCharacter.name}, Classe: ${currentCharacter.charClass}, Raça: ${currentCharacter.race}, Nível: ${currentCharacter.level}.
        Personagem 2: ${friendChar.name}, Classe: ${friendChar.charClass}, Raça: ${friendChar.race}, Nível: ${friendChar.level}.
        As sugestões devem ser curtas e focadas em sinergia de combate.`,
      });
      return response.text;
    } catch (err) {
      console.error("Erro ao obter combos da IA:", err);
      return "Não foi possível obter sugestões da IA no momento.";
    }
  };

  const createScroll = async (name: string, campaignId: string, authorIds: string[]) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "campaigns", campaignId, "scrolls"), sanitizeData({
        name,
        content: "",
        campaignId,
        authorIds,
        lastEditedBy: user.uid,
        updatedAt: new Date(),
        style: {
          fontSize: '18px',
          fontFamily: 'serif',
          textAlign: 'left'
        }
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `campaigns/${campaignId}/scrolls`);
    }
  };

  const updateScroll = async (scrollId: string, content: string, links?: string[], style?: Scroll['style']) => {
    if (!user || !currentCampaign) return;
    try {
      await updateDoc(doc(db, "campaigns", currentCampaign.id, "scrolls", scrollId), sanitizeData({
        content,
        links: links || [],
        style: style || {},
        lastEditedBy: user.uid,
        updatedAt: new Date()
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}/scrolls/${scrollId}`);
    }
  };

  const deleteScroll = async (scrollId: string) => {
    if (!user || !currentCampaign) return;
    try {
      await updateDoc(doc(db, "campaigns", currentCampaign.id, "scrolls", scrollId), sanitizeData({ deleted: true }));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `campaigns/${currentCampaign.id}/scrolls/${scrollId}`);
    }
  };

  const tradeItem = async (toCharId: string, itemId: string) => {
    if (!currentCharacter) return;
    try {
      const itemToTrade = currentCharacter.inventory.find(i => i.id === itemId);
      if (!itemToTrade) return;

      const newInventory = currentCharacter.inventory.filter(i => i.id !== itemId);
      await saveCharacter({ inventory: newInventory });

      const targetChar = campaignCharacters.find(c => c.id === toCharId) || 
                         characters.find(c => c.id === toCharId);
      
      if (targetChar) {
        const charRef = doc(db, "users", targetChar.userId, "characters", toCharId);
        const targetNewInventory = [...(targetChar.inventory || []), itemToTrade];
        
        // Optimistic update for target
        setCharacters(prev => prev.map(c => c.id === toCharId ? { ...c, inventory: targetNewInventory } : c));
        setAllCharacters(prev => prev.map(c => c.id === toCharId ? { ...c, inventory: targetNewInventory } : c));

        await updateDoc(charRef, sanitizeData({
          inventory: targetNewInventory,
          updatedAt: new Date()
        }));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "trade item");
    }
  };

  const updateUserProfile = async (displayName: string) => {
    if (!auth.currentUser) return;
    try {
      await updateProfile(auth.currentUser, { displayName });
      setUser({ ...auth.currentUser, displayName });
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
    }
  };

  const createNPC = async (npcData: Partial<NPC>) => {
    if (!currentCampaign?.id) return;
    try {
      await addDoc(collection(db, "campaigns", currentCampaign.id, "npcs"), sanitizeData({
        ...npcData,
        campaignId: currentCampaign.id,
        createdAt: new Date()
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `campaigns/${currentCampaign.id}/npcs`);
    }
  };

  const updateNPC = async (npcId: string, updates: Partial<NPC>) => {
    if (!currentCampaign?.id) return;
    try {
      // Optimistic update
      setNpcs(prev => prev.map(n => n.id === npcId ? { ...n, ...updates } : n));
      
      await updateDoc(doc(db, "campaigns", currentCampaign.id, "npcs", npcId), sanitizeData(updates));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}/npcs/${npcId}`);
    }
  };

  const deleteNPC = async (npcId: string) => {
    if (!currentCampaign?.id) return;
    try {
      await setDoc(doc(db, "campaigns", currentCampaign.id, "npcs", npcId), { deleted: true }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `campaigns/${currentCampaign.id}/npcs/${npcId}`);
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    if (!user) return;
    try {
      // We'll mark as deleted to preserve history if needed, or just delete
      await updateDoc(doc(db, "campaigns", campaignId), sanitizeData({ deleted: true, updatedAt: new Date() }));
      if (currentCampaign?.id === campaignId) {
        selectCampaign(null);
      }
      toast.success("Campanha excluída com sucesso.");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `campaigns/${campaignId}`);
    }
  };

  const leaveCampaign = async (campaignId: string) => {
    if (!user) return;
    try {
      const campaignRef = doc(db, "campaigns", campaignId);
      const campaignSnap = await getDoc(campaignRef);
      if (!campaignSnap.exists()) return;
      
      const data = campaignSnap.data() as Campaign;
      const players = (data.players || []).filter(id => id !== user.uid);
      const characterRefs = (data.characterRefs || []).filter(ref => ref.userId !== user.uid);
      
      await updateDoc(campaignRef, sanitizeData({
        players,
        characterRefs,
        updatedAt: new Date()
      }));
      toast.success("Você saiu da campanha.");
      if (currentCampaign?.id === campaignId) {
        selectCampaign(null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${campaignId} (leave)`);
    }
  };

  const saveFormation = async (formation: Record<string, { x: number; y: number; role: string }>) => {
    if (!currentCampaign?.id) return;
    try {
      await updateDoc(doc(db, "campaigns", currentCampaign.id), {
        formation: sanitizeData(formation),
        updatedAt: new Date()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const unlockMonster = async (monsterId: string) => {
    if (!currentCampaign?.id || !user) return;
    if (currentCampaign.dmId !== user.uid) {
      console.error("Only the DM can unlock monsters.");
      return;
    }
    try {
      const currentUnlocked = currentCampaign.bestiary?.unlockedMonsters || [];
      if (!currentUnlocked.includes(monsterId)) {
        await updateDoc(doc(db, "campaigns", currentCampaign.id), sanitizeData({
          'bestiary.unlockedMonsters': [...currentUnlocked, monsterId],
          updatedAt: new Date()
        }));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}/bestiary`);
    }
  };

  const lockMonster = async (monsterId: string) => {
    if (!currentCampaign?.id || !user) return;
    if (currentCampaign.dmId !== user.uid) {
      console.error("Only the DM can lock monsters.");
      return;
    }
    try {
      const currentUnlocked = currentCampaign.bestiary?.unlockedMonsters || [];
      if (currentUnlocked.includes(monsterId)) {
        await updateDoc(doc(db, "campaigns", currentCampaign.id), sanitizeData({
          'bestiary.unlockedMonsters': currentUnlocked.filter(id => id !== monsterId),
          updatedAt: new Date()
        }));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}/bestiary`);
    }
  };

  const saveMonsterNote = async (monsterId: string, content: string) => {
    if (!currentCampaign?.id || !user) return;
    try {
      const notesRef = collection(db, "campaigns", currentCampaign.id, "monsterNotes");
      const q = query(
        notesRef,
        where("monsterId", "==", monsterId),
        where("authorId", "==", user.uid)
      );
      const snap = await getDocs(q);
      
      if (snap.empty) {
        await addDoc(notesRef, sanitizeData({
          monsterId,
          campaignId: currentCampaign.id,
          authorId: user.uid,
          content,
          updatedAt: new Date()
        }));
      } else {
        const noteDoc = snap.docs[0];
        await updateDoc(doc(db, "campaigns", currentCampaign.id, "monsterNotes", noteDoc.id), sanitizeData({
          content,
          updatedAt: new Date()
        }));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `campaigns/${currentCampaign.id}/monsterNotes`);
    }
  };

  const startGuideSelection = async () => {
    if (!currentCampaign?.id || !user) return;
    if (currentCampaign.dmId !== user.uid) return;
    
    try {
      const options = [
        {
          id: 'azaka',
          name: 'Azaka Stormfang',
          image: 'https://i.pinimg.com/1200x/03/ef/fa/03effa3962d309d85c754867948b42c5.jpg',
          description: 'Uma caçadora jovem e experiente, com postura firme e olhar atento. Seu corpo traz cicatrizes antigas, e ela observa a selva como um predador. Extremamente competente.',
          bonus: 'Bônus em Sobrevivência e conhecimento da selva profunda.'
        },
        {
          id: 'river_flask',
          name: 'River Mist & Flask of Wine',
          image: 'https://i.pinimg.com/736x/48/ae/da/48aeda6614b8be22374461e865d50001.jpg',
          description: 'Dois companheiros completamente diferentes. River Mist é curiosa e inquieta. Flask of Wine é mais lento, filosófico. Energia caótica, mas divertida.',
          bonus: 'Bônus em Exploração urbana e contatos em Porto Nyanzaru.'
        },
        {
          id: 'shago',
          name: 'Shago',
          image: 'https://i.pinimg.com/736x/bf/fb/7f/bffb7fc80fcc3799e86b758ce4f35672.jpg',
          description: 'Um guerreiro alto, silencioso e disciplinado. Mantém postura firme e fala apenas quando necessário. Parece mais um soldado do que um explorador.',
          bonus: 'Bônus em Combate e intimidação de feras.'
        },
        {
          id: 'qawasha',
          name: 'Qawasha & Kupalué',
          image: 'https://i.pinimg.com/1200x/79/f2/64/79f264839dbba578feb9bea4d5823b74.jpg',
          description: 'Qawasha é um frogfolk tranquilo, com voz calma e uma forma quase espiritual de falar sobre a selva. Ao lado dele, Kupalué, uma criatura vegetal.',
          bonus: 'Bônus contra Mortos-Vivos e conhecimento botânico.'
        }
      ];

      const votingId = Math.random().toString(36).substring(7);
      const notification = {
        id: Math.random().toString(36).substring(7),
        type: 'voting' as const,
        message: 'O Mestre iniciou a escolha do Guia da Campanha!',
        timestamp: Date.now(),
        data: { votingId }
      };

      await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
        activeVoting: {
          id: votingId,
          type: 'guide_selection',
          title: 'Escolha seu Guia',
          options,
          votes: {},
          status: 'open',
          createdAt: Date.now()
        },
        notifications: arrayUnion(notification)
      }));
      toast.success("Votação iniciada!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const submitVote = async (votingId: string, optionId: string) => {
    if (!currentCampaign?.id || !user || currentCampaign.activeVoting?.id !== votingId) return;
    try {
      await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
        [`activeVoting.votes.${user.uid}`]: optionId
      }));
      toast.success("Voto registrado!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const closeVoting = async () => {
    if (!currentCampaign?.id || !currentCampaign.activeVoting || !user) return;
    if (currentCampaign.dmId !== user.uid) return;

    try {
      const votes = currentCampaign.activeVoting.votes;
      const counts: Record<string, number> = {};
      Object.values(votes).forEach(optionId => {
        counts[optionId] = (counts[optionId] || 0) + 1;
      });

      let winnerId = '';
      let maxVotes = -1;
      Object.entries(counts).forEach(([id, count]) => {
        if (count > maxVotes) {
          maxVotes = count;
          winnerId = id;
        }
      });

      const winner = currentCampaign.activeVoting.options.find(o => o.id === winnerId);

      if (winner) {
        // Create NPC automatically
        const npcId = Math.random().toString(36).substring(7);
        const newNPC: NPC = {
          id: npcId,
          name: winner.name,
          race: winner.id === 'qawasha' ? 'Frogfolk' : 'Human',
          charClass: 'Guide',
          role: 'Guia Aliado',
          description: winner.description + '\n\nBônus: ' + winner.bonus,
          appearance: winner.image,
          campaignId: currentCampaign.id
        };

        await setDoc(doc(db, 'campaigns', currentCampaign.id, 'npcs', npcId), newNPC);

        const notification = {
          id: Math.random().toString(36).substring(7),
          type: 'info' as const,
          message: `Votação encerrada! O guia escolhido foi: ${winner.name}`,
          timestamp: Date.now()
        };

        await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
          'activeVoting.status': 'closed',
          notifications: arrayUnion(notification)
        }));
        toast.success(`Votação encerrada! ${winner.name} foi adicionado aos NPCs.`);
      } else {
        await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
          'activeVoting.status': 'closed'
        }));
        toast.info("Votação encerrada sem vencedor.");
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const clearNotifications = async () => {
    if (!currentCampaign?.id) return;
    try {
      await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
        notifications: []
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const startCombat = async (participants: any[]) => {
    if (!currentCampaign?.id) return;
    
    // Initialize Decks and Hands for all participants
    const initializedParticipants = participants.map(p => {
      let deck: CombatCard[] = [];
      let keywords: string[] = [];
      
      if (p.type === 'player') {
        // Base Class Cards + Common Cards
        deck = [
          ...(BASE_CARDS[p.charClass] || BASE_CARDS['Guerreiro']),
          ...COMMON_CARDS
        ];
        
        // Add Items from Inventory
        const char = allCharacters.find(c => c.id === p.id);
        
        // Racial Keywords
        if (char?.race) {
          const raceData = RACES[char.race as keyof typeof RACES];
          if (raceData?.traits) {
            raceData.traits.forEach(trait => {
              if (trait === 'Visão no Escuro') keywords.push('Visão no Escuro (18m)');
              else if (trait === 'Imunidade a Veneno') {
                keywords.push('Imune a Veneno');
                keywords.push('Imune a Envenenado');
              }
              else if (trait === 'Ancestralidade Feérica') keywords.push('Resistente a Enfeitiçado');
              else if (trait === 'Resistência Infernal') keywords.push('Resistente a Fogo');
              else if (trait === 'Resistência Anã') keywords.push('Resistente a Veneno');
              else keywords.push(trait);
            });
          }
        }

        if (char?.inventory) {
          char.inventory.forEach(item => {
            // If it's a consumable (Potion, Scroll), add as a card
            if (item.category === 'Potion' || item.category === 'Scroll') {
              const baseItemCard = CONSUMABLE_CARDS.find(c => c.name === item.name) || {
                id: `item-${item.id}`,
                name: item.name,
                type: 'action',
                category: 'consumable',
                range: 'Toque',
                effect: item.description,
                tags: ['Consumível', item.rarity],
                value: item.damage || '2d4',
                charges: 1,
                maxCharges: 1
              };
              deck.push({ ...baseItemCard, id: `item-${item.id}` });
            }
            // Magical Items (Uncommon or better) that are weapons or armor
            else if (item.rarity !== 'Common' && (item.category === 'Weapon' || item.category === 'Armor' || item.category === 'Wondrous Item')) {
              deck.push({
                id: `magic-item-${item.id}`,
                name: item.name,
                type: item.category === 'Weapon' ? 'action' : 'passive',
                category: 'item',
                range: item.category === 'Weapon' ? '5 ft' : 'Pessoal',
                effect: item.description,
                tags: ['Item Mágico', item.rarity, item.category],
                value: item.damage || (item.bonus ? `+${item.bonus}` : undefined),
                keywords: item.requiresAttunement ? ['Sintonizado'] : []
              });
            }
          });
        }

        // Add Spells from Spellbook (Grimório)
        const charSpells = char?.spellcasting?.prepared || char?.spells || [];
        charSpells.forEach(spellId => {
          const spellData = spells.find(s => s.id === spellId);
          if (spellData) {
            // Avoid duplicates if the class already has it
            if (!deck.some(c => c.name === spellData.name)) {
              deck.push({
                id: `spell-${spellData.id}`,
                name: spellData.name,
                type: spellData.castingTime.toLowerCase().includes('bônus') ? 'bonus' : 
                      spellData.castingTime.toLowerCase().includes('reação') ? 'reaction' : 'action',
                category: 'spell',
                range: spellData.range,
                cost: `Slot Nível ${spellData.level}`,
                effect: spellData.description,
                tags: ['Magia', spellData.school, spellData.level === 0 ? 'Truque' : `Nível ${spellData.level}`],
                value: spellData.description.match(/\d+d\d+/)?.[0] || '',
                damageType: spellData.school === 'Evocação' ? 'Fogo' : 'Magia'
              });
            }
          }
        });
        
        const conScore = char?.attributes ? getAttr(char.attributes, 'con') : 10;
        const mainAttrKey = (CLASSES[p.charClass as keyof typeof CLASSES]?.primaryAbility || 'Strength').toLowerCase().substring(0, 3);
        const mainAttrScore = char?.attributes ? getAttr(char.attributes, mainAttrKey) : 10;
        
        const maxStamina = 10 + calculateModifier(conScore);
        const maxMana = 10 + calculateModifier(mainAttrScore);

        return {
          ...p,
          charClass: p.charClass,
          spellcasting: char?.spellcasting,
          stamina: { current: maxStamina, max: maxStamina },
          mana: { current: maxMana, max: maxMana },
          deck,
          hand: deck.filter(c => c.type !== 'passive'),
          conditions: p.conditions || [],
          keywords
        };
      } else if (p.type === 'monster') {
        deck = MONSTER_CARDS[p.monsterType] || [];
        if (p.monsterType === 'goblin') keywords.push('Elusivo', 'Visão no Escuro (18m)');
        if (p.monsterType === 'skeleton') keywords.push('Resistente a Perfurante', 'Imune a Veneno', 'Imune a Envenenado', 'Imune a Exaustão', 'Vulnerável a Concussão');
        if (p.monsterType === 'owlbear') keywords.push('Amedrontador', 'Visão e Faro Aguçados');
        if (p.monsterType === 'ghost') keywords.push('Elusivo', 'Incorpóreo', 'Visão Etérea', 'Imune a Veneno', 'Imune a Envenenado', 'Imune a Exaustão', 'Imune a Paralisado', 'Imune a Petrificado', 'Imune a Inconsciente');
        
        return {
          ...p,
          stamina: { current: 10, max: 10 },
          mana: { current: 10, max: 10 },
          deck,
          hand: deck.filter(c => c.type !== 'passive'),
          conditions: p.conditions || [],
          keywords
        };
      }
      return {
        ...p,
        stamina: { current: 10, max: 10 },
        mana: { current: 10, max: 10 },
        deck,
        hand: deck.filter(c => c.type !== 'passive'), // Only actions/bonus/reactions in hand
        conditions: p.conditions || [],
        keywords
      };
    });

    try {
      await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
        combat: {
          active: true,
          phase: 'deck_selection',
          turn: 0,
          round: 1,
          order: initializedParticipants,
          initiatives: {},
          selectedActions: {},
          deckSelections: {},
          history: [{
            id: Math.random().toString(36).substr(2, 9),
            type: 'info',
            message: 'O combate começou! Fase de Seleção de Deck: Escolham suas 5 cartas adicionais.',
            timestamp: Date.now(),
            actorId: 'system'
          }]
        }
      }));
      toast.success("Combate Iniciado! Escolha suas 5 cartas adicionais.");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const finalizeDeckSelection = async (participantId: string, selectedPoolCardIds: string[]) => {
    if (!currentCampaign?.id || !currentCampaign.combat) return;
    
    const { order, deckSelections } = currentCampaign.combat;
    const updatedDeckSelections = { ...deckSelections, [participantId]: selectedPoolCardIds };
    
    // Check if all players have selected exactly 5 cards
    const players = order.filter(p => p.type === 'player');
    const allSelected = players.every(p => (updatedDeckSelections[p.id] || []).length === 5);

    try {
      if (allSelected) {
        // Finalize all decks and move to initiative
        const finalOrder = order.map(p => {
          if (p.type === 'player') {
            const selectedCards = POOL_CARDS.filter(c => (updatedDeckSelections[p.id] || []).includes(c.id));
            // Base deck only contains class cards, common cards, and inventory items
            const baseDeck = [...(p.deck || []), ...COMMON_CARDS];
            return { 
              ...p, 
              deck: baseDeck, 
              hand: baseDeck.filter(c => c.type !== 'passive'),
              bonusPool: selectedCards 
            };
          }
          return p;
        });

        await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
          'combat.phase': 'initiative',
          'combat.order': finalOrder,
          'combat.deckSelections': updatedDeckSelections
        }));
        toast.success("Todos os decks prontos! Rolem a iniciativa.");
      } else {
        await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
          [`combat.deckSelections.${participantId}`]: selectedPoolCardIds
        }));
        toast.info("Deck salvo. Aguardando outros jogadores...");
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const selectCombatAction = async (participantId: string, actionId: string, type: 'main' | 'bonus', targetId?: string) => {
    if (!currentCampaign?.id || !currentCampaign.combat) return;
    try {
      const currentSelection = currentCampaign.combat.selectedActions?.[participantId] || {};
      const actionData: any = { ...currentSelection };
      
      if (type === 'main') {
        actionData.mainActionId = actionId;
        if (targetId) actionData.mainTargetId = targetId;
      } else {
        actionData.bonusActionId = actionId;
        if (targetId) actionData.bonusTargetId = targetId;
      }

      await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
        [`combat.selectedActions.${participantId}`]: actionData
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const submitReaction = async (participantId: string, cardId: string | null) => {
    if (!currentCampaign?.id || !currentCampaign.combat) return;
    try {
      // If cardId is null, they passed the reaction
      if (cardId) {
        // Logic to apply reaction effect would go here
        await addCombatLog({
          type: 'info',
          message: `${participantId} usou uma reação!`,
          actorId: participantId
        });
      }
      
      await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
        'combat.reactionPrompt': deleteField()
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const submitSavingThrow = async (participantId: string, roll: number) => {
    if (!currentCampaign?.id || !currentCampaign.combat) return;
    const { savingThrowPrompt, order, turn } = currentCampaign.combat;
    if (!savingThrowPrompt) return;

    try {
      const success = roll >= savingThrowPrompt.dc;
      const actor = order.find(p => p.id === participantId);
      
      if (success) {
        toast.success("Sucesso! Você retomou o controle!");
        await addCombatLog({
          type: 'info',
          message: `${actor?.name} resistiu à possessão! (Roll: ${roll} vs DC ${savingThrowPrompt.dc})`,
          actorId: participantId
        });
        
        // Remove condition
        const updatedOrder = order.map(p => 
          p.id === participantId 
            ? { ...p, conditions: p.conditions?.filter(c => c !== savingThrowPrompt.conditionToRemove) } 
            : p
        );
        
        await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
          'combat.order': updatedOrder,
          'combat.savingThrowPrompt': deleteField()
        }));
      } else {
        toast.error("Falha! O fantasma ainda controla você!");
        await addCombatLog({
          type: 'info',
          message: `${actor?.name} falhou no teste de resistência! (Roll: ${roll} vs DC ${savingThrowPrompt.dc})`,
          actorId: participantId
        });
        
        // Skip turn
        if (turn + 1 >= order.length) {
          await endRound();
        } else {
          await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
            'combat.turn': turn + 1,
            'combat.savingThrowPrompt': deleteField()
          }));
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const startExecutionPhase = async () => {
    if (!currentCampaign?.id || !currentCampaign.combat) return;
    
    // Auto-roll initiative for the round
    const initiatives: Record<string, number> = {};
    const updatedOrder = currentCampaign.combat.order.map(p => {
      const dex = p.attributes?.dex || p.attributes?.Dexterity || 10;
      const roll = Math.floor(Math.random() * 20) + 1;
      const total = roll + Math.floor((dex - 10) / 2);
      initiatives[p.id] = total;
      return { ...p, initiative: total };
    }).sort((a, b) => b.initiative - a.initiative);

    try {
      await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
        'combat.phase': 'execution',
        'combat.order': updatedOrder,
        'combat.initiatives': initiatives,
        'combat.turn': 0
      }));
      toast.info("Fase de Execução! Resolvendo ações por iniciativa.");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const resolveCombatAction = async (actor: any, actionId: string, targetId?: string, currentOrder: any[] = []) => {
    if (!currentCampaign?.id || !currentCampaign.combat) return { order: currentOrder, message: '' };
    
    const card = actor.deck?.find((c: any) => c.id === actionId) || 
                 CONSUMABLE_CARDS.find(c => c.id === actionId);
    if (!card) return { order: currentOrder, message: '' };

    // Check Resources
    if (card.staminaCost && (actor.stamina?.current || 0) < card.staminaCost) {
      await addCombatLog({
        type: 'info',
        message: `${actor.name} tentou usar ${card.name}, mas não tem Stamina suficiente!`,
        actorId: actor.id
      });
      return { order: currentOrder, message: 'Sem Stamina' };
    }
    if (card.manaCost && (actor.mana?.current || 0) < card.manaCost) {
      await addCombatLog({
        type: 'info',
        message: `${actor.name} tentou usar ${card.name}, mas não tem Mana suficiente!`,
        actorId: actor.id
      });
      return { order: currentOrder, message: 'Sem Mana' };
    }

    let message = `${actor.name} usou ${card.name}`;
    let value = 0;
    let synergyBonus = 0;
    let comboBonus = 0;
    let isMiss = false;
    let isCritical = false;
    let diceRollInfo: any = undefined;

    const target = targetId ? currentOrder.find(p => p.id === targetId) : null;

    // 0. Keyword Checks
    if (actor.conditions?.includes('Silenciado') && card.tags.includes('Magia')) {
      await addCombatLog({
        type: 'info',
        message: `${actor.name} está Silenciado e não pode conjurar magias!`,
        actorId: actor.id
      });
      return { order: currentOrder, message: 'Silenciado' };
    }

    if (target && (card.category === 'attack' || card.category === 'spell' || card.category === 'skill')) {
      const targetKeywords = target.keywords || [];
      const actorConditions = actor.conditions || [];
      const targetConditions = target.conditions || [];

      if (targetKeywords.includes('Amedrontador') && actor.hp && actor.hp.current < 10) {
        await addCombatLog({
          type: 'info',
          message: `${actor.name} está amedrontado demais para atacar ${target.name}!`,
          actorId: actor.id,
          targetId: target.id
        });
        return { order: currentOrder, message: 'Amedrontado' };
      }

      // Elusivo
      const isElusive = (targetKeywords.includes('Elusivo') || targetConditions.some(c => c.startsWith('Elusivo'))) && 
                        !actorConditions.some(c => c.startsWith('Marcado'));
      
      if (isElusive && card.category !== 'spell' && !card.tags.includes('Área')) {
        let d20_1 = Math.floor(Math.random() * 20) + 1;
        let d20_2 = Math.floor(Math.random() * 20) + 1;
        if (actorConditions.some(c => c.startsWith('Focado'))) {
          d20_1 = Math.max(Math.floor(Math.random() * 20) + 1, Math.floor(Math.random() * 20) + 1);
          d20_2 = Math.max(Math.floor(Math.random() * 20) + 1, Math.floor(Math.random() * 20) + 1);
        }
        const d20 = Math.min(d20_1, d20_2);
        let attackMod = (actor.attributes?.dex ? calculateModifier(actor.attributes.dex) : 2);
        if (actorConditions.some(c => c.startsWith('Focado'))) attackMod += 2;
        const totalAttack = d20 + attackMod;
        const targetAC = (target.ac || 10);
        if (d20 === 1 || totalAttack < targetAC) isMiss = true;
        if (d20 === 20) isCritical = true;
        diceRollInfo = { d20, mod: attackMod, total: totalAttack, targetAC, isDisadvantage: true };
        
        let elusiveCount = 0;
        const countCond = targetConditions.find(c => c.startsWith('Elusivo ('));
        if (countCond) elusiveCount = parseInt(countCond.match(/\d+/)?.[0] || '0');
        elusiveCount++;

        let updatedTargetConditions = [...targetConditions];
        if (elusiveCount >= 2) {
          updatedTargetConditions = updatedTargetConditions.filter(c => !c.startsWith('Elusivo'));
        } else {
          updatedTargetConditions = updatedTargetConditions.filter(c => !c.startsWith('Elusivo'));
          updatedTargetConditions.push(`Elusivo (${elusiveCount}/2)`);
        }
        currentOrder = currentOrder.map(p => p.id === target.id ? { ...p, conditions: updatedTargetConditions } : p);
      }
    }

    // 1. Attack Roll
    if (card.category === 'attack' && target && !diceRollInfo) {
      let d20 = Math.floor(Math.random() * 20) + 1;
      if (actor.conditions?.some(c => c.startsWith('Focado'))) d20 = Math.max(d20, Math.floor(Math.random() * 20) + 1);
      
      let classBonus = 0;
      if (actor.charClass === 'Guerreiro' && card.tags.includes('Físico')) classBonus = 2;
      let attackMod = (actor.attributes?.dex ? calculateModifier(actor.attributes.dex) : 2) + classBonus;
      const totalAttack = d20 + attackMod;
      const targetAC = (target.ac || 10);
      if (d20 === 20) isCritical = true;
      if (d20 === 1 || totalAttack < targetAC) isMiss = true;
      diceRollInfo = { d20, mod: attackMod, total: totalAttack, targetAC };
    }

    // 2. Damage Calculation
    if (!isMiss && card.value) {
      try {
        const parts = card.value.split('+');
        const dicePart = parts[0].trim();
        let modifier = 0;
        if (parts[1]) {
          const modStr = parts[1].trim();
          if (['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].includes(modStr)) {
            modifier = actor.attributes?.[modStr.toLowerCase()] ? calculateModifier(actor.attributes[modStr.toLowerCase()]) : 0;
          } else modifier = parseInt(modStr) || 0;
        }
        if (actor.charClass === 'Guerreiro' && card.tags.includes('Físico')) modifier += 2;
        
        if (dicePart.includes('d')) {
          const [count, sides] = dicePart.split('d').map(Number);
          for (let i = 0; i < (isCritical ? count * 2 : count); i++) value += Math.floor(Math.random() * sides) + 1;
        } else value = parseInt(dicePart) || 0;
        value += modifier;
      } catch (e) { value = 5; }
    }

    // 3. Apply Effects
    let updatedOrder = [...currentOrder];
    const isArea = card.tags.includes('Área') || card.range.toLowerCase().includes('área');
    
    if ((target || isArea) && !isMiss) {
      const isHeal = card.tags.includes('Cura');
      const targets = isArea ? updatedOrder.filter(p => p.hp?.current !== undefined && p.hp.current > 0 && p.type !== actor.type) : [target];

      for (const t of targets) {
        if (!t || !t.hp) continue;
        let finalValue = value;
        if (card.synergy && t.conditions?.includes(card.synergy.tag)) finalValue += 5;
        
        // Apply HP
        updatedOrder = updatedOrder.map(p => {
          if (p.id === t.id && p.hp) {
            const newHp = isHeal ? Math.min(p.hp.max, p.hp.current + finalValue) : Math.max(0, p.hp.current - finalValue);
            return { ...p, hp: { ...p.hp, current: newHp } };
          }
          return p;
        });

        // Apply Tags
        if (card.appliesTags) {
          updatedOrder = updatedOrder.map(p => {
            if (p.id === t.id) {
              const newConditions = [...(p.conditions || [])];
              card.appliesTags!.forEach(tag => {
                if (!newConditions.includes(tag)) newConditions.push(`${tag} (2)`);
              });
              return { ...p, conditions: newConditions };
            }
            return p;
          });
        }
      }
    }

    // 4. Consume Resources
    updatedOrder = updatedOrder.map(p => {
      if (p.id === actor.id) {
        const newStamina = Math.max(0, (p.stamina?.current || 0) - (card.staminaCost || 0));
        const newMana = Math.max(0, (p.mana?.current || 0) - (card.manaCost || 0));
        
        // Special: Second Wind restores Stamina
        let finalStamina = newStamina;
        if (card.id === 'warrior-second-wind') finalStamina = Math.min(p.stamina!.max, finalStamina + 4);

        return { 
          ...p, 
          stamina: p.stamina ? { ...p.stamina, current: finalStamina } : null,
          mana: p.mana ? { ...p.mana, current: newMana } : null
        };
      }
      return p;
    });

    await addCombatLog({
      type: isMiss ? 'info' : (card.tags.includes('Cura') ? 'heal' : 'attack'),
      message: `${actor.name} usou ${card.name}${isMiss ? ' e errou!' : ` causando ${value} de efeito!`}`,
      actorId: actor.id,
      targetId: targetId,
      value: isMiss ? 0 : value,
      isMiss,
      isCritical,
      diceRoll: diceRollInfo
    });

    return { order: updatedOrder, message };
  };

  const executeNextAction = async () => {
    if (!currentCampaign?.id || !currentCampaign.combat) return;
    const { turn, order, selectedActions } = currentCampaign.combat;
    const actor = order[turn];
    const selection = selectedActions?.[actor.id];
    let currentOrder = [...order];

    if (!selection || (actor.hp && actor.hp.current <= 0)) {
      if (turn + 1 >= order.length) await endRound(currentOrder);
      else await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({ 'combat.turn': turn + 1 }));
      return;
    }

    // Resolve Main Action
    if (selection.mainActionId) {
      const result = await resolveCombatAction(actor, selection.mainActionId, selection.mainTargetId, currentOrder);
      currentOrder = result.order;
    }

    // Resolve Bonus Action
    if (selection.bonusActionId) {
      const result = await resolveCombatAction(actor, selection.bonusActionId, selection.bonusTargetId, currentOrder);
      currentOrder = result.order;
    }

    if (turn + 1 >= order.length) {
      await endRound(currentOrder);
    } else {
      await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
        'combat.turn': turn + 1,
        'combat.order': currentOrder
      }));
    }
  };

  const endRound = async (finalOrder?: any[]) => {
    if (!currentCampaign?.id || !currentCampaign.combat) return;
    const { round, order } = currentCampaign.combat;
    const baseOrder = finalOrder || order;
    
    try {
      let updatedOrder = baseOrder.map(p => {
        // Decrement condition durations
        const updatedConditions = (p.conditions || []).map(c => {
          const match = c.match(/(.+) \((\d+)\)/);
          if (match) {
            const name = match[1];
            const duration = parseInt(match[2]);
            if (duration > 1) return `${name} (${duration - 1})`;
            return null;
          }
          return c;
        }).filter(c => c !== null) as string[];

        // Apply Poison Damage
        let currentHp = p.hp?.current || 0;
        if (p.conditions?.some(c => c.startsWith('Envenenado'))) {
          const poisonDamage = Math.floor(Math.random() * 4) + 1;
          currentHp = Math.max(0, currentHp - poisonDamage);
          toast.warning(`${p.name} sofreu ${poisonDamage} de dano de veneno!`);
        }

        // Regenerate Stamina and Mana
        let currentStamina = p.stamina?.current || 0;
        let maxStamina = p.stamina?.max || 10;
        let currentMana = p.mana?.current || 0;
        let maxMana = p.mana?.max || 10;

        currentStamina = Math.min(maxStamina, currentStamina + 2);
        currentMana = Math.min(maxMana, currentMana + 2);

        return { 
          ...p, 
          conditions: updatedConditions, 
          hp: p.hp ? { ...p.hp, current: currentHp } : null,
          stamina: p.stamina ? { ...p.stamina, current: currentStamina } : null,
          mana: p.mana ? { ...p.mana, current: currentMana } : null
        };
      });
      
      // Every 3 rounds, give everyone a random card from their bonus pool
      if ((round + 1) % 3 === 0) {
        updatedOrder = updatedOrder.map(p => {
          if (p.type === 'player' && p.bonusPool && p.bonusPool.length > 0) {
            const pool = [...p.bonusPool];
            const randomIndex = Math.floor(Math.random() * pool.length);
            const randomCard = pool.splice(randomIndex, 1)[0];
            
            return {
              ...p,
              deck: [...(p.deck || []), randomCard],
              hand: [...(p.hand || []), randomCard],
              bonusPool: pool
            };
          } else if (p.type === 'player') {
            // Fallback if bonus pool is empty: give a random class card as before
            const classCards = BASE_CARDS[p.charClass] || BASE_CARDS['Guerreiro'];
            const randomCard = classCards[Math.floor(Math.random() * classCards.length)];
            return {
              ...p,
              hand: [...(p.hand || []), { ...randomCard, id: `${randomCard.id}-${Math.random().toString(36).substr(2, 5)}` }]
            };
          }
          return p;
        });
        toast.info("Nova rodada! Todos os jogadores receberam uma carta bônus.");
      }

      await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
        'combat.phase': 'preparation',
        'combat.round': round + 1,
        'combat.turn': 0,
        'combat.selectedActions': {},
        'combat.order': updatedOrder
      }));
      toast.success(`Rodada ${round} finalizada!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const submitInitiative = async (participantId: string, roll: number) => {
    if (!currentCampaign?.id || !currentCampaign.combat) return;
    try {
      await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
        [`combat.initiatives.${participantId}`]: roll
      }));
      toast.success("Iniciativa registrada!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const cancelCombatAction = async (participantId: string) => {
    if (!currentCampaign?.id || !currentCampaign.combat) return;
    try {
      await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
        [`combat.selectedActions.${participantId}`]: deleteField()
      }));
      toast.info("Ação cancelada.");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const finalizeInitiative = async () => {
    if (!currentCampaign?.id || !currentCampaign.combat) return;
    const { order, initiatives } = currentCampaign.combat;
    
    const updatedOrder = order.map(p => ({
      ...p,
      initiative: initiatives?.[p.id] || p.initiative || 0
    })).sort((a, b) => b.initiative - a.initiative);

    try {
      await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
        'combat.phase': 'preparation',
        'combat.order': updatedOrder,
        'combat.turn': 0
      }));
      toast.success("Combate Iniciado! Fase de Preparação.");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const addCombatLog = async (log: Omit<Campaign['combat']['history'][0], 'id' | 'timestamp'>) => {
    if (!currentCampaign?.id || !currentCampaign.combat) return;
    
    // Clean undefined values to avoid Firestore errors
    const cleanedLog = Object.entries(log).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = value;
      return acc;
    }, {} as any);

    const newLog = {
      ...cleanedLog,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    try {
      await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
        'combat.history': arrayUnion(newLog)
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const applyCombatDamage = async (targetId: string, amount: number, isHeal: boolean = false) => {
    if (!currentCampaign?.id || !currentCampaign.combat) return;
    const updatedOrder = currentCampaign.combat.order.map(p => {
      if (p.id === targetId && p.hp) {
        const newHp = isHeal 
          ? Math.min(p.hp.current + amount, p.hp.max)
          : Math.max(p.hp.current - amount, 0);
        return { ...p, hp: { ...p.hp, current: newHp } };
      }
      return p;
    });

    try {
      await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
        'combat.order': updatedOrder
      }));
      
      const target = currentCampaign.combat.order.find(p => p.id === targetId);
      if (target) {
        await addCombatLog({
          type: isHeal ? 'heal' : 'damage',
          message: `${target.name} ${isHeal ? 'recuperou' : 'recebeu'} ${amount} PV!`,
          actorId: 'system',
          targetId,
          value: amount
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const toggleDefend = async (participantId: string) => {
    if (!currentCampaign?.id || !currentCampaign.combat) return;
    const updatedOrder = currentCampaign.combat.order.map(p => {
      if (p.id === participantId) {
        return { ...p, defending: !p.defending };
      }
      return p;
    });

    try {
      await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
        'combat.order': updatedOrder
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const endCombat = async () => {
    if (!currentCampaign?.id || !currentCampaign.combat) return;
    try {
      const { order } = currentCampaign.combat;
      
      // Sync Player States
      for (const p of order) {
        if (p.type === 'player') {
          const char = allCharacters.find(c => c.id === p.id);
          if (char) {
            const updates: any = {};
            
            // Sync HP
            if (p.hp) {
              updates.hp = { ...char.hp, current: p.hp.current };
            }
            
            // Sync Spell Slots
            if (p.spellcasting?.slots) {
              updates['spellcasting.slots'] = p.spellcasting.slots;
            }
            
            // Sync Inventory (Consumed items)
            if (p.deck) {
              const updatedInventory = char.inventory.map(item => {
                const itemCard = p.deck.find(c => c.id === `item-${item.id}`);
                if (itemCard && itemCard.charges !== undefined) {
                  // If charges reached 0 and it's a consumable, remove it
                  if (itemCard.charges === 0 && (item.category === 'Potion' || item.category === 'Scroll')) {
                    return null;
                  }
                }
                return item;
              }).filter(Boolean);
              
              if (updatedInventory.length !== char.inventory.length) {
                updates.inventory = updatedInventory;
              }
            }
            
            if (Object.keys(updates).length > 0) {
              await updateDoc(doc(db, 'users', char.userId, 'characters', char.id), sanitizeData(updates));
            }
          }
        }
      }

      await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
        'combat.active': false
      }));
      toast.success("Combate finalizado e estados sincronizados!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const nextTurn = async () => {
    if (!currentCampaign?.id || !currentCampaign.combat) return;
    const { turn, round, order } = currentCampaign.combat;
    let nextTurn = turn + 1;
    let nextRound = round;

    if (nextTurn >= order.length) {
      nextTurn = 0;
      nextRound += 1;
    }

    try {
      await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
        'combat.turn': nextTurn,
        'combat.round': nextRound
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const updateCombatOrder = async (order: any[]) => {
    if (!currentCampaign?.id) return;
    try {
      await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
        'combat.order': order
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const addQuest = async (quest: Omit<Campaign['quests'][0], 'id' | 'createdAt'>) => {
    if (!currentCampaign?.id) return;
    
    // Clean undefined values
    const cleanedQuest = Object.entries(quest).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = value;
      return acc;
    }, {} as any);

    const newQuest = {
      ...cleanedQuest,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };
    try {
      // Optimistic update
      setCurrentCampaign({ 
        ...currentCampaign, 
        quests: [...(currentCampaign.quests || []), newQuest] 
      });

      await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
        quests: arrayUnion(newQuest)
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const updateQuest = async (questId: string, updates: Partial<Campaign['quests'][0]>) => {
    if (!currentCampaign?.id || !currentCampaign.quests) return;
    const updatedQuests = currentCampaign.quests.map(q => 
      q.id === questId ? { ...q, ...updates } : q
    );
    try {
      // Optimistic update
      setCurrentCampaign({ ...currentCampaign, quests: updatedQuests });
      
      await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
        quests: updatedQuests
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const deleteQuest = async (questId: string) => {
    if (!currentCampaign?.id || !currentCampaign.quests) return;
    const updatedQuests = currentCampaign.quests.filter(q => q.id !== questId);
    try {
      // Optimistic update
      setCurrentCampaign({ ...currentCampaign, quests: updatedQuests });

      await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
        quests: updatedQuests
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const grantAchievement = async (charId: string, achievementId: string) => {
    if (!currentCampaign) return;
    const char = allCharacters.find(c => c.id === charId);
    if (!char) return;

    const achievement = (currentCampaign.achievements || TOA_ACHIEVEMENTS).find(a => a.id === achievementId);
    if (!achievement) return;

    const alreadyUnlocked = char.profile?.achievements?.some(a => a.id === achievementId);
    if (alreadyUnlocked) return;

    try {
      const charRef = doc(db, "users", char.userId, "characters", char.id);
      const newAchievement = { id: achievementId, unlockedAt: Date.now() };
      
      await updateDoc(charRef, sanitizeData({
        "profile.achievements": arrayUnion(newAchievement),
        updatedAt: new Date()
      }));

      // Apply rewards
      if (achievement.reward.xp) {
        await addXPToCharacter(charId, achievement.reward.xp);
      }
      if (achievement.reward.gold) {
        await addGoldToCharacter(charId, achievement.reward.gold);
      }
      if (achievement.reward.item) {
        await giveItemToCharacter(charId, { 
          name: achievement.reward.item, 
          type: 'item', 
          description: `Recompensa da conquista: ${achievement.name}` 
        });
      }

      // Add notification to campaign
      const campaignRef = doc(db, "campaigns", currentCampaign.id);
      await updateDoc(campaignRef, sanitizeData({
        notifications: arrayUnion({
          id: Math.random().toString(36).substr(2, 9),
          type: 'info',
          message: `🏆 CONQUISTA DESBLOQUEADA! ${char.name} desbloqueou "${achievement.name}" (${achievement.tier})`,
          timestamp: Date.now(),
          data: { achievementId, charId }
        })
      }));

      toast.success("🏆 CONQUISTA DESBLOQUEADA!", {
        description: `${achievement.name} (${achievement.tier})\n+${achievement.reward.xp || 0} XP`,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${char.userId}/characters/${char.id}`);
    }
  };

  const setFeaturedAchievements = async (charId: string, achievementIds: string[]) => {
    const char = allCharacters.find(c => c.id === charId);
    if (!char) return;

    try {
      const charRef = doc(db, "users", char.userId, "characters", char.id);
      await updateDoc(charRef, sanitizeData({
        "profile.featuredAchievements": achievementIds.slice(0, 3),
        updatedAt: new Date()
      }));
      toast.success("Conquistas em destaque atualizadas!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${char.userId}/characters/${char.id}`);
    }
  };

  const initializeCampaignAchievements = async (campaignId: string) => {
    try {
      const campaignRef = doc(db, "campaigns", campaignId);
      await updateDoc(campaignRef, sanitizeData({
        achievements: TOA_ACHIEVEMENTS
      }));
      toast.success("Conquistas da campanha inicializadas!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${campaignId}`);
    }
  };

  const startMerchantEvent = async () => {
    if (!currentCampaign?.id || !user) return;
    if (currentCampaign.dmId !== user.uid) return;

    try {
      await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
        merchantEvent: {
          active: true,
          npcName: "Chôro",
          npcImage: "https://i.pinimg.com/1200x/31/0f/0e/310f0ea1fa5d1f35e6d7ecb3732317c5.jpg",
          inventory: [
            { itemKey: 'vassoura-de-bruxa', sold: false },
            { itemKey: 'varinha-magica', sold: false },
            { itemKey: 'espada-longa-plus-2', sold: false }
          ]
        },
        updatedAt: new Date()
      }));
      toast.success("Evento de Mercador iniciado!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const closeMerchantEvent = async () => {
    if (!currentCampaign?.id) return;
    try {
      await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
        'merchantEvent.active': false,
        updatedAt: new Date()
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `campaigns/${currentCampaign.id}`);
    }
  };

  const buyFromMerchant = async (itemKey: string) => {
    if (!currentCampaign?.id || !currentCharacter || !user) return;
    const merchant = currentCampaign.merchantEvent;
    if (!merchant || !merchant.active) return;

    const itemInStock = merchant.inventory.find(i => i.itemKey === itemKey && !i.sold);
    if (!itemInStock) {
      toast.error("Item esgotado!");
      return;
    }

    const { ITEMS } = await import("../data/items");
    const itemData = ITEMS[itemKey];
    if (!itemData) return;

    if (currentCharacter.gold < itemData.price) {
      toast.error("Ouro insuficiente!");
      return;
    }

    try {
      // 1. Mark as sold in campaign
      const updatedInventory = merchant.inventory.map(i => 
        i.itemKey === itemKey ? { ...i, sold: true } : i
      );

      await updateDoc(doc(db, 'campaigns', currentCampaign.id), sanitizeData({
        'merchantEvent.inventory': updatedInventory,
        updatedAt: new Date()
      }));

      // 2. Add to player inventory and deduct gold
      const updatedChar = automateCalculations({
        ...currentCharacter,
        gold: currentCharacter.gold - itemData.price,
        inventory: [...(currentCharacter.inventory || []), { ...itemData, id: `${itemKey}-${Date.now()}`, quantity: 1, equipped: false }]
      });

      // Update local state immediately
      setCurrentCharacter(updatedChar);
      setCharacters(prev => prev.map(c => c.id === updatedChar.id ? updatedChar : c));

      const { id, ...dataToSave } = updatedChar;
      const cleanUpdates = sanitizeData({ ...dataToSave, updatedAt: new Date() });
      await updateDoc(doc(db, "users", user.uid, "characters", currentCharacter.id), cleanUpdates);

      toast.success(`Você comprou ${itemData.name}!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "merchant purchase");
    }
  };

  return (
    <CharacterContext.Provider value={{
      currentCharacter,
      characters,
      allCharacters,
      campaignCharacters,
      currentCampaign,
      userCampaigns,
      friendships,
      guilds,
      npcs,
      monsterNotes,
      scrolls,
      loading,
      error,
      saveCharacter,
      createCharacter,
      setCurrentCharacter,
      loadCharacter,
      user,
      addXP,
      addXPToCharacter,
      addGoldToCharacter,
      deleteCharacter,
      distributeGroupXP,
      distributeGroupGold,
      groupRest,
      rollAttributes,
      rollStartingGold,
      giveItemToCharacter,
      longRest,
      logout,
      createCampaign,
      joinCampaign,
      setCurrentCampaign: selectCampaign,
      sendFriendRequest,
      acceptFriendRequest,
      createGuild,
      joinGuild,
      leaveGuild,
      updateGuildRank,
      depositToGuildVault,
      withdrawFromGuildVault,
      addGuildNote,
      getAICombos,
      createScroll,
      updateScroll,
      deleteScroll,
      tradeItem,
      updateUserProfile,
      createNPC,
      updateNPC,
      deleteNPC,
      deleteCampaign,
      leaveCampaign,
      saveFormation,
      unlockMonster,
      lockMonster,
      saveMonsterNote,
      startGuideSelection,
      submitVote,
      closeVoting,
      clearNotifications,
      startCombat,
      submitInitiative,
      finalizeInitiative,
      finalizeDeckSelection,
      selectCombatAction,
      submitReaction,
      submitSavingThrow,
      startExecutionPhase,
      executeNextAction,
      endRound,
      cancelCombatAction,
      endCombat,
      nextTurn,
      updateCombatOrder,
      addCombatLog,
      applyCombatDamage,
      toggleDefend,
      addQuest,
      updateQuest,
      deleteQuest,
      grantAchievement,
      setFeaturedAchievements,
      initializeCampaignAchievements,
      startMerchantEvent,
      closeMerchantEvent,
      buyFromMerchant,
      openDiceTray,
      closeDiceTray,
      diceTrayConfig,
      sendGuildMessage,
      guildMessages,
      setMagicSchool: async (school: string) => {
        if (!currentCharacter) return;
        await saveCharacter({ magicSchool: school });
        toast.success(`Escola de Magia Escolhida!`, {
          description: `Você agora é um especialista em ${school}.`
        });
      }
    }}>
      {children}
    </CharacterContext.Provider>
  );
}
