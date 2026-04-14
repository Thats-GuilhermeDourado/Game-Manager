import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { 
  Users, 
  Scroll as ScrollIcon, 
  Sparkles, 
  FileText, 
  Grid3X3,
  Eye,
  Plus,
  Save,
  MessageSquare,
  Sword,
  Shield,
  Target,
  Trophy,
  Coins,
  Trash2,
  RefreshCw,
  Lock,
  Unlock,
  Network,
  Skull,
  Heart,
  Zap,
  Info,
  ChevronRight,
  Search,
  X,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Link as LinkIcon,
  Dices,
  Map as MapIcon,
  UserCircle,
  Brain,
  Ghost,
  Edit3,
  Settings2,
  MapPin,
  Calendar,
  Clock,
  ChevronLeft,
  Play,
  Square
} from 'lucide-react';
import { DiceTray } from '../components/DiceTray';
import { CombatGame } from '../components/campaign/CombatGame';
import { CombatSetupModal } from '../components/campaign/CombatSetupModal';
import { useCharacter, Character, Scroll, NPC, MonsterNote, Campaign } from '../contexts/CharacterContext';
import { calculateInitiative, calculateAC } from '../data/rules';
import { cn } from '../lib/utils';
import { RaceIcon } from '../components/RaceIcon';
import { useSound } from '../hooks/useSound';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { MONSTERS, Monster } from '../data/monsters';
import { TOA_ACHIEVEMENTS } from '../data/achievements';
import GraphView from '../components/GraphView';
import Fuse from 'fuse.js';

export default function CampaignDetails() {
  const { 
    currentCampaign, 
    campaignCharacters, 
    npcs,
    monsterNotes,
    scrolls,
    user,
    currentCharacter,
    saveCharacter,
    addXPToCharacter,
    addGoldToCharacter,
    groupRest,
    friendships,
    createScroll,
    updateScroll,
    deleteScroll,
    distributeGroupXP,
    distributeGroupGold,
    loading,
    createNPC,
    updateNPC,
    deleteNPC,
    saveFormation,
    unlockMonster,
    lockMonster,
    saveMonsterNote,
    submitVote,
    startCombat,
    endCombat,
    nextTurn,
    updateCombatOrder,
    addQuest,
    updateQuest,
    deleteQuest
  } = useCharacter();

  const { playSound } = useSound();
  const [activeTab, setActiveTab] = useState<'info' | 'scrolls' | 'tactics' | 'bestiary' | 'npcs' | 'quests'>('info');
  const [questSubTab, setQuestSubTab] = useState<'missions' | 'achievements'>('missions');
  const [isCombatSetupOpen, setIsCombatSetupOpen] = useState(false);
  const [selectedScroll, setSelectedScroll] = useState<Scroll | null>(null);
  const [isCreateQuestModalOpen, setIsCreateQuestModalOpen] = useState(false);
  const [newQuest, setNewQuest] = useState<{ title: string; description: string; type: 'main' | 'side' | 'rumor' }>({ title: '', description: '', type: 'main' });
  const [scrollContent, setScrollContent] = useState('');
  const [scrollLinks, setScrollLinks] = useState<string[]>([]);
  const [scrollStyle, setScrollStyle] = useState<Scroll['style']>({
    fontSize: '18px',
    fontFamily: 'serif',
    textAlign: 'left'
  });
  const [isPreview, setIsPreview] = useState(false);
  const [isVotingModalOpen, setIsVotingModalOpen] = useState(false);

  useEffect(() => {
    if (currentCampaign?.activeVoting?.status === 'open' && user) {
      const hasVoted = !!currentCampaign.activeVoting.votes[user.uid];
      if (!hasVoted) {
        setIsVotingModalOpen(true);
      }
    } else {
      setIsVotingModalOpen(false);
    }
  }, [currentCampaign?.activeVoting, user]);
  const [showGraph, setShowGraph] = useState(false);
  const [formation, setFormation] = useState<Record<string, { x: number; y: number; role: string }>>({});
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [selectedCharForFormation, setSelectedCharForFormation] = useState<string | null>(null);
  const [isNpcModalOpen, setIsNpcModalOpen] = useState(false);
  const [editingNpc, setEditingNpc] = useState<Partial<NPC> | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);
  const [monsterNote, setMonsterNote] = useState('');

  const [isCreateScrollModalOpen, setIsCreateScrollModalOpen] = useState(false);
  const [newScrollName, setNewScrollName] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [selectedAuthor1Id, setSelectedAuthor1Id] = useState<string>('');
  const [selectedAuthor2Id, setSelectedAuthor2Id] = useState<string>('');

  const isDM = currentCampaign?.dmId === user?.uid;
  const unlockedMonsters = currentCampaign?.bestiary?.unlockedMonsters || [];

  const duoFriendship = friendships.find(f => f.status === 'accepted');
  const partnerId = duoFriendship?.charIds.find(id => id !== currentCharacter?.id);
  const partner = campaignCharacters.find(c => c.id === partnerId);
  const isDuo = !!partner;

  const filteredScrolls = scrolls.filter(s => 
    isDM || (s.authorIds && currentCharacter && s.authorIds.includes(currentCharacter.id))
  );

  const fuse = new Fuse(MONSTERS, {
    keys: ['name', 'type', 'description', 'actions.name', 'actions.description'],
    threshold: 0.3,
    ignoreLocation: true
  });

  const filteredMonsters = searchTerm 
    ? fuse.search(searchTerm).map(result => result.item)
    : MONSTERS;

  // Sincronização da Formação
  useEffect(() => {
    if (currentCampaign?.formation) {
      setFormation(currentCampaign.formation);
    }
  }, [currentCampaign?.id, currentCampaign?.formation]);

  useEffect(() => {
    if (selectedScroll) {
      setScrollContent(selectedScroll.content || '');
      setScrollLinks(selectedScroll.links || []);
      setScrollStyle(selectedScroll.style || {
        fontSize: '18px',
        fontFamily: 'serif',
        textAlign: 'left'
      });
    }
  }, [selectedScroll?.id]);

  useEffect(() => {
    if (selectedMonster && user) {
      const note = monsterNotes.find(n => n.monsterId === selectedMonster.id && n.authorId === user.uid);
      setMonsterNote(note?.content || '');
    }
  }, [selectedMonster?.id, monsterNotes, user]);

  if (!currentCampaign) {
    return (
      <div className="flex flex-col items-center justify-center py-20 glass-card">
        <Sparkles size={48} className="text-gold/20 mb-4" />
        <h2 className="text-2xl font-display font-bold text-parchment/60">No Active Campaign</h2>
        <p className="text-sm text-parchment/40">Join a campaign to see details.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 pb-20 space-y-8 sm:space-y-12">
      {/* Campaign Header */}
      <div className="liquid-glass p-6 sm:p-12 border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gold/5 to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8 relative z-10">
          <div className="space-y-4 w-full lg:w-auto">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shadow-2xl group-hover:scale-110 transition-transform duration-700">
                <MapIcon size={24} className="sm:w-8 sm:h-8" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl sm:text-6xl font-display font-black text-parchment uppercase tracking-tighter drop-shadow-2xl break-words">{currentCampaign.name}</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                  <span className="px-2 sm:px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[7px] sm:text-[8px] font-black text-gold uppercase tracking-[0.2em] shadow-inner">
                    Código: {currentCampaign.inviteCode}
                  </span>
                  <span className="text-[7px] sm:text-[8px] text-parchment/20 uppercase font-black tracking-widest">
                    {currentCampaign.characterRefs?.length || 0} Aventureiros
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-6 w-full lg:w-auto">
            {isDM && (
              <div className="flex gap-2 sm:gap-4 w-full lg:w-auto">
                <button 
                  onClick={() => groupRest('short')}
                  className="flex-1 lg:flex-none px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-[8px] sm:text-[10px] font-black text-parchment uppercase tracking-[0.2em] hover:bg-white/10 transition-all shadow-xl"
                >
                  Curto
                </button>
                <button 
                  onClick={() => groupRest('long')}
                  className="flex-1 lg:flex-none px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gold text-midnight text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_10px_20px_rgba(212,175,55,0.3)]"
                >
                  Longo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 sm:gap-4 p-2 bg-white/2 border border-white/5 rounded-2xl sm:rounded-3xl shadow-inner justify-center sm:justify-start">
        {[
          { id: 'info', label: 'Grupo', icon: Users },
          { id: 'npcs', label: 'NPCs', icon: UserCircle },
          { id: 'scrolls', label: 'Cérebro', icon: Brain },
          { id: 'tactics', label: 'Táticas', icon: Shield },
          { id: 'bestiary', label: 'Bestiário', icon: Ghost },
        ].map(tab => {
          if (tab.id === 'scrolls' && !isDuo && !isDM) return null;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                playSound('click');
              }}
              className={cn(
                "flex-1 min-w-[80px] sm:min-w-[120px] flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                activeTab === tab.id 
                  ? "bg-gold text-midnight shadow-[0_5px_15px_rgba(212,175,55,0.3)]" 
                  : "text-parchment/20 hover:text-parchment hover:bg-white/5"
              )}
            >
              <tab.icon size={14} className="sm:w-4 sm:h-4" strokeWidth={3} />
              <span className={cn(activeTab === tab.id ? "block" : "hidden sm:block")}>{tab.label}</span>
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        {activeTab === 'info' && (
          <motion.div 
            key="info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {campaignCharacters.map((char, i) => (
              <motion.div
                key={char.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                className="liquid-glass p-6 sm:p-8 space-y-6 sm:space-y-8 group border-white/5 relative overflow-hidden hover:border-gold/20 transition-all duration-500"
              >
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gold/5 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 blur-3xl group-hover:bg-gold/10 transition-all duration-700" />
                <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-gold/5 rounded-full -ml-8 -mb-8 sm:-ml-12 sm:-mb-12 blur-2xl opacity-50" />
                
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex gap-4 sm:gap-6">
                    <div className="relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-gold/40 transition-all duration-500 shadow-2xl relative z-10">
                        {char.appearance ? (
                          <img 
                            src={char.appearance} 
                            alt={char.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <RaceIcon 
                            race={char.race} 
                            className="w-full h-full rounded-xl sm:rounded-2xl" 
                          />
                        )}
                      </div>
                      <div className="absolute -bottom-1.5 -right-1.5 sm:-bottom-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-midnight border border-white/10 rounded-lg sm:rounded-xl flex items-center justify-center text-gold shadow-xl z-20">
                        <span className="text-[10px] sm:text-xs font-black">{char.level}</span>
                      </div>
                    </div>
                    <div className="pt-1 sm:pt-2">
                      <h3 className="text-2xl sm:text-3xl font-display font-black text-parchment group-hover:text-gold transition-colors tracking-tight leading-none truncate max-w-[120px] sm:max-w-none">{char.name}</h3>
                      <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
                        <span className="text-[9px] sm:text-[10px] text-parchment/40 font-black uppercase tracking-widest">{char.race}</span>
                        <span className="w-1 h-1 rounded-full bg-gold/30" />
                        <span className="text-[9px] sm:text-[10px] text-gold/60 font-black uppercase tracking-widest">{char.charClass}</span>
                      </div>
                      <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-white/5 border border-white/10 text-[7px] sm:text-[8px] font-black text-parchment/40 uppercase tracking-widest">Iniciativa: {calculateInitiative(char)}</span>
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-white/5 border border-white/10 text-[7px] sm:text-[8px] font-black text-parchment/40 uppercase tracking-widest">CA: {calculateAC(char)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 relative z-10">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-parchment/30 block">Vitalidade</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl sm:text-2xl font-display font-black text-parchment">{(char.hp?.current ?? 0) || 0}</span>
                        <span className="text-[10px] sm:text-xs font-black text-parchment/20">/ {(char.hp?.max ?? 0) || 0}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-parchment/30 block">Experiência</span>
                      <span className="text-[10px] sm:text-xs font-black text-gold/60">{char.xp || 0} XP</span>
                    </div>
                  </div>
                  <div className="h-2.5 sm:h-3 bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/5 p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(0, Math.min(100, (((char.hp?.current ?? 0) || 0) / ((char.hp?.max ?? 0) || 1)) * 100))}%` }}
                      className={cn(
                        "h-full rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-colors duration-500",
                        (((char.hp?.current ?? 0) || 0) / ((char.hp?.max ?? 0) || 1)) < 0.3 
                          ? "bg-gradient-to-r from-red-600 to-red-400" 
                          : "bg-gradient-to-r from-emerald-600 to-emerald-400"
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 relative z-10">
                  {isDM && (
                    <>
                      <button 
                        onClick={() => {
                          const amount = prompt("Quantidade de XP:");
                          if (amount) {
                            const parsed = parseInt(amount);
                            if (!isNaN(parsed)) addXPToCharacter(char.id, parsed);
                          }
                        }}
                        className="flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-[8px] sm:text-[9px] font-black text-parchment/60 uppercase tracking-widest hover:bg-gold hover:text-midnight hover:border-gold transition-all duration-300 shadow-lg group/btn"
                      >
                        <Trophy size={12} className="sm:w-3.5 sm:h-3.5 group-hover/btn:scale-110 transition-transform" />
                        Dar XP
                      </button>
                      <button 
                        onClick={() => {
                          const amount = prompt("Quantidade de Ouro:");
                          if (amount) {
                            const parsed = parseInt(amount);
                            if (!isNaN(parsed)) addGoldToCharacter(char.id, parsed);
                          }
                        }}
                        className="flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-[8px] sm:text-[9px] font-black text-parchment/60 uppercase tracking-widest hover:bg-gold hover:text-midnight hover:border-gold transition-all duration-300 shadow-lg group/btn"
                      >
                        <Coins size={12} className="sm:w-3.5 sm:h-3.5 group-hover/btn:scale-110 transition-transform" />
                        Dar Ouro
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'scrolls' && (
          <motion.div 
            key="scrolls"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 h-auto lg:h-[700px]"
          >
            {/* Sidebar: Library */}
            <div className="lg:col-span-4 glass-card p-6 sm:p-8 flex flex-col gap-6 sm:gap-8 relative overflow-hidden group border-white/5">
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/10 transition-all duration-1000" />
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shadow-lg">
                    <Brain size={20} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-display font-black text-parchment uppercase tracking-tighter leading-none">Cérebro Virtual</h3>
                    <p className="text-[7px] sm:text-[8px] text-parchment/30 font-black uppercase tracking-[0.2em] mt-1">Biblioteca Compartilhada</p>
                  </div>
                </div>
                <div className="flex gap-1.5 sm:gap-2">
                  <button 
                    onClick={() => setShowGraph(!showGraph)}
                    className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl transition-all flex items-center justify-center border",
                      showGraph 
                        ? "bg-gold text-midnight border-gold shadow-lg shadow-gold/20" 
                        : "bg-white/5 text-gold border-white/10 hover:bg-white/10 hover:border-gold/30"
                    )}
                    title="Visão de Grafo"
                  >
                    <Network size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
                  </button>
                  <button 
                    onClick={() => {
                      setNewScrollName('');
                      if (isDM) {
                        setSelectedAuthor1Id(campaignCharacters[0]?.id || '');
                        setSelectedAuthor2Id(campaignCharacters[1]?.id || '');
                      } else {
                        const myChar = currentCharacter || campaignCharacters.find(c => c.userId === user?.uid);
                        const partner = campaignCharacters.find(c => c.id !== myChar?.id);
                        setSelectedPartnerId(partner?.id || '');
                      }
                      setIsCreateScrollModalOpen(true);
                    }}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gold text-midnight flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-gold/20"
                    title="Novo Pergaminho"
                  >
                    <Plus size={18} className="sm:w-5 sm:h-5" strokeWidth={3} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pr-2 custom-scrollbar relative z-10 max-h-[400px] lg:max-h-none">
                {filteredScrolls.length === 0 ? (
                  <div className="py-12 sm:py-20 text-center opacity-20 space-y-3 sm:space-y-4">
                    <ScrollIcon size={40} className="sm:w-12 sm:h-12 mx-auto text-gold" />
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em]">Nenhum conhecimento registrado...</p>
                  </div>
                ) : (
                  filteredScrolls.map(scroll => (
                    <motion.div 
                      key={scroll.id} 
                      layout
                      className="relative group/item"
                    >
                      <button
                        onClick={() => {
                          setSelectedScroll(scroll);
                          setShowGraph(false);
                        }}
                        className={cn(
                          "w-full p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all duration-500 text-left relative overflow-hidden group/btn",
                          selectedScroll?.id === scroll.id 
                            ? "bg-gold/10 border-gold/40 text-gold shadow-[0_10px_30px_rgba(212,175,55,0.1)]" 
                            : "bg-white/2 border-white/5 text-parchment/40 hover:border-white/20 hover:bg-white/5"
                        )}
                      >
                        <div className="flex items-center gap-4 sm:gap-5 relative z-10">
                          <div className={cn(
                            "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover/btn:scale-110",
                            selectedScroll?.id === scroll.id ? "bg-gold/20 border-gold/30" : "bg-white/5 border-white/10"
                          )}>
                            <ScrollIcon size={16} className={cn("sm:w-5 sm:h-5", selectedScroll?.id === scroll.id ? "text-gold" : "text-parchment/20")} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm sm:text-base font-black truncate block uppercase tracking-tight group-hover/btn:text-gold transition-colors">{scroll.name}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[7px] sm:text-[8px] opacity-40 uppercase tracking-widest font-black">
                                {scroll.authorIds.length} Autores
                              </span>
                              <span className="w-1 h-1 rounded-full bg-white/10" />
                              <span className="text-[8px] opacity-40 uppercase tracking-widest font-black">
                                {scroll.links?.length || 0} Conexões
                              </span>
                            </div>
                          </div>
                          <ChevronRight size={16} className={cn(
                            "transition-all duration-500",
                            selectedScroll?.id === scroll.id ? "text-gold translate-x-0" : "text-parchment/10 -translate-x-2 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0"
                          )} />
                        </div>
                      </button>
                      { (isDM || (currentCharacter && scroll.authorIds.includes(currentCharacter.id))) && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmModal({
                              isOpen: true,
                              title: 'Deletar Pergaminho',
                              message: 'Deseja realmente deletar este pergaminho? Esta ação não pode ser desfeita.',
                              onConfirm: () => deleteScroll(scroll.id)
                            });
                          }}
                          className="absolute -right-2 -top-2 w-8 h-8 rounded-xl bg-red-500 text-white opacity-0 group-hover/item:opacity-100 transition-all hover:scale-110 flex items-center justify-center shadow-xl z-20"
                        >
                          <Trash2 size={14} strokeWidth={3} />
                        </button>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-8 liquid-glass p-10 flex flex-col gap-8 relative overflow-hidden border-white/5">
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gold/5 to-transparent pointer-events-none" />
              
              {showGraph ? (
                <div className="flex-1 p-8">
                  <GraphView 
                    nodes={[
                      ...filteredScrolls.map(s => ({ id: s.id, name: s.name, type: 'scroll' as const })),
                      ...MONSTERS.filter(m => unlockedMonsters.includes(m.id)).map(m => ({ id: m.id, name: m.name, type: 'monster' as const })),
                      ...campaignCharacters.map(c => ({ id: c.id, name: c.name, type: 'character' as const }))
                    ]}
                    links={[
                      ...filteredScrolls.flatMap(s => {
                        const manualLinks = (s.links || [])
                          .filter(targetId => 
                            filteredScrolls.some(sc => sc.id === targetId) || 
                            MONSTERS.some(m => m.id === targetId && unlockedMonsters.includes(m.id)) ||
                            campaignCharacters.some(c => c.id === targetId)
                          )
                          .map(targetId => ({ source: s.id, target: targetId }));

                        // Auto-linking: Scan content for monster and character names
                        const autoLinks: { source: string; target: string }[] = [];
                        const content = s.content || '';
                        
                        MONSTERS.filter(m => unlockedMonsters.includes(m.id)).forEach(m => {
                          if (content.toLowerCase().includes(m.name.toLowerCase())) {
                            autoLinks.push({ source: s.id, target: m.id });
                          }
                        });

                        campaignCharacters.forEach(c => {
                          if (content.toLowerCase().includes(c.name.toLowerCase())) {
                            autoLinks.push({ source: s.id, target: c.id });
                          }
                        });

                        return [...manualLinks, ...autoLinks];
                      }),
                      // Link monsters that appear in the same scroll
                      ...filteredScrolls.flatMap(s => {
                        const content = s.content || '';
                        const visibleMonsters = MONSTERS.filter(m => unlockedMonsters.includes(m.id))
                          .filter(m => content.toLowerCase().includes(m.name.toLowerCase()));
                        
                        const monsterLinks: { source: string; target: string }[] = [];
                        for (let i = 0; i < visibleMonsters.length; i++) {
                          for (let j = i + 1; j < visibleMonsters.length; j++) {
                            monsterLinks.push({ source: visibleMonsters[i].id, target: visibleMonsters[j].id });
                          }
                        }
                        return monsterLinks;
                      })
                    ]}
                    onNodeClick={(node) => {
                      if (node.type === 'scroll') {
                        const s = filteredScrolls.find(sc => sc.id === node.id);
                        if (s) {
                          setSelectedScroll(s);
                          setShowGraph(false);
                        }
                      } else if (node.type === 'monster') {
                        const m = MONSTERS.find(mon => mon.id === node.id);
                        if (m) {
                          setSelectedMonster(m);
                          setActiveTab('bestiary');
                          setShowGraph(false);
                        }
                      }
                    }}
                  />
                </div>
              ) : selectedScroll ? (
                <div className="flex flex-col h-full">
                  {/* Editor Header */}
                  <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2 backdrop-blur-sm">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shadow-inner">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h3 className="text-3xl font-display font-black text-parchment uppercase tracking-tight">{selectedScroll.name}</h3>
                        <div className="flex gap-3 mt-1">
                          {selectedScroll.authorIds.map(authId => {
                            const author = campaignCharacters.find(c => c.id === authId);
                            return (
                              <div key={authId} className="flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded-full bg-gold/20 border border-gold/30" />
                                <span className="text-[9px] font-black text-parchment/40 uppercase tracking-widest">
                                  {author?.name || 'Unknown'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex bg-midnight/40 p-1.5 rounded-2xl border border-white/5">
                        <button 
                          onClick={() => setIsPreview(false)}
                          className={cn(
                            "px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                            !isPreview ? "bg-gold text-midnight shadow-lg" : "text-parchment/40 hover:text-parchment"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Edit3 size={14} />
                            Editar
                          </div>
                        </button>
                        <button 
                          onClick={() => setIsPreview(true)}
                          className={cn(
                            "px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                            isPreview ? "bg-gold text-midnight shadow-lg" : "text-parchment/40 hover:text-parchment"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Eye size={14} />
                            Preview
                          </div>
                        </button>
                      </div>
                      
                      <div className="h-8 w-px bg-white/10 mx-2" />

                      <button 
                        onClick={() => {
                          const options = [
                            ...filteredScrolls.filter(s => s.id !== selectedScroll?.id).map(s => ({ id: s.id, name: `Pergaminho: ${s.name}` })),
                            ...MONSTERS.filter(m => unlockedMonsters.includes(m.id)).map(m => ({ id: m.id, name: `Monstro: ${m.name}` }))
                          ];

                          if (options.length === 0) {
                            toast.error("Nenhum outro recurso disponível para vincular.");
                            return;
                          }

                          const optionNames = options.map((o, i) => `${i + 1}. ${o.name}`).join('\n');
                          const selection = prompt(`Selecione um recurso para vincular:\n${optionNames}`);
                          
                          if (selection) {
                            const index = parseInt(selection) - 1;
                            const target = options[index];
                            if (target && !scrollLinks.includes(target.id)) {
                              setScrollLinks([...scrollLinks, target.id]);
                            }
                          }
                        }}
                        className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl text-gold hover:bg-gold/10 hover:border-gold/30 transition-all flex items-center justify-center shadow-lg group/btn"
                        title="Vincular Conhecimento"
                      >
                        <Network size={20} className="group-hover/btn:scale-110 transition-transform" />
                      </button>

                      <button 
                        onClick={() => updateScroll(selectedScroll.id, scrollContent, scrollLinks, scrollStyle)}
                        className="flex items-center gap-3 px-8 py-3.5 bg-gold text-midnight rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gold/20 border border-gold-bright/30"
                      >
                        <Save size={18} strokeWidth={3} /> Salvar
                      </button>
                    </div>
                  </div>
                  
                  {/* Editor Body */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {!isPreview && (
                      <div className="p-4 border-b border-white/5 bg-white/1 flex flex-wrap gap-3">
                        <div className="flex gap-1 bg-midnight/40 p-1 rounded-xl border border-white/5">
                          {[
                            { icon: Bold, tag: '<b>', endTag: '</b>', label: 'Negrito' },
                            { icon: Italic, tag: '<i>', endTag: '</i>', label: 'Itálico' },
                            { icon: Underline, tag: '<u>', endTag: '</u>', label: 'Sublinhado' },
                          ].map(({ icon: Icon, tag, endTag, label }) => (
                            <button
                              key={tag}
                              onClick={() => setScrollContent(prev => prev + tag + (endTag || ''))}
                              className="w-9 h-9 rounded-lg hover:bg-white/10 text-parchment/60 hover:text-gold transition-all flex items-center justify-center"
                              title={label}
                            >
                              <Icon size={16} />
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-1 bg-midnight/40 p-1 rounded-xl border border-white/5">
                          {[
                            { icon: Heading1, tag: '# ', label: 'Título 1' },
                            { icon: Heading2, tag: '## ', label: 'Título 2' },
                            { icon: LinkIcon, tag: '[[', endTag: ']]', label: 'Link Interno' }
                          ].map(({ icon: Icon, tag, endTag, label }) => (
                            <button
                              key={tag}
                              onClick={() => setScrollContent(prev => prev + tag + (endTag || ''))}
                              className="w-9 h-9 rounded-lg hover:bg-white/10 text-parchment/60 hover:text-gold transition-all flex items-center justify-center"
                              title={label}
                            >
                              <Icon size={16} />
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-1 bg-midnight/40 p-1 rounded-xl border border-white/5">
                          <button 
                            onClick={() => setScrollStyle(prev => ({ ...prev, textAlign: 'left' }))}
                            className={cn("w-9 h-9 rounded-lg transition-all flex items-center justify-center", scrollStyle?.textAlign === 'left' ? "bg-gold/20 text-gold" : "text-parchment/40 hover:text-parchment")}
                          >
                            <AlignLeft size={16} />
                          </button>
                          <button 
                            onClick={() => setScrollStyle(prev => ({ ...prev, textAlign: 'center' }))}
                            className={cn("w-9 h-9 rounded-lg transition-all flex items-center justify-center", scrollStyle?.textAlign === 'center' ? "bg-gold/20 text-gold" : "text-parchment/40 hover:text-parchment")}
                          >
                            <AlignCenter size={16} />
                          </button>
                          <button 
                            onClick={() => setScrollStyle(prev => ({ ...prev, textAlign: 'right' }))}
                            className={cn("w-9 h-9 rounded-lg transition-all flex items-center justify-center", scrollStyle?.textAlign === 'right' ? "bg-gold/20 text-gold" : "text-parchment/40 hover:text-parchment")}
                          >
                            <AlignRight size={16} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3 ml-auto px-4">
                          <Settings2 size={14} className="text-parchment/20" />
                          <select 
                            value={scrollStyle?.fontSize}
                            onChange={(e) => setScrollStyle(prev => ({ ...prev, fontSize: e.target.value }))}
                            className="bg-transparent text-[10px] font-black text-parchment/40 uppercase tracking-widest outline-none cursor-pointer hover:text-gold transition-colors"
                          >
                            <option value="14px">Pequeno</option>
                            <option value="18px">Médio</option>
                            <option value="24px">Grande</option>
                            <option value="32px">Enorme</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                      {isPreview ? (
                        <div 
                          className="prose prose-invert max-w-none"
                          style={{ 
                            fontSize: scrollStyle?.fontSize,
                            fontFamily: scrollStyle?.fontFamily === 'serif' ? 'var(--font-serif)' : scrollStyle?.fontFamily === 'sans' ? 'var(--font-sans)' : 'var(--font-mono)',
                            textAlign: scrollStyle?.textAlign as any
                          }}
                        >
                          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                            {scrollContent || '*O pergaminho está em branco...*'}
                          </ReactMarkdown>
                          
                          {scrollLinks.length > 0 && (
                            <div className="mt-12 pt-8 border-t border-white/5">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/40 mb-6">Conhecimentos Vinculados</h4>
                              <div className="flex flex-wrap gap-3">
                                {scrollLinks.map(linkId => {
                                  const linkedScroll = filteredScrolls.find(s => s.id === linkId);
                                  const linkedMonster = MONSTERS.find(m => m.id === linkId);
                                  
                                  if (linkedScroll) {
                                    return (
                                      <button 
                                        key={linkId}
                                        onClick={() => setSelectedScroll(linkedScroll)}
                                        className="px-4 py-2 rounded-xl bg-gold/5 border border-gold/20 text-gold text-[10px] font-black uppercase tracking-widest hover:bg-gold/20 transition-all flex items-center gap-2"
                                      >
                                        <ScrollIcon size={12} />
                                        {linkedScroll.name}
                                      </button>
                                    );
                                  }
                                  if (linkedMonster) {
                                    return (
                                      <button 
                                        key={linkId}
                                        onClick={() => {
                                          setSelectedMonster(linkedMonster);
                                          setActiveTab('bestiary');
                                        }}
                                        className="px-4 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                                      >
                                        <Ghost size={12} />
                                        {linkedMonster.name}
                                      </button>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <textarea
                          value={scrollContent}
                          onChange={(e) => setScrollContent(e.target.value)}
                          placeholder="Escreva o conhecimento arcano aqui..."
                          className="w-full h-full bg-transparent border-none outline-none resize-none text-parchment/80 placeholder:text-parchment/10 leading-relaxed"
                          style={{ 
                            fontSize: scrollStyle?.fontSize,
                            fontFamily: scrollStyle?.fontFamily === 'serif' ? 'var(--font-serif)' : scrollStyle?.fontFamily === 'sans' ? 'var(--font-sans)' : 'var(--font-mono)',
                            textAlign: scrollStyle?.textAlign as any
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-8">
                  <div className="w-32 h-32 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center text-gold/20 animate-pulse">
                    <Brain size={64} strokeWidth={1} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-4xl font-display font-black text-parchment/20 uppercase tracking-tighter">Selecione um Pergaminho</h3>
                    <p className="text-sm text-parchment/10 max-w-md mx-auto leading-relaxed">
                      Explore a biblioteca compartilhada do grupo para acessar conhecimentos arcanos, táticas e registros de campanha.
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsCreateScrollModalOpen(true)}
                    className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-gold uppercase tracking-[0.3em] hover:bg-gold hover:text-midnight transition-all shadow-xl"
                  >
                    Criar Novo Registro
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'tactics' && (
          <motion.div 
            key="tactics"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8 sm:space-y-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12">
              <div className="lg:col-span-8">
                <div 
                  className={cn(
                    "aspect-square sm:aspect-video bg-midnight/60 rounded-2xl sm:rounded-3xl border border-white/10 relative overflow-hidden",
                    isDM && selectedCharForFormation && "cursor-crosshair border-gold/40"
                  )}
                  onClick={(e) => {
                    if (!isDM || !selectedCharForFormation) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    
                    let role = 'Midline';
                    if (y < 33) role = 'Vanguard';
                    else if (y > 66) role = 'Rearguard';

                    const newFormation = {
                      ...formation,
                      [selectedCharForFormation]: { x, y, role }
                    };
                    setFormation(newFormation);
                    saveFormation(newFormation);
                  }}
                >
                  {/* Zone Indicators */}
                  <div className="absolute inset-0 flex flex-col pointer-events-none">
                    <div className="flex-1 bg-red-500/5 border-b border-red-500/10 flex items-center justify-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500/20">Vanguard</span>
                    </div>
                    <div className="flex-1 bg-gold-500/5 border-b border-gold-500/10 flex items-center justify-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gold/20">Midline</span>
                    </div>
                    <div className="flex-1 bg-blue-500/5 flex items-center justify-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500/20">Rearguard</span>
                    </div>
                  </div>

                  <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-10 pointer-events-none">
                    {Array.from({ length: 100 }).map((_, i) => (
                      <div key={i} className="border-[0.5px] border-white/20" />
                    ))}
                  </div>

                  <div className="absolute inset-0">
                    {campaignCharacters.map((char, index) => {
                      const pos = formation[char.id] || { x: 50, y: 20 + (index * 15) };
                      return (
                        <motion.div
                          key={char.id}
                          layoutId={`char-${char.id}`}
                          className={cn(
                            "absolute w-16 h-16 z-10 transition-transform",
                            selectedCharForFormation === char.id && "scale-110"
                          )}
                          style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                        >
                          <div className="relative group/char">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl bg-gold/10 border-2 flex items-center justify-center overflow-hidden shadow-lg transition-all",
                              selectedCharForFormation === char.id ? "border-gold shadow-[0_0_20px_rgba(201,160,61,0.5)]" : "border-white/20"
                            )}>
                              {char.appearance ? (
                                <img src={char.appearance} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <RaceIcon race={char.race} className="w-full h-full p-2" />
                              )}
                            </div>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gold text-midnight text-[8px] font-black rounded-md opacity-0 group-hover/char:opacity-100 transition-opacity whitespace-nowrap uppercase">
                              {char.name} ({formation[char.id]?.role || 'Midline'})
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 space-y-6 sm:space-y-8">
                <div className="glass-card p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gold uppercase tracking-widest">Formation Roles</h3>
                    {isDM && (
                      <button 
                        onClick={() => {
                          setFormation({});
                          saveFormation({});
                        }}
                        className="p-2 bg-white/5 rounded-lg text-parchment/40 hover:text-red-400 transition-colors"
                        title="Reset Formation"
                      >
                        <RefreshCw size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                    {campaignCharacters.map(char => (
                      <button 
                        key={char.id} 
                        disabled={!isDM}
                        onClick={() => setSelectedCharForFormation(selectedCharForFormation === char.id ? null : char.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                          selectedCharForFormation === char.id 
                            ? "bg-gold/10 border-gold" 
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg overflow-hidden border border-gold/20">
                            <img src={char.appearance || `https://api.dicebear.com/7.x/avataaars/svg?seed=${char.id}`} alt="" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-xs font-bold truncate max-w-[80px] sm:max-w-none">{char.name}</span>
                        </div>
                        <div className="text-[10px] font-bold text-gold uppercase shrink-0">{formation[char.id]?.role || 'Midline'}</div>
                      </button>
                    ))}
                  </div>
                  {isDM && (
                    <p className="text-[10px] text-parchment/40 text-center italic">
                      {selectedCharForFormation 
                        ? "Click on the grid to position the selected character" 
                        : "Select a character to change their position"}
                    </p>
                  )}
                </div>

                {/* Combat Card Game */}
                <div className="glass-card p-4 sm:p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gold uppercase tracking-widest flex items-center gap-2">
                      <Sword size={16} />
                      Táticas de Combate
                    </h3>
                    {isDM && !currentCampaign.combat?.active && (
                      <button 
                        onClick={() => setIsCombatSetupOpen(true)}
                        className="px-4 py-2 bg-gold text-midnight rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                      >
                        <Play size={12} className="inline mr-2" fill="currentColor" /> Iniciar Combate
                      </button>
                    )}
                  </div>

                  {currentCampaign.combat?.active ? (
                    <div className="p-12 border-2 border-dashed border-gold/20 rounded-[2rem] text-center space-y-6 bg-gold/5">
                      <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center text-gold border border-gold/20 mx-auto animate-pulse">
                        <Sword size={40} strokeWidth={1.5} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gold uppercase font-black tracking-[0.3em]">Combate em Andamento!</p>
                        <p className="text-[10px] text-parchment/40 uppercase font-bold">A batalha épica já começou.</p>
                      </div>
                      <button 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="px-8 py-3 bg-gold text-midnight rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                      >
                        Ver Campo de Batalha
                      </button>
                    </div>
                  ) : (
                    <div className="p-12 border-2 border-dashed border-white/5 rounded-[2rem] text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-parchment/10 border border-white/5 mx-auto">
                        <Sword size={32} strokeWidth={1} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-parchment/20 uppercase font-black tracking-[0.3em]">Nenhum combate ativo</p>
                        <p className="text-[9px] text-parchment/10 uppercase font-bold">O mestre deve iniciar uma nova batalha</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'bestiary' && (
          <motion.div 
            key="bestiary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row h-auto lg:h-[750px] gap-6 sm:gap-8"
          >
            {/* Monster List */}
            <div className="flex-1 space-y-6 sm:space-y-8 overflow-y-auto pr-0 lg:pr-4 custom-scrollbar">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sticky top-0 bg-midnight/80 backdrop-blur-md z-10 py-4 border-b border-white/5 gap-4">
                <div className="w-full sm:w-auto">
                  <h2 className="text-3xl sm:text-5xl font-display font-black text-gold uppercase tracking-tighter leading-none">Bestiário</h2>
                  <p className="text-parchment/40 font-black tracking-[0.3em] uppercase text-[8px] sm:text-[9px] mt-2 flex items-center gap-2">
                    <Skull size={12} className="text-gold/40" />
                    Conhecimento Ancestral & Criaturas Perigosas
                  </p>
                </div>
                
                <div className="relative group w-full sm:w-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/40 group-focus-within:text-gold transition-colors" />
                  <input 
                    type="text"
                    placeholder="Buscar monstros..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-72 bg-midnight/60 border border-white/10 rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-12 pr-6 text-xs sm:text-sm text-parchment placeholder:text-parchment/20 focus:outline-none focus:border-gold/40 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 pt-4">
                {filteredMonsters.map((monster) => {
                  const isUnlocked = unlockedMonsters.includes(monster.id);
                  const showContent = isDM || isUnlocked;

                  return (
                    <motion.div
                      key={monster.id}
                      onClick={() => setSelectedMonster(monster)}
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "group relative p-4 sm:p-8 glass-card cursor-pointer transition-all border-white/5 overflow-hidden",
                        selectedMonster?.id === monster.id ? "border-gold/50 bg-gold/5 shadow-2xl shadow-gold/10" : "hover:border-gold/30 hover:bg-white/5"
                      )}
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-bl from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {!showContent ? (
                        <div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-4 sm:space-y-6">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-2xl sm:rounded-3xl flex items-center justify-center text-parchment/10 border border-white/5 shadow-inner">
                            <Lock size={24} className="sm:w-8 sm:h-8" strokeWidth={1.5} />
                          </div>
                          <div className="text-[8px] sm:text-[9px] font-black text-parchment/20 uppercase tracking-[0.3em]">Conhecimento Oculto</div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between mb-4 sm:mb-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gold/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-gold group-hover:scale-110 transition-transform shadow-inner border border-gold/20">
                              <Skull className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="text-right">
                              <div className="text-[9px] sm:text-[10px] font-black text-gold uppercase tracking-widest">CR {monster.challenge}</div>
                              <div className="text-[8px] sm:text-[9px] text-parchment/40 uppercase font-black tracking-tighter mt-0.5">{monster.xp} XP</div>
                            </div>
                          </div>

                          <h3 className="text-xl sm:text-2xl font-display font-black text-parchment uppercase tracking-tight mb-1 group-hover:text-gold transition-colors truncate">{monster.name}</h3>
                          <p className="text-[9px] sm:text-[10px] text-parchment/40 font-black uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-gold/40" />
                            {monster.size} {monster.type}
                          </p>

                          <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/5 flex items-center justify-center text-gold/40 border border-white/5">
                                <Shield size={12} className="sm:w-3.5 sm:h-3.5" />
                              </div>
                              <div>
                                <div className="text-[7px] sm:text-[8px] font-black text-parchment/20 uppercase tracking-widest leading-none">CA</div>
                                <div className="text-xs sm:text-sm font-black text-parchment">{monster.ac}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-red-500/5 flex items-center justify-center text-red-500/40 border border-red-500/10">
                                <Heart size={12} className="sm:w-3.5 sm:h-3.5" />
                              </div>
                              <div>
                                <div className="text-[7px] sm:text-[8px] font-black text-parchment/20 uppercase tracking-widest leading-none">PV</div>
                                <div className="text-xs sm:text-sm font-black text-parchment">{monster.hp}</div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Monster Details Sidebar */}
            <AnimatePresence>
              {selectedMonster && (
                <motion.div
                  initial={{ x: 400, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 400, opacity: 0 }}
                  className="fixed inset-0 lg:relative lg:inset-auto z-[60] lg:z-auto w-full lg:w-[500px] liquid-glass p-6 sm:p-10 overflow-y-auto custom-scrollbar border-l border-white/5"
                >
                  <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold/5 to-transparent pointer-events-none" />
                  
                  {(!isDM && !unlockedMonsters.includes(selectedMonster.id)) ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
                      <div className="w-24 h-24 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center text-gold/20 animate-pulse">
                        <Lock size={48} strokeWidth={1} />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-3xl font-display font-black text-gold uppercase tracking-widest">Conteúdo Bloqueado</h3>
                        <p className="text-sm text-parchment/40 max-w-xs mx-auto leading-relaxed">O Mestre ainda não revelou os segredos desta criatura para o grupo.</p>
                      </div>
                      <button 
                        onClick={() => setSelectedMonster(null)}
                        className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-gold uppercase tracking-[0.3em] hover:bg-gold hover:text-midnight transition-all"
                      >
                        Voltar para a Lista
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-10 relative z-10">
                      <div className="flex items-center justify-between">
                        <button 
                          onClick={() => setSelectedMonster(null)}
                          className="flex items-center gap-2 text-[10px] font-black text-parchment/40 hover:text-gold uppercase tracking-[0.2em] transition-all group/back"
                        >
                          <X size={14} className="group-hover/back:rotate-90 transition-transform" />
                          Fechar Detalhes
                        </button>
                        <div className="flex items-center gap-4">
                          {isDM && (
                            <button 
                              onClick={() => unlockedMonsters.includes(selectedMonster.id) ? lockMonster(selectedMonster.id) : unlockMonster(selectedMonster.id)}
                              className={cn(
                                "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border shadow-lg",
                                unlockedMonsters.includes(selectedMonster.id) 
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10" 
                                  : "bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/10"
                              )}
                            >
                              {unlockedMonsters.includes(selectedMonster.id) ? <Unlock size={12} /> : <Lock size={12} />}
                              {unlockedMonsters.includes(selectedMonster.id) ? 'Revelado' : 'Oculto'}
                            </button>
                          )}
                          <div className="px-4 py-2 bg-gold/10 border border-gold/20 rounded-xl text-[10px] font-black text-gold uppercase tracking-widest shadow-lg shadow-gold/10">
                            CR {selectedMonster.challenge}
                          </div>
                        </div>
                      </div>

                      {(!isDM && !unlockedMonsters.includes(selectedMonster.id)) ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center space-y-8">
                          <div className="w-24 h-24 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center text-gold/20 animate-pulse">
                            <Lock size={48} strokeWidth={1} />
                          </div>
                          <div className="space-y-4">
                            <h3 className="text-3xl font-display font-black text-gold uppercase tracking-widest">Conteúdo Bloqueado</h3>
                            <p className="text-sm text-parchment/40 max-w-xs mx-auto leading-relaxed">O Mestre ainda não revelou os segredos desta criatura para o grupo.</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center text-gold border border-gold/20 shadow-inner">
                                <Skull size={32} />
                              </div>
                              <div>
                                <h2 className="text-5xl font-display font-black text-parchment uppercase tracking-tighter leading-none">{selectedMonster.name}</h2>
                                <p className="text-[10px] text-parchment/40 font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                                  {selectedMonster.size} {selectedMonster.type}
                                  <span className="w-1 h-1 rounded-full bg-gold/20" />
                                  {selectedMonster.alignment}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="p-6 bg-white/2 rounded-3xl border border-white/5 text-center shadow-inner group/stat">
                              <Shield className="w-6 h-6 text-gold/40 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                              <div className="text-[8px] font-black text-parchment/20 uppercase tracking-widest mb-1">Armadura</div>
                              <div className="text-2xl font-black text-parchment">{selectedMonster.ac}</div>
                            </div>
                            <div className="p-6 bg-white/2 rounded-3xl border border-white/5 text-center shadow-inner group/stat">
                              <Heart className="w-6 h-6 text-red-500/40 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                              <div className="text-[8px] font-black text-parchment/20 uppercase tracking-widest mb-1">Vida</div>
                              <div className="text-2xl font-black text-parchment">{selectedMonster.hp}</div>
                            </div>
                            <div className="p-6 bg-white/2 rounded-3xl border border-white/5 text-center shadow-inner group/stat">
                              <Zap className="w-6 h-6 text-emerald-500/40 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                              <div className="text-[8px] font-black text-parchment/20 uppercase tracking-widest mb-1">Velocidade</div>
                              <div className="text-2xl font-black text-parchment">{selectedMonster.speed}</div>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="h-px flex-1 bg-white/5" />
                              <span className="text-[9px] font-black text-gold/40 uppercase tracking-[0.3em]">Atributos</span>
                              <div className="h-px flex-1 bg-white/5" />
                            </div>
                            <div className="grid grid-cols-6 gap-2">
                              {Object.entries(selectedMonster.attributes).map(([stat, value]) => (
                                <div key={stat} className="p-3 bg-white/2 rounded-2xl border border-white/5 text-center group/stat-mini">
                                  <div className="text-[8px] font-black text-parchment/20 uppercase tracking-widest mb-1 group-hover:text-gold/40 transition-colors">{stat}</div>
                                  <div className="text-sm font-black text-parchment">{value}</div>
                                  <div className="text-[9px] font-bold text-gold/40">
                                    {(() => {
                                      const mod = Math.floor((Number(value) - 10) / 2);
                                      if (isNaN(mod)) return '0';
                                      return (mod >= 0 ? '+' : '') + mod;
                                    })()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="h-px flex-1 bg-white/5" />
                              <span className="text-[9px] font-black text-gold/40 uppercase tracking-[0.3em]">Habilidades</span>
                              <div className="h-px flex-1 bg-white/5" />
                            </div>
                            <div className="space-y-4">
                              {selectedMonster.traits.map((trait, idx) => (
                                <div key={idx} className="p-5 bg-white/2 rounded-2xl border border-white/5 hover:border-gold/20 transition-all group/ability">
                                  <h4 className="text-xs font-black text-gold uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
                                    {trait.name}
                                  </h4>
                                  <p className="text-xs text-parchment/60 leading-relaxed">{trait.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="h-px flex-1 bg-white/5" />
                              <span className="text-[9px] font-black text-gold/40 uppercase tracking-[0.3em]">Ações</span>
                              <div className="h-px flex-1 bg-white/5" />
                            </div>
                            <div className="space-y-4">
                              {selectedMonster.actions.map((action, idx) => (
                                <div key={idx} className="p-5 bg-white/2 rounded-2xl border border-white/5 hover:border-red-500/20 transition-all group/action">
                                  <h4 className="text-xs font-black text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Sword size={12} />
                                    {action.name}
                                  </h4>
                                  <p className="text-xs text-parchment/60 leading-relaxed">{action.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="h-px flex-1 bg-white/5" />
                              <span className="text-[9px] font-black text-gold/40 uppercase tracking-[0.3em]">Notas do Mestre</span>
                              <div className="h-px flex-1 bg-white/5" />
                            </div>
                            <div className="p-6 bg-gold/5 rounded-3xl border border-gold/10 relative overflow-hidden group/notes">
                              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FileText size={48} />
                              </div>
                              <textarea 
                                value={monsterNotes.find(n => n.monsterId === selectedMonster.id)?.content || ''}
                                onChange={(e) => saveMonsterNote(selectedMonster.id, e.target.value)}
                                placeholder="Adicione observações sobre esta criatura..."
                                className="w-full bg-transparent border-none outline-none text-xs text-parchment/80 placeholder:text-parchment/20 resize-none min-h-[120px] leading-relaxed relative z-10"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {activeTab === 'npcs' && (
          <motion.div 
            key="npcs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-3xl sm:text-4xl font-display font-black text-parchment uppercase tracking-tighter">Personagens do Mundo</h2>
                <p className="text-[10px] sm:text-xs text-parchment/40 font-black uppercase tracking-[0.2em]">Aliados, Inimigos e Figuras Notáveis</p>
              </div>
              {isDM && (
                <button 
                  onClick={() => {
                    setEditingNpc({ name: '', role: 'Aliado', race: 'Humano', charClass: 'Comum' });
                    setIsNpcModalOpen(true);
                  }}
                  className="w-full sm:w-auto group relative px-6 sm:px-8 py-3 sm:py-4 bg-gold text-midnight rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative flex items-center justify-center gap-2">
                    <Plus size={16} strokeWidth={3} />
                    Novo NPC
                  </span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {npcs.length === 0 ? (
                <div className="col-span-full py-20 sm:py-32 liquid-glass border-dashed border-2 border-gold/10 flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center text-gold/20">
                    <Users size={32} className="sm:w-10 sm:h-10" strokeWidth={1} />
                  </div>
                  <div className="space-y-2">
                    <p className="font-display text-xl sm:text-2xl text-gold/40 uppercase tracking-widest">Nenhum NPC Encontrado</p>
                    <p className="text-[10px] sm:text-xs text-parchment/20 uppercase font-black tracking-widest">O mundo parece estar vazio por enquanto...</p>
                  </div>
                </div>
              ) : (
                npcs.map(npc => (
                  <motion.div 
                    key={npc.id} 
                    layoutId={`npc-${npc.id}`}
                    className="liquid-glass group relative overflow-hidden aspect-[3/4] cursor-pointer border-white/5 hover:border-gold/30 transition-all duration-500 shadow-2xl"
                  >
                    <div className="absolute inset-0 z-0 scale-110 group-hover:scale-100 transition-transform duration-700">
                      {npc.appearance ? (
                        <img 
                          src={npc.appearance} 
                          alt={npc.name} 
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <RaceIcon 
                          race={npc.race} 
                          className="w-full h-full" 
                          iconClassName="w-1/4 h-1/4"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/40 to-transparent" />
                    </div>
                    
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex gap-1.5 sm:gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      {isDM && (
                        <>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingNpc(npc);
                              setIsNpcModalOpen(true);
                            }}
                            className="p-2 sm:p-3 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl hover:bg-gold hover:text-midnight transition-all shadow-xl"
                          >
                            <Edit3 size={12} className="sm:w-3.5 sm:h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmModal({
                                isOpen: true,
                                title: 'Apagar NPC',
                                message: `Tem certeza que deseja apagar o NPC ${npc.name}? Esta ação não pode ser desfeita.`,
                                onConfirm: () => deleteNPC(npc.id)
                              });
                            }}
                            className="p-2 sm:p-3 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-xl"
                            title="Remover NPC"
                          >
                            <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                          </button>
                        </>
                      )}
                    </div>

                    <div className="absolute inset-0 z-10 p-4 sm:p-8 flex flex-col justify-end space-y-3 sm:space-y-4">
                      <div className="space-y-1.5 sm:space-y-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-widest border shadow-lg",
                            npc.role === 'Aliado' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            npc.role === 'Inimigo' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                            "bg-gold/10 text-gold border-gold/20"
                          )}>
                            {npc.role}
                          </span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-display font-black text-parchment uppercase tracking-tighter leading-none truncate">{npc.name}</h3>
                        <div className="flex items-center gap-2 text-[8px] sm:text-[9px] text-parchment/40 font-black uppercase tracking-[0.2em]">
                          {npc.race}
                          <span className="w-1 h-1 rounded-full bg-gold/20" />
                          {npc.charClass}
                        </div>
                      </div>
                      
                      <div className="h-0 group-hover:h-10 sm:group-hover:h-12 opacity-0 group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                        <p className="text-[9px] sm:text-[10px] text-parchment/60 line-clamp-2 leading-relaxed italic">
                          "{npc.description || 'Nenhuma descrição disponível.'}"
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'quests' && (
          <motion.div 
            key="quests-container"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              backgroundColor: questSubTab === 'missions' ? 'rgba(10, 10, 12, 0)' : 'rgba(20, 40, 20, 0.2)' 
            }}
            exit={{ opacity: 0 }}
            className="space-y-8 sm:space-y-12 relative min-h-[700px] p-6 sm:p-10 rounded-[3rem] transition-colors duration-1000"
          >
            {/* Sub-tabs Toggle */}
            <div className="flex justify-center mb-12">
              <div className="bg-midnight/40 p-1.5 rounded-2xl border border-white/5 flex gap-2 backdrop-blur-md">
                <button 
                  onClick={() => {
                    setQuestSubTab('missions');
                    playSound('click');
                  }}
                  className={cn(
                    "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                    questSubTab === 'missions' ? "bg-gold text-midnight shadow-lg scale-105" : "text-parchment/40 hover:text-parchment"
                  )}
                >
                  Missões
                </button>
                <button 
                  onClick={() => {
                    setQuestSubTab('achievements');
                    playSound('click');
                  }}
                  className={cn(
                    "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                    questSubTab === 'achievements' ? "bg-gold text-midnight shadow-lg scale-105" : "text-parchment/40 hover:text-parchment"
                  )}
                >
                  Conquistas
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {questSubTab === 'missions' ? (
                <motion.div
                  key="missions-view"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                  className="space-y-8 sm:space-y-12"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                      <h2 className="text-3xl sm:text-5xl font-display font-black text-gold uppercase tracking-tighter leading-none">Diário de Missões</h2>
                      <p className="text-parchment/40 font-black tracking-[0.3em] uppercase text-[8px] sm:text-[9px] mt-2 flex items-center gap-2">
                        <MapPin size={12} className="text-gold/40" />
                        Rumores, Objetivos & Descobertas em Chult
                      </p>
                    </div>
                    {isDM && (
                      <button 
                        onClick={() => setIsCreateQuestModalOpen(true)}
                        className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 bg-gold text-midnight rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-[0_10px_20px_rgba(212,175,55,0.3)]"
                      >
                        Nova Missão / Rumor
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {(['main', 'side', 'rumor'] as const).map(type => (
                      <div key={type} className="space-y-4 sm:space-y-6">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]",
                            type === 'main' ? "bg-gold" : type === 'side' ? "bg-blue-400" : "bg-purple-400"
                          )} />
                          <h3 className="text-[10px] sm:text-xs font-black text-parchment/40 uppercase tracking-[0.3em]">
                            {type === 'main' ? 'Missões Principais' : type === 'side' ? 'Missões Secundárias' : 'Rumores & Pistas'}
                          </h3>
                        </div>
                        
                        <div className="space-y-3 sm:space-y-4">
                          {currentCampaign.quests?.filter(q => q.type === type).map(quest => (
                            <motion.div 
                              key={quest.id}
                              layoutId={quest.id}
                              className={cn(
                                "glass-card p-4 sm:p-6 border-white/5 hover:border-gold/20 transition-all group relative overflow-hidden",
                                quest.status === 'completed' && "opacity-60 grayscale"
                              )}
                            >
                              <div className="flex justify-between items-start mb-3 sm:mb-4">
                                <h4 className="text-base sm:text-lg font-display font-black text-parchment uppercase tracking-tight group-hover:text-gold transition-colors truncate max-w-[150px] sm:max-w-none">{quest.title}</h4>
                                {isDM && (
                                  <div className="flex gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => updateQuest(quest.id, { status: quest.status === 'completed' ? 'active' : 'completed' })} className="p-1.5 sm:p-2 hover:text-emerald-400 transition-colors"><Trophy size={14} /></button>
                                    <button onClick={() => deleteQuest(quest.id)} className="p-1.5 sm:p-2 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                                  </div>
                                )}
                              </div>
                              <p className="text-[10px] sm:text-xs text-parchment/60 leading-relaxed mb-4 line-clamp-3 group-hover:line-clamp-none transition-all">{quest.description}</p>
                              <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-white/5">
                                <span className={cn(
                                  "text-[7px] sm:text-[8px] font-black uppercase tracking-widest px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md",
                                  quest.status === 'active' ? "bg-gold/10 text-gold" : "bg-emerald-500/10 text-emerald-400"
                                )}>
                                  {quest.status}
                                </span>
                                <span className="text-[7px] sm:text-[8px] text-parchment/20 uppercase font-black">
                                  {new Date(quest.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                          {(!currentCampaign.quests || currentCampaign.quests.filter(q => q.type === type).length === 0) && (
                            <div className="p-8 border border-dashed border-white/5 rounded-3xl text-center">
                              <p className="text-[10px] text-parchment/20 uppercase font-black tracking-widest">Nenhum registro encontrado</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="achievements-view"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                  className="space-y-12 relative"
                >
                  {/* Background Art */}
                  <div className="absolute inset-0 -z-10 opacity-10 blur-sm pointer-events-none overflow-hidden rounded-[4rem]">
                    <img 
                      src="https://i.pinimg.com/1200x/56/7a/6c/567a6ced3ccd14aadab3042bada14a15.jpg" 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight via-transparent to-midnight" />
                  </div>

                  <div className="text-center space-y-4">
                    <h2 className="text-4xl sm:text-6xl font-display font-black text-parchment uppercase tracking-tighter leading-none drop-shadow-2xl">Salão de Conquistas</h2>
                    <p className="text-gold font-black tracking-[0.4em] uppercase text-[9px] sm:text-[10px]">Glória Eterna aos Heróis de Chult</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {(currentCampaign.achievements || TOA_ACHIEVEMENTS).map(achievement => {
                      const unlockedBy = campaignCharacters.filter(c => c.profile?.achievements?.some(a => a.id === achievement.id));
                      return (
                        <div 
                          key={achievement.id}
                          className="liquid-glass p-8 border-white/5 hover:border-gold/30 transition-all duration-500 group relative overflow-hidden"
                        >
                          <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/10 transition-all duration-1000" />
                          
                          <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="text-4xl group-hover:scale-125 transition-transform duration-500">{achievement.icon}</div>
                            <div className={cn(
                              "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                              achievement.tier === 'bronze' ? "bg-orange-900/20 text-orange-400 border-orange-500/30" :
                              achievement.tier === 'silver' ? "bg-slate-400/20 text-slate-300 border-slate-400/30" :
                              achievement.tier === 'gold' ? "bg-gold/20 text-gold border-gold/30" :
                              "bg-purple-500/20 text-purple-400 border-purple-500/30"
                            )}>
                              {achievement.tier}
                            </div>
                          </div>

                          <div className="space-y-2 relative z-10">
                            <h3 className="text-xl font-display font-black text-parchment uppercase tracking-tight group-hover:text-gold transition-colors">{achievement.name}</h3>
                            <p className="text-[10px] text-parchment/40 leading-relaxed italic">"{achievement.description}"</p>
                          </div>

                          <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
                            <div className="text-[8px] font-black text-gold/40 uppercase tracking-widest mb-4">Desbloqueado por:</div>
                            <div className="flex flex-wrap gap-2">
                              {unlockedBy.length > 0 ? unlockedBy.map(char => (
                                <div 
                                  key={char.id}
                                  className="w-8 h-8 rounded-lg overflow-hidden border border-gold/20 shadow-lg"
                                  title={char.name}
                                >
                                  {char.appearance ? (
                                    <img src={char.appearance} alt={char.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <RaceIcon race={char.race} className="w-full h-full" />
                                  )}
                                </div>
                              )) : (
                                <span className="text-[8px] text-parchment/20 uppercase font-black tracking-widest">Ninguém ainda...</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combat Game Fullscreen Overlay */}
      <AnimatePresence>
        {currentCampaign.combat?.active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150]"
          >
            <CombatGame campaign={currentCampaign} isDM={isDM} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combat Setup Modal */}
      <CombatSetupModal 
        isOpen={isCombatSetupOpen}
        onClose={() => setIsCombatSetupOpen(false)}
      />


      {/* NPC Modal */}
      <AnimatePresence>
        {isNpcModalOpen && editingNpc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNpcModalOpen(false)}
              className="absolute inset-0 bg-midnight/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg glass-card p-6 sm:p-8 space-y-4 sm:space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <h2 className="text-xl sm:text-2xl font-display font-bold text-gold uppercase tracking-widest">
                {editingNpc.id ? 'Edit NPC' : 'Create NPC'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-parchment/40">Name</label>
                  <input 
                    type="text" 
                    value={editingNpc.name}
                    onChange={(e) => setEditingNpc({ ...editingNpc, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 sm:p-3 text-sm focus:outline-none focus:border-gold/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-parchment/40">Role</label>
                  <input 
                    type="text" 
                    value={editingNpc.role}
                    onChange={(e) => setEditingNpc({ ...editingNpc, role: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 sm:p-3 text-sm focus:outline-none focus:border-gold/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-parchment/40">Race</label>
                  <input 
                    type="text" 
                    value={editingNpc.race}
                    onChange={(e) => setEditingNpc({ ...editingNpc, race: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 sm:p-3 text-sm focus:outline-none focus:border-gold/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-parchment/40">Class</label>
                  <input 
                    type="text" 
                    value={editingNpc.charClass}
                    onChange={(e) => setEditingNpc({ ...editingNpc, charClass: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 sm:p-3 text-sm focus:outline-none focus:border-gold/30"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-parchment/40">Appearance URL</label>
                <input 
                  type="text" 
                  value={editingNpc.appearance}
                  onChange={(e) => setEditingNpc({ ...editingNpc, appearance: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 sm:p-3 text-sm focus:outline-none focus:border-gold/30"
                  placeholder="https://..."
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                <button 
                  onClick={() => setIsNpcModalOpen(false)}
                  className="w-full sm:flex-1 px-6 py-3 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    if (editingNpc.id) {
                      await updateNPC(editingNpc.id, editingNpc);
                    } else {
                      await createNPC(editingNpc);
                    }
                    setIsNpcModalOpen(false);
                  }}
                  className="w-full sm:flex-1 px-6 py-3 bg-gold text-midnight rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all"
                >
                  {editingNpc.id ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Scroll Modal */}
      <AnimatePresence>
        {isCreateScrollModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-midnight/80 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md glass-card p-6 sm:p-8 space-y-4 sm:space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-display font-bold text-gold uppercase tracking-widest">New Shared Scroll</h3>
                  <button onClick={() => setIsCreateScrollModalOpen(false)} className="text-parchment/40 hover:text-parchment">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gold/40 uppercase tracking-widest mb-2 block">Scroll Name</label>
                    <input 
                      type="text"
                      value={newScrollName}
                      onChange={(e) => setNewScrollName(e.target.value)}
                      placeholder="e.g., The Prophecy of the Void"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 sm:py-3 px-4 text-sm text-parchment focus:outline-none focus:border-gold/40"
                    />
                  </div>

                  {isDM ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gold/40 uppercase tracking-widest mb-2 block">Author 1</label>
                        <select 
                          value={selectedAuthor1Id}
                          onChange={(e) => setSelectedAuthor1Id(e.target.value)}
                          className="w-full bg-midnight border border-white/10 rounded-xl py-2.5 sm:py-3 px-4 text-sm text-parchment focus:outline-none focus:border-gold/40"
                        >
                          {campaignCharacters.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gold/40 uppercase tracking-widest mb-2 block">Author 2</label>
                        <select 
                          value={selectedAuthor2Id}
                          onChange={(e) => setSelectedAuthor2Id(e.target.value)}
                          className="w-full bg-midnight border border-white/10 rounded-xl py-2.5 sm:py-3 px-4 text-sm text-parchment focus:outline-none focus:border-gold/40"
                        >
                          {campaignCharacters.filter(c => c.id !== selectedAuthor1Id).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-[10px] font-bold text-gold/40 uppercase tracking-widest mb-2 block">Partner</label>
                      <select 
                        value={selectedPartnerId}
                        onChange={(e) => setSelectedPartnerId(e.target.value)}
                        className="w-full bg-midnight border border-white/10 rounded-xl py-2.5 sm:py-3 px-4 text-sm text-parchment focus:outline-none focus:border-gold/40"
                      >
                        {campaignCharacters.filter(c => c.userId !== user?.uid).map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => {
                    if (!newScrollName) return;
                    if (isDM) {
                      if (selectedAuthor1Id && selectedAuthor2Id) {
                        createScroll(newScrollName, currentCampaign.id, [selectedAuthor1Id, selectedAuthor2Id]);
                      }
                    } else {
                      const myChar = currentCharacter || campaignCharacters.find(c => c.userId === user?.uid);
                      if (myChar && selectedPartnerId) {
                        createScroll(newScrollName, currentCampaign.id, [myChar.id, selectedPartnerId]);
                      }
                    }
                    setIsCreateScrollModalOpen(false);
                  }}
                  disabled={!newScrollName}
                  className="w-full py-3 sm:py-4 bg-gold text-midnight font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  Create Scroll
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
              className="absolute inset-0 bg-midnight/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md liquid-glass p-6 sm:p-8 border-gold/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <Trash2 className="text-red-500 sm:w-6 sm:h-6" size={20} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-display font-bold text-parchment">{confirmModal.title}</h3>
                  <p className="text-[8px] sm:text-[10px] text-gold/60 font-black uppercase tracking-widest">Ação Crítica</p>
                </div>
              </div>
              
              <p className="text-sm sm:text-base text-parchment/70 mb-6 sm:mb-8 leading-relaxed">
                {confirmModal.message}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                  className="w-full sm:flex-1 px-6 py-2.5 sm:py-3 rounded-xl border border-white/10 text-parchment font-bold hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal({ ...confirmModal, isOpen: false });
                  }}
                  className="w-full sm:flex-1 px-6 py-2.5 sm:py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Quest Modal */}
      <AnimatePresence>
        {isCreateQuestModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateQuestModalOpen(false)}
              className="absolute inset-0 bg-midnight/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md liquid-glass p-6 sm:p-8 border-gold/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <h3 className="text-xl sm:text-2xl font-display font-black text-parchment uppercase tracking-tight mb-4 sm:mb-6">Nova Missão / Rumor</h3>
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gold uppercase tracking-widest mb-2 block">Título</label>
                  <input
                    type="text"
                    value={newQuest.title}
                    onChange={(e) => setNewQuest({ ...newQuest, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 text-sm text-parchment outline-none focus:border-gold/40"
                    placeholder="Ex: Encontrar o Templo de Savras"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gold uppercase tracking-widest mb-2 block">Tipo</label>
                  <div className="flex gap-2">
                    {(['main', 'side', 'rumor'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setNewQuest({ ...newQuest, type })}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest border transition-all",
                          newQuest.type === type ? "bg-gold text-midnight border-gold" : "bg-white/5 text-parchment/40 border-white/10"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gold uppercase tracking-widest mb-2 block">Descrição</label>
                  <textarea
                    value={newQuest.description}
                    onChange={(e) => setNewQuest({ ...newQuest, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 text-sm text-parchment outline-none focus:border-gold/40 min-h-[80px] sm:min-h-[100px]"
                    placeholder="Detalhes sobre o objetivo ou pista encontrada..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                  <button
                    onClick={() => setIsCreateQuestModalOpen(false)}
                    className="w-full sm:flex-1 px-6 py-2.5 sm:py-3 rounded-xl border border-white/10 text-parchment font-bold hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (newQuest.title && newQuest.description) {
                        addQuest(newQuest);
                        setIsCreateQuestModalOpen(false);
                        setNewQuest({ title: '', description: '', type: 'main' });
                        playSound('success');
                      }
                    }}
                    className="w-full sm:flex-1 px-6 py-2.5 sm:py-3 rounded-xl bg-gold text-midnight font-bold hover:scale-105 transition-all shadow-lg shadow-gold/20"
                  >
                    Criar Registro
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isVotingModalOpen && currentCampaign?.activeVoting && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-midnight/95 backdrop-blur-xl"
              onClick={() => setIsVotingModalOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl liquid-glass border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-4 sm:p-8 border-b border-white/5 bg-white/2 flex items-center justify-between">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shadow-lg">
                    <Zap size={20} className="sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-3xl font-display font-black text-parchment uppercase tracking-tight truncate max-w-[200px] sm:max-w-none">
                      {currentCampaign.activeVoting.title}
                    </h2>
                  </div>
                </div>
                <button 
                  onClick={() => setIsVotingModalOpen(false)}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/5 flex items-center justify-center text-parchment/40 hover:text-ruby hover:bg-ruby/10 transition-all"
                >
                  <X size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                  {currentCampaign.activeVoting.options.map((option) => {
                    const voteCount = Object.values(currentCampaign.activeVoting!.votes).filter(v => v === option.id).length;
                    const totalVotes = Object.keys(currentCampaign.activeVoting!.votes).length;
                    const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                    const isSelected = currentCampaign.activeVoting!.votes[user?.uid || ''] === option.id;

                    return (
                      <motion.div 
                        key={option.id}
                        whileHover={{ y: -10 }}
                        className={cn(
                          "liquid-glass flex flex-col group relative overflow-hidden transition-all duration-500",
                          isSelected ? "border-gold bg-gold/5 ring-1 ring-gold/20" : "border-white/5 hover:border-white/20"
                        )}
                      >
                        {/* Image */}
                        <div className="aspect-[3/4] relative overflow-hidden">
                          <img 
                            src={option.image} 
                            alt={option.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/20 to-transparent" />
                          
                          {/* Vote Badge */}
                          <div className="absolute top-3 sm:top-4 right-3 sm:top-4 px-2 sm:px-3 py-1 sm:py-1.5 bg-midnight/80 backdrop-blur-md border border-white/10 rounded-lg flex items-center gap-1.5 sm:gap-2">
                            <Users size={10} className="sm:w-3 sm:h-3 text-gold" />
                            <span className="text-[9px] sm:text-[10px] font-black text-parchment">{voteCount}</span>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 flex-1 flex flex-col">
                          <div>
                            <h3 className="text-lg sm:text-xl font-display font-black text-parchment uppercase tracking-tight group-hover:text-gold transition-colors">
                              {option.name}
                            </h3>
                          </div>

                          <p className="text-xs text-parchment/60 leading-relaxed line-clamp-4 italic">
                            "{option.description}"
                          </p>

                          <div className="space-y-2 pt-4 mt-auto">
                            <div className="text-[8px] font-black uppercase tracking-widest text-gold/60">Bônus de Grupo</div>
                            <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-lg">
                              {option.bonus}
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="pt-6 space-y-2">
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-parchment/30">
                              <span>Preferência</span>
                              <span>{Math.round(percentage)}%</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                className={cn(
                                  "h-full transition-all duration-1000",
                                  isSelected ? "bg-gold" : "bg-white/20"
                                )}
                              />
                            </div>
                          </div>

                          <button 
                            onClick={() => submitVote(currentCampaign.activeVoting!.id, option.id)}
                            disabled={isSelected}
                            className={cn(
                              "w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mt-6",
                              isSelected 
                                ? "bg-gold text-midnight cursor-default shadow-[0_0_20px_rgba(212,175,55,0.3)]" 
                                : "bg-white/5 text-parchment/40 hover:bg-gold hover:text-midnight hover:shadow-lg"
                            )}
                          >
                            {isSelected ? 'Voto Confirmado' : 'Votar neste Guia'}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="p-8 border-t border-white/5 bg-white/2 flex items-center justify-between">
                <div className="flex items-center gap-4 text-parchment/40">
                  <Info size={16} />
                  <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                    A escolha do guia é uma decisão coletiva. O guia com mais votos será contratado pelo grupo.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Votação em Tempo Real</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
