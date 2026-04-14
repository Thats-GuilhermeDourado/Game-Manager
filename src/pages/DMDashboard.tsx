import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Minus, 
  Zap, 
  Coffee, 
  Moon, 
  Gift, 
  Skull, 
  Eye, 
  ChevronRight,
  Search,
  Sword,
  Shield,
  Heart,
  Scroll as ScrollIcon,
  Sparkles,
  FileText,
  Grid3X3,
  Save,
  Lock,
  Unlock,
  Package,
  Trash2,
  Map as MapIcon,
  Compass,
  MessageSquare,
  Trophy,
  CheckCircle2,
  ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCharacter, Character, Scroll } from '../contexts/CharacterContext';
import { TOA_ACHIEVEMENTS, Achievement } from '../data/achievements';
import { GameIcon } from '../components/GameIcon';
import { ITEMS } from '../data/items';
import { MONSTERS } from '../data/monsters';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { RaceIcon } from '../components/RaceIcon';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function DMDashboard() {
  const navigate = useNavigate();
  const { 
    campaignCharacters, 
    currentCampaign, 
    distributeGroupXP, 
    distributeGroupGold,
    groupRest, 
    giveItemToCharacter, 
    loadCharacter,
    addXPToCharacter,
    addGoldToCharacter,
    createCampaign,
    createScroll,
    updateScroll,
    deleteScroll,
    createNPC,
    updateNPC,
    deleteNPC,
    npcs,
    user,
    lockMonster,
    unlockMonster,
    startGuideSelection,
    closeVoting,
    grantAchievement,
    initializeCampaignAchievements,
    startMerchantEvent,
    closeMerchantEvent
  } = useCharacter();

  useEffect(() => {
    if (currentCampaign && user && currentCampaign.dmId !== user.uid) {
      navigate('/dashboard');
    }
  }, [currentCampaign, user, navigate]);

  const [activeTab, setActiveTab] = useState<'party' | 'bestiary' | 'campaign' | 'scrolls' | 'tactics' | 'npcs' | 'actions' | 'achievements'>('party');
  const [xpAmount, setXpAmount] = useState(100);
  const [goldAmount, setGoldAmount] = useState(50);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCampaignName, setNewCampaignName] = useState('');
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  
  const [scrolls, setScrolls] = useState<Scroll[]>([]);
  const [selectedScroll, setSelectedScroll] = useState<Scroll | null>(null);
  const [scrollContent, setScrollContent] = useState('');
  const [formation, setFormation] = useState<Record<string, { x: number; y: number; role: string }>>({});

  const [isNPCModalOpen, setIsNPCModalOpen] = useState(false);
  const [editingNPC, setEditingNPC] = useState<any>(null);
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
  const [npcForm, setNpcForm] = useState({
    name: '',
    race: '',
    charClass: '',
    role: '',
    description: '',
    appearance: ''
  });

  const { saveFormation } = useCharacter();

  // Sincronização de Pergaminhos
  useEffect(() => {
    if (!currentCampaign) return;
    const q = query(collection(db, "scrolls"), where("campaignId", "==", currentCampaign.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setScrolls(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scroll)));
    });
    return () => unsubscribe();
  }, [currentCampaign?.id]);

  // Sincronização da Formação
  useEffect(() => {
    if (currentCampaign?.formation) {
      setFormation(currentCampaign.formation);
    }
  }, [currentCampaign?.id, currentCampaign?.formation]);

  useEffect(() => {
    if (selectedScroll) {
      setScrollContent(selectedScroll.content || '');
    }
  }, [selectedScroll?.id]);

  const filteredItems = Object.values(ITEMS).filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDistributeXP = async () => {
    await distributeGroupXP(xpAmount);
  };

  const handleGiveItem = async (item: any) => {
    if (!selectedCharId) return;
    await giveItemToCharacter(selectedCharId, item);
    setIsItemModalOpen(false);
  };

  const handleCreateCampaign = async () => {
    if (!newCampaignName) return;
    const code = await createCampaign(newCampaignName);
    if (code) {
      setShowCreateCampaign(false);
      setNewCampaignName('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20 space-y-12">
      {/* Master Header */}
      <div className="liquid-glass p-12 border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gold/5 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shadow-2xl group-hover:scale-110 transition-transform duration-700">
                <MapIcon size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-6xl font-display font-black text-parchment uppercase tracking-tighter drop-shadow-2xl">Master Controls</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[8px] font-black text-gold uppercase tracking-[0.2em] shadow-inner">
                    {currentCampaign ? `Campanha: ${currentCampaign.name}` : 'Dungeon Master Dashboard'}
                  </span>
                  {currentCampaign && (
                    <span className="text-[8px] text-parchment/20 uppercase font-black tracking-widest">
                      Código: {currentCampaign.inviteCode}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {!currentCampaign ? (
              <button 
                onClick={() => setShowCreateCampaign(true)}
                className="px-8 py-4 rounded-2xl bg-gold text-midnight text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_10px_20px_rgba(212,175,55,0.3)]"
              >
                Criar Campanha
              </button>
            ) : (
              <div className="flex gap-4">
                <button 
                  onClick={() => groupRest('short')}
                  className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-parchment uppercase tracking-[0.2em] hover:bg-white/10 transition-all shadow-xl"
                >
                  Descanso Curto
                </button>
                <button 
                  onClick={() => groupRest('long')}
                  className="px-8 py-4 rounded-2xl bg-gold text-midnight text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_10px_20px_rgba(212,175,55,0.3)]"
                >
                  Descanso Longo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-4 p-2 bg-white/2 border border-white/5 rounded-3xl shadow-inner">
        {[
          { id: 'party', label: 'Grupo', icon: Users },
          { id: 'npcs', label: 'NPCs', icon: Users },
          { id: 'scrolls', label: 'Cérebro Virtual', icon: ScrollIcon },
          { id: 'tactics', label: 'Táticas', icon: Shield },
          { id: 'bestiary', label: 'Bestiário', icon: Skull },
          { id: 'achievements', label: 'Conquistas', icon: Trophy },
          { id: 'actions', label: 'Atalhos', icon: Zap },
          { id: 'campaign', label: 'Campanha', icon: Package },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 min-w-[120px] flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
              activeTab === tab.id 
                ? "bg-gold text-midnight shadow-[0_5px_15px_rgba(212,175,55,0.3)]" 
                : "text-parchment/20 hover:text-parchment hover:bg-white/5"
            )}
          >
            <tab.icon size={16} strokeWidth={3} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'party' && (
          <motion.div 
            key="party"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-12"
          >
            {/* Party Overview */}
            <div className="xl:col-span-8 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-display font-black flex items-center gap-4 text-parchment uppercase tracking-tight">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shadow-lg">
                    <Users size={24} />
                  </div>
                  O Grupo de Aventureiros
                </h2>
              </div>

                {campaignCharacters.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {campaignCharacters.map((char, i) => (
                      <motion.div 
                        key={char.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => setSelectedCharId(char.id)}
                        className={cn(
                          "liquid-glass p-8 relative group overflow-hidden cursor-pointer transition-all duration-500",
                          selectedCharId === char.id ? "border-gold/40 bg-gold/5 shadow-[0_0_30px_rgba(212,175,55,0.1)]" : "hover:border-gold/20"
                        )}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gold/5 to-transparent pointer-events-none" />
                        
                        <div className="flex items-center gap-6 mb-8 relative z-10">
                          <div className="relative">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-gold/40 transition-all duration-500 shadow-2xl">
                              {char.appearance ? (
                                <img 
                                  src={char.appearance} 
                                  alt={char.name} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                              ) : (
                                <RaceIcon 
                                  race={char.race} 
                                  className="w-full h-full rounded-2xl" 
                                />
                              )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-midnight border border-white/10 rounded-xl flex items-center justify-center text-gold shadow-xl z-20">
                              <span className="text-xs font-black">{char.level}</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-display font-black text-parchment group-hover:text-gold transition-colors tracking-tight uppercase leading-none">{char.name}</h3>
                            <div className="text-[10px] text-parchment/40 uppercase tracking-widest font-black mt-2">{char.race} • {char.charClass}</div>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              loadCharacter(char.id);
                              navigate('/character');
                            }}
                            className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-gold hover:bg-gold hover:text-midnight transition-all hover:scale-110 shadow-lg"
                            title="Ver Ficha"
                          >
                            <Eye size={20} />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-8">
                          <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/10 shadow-inner">
                            <div className="text-[8px] uppercase text-gold/60 font-black tracking-widest mb-1">HP</div>
                            <div className="text-sm font-black text-parchment">{char.hp?.current || 0}/{char.hp?.max || 0}</div>
                          </div>
                          <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/10 shadow-inner">
                            <div className="text-[8px] uppercase text-gold/60 font-black tracking-widest mb-1">CA</div>
                            <div className="text-sm font-black text-parchment">{char.ac}</div>
                          </div>
                          <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/10 shadow-inner">
                            <div className="text-[8px] uppercase text-gold/60 font-black tracking-widest mb-1">Ouro</div>
                            <div className="text-sm font-black text-parchment">{char.gold}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              addXPToCharacter(char.id, xpAmount);
                            }}
                            className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-parchment/60 uppercase tracking-widest hover:bg-gold hover:text-midnight hover:border-gold transition-all shadow-lg group/btn"
                          >
                            <Plus size={14} className="group-hover/btn:scale-110 transition-transform" /> {xpAmount} XP
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              addGoldToCharacter(char.id, goldAmount);
                            }}
                            className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-parchment/60 uppercase tracking-widest hover:bg-gold hover:text-midnight hover:border-gold transition-all shadow-lg group/btn"
                          >
                            <Plus size={14} className="group-hover/btn:scale-110 transition-transform" /> {goldAmount} GP
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCharId(char.id);
                              setIsItemModalOpen(true);
                            }}
                            className="col-span-2 flex items-center justify-center gap-2 py-3 bg-gold/10 border border-gold/20 rounded-xl text-[9px] font-black text-gold uppercase tracking-widest hover:bg-gold hover:text-midnight transition-all shadow-lg group/btn"
                          >
                            <Gift size={14} className="group-hover/btn:scale-110 transition-transform" /> Dar Item
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="liquid-glass p-20 text-center space-y-8 border-white/5">
                    <div className="w-24 h-24 bg-gold/5 rounded-full flex items-center justify-center mx-auto border border-gold/10">
                      <Users className="text-gold/20 w-12 h-12" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-display font-black text-parchment/60 uppercase tracking-tight">Nenhum Aventureiro</h3>
                      <p className="text-sm text-parchment/40 max-w-md mx-auto leading-relaxed">
                        Convide seus jogadores usando o código <span className="text-gold font-black tracking-widest">{currentCampaign?.inviteCode}</span> ou entre com seu próprio personagem.
                      </p>
                    </div>
                  </div>
                )}
            </div>

            {/* Global Controls */}
            <div className="xl:col-span-4 space-y-12">
              <section className="liquid-glass p-10 space-y-10 border-white/5 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold/5 rounded-full blur-3xl" />
                
                <h2 className="text-2xl font-display font-black text-gold uppercase tracking-tighter flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <Zap size={20} />
                  </div>
                  Recompensas Globais
                </h2>
                <div className="space-y-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <button onClick={() => setXpAmount(Math.max(0, xpAmount - 50))} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gold hover:bg-gold hover:text-midnight transition-all shadow-lg"><Minus size={20} /></button>
                      <div className="flex-1 text-center">
                        <div className="text-4xl font-display font-black text-parchment tracking-tighter">{xpAmount}</div>
                        <div className="text-[8px] text-parchment/30 uppercase font-black tracking-[0.3em] mt-1">Quantidade de XP</div>
                      </div>
                      <button onClick={() => setXpAmount(xpAmount + 50)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gold hover:bg-gold hover:text-midnight transition-all shadow-lg"><Plus size={20} /></button>
                    </div>
                    <button onClick={handleDistributeXP} className="w-full py-4 bg-gold/10 border border-gold/20 rounded-2xl text-[10px] font-black text-gold uppercase tracking-widest hover:bg-gold hover:text-midnight transition-all shadow-xl">Distribuir XP para o Grupo</button>
                  </div>

                  <div className="h-px bg-white/5" />

                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <button onClick={() => setGoldAmount(Math.max(0, goldAmount - 10))} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gold hover:bg-gold hover:text-midnight transition-all shadow-lg"><Minus size={20} /></button>
                      <div className="flex-1 text-center">
                        <div className="text-4xl font-display font-black text-parchment tracking-tighter">{goldAmount}</div>
                        <div className="text-[8px] text-parchment/30 uppercase font-black tracking-[0.3em] mt-1">Quantidade de Ouro</div>
                      </div>
                      <button onClick={() => setGoldAmount(goldAmount + 10)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gold hover:bg-gold hover:text-midnight transition-all shadow-lg"><Plus size={20} /></button>
                    </div>
                    <button 
                      onClick={() => distributeGroupGold(goldAmount)} 
                      className="w-full py-4 bg-gold/10 border border-gold/20 rounded-2xl text-[10px] font-black text-gold uppercase tracking-widest hover:bg-gold hover:text-midnight transition-all shadow-xl"
                    >
                      Distribuir Ouro para o Grupo
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        )}

        {activeTab === 'scrolls' && (
          <motion.div 
            key="scrolls"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[700px]"
          >
            {/* Sidebar: Library */}
            <div className="lg:col-span-4 liquid-glass p-8 flex flex-col gap-8 relative overflow-hidden group border-white/5">
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/10 transition-all duration-1000" />
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shadow-lg">
                    <ScrollIcon size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-black text-parchment uppercase tracking-tighter leading-none">Cérebro Virtual</h3>
                    <p className="text-[8px] text-parchment/30 font-black uppercase tracking-[0.2em] mt-1">Biblioteca da Campanha</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const name = prompt("Nome do Pergaminho:");
                    if (name && currentCampaign && user) createScroll(name, currentCampaign.id, [user.uid]);
                  }}
                  className="w-10 h-10 rounded-xl bg-gold text-midnight flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-gold/20"
                  title="Novo Pergaminho"
                >
                  <Plus size={20} strokeWidth={3} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar relative z-10">
                {scrolls.length === 0 ? (
                  <div className="py-20 text-center opacity-20 space-y-4">
                    <ScrollIcon size={48} className="mx-auto text-gold" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Nenhum conhecimento registrado...</p>
                  </div>
                ) : (
                  scrolls.map(scroll => (
                    <motion.div 
                      key={scroll.id} 
                      layout
                      className="relative group/item"
                    >
                      <button
                        onClick={() => setSelectedScroll(scroll)}
                        className={cn(
                          "w-full p-6 rounded-3xl border transition-all duration-500 text-left relative overflow-hidden group/btn",
                          selectedScroll?.id === scroll.id 
                            ? "bg-gold/10 border-gold/40 text-gold shadow-[0_10px_30px_rgba(212,175,55,0.1)]" 
                            : "bg-white/2 border-white/5 text-parchment/40 hover:border-white/20 hover:bg-white/5"
                        )}
                      >
                        <div className="flex items-center gap-5 relative z-10">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover/btn:scale-110",
                            selectedScroll?.id === scroll.id ? "bg-gold/20 border-gold/30" : "bg-white/5 border-white/10"
                          )}>
                            <ScrollIcon size={20} className={selectedScroll?.id === scroll.id ? "text-gold" : "text-parchment/20"} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-base font-black truncate block uppercase tracking-tight group-hover/btn:text-gold transition-colors">{scroll.name}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[8px] opacity-40 uppercase tracking-widest font-black">
                                {scroll.authorIds.length} Autores
                              </span>
                            </div>
                          </div>
                          <ChevronRight size={16} className={cn(
                            "transition-all duration-500",
                            selectedScroll?.id === scroll.id ? "text-gold translate-x-0" : "text-parchment/10 -translate-x-2 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0"
                          )} />
                        </div>
                      </button>
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
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-8 liquid-glass p-10 flex flex-col gap-8 relative overflow-hidden border-white/5">
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gold/5 to-transparent pointer-events-none" />
              
              {selectedScroll ? (
                <div className="flex flex-col h-full">
                  {/* Editor Header */}
                  <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2 backdrop-blur-sm rounded-t-3xl">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shadow-inner">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h3 className="text-3xl font-display font-black text-parchment uppercase tracking-tight">{selectedScroll.name}</h3>
                        <p className="text-[9px] font-black text-parchment/40 uppercase tracking-widest mt-1">Editando Conhecimento</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => updateScroll(selectedScroll.id, scrollContent)}
                      className="flex items-center gap-3 px-8 py-4 bg-gold text-midnight rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gold/20"
                    >
                      <Save size={16} strokeWidth={3} /> Salvar Alterações
                    </button>
                  </div>

                  <div className="flex-1 p-8 bg-midnight/20 rounded-b-3xl relative">
                    <textarea 
                      value={scrollContent}
                      onChange={(e) => setScrollContent(e.target.value)}
                      className="w-full h-full bg-transparent border-none text-parchment font-mono text-sm focus:outline-none resize-none custom-scrollbar leading-relaxed"
                      placeholder="Escreva o conhecimento aqui... Use Markdown para formatar."
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-20 text-center opacity-20 space-y-6">
                  <ScrollIcon size={80} className="text-gold" />
                  <div>
                    <h3 className="text-3xl font-display font-black text-parchment uppercase tracking-tight">Selecione um Pergaminho</h3>
                    <p className="text-[10px] font-black text-parchment/40 uppercase tracking-[0.3em] mt-2">Para ler ou editar o conhecimento compartilhado</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'tactics' && (
          <motion.div 
            key="tactics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-display font-black flex items-center gap-4 text-parchment uppercase tracking-tight">
                <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shadow-lg">
                  <MapIcon size={24} />
                </div>
                Formação Tática
              </h2>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-parchment/30">Arraste os personagens para planejar a estratégia</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <div className="liquid-glass p-8 aspect-video relative overflow-hidden bg-midnight/60 border-white/5 shadow-2xl">
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C9A03D 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                  
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full h-px bg-gold/5" />
                    <div className="h-full w-px bg-gold/5" />
                  </div>

                  <div className="relative w-full h-full border border-white/5 rounded-3xl" id="tactical-grid">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div id="formation-container" className="w-[85%] h-[85%] border-2 border-dashed border-gold/10 rounded-3xl relative">
                        {campaignCharacters.map((char, index) => {
                          const pos = formation[char.id] || { x: 50, y: 20 + (index * 15) };
                          return (
                            <motion.div
                              key={char.id}
                              drag
                              dragMomentum={false}
                              onDragEnd={(_, info) => {
                                const container = document.getElementById('formation-container');
                                if (!container) return;
                                const rect = container.getBoundingClientRect();
                                const x = Math.max(0, Math.min(100, (pos.x + (info.offset.x / rect.width) * 100)));
                                const y = Math.max(0, Math.min(100, (pos.y + (info.offset.y / rect.height) * 100)));
                                
                                const newFormation = {
                                  ...formation,
                                  [char.id]: { ...(formation[char.id] || { role: 'Midline' }), x, y }
                                };
                                setFormation(newFormation);
                                saveFormation(newFormation);
                              }}
                              className="absolute w-24 h-24 cursor-grab active:cursor-grabbing z-10"
                              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                            >
                              <div className="relative group/char">
                                <div className="w-20 h-20 rounded-2xl bg-midnight border-2 border-gold flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-transform group-hover/char:scale-110">
                                  {char.appearance ? (
                                    <img src={char.appearance} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <RaceIcon race={char.race} className="w-full h-full rounded-2xl" />
                                  )}
                                </div>
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-gold text-midnight text-[10px] font-black rounded-xl opacity-0 group-hover/char:opacity-100 transition-all whitespace-nowrap uppercase tracking-widest shadow-2xl">
                                  {char.name}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 space-y-6">
                <div className="liquid-glass p-8 space-y-8 border-white/5">
                  <h3 className="text-xs font-black text-gold uppercase tracking-[0.3em] flex items-center gap-3">
                    <Shield className="w-5 h-5" /> Papéis na Formação
                  </h3>
                  <div className="space-y-4">
                    {campaignCharacters.map(char => (
                      <div key={char.id} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-gold/20 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/10 bg-midnight group-hover:border-gold/40 transition-all">
                            {char.appearance ? (
                              <img src={char.appearance} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <RaceIcon race={char.race} className="w-full h-full rounded-xl" />
                            )}
                          </div>
                          <span className="text-sm font-black text-parchment uppercase tracking-tight group-hover:text-gold transition-colors">{char.name}</span>
                        </div>
                        <select 
                          value={formation[char.id]?.role || 'Midline'}
                          onChange={(e) => {
                            const newFormation = {
                              ...formation,
                              [char.id]: { ...(formation[char.id] || { x: 50, y: 50 }), role: e.target.value }
                            };
                            setFormation(newFormation);
                            saveFormation(newFormation);
                          }}
                          className="bg-midnight border border-white/10 rounded-xl text-[10px] px-4 py-2.5 text-gold font-black uppercase tracking-widest focus:outline-none focus:border-gold transition-all"
                        >
                          <option>Vanguard</option>
                          <option>Midline</option>
                          <option>Rearguard</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'npcs' && (
          <motion.div 
            key="npcs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-display font-black flex items-center gap-4 text-parchment uppercase tracking-tight">
                <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shadow-lg">
                  <Users size={24} />
                </div>
                NPCs da Campanha
              </h2>
              <button 
                onClick={() => {
                  setEditingNPC(null);
                  setNpcForm({ name: '', race: '', charClass: '', role: '', description: '', appearance: '' });
                  setIsNPCModalOpen(true);
                }}
                className="px-8 py-4 bg-gold text-midnight rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gold/20 flex items-center gap-3"
              >
                <Plus size={18} strokeWidth={3} /> Criar NPC
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {npcs.length === 0 ? (
                <div className="col-span-full py-32 liquid-glass border-dashed border-2 border-gold/10 flex flex-col items-center justify-center text-center opacity-40">
                  <Users size={64} className="mb-6 text-gold/40" />
                  <p className="font-display text-2xl uppercase tracking-widest text-parchment/40">Nenhum NPC registrado</p>
                </div>
              ) : (
                npcs.map(npc => (
                  <motion.div 
                    key={npc.id}
                    whileHover={{ y: -10 }}
                    className="liquid-glass group relative overflow-hidden aspect-[3/4] border-white/5 hover:border-gold/30 transition-all duration-500 shadow-2xl rounded-3xl"
                  >
                    {/* Background Image with Blending */}
                    <div className="absolute inset-0 z-0">
                      {npc.appearance ? (
                        <img 
                          src={npc.appearance} 
                          alt={npc.name}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <RaceIcon 
                          race={npc.race} 
                          className="w-full h-full" 
                          iconClassName="w-1/3 h-1/3"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/40 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 z-10 p-8 flex flex-col justify-end">
                      <div className="space-y-3 transform transition-transform duration-500 group-hover:-translate-y-2">
                        <div className={cn(
                          "w-fit px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] shadow-lg",
                          npc.role?.toLowerCase().includes('inimigo') || npc.role?.toLowerCase().includes('vilão') 
                            ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                            : npc.role?.toLowerCase().includes('aliado')
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-gold/20 text-gold border border-gold/30"
                        )}>
                          {npc.role}
                        </div>
                        <h3 className="text-3xl font-display font-black text-parchment uppercase tracking-tighter leading-none drop-shadow-2xl">{npc.name}</h3>
                        <div className="text-[10px] text-parchment/60 font-black uppercase tracking-[0.2em]">
                          {npc.race} • {npc.charClass}
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                        <p className="text-xs text-parchment/60 line-clamp-3 mb-6 italic leading-relaxed font-medium">
                          "{npc.description || 'Nenhuma descrição fornecida.'}"
                        </p>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => {
                              setEditingNPC(npc);
                              setNpcForm({
                                name: npc.name,
                                race: npc.race,
                                charClass: npc.charClass,
                                role: npc.role,
                                description: npc.description || '',
                                appearance: npc.appearance || ''
                              });
                              setIsNPCModalOpen(true);
                            }}
                            className="flex-1 py-3.5 bg-white/10 hover:bg-gold hover:text-midnight border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-parchment"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: 'Remover NPC',
                                message: `Deseja realmente remover o NPC ${npc.name}? Esta ação não pode ser desfeita.`,
                                onConfirm: () => deleteNPC(npc.id)
                              });
                            }}
                            className="w-12 h-12 flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'bestiary' && (
          <motion.div 
            key="bestiary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-display font-black flex items-center gap-4 text-parchment uppercase tracking-tight">
                <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shadow-lg">
                  <Skull size={24} />
                </div>
                Bestiário da Campanha
              </h2>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-parchment/30">Gerencie o conhecimento sobre as criaturas</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {MONSTERS.map(monster => {
                const isUnlocked = currentCampaign?.bestiary?.unlockedMonsters?.includes(monster.id);
                return (
                  <motion.div 
                    key={monster.id} 
                    whileHover={{ y: -5 }}
                    className="liquid-glass p-8 space-y-6 relative group overflow-hidden border-white/5 hover:border-gold/30 transition-all duration-500"
                  >
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/10 transition-all duration-1000" />
                    
                    <div className="flex justify-between items-start relative z-10">
                      <div className="w-14 h-14 bg-gold/10 rounded-2xl border border-gold/20 flex items-center justify-center text-gold shadow-lg group-hover:scale-110 transition-transform duration-500">
                        <Skull size={28} />
                      </div>
                      <button 
                        onClick={() => isUnlocked ? lockMonster(monster.id) : unlockMonster(monster.id)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg",
                          isUnlocked 
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white" 
                            : "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"
                        )}
                      >
                        {isUnlocked ? <Unlock size={14} strokeWidth={3} /> : <Lock size={14} strokeWidth={3} />}
                        {isUnlocked ? 'Desbloqueado' : 'Bloqueado'}
                      </button>
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-2xl font-display font-black text-parchment uppercase tracking-tight group-hover:text-gold transition-colors">{monster.name}</h3>
                      <div className="text-[10px] text-parchment/40 font-black uppercase tracking-[0.2em] mt-1">Nível de Desafio {monster.challenge} • {monster.type}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 relative z-10">
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/10 group/stat hover:border-gold/20 transition-all">
                        <div className="text-[8px] text-parchment/30 font-black uppercase tracking-widest mb-1 group-hover/stat:text-gold transition-colors">Vida (HP)</div>
                        <div className="text-xl font-display font-black text-parchment">{monster.hp}</div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/10 group/stat hover:border-gold/20 transition-all">
                        <div className="text-[8px] text-parchment/30 font-black uppercase tracking-widest mb-1 group-hover/stat:text-gold transition-colors">Armadura (AC)</div>
                        <div className="text-xl font-display font-black text-parchment">{monster.ac}</div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 relative z-10">
                      <p className="text-[10px] text-parchment/40 font-medium italic leading-relaxed line-clamp-2">
                        {isUnlocked ? "Informações detalhadas disponíveis para os jogadores." : "Esta criatura ainda é um mistério para o grupo."}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div 
            key="achievements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shadow-lg">
                  <Trophy size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-display font-black text-parchment uppercase tracking-tight">Sistema de Conquistas</h2>
                  <p className="text-[10px] text-parchment/40 font-black uppercase tracking-[0.3em] mt-1">Conceda glória e recompensas aos seus jogadores</p>
                </div>
              </div>
              {!currentCampaign?.achievements && (
                <button 
                  onClick={() => initializeCampaignAchievements(currentCampaign!.id)}
                  className="px-6 py-3 bg-gold/10 border border-gold/20 rounded-xl text-[10px] font-black text-gold uppercase tracking-widest hover:bg-gold hover:text-midnight transition-all shadow-lg"
                >
                  Inicializar Conquistas (ToA)
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-12">
              {campaignCharacters.map(char => (
                <div key={char.id} className="liquid-glass p-10 border-white/5 space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-gold/40 shadow-2xl">
                      {char.appearance ? (
                        <img src={char.appearance} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <RaceIcon race={char.race} className="w-full h-full" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-3xl font-display font-black text-parchment uppercase tracking-tight">{char.name}</h3>
                      <div className="text-[10px] text-gold font-black uppercase tracking-widest mt-1">
                        {char.profile?.achievements?.length || 0} Conquistas Desbloqueadas
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {(currentCampaign?.achievements || TOA_ACHIEVEMENTS).map(achievement => {
                      const isUnlocked = char.profile?.achievements?.some(a => a.id === achievement.id);
                      return (
                        <div 
                          key={achievement.id}
                          className={cn(
                            "p-6 rounded-3xl border transition-all duration-500 relative overflow-hidden group",
                            isUnlocked 
                              ? "bg-gold/5 border-gold/30 opacity-60" 
                              : "bg-white/2 border-white/5 hover:border-gold/20 hover:bg-white/5"
                          )}
                        >
                          <div className="flex items-start justify-between mb-4 relative z-10">
                            <div className="text-3xl">{achievement.icon}</div>
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
                          
                          <div className="relative z-10 space-y-2">
                            <h4 className="font-display font-black text-parchment uppercase tracking-tight group-hover:text-gold transition-colors">{achievement.name}</h4>
                            <p className="text-[10px] text-parchment/40 leading-relaxed line-clamp-2">{achievement.description}</p>
                          </div>

                          <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                            <div className="text-[8px] font-black text-gold/60 uppercase tracking-widest">
                              {achievement.reward.xp && `+${achievement.reward.xp} XP`}
                              {achievement.reward.gold && ` • +${achievement.reward.gold} GP`}
                            </div>
                            {!isUnlocked && (
                              <button 
                                onClick={() => grantAchievement(char.id, achievement.id)}
                                className="px-4 py-2 bg-gold text-midnight rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-110 transition-all shadow-lg shadow-gold/20"
                              >
                                Conceder
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div 
            key="achievements"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl sm:text-5xl font-display font-black text-gold uppercase tracking-tighter leading-none">Gestão de Conquistas</h2>
                <p className="text-[10px] text-parchment/40 font-black uppercase tracking-[0.3em] mt-2">Recompense os feitos lendários dos seus jogadores</p>
              </div>
              {!currentCampaign?.achievements && (
                <button 
                  onClick={() => currentCampaign && initializeCampaignAchievements(currentCampaign.id)}
                  className="px-8 py-4 bg-gold text-midnight rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                >
                  Inicializar Conquistas da Campanha
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-12">
              {campaignCharacters.map(char => (
                <div key={char.id} className="liquid-glass p-8 sm:p-10 border-white/5 space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-gold/30 shadow-2xl">
                      {char.appearance ? (
                        <img src={char.appearance} alt={char.name} className="w-full h-full object-cover" />
                      ) : (
                        <RaceIcon race={char.race} className="w-full h-full" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-black text-parchment uppercase tracking-tight">{char.name}</h3>
                      <p className="text-[10px] text-gold font-black uppercase tracking-widest">{char.race} • {char.charClass} Nível {char.level}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {(currentCampaign?.achievements || TOA_ACHIEVEMENTS).map(achievement => {
                      const isUnlocked = char.profile?.achievements?.some(a => a.id === achievement.id);
                      return (
                        <motion.div 
                          key={achievement.id}
                          whileHover={{ y: -2 }}
                          className={cn(
                            "p-5 rounded-2xl border transition-all duration-500 flex flex-col gap-4 relative overflow-hidden group",
                            isUnlocked 
                              ? "bg-gold/10 border-gold/30 shadow-[0_4px_20px_rgba(212,175,55,0.1)]" 
                              : "bg-white/2 border-white/5 opacity-60 hover:opacity-100 hover:border-white/20"
                          )}
                        >
                          <div className="flex justify-between items-start relative z-10">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
                              isUnlocked ? "bg-gold/20" : "bg-white/5"
                            )}>
                              <GameIcon icon={achievement.icon} tier={achievement.tier} unlocked={isUnlocked} className="w-6 h-6" />
                            </div>
                            <span className={cn(
                              "text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border",
                              achievement.tier === 'bronze' ? "bg-orange-900/20 text-orange-400 border-orange-500/30" :
                              achievement.tier === 'silver' ? "bg-slate-400/20 text-slate-300 border-slate-400/30" :
                              achievement.tier === 'gold' ? "bg-gold/20 text-gold border-gold/30" :
                              "bg-purple-500/20 text-purple-400 border-purple-500/30"
                            )}>
                              {achievement.tier}
                            </span>
                          </div>

                          <div className="relative z-10">
                            <h4 className={cn(
                              "text-[10px] font-black uppercase tracking-tight mb-1",
                              isUnlocked ? "text-gold" : "text-parchment/60"
                            )}>
                              {achievement.name}
                            </h4>
                            <p className="text-[9px] text-parchment/30 leading-tight line-clamp-2 italic">
                              {achievement.description}
                            </p>
                          </div>

                          <div className="relative z-10 mt-auto">
                            {!isUnlocked ? (
                              <button 
                                onClick={() => grantAchievement(char.id, achievement.id)}
                                className="w-full py-2 bg-gold text-midnight rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md"
                              >
                                Conceder
                              </button>
                            ) : (
                              <div className="flex items-center justify-center gap-2 text-[8px] font-black text-gold/60 uppercase tracking-widest py-2 border border-gold/20 rounded-xl bg-gold/5">
                                <CheckCircle2 size={10} />
                                Desbloqueado
                              </div>
                            )}
                          </div>

                          {/* Texture Overlay */}
                          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'actions' && (
          <motion.div 
            key="actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shadow-lg">
                <Zap size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-display font-black text-parchment uppercase tracking-tight">Atalhos de Campanha</h2>
                <p className="text-[10px] text-parchment/40 font-black uppercase tracking-[0.3em] mt-1">Ações rápidas e eventos especiais</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Tomb of Annihilation Module */}
              <div className="liquid-glass p-8 space-y-6 border-white/5 relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-1000" />
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Compass size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-black text-parchment uppercase tracking-tight">Módulo: Chult</h3>
                    <p className="text-[8px] text-parchment/30 font-black uppercase tracking-widest">Tomb of Annihilation</p>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <p className="text-xs text-parchment/60 leading-relaxed">
                    Inicie eventos específicos da campanha de Tomb of Annihilation, como a escolha de guias em Porto Nyanzaru.
                  </p>
                  
                  {currentCampaign?.activeVoting?.status === 'open' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-emerald-400">
                        <span>Votação em Curso</span>
                        <span>{Object.keys(currentCampaign.activeVoting.votes).length} Votos</span>
                      </div>
                      <button 
                        onClick={closeVoting}
                        className="w-full py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black text-red-400 uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                      >
                        Encerrar Votação
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={startGuideSelection}
                      className="w-full py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-lg"
                    >
                      Iniciar Escolha de Guia
                    </button>
                  )}
                </div>
              </div>

              {/* Generic Actions */}
              <div className="liquid-glass p-8 space-y-6 border-white/5 relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/10 transition-all duration-1000" />
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-black text-parchment uppercase tracking-tight">Anúncio Global</h3>
                    <p className="text-[8px] text-parchment/30 font-black uppercase tracking-widest">Notificação para todos</p>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <p className="text-xs text-parchment/60 leading-relaxed">
                    Envie uma mensagem importante que aparecerá no topo da tela de todos os jogadores.
                  </p>
                  <button 
                    onClick={() => {
                      const msg = prompt("Mensagem do Anúncio:");
                      if (msg) {
                        // We could implement a generic notification function here
                        toast.info("Funcionalidade em desenvolvimento");
                      }
                    }}
                    className="w-full py-4 bg-gold/10 border border-gold/20 rounded-xl text-[10px] font-black text-gold uppercase tracking-widest hover:bg-gold hover:text-midnight transition-all shadow-lg"
                  >
                    Enviar Anúncio
                  </button>
                </div>
              </div>

              {/* Merchant Event */}
              <div className="liquid-glass p-8 space-y-6 border-white/5 relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/10 transition-all duration-1000" />
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-black text-parchment uppercase tracking-tight">Evento: Mercador</h3>
                    <p className="text-[8px] text-parchment/30 font-black uppercase tracking-widest">Chôro, o Colecionador</p>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <p className="text-xs text-parchment/60 leading-relaxed">
                    Inicie o evento do mercador Chôro. Todos os jogadores verão a interface de interação e poderão comprar itens únicos.
                  </p>
                  
                  {currentCampaign?.merchantEvent?.active ? (
                    <button 
                      onClick={closeMerchantEvent}
                      className="w-full py-4 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black text-red-400 uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg"
                    >
                      Encerrar Evento
                    </button>
                  ) : (
                    <button 
                      onClick={startMerchantEvent}
                      className="w-full py-4 bg-gold/10 border border-gold/20 rounded-xl text-[10px] font-black text-gold uppercase tracking-widest hover:bg-gold hover:text-midnight transition-all shadow-lg"
                    >
                      Iniciar Mercador
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'campaign' && (
          <motion.div 
            key="campaign"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto space-y-8"
          >
            <div className="glass-card p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-gold/10 rounded-3xl flex items-center justify-center text-gold mx-auto border border-gold/20 shadow-[0_0_30px_rgba(201,160,61,0.2)]">
                <Package size={40} />
              </div>
              <div>
                <h2 className="text-3xl font-display font-black text-parchment uppercase tracking-tighter">Campaign Settings</h2>
                <p className="text-parchment/40 text-xs uppercase tracking-widest mt-2">Manage restrictions and rules</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4 text-left">
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-parchment">Restricted Races</div>
                    <div className="text-[10px] text-parchment/40 uppercase">Limit character creation options</div>
                  </div>
                  <button className="p-2 text-gold hover:bg-gold/10 rounded-lg transition-colors"><ChevronRight /></button>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-parchment">Banned Spells</div>
                    <div className="text-[10px] text-parchment/40 uppercase">Remove specific magic from the world</div>
                  </div>
                  <button className="p-2 text-gold hover:bg-gold/10 rounded-lg transition-colors"><ChevronRight /></button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NPC Modal */}
      <AnimatePresence>
        {isNPCModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsNPCModalOpen(false)} 
              className="absolute inset-0 bg-midnight/90 backdrop-blur-xl" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="relative w-full max-w-2xl glass-card p-10 overflow-hidden"
            >
              <h2 className="text-3xl font-display font-black text-gold uppercase tracking-tighter mb-8">
                {editingNPC ? 'Edit NPC' : 'Create New NPC'}
              </h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-parchment/40 uppercase tracking-widest mb-2">Name</label>
                    <input 
                      type="text" 
                      value={npcForm.name}
                      onChange={(e) => setNpcForm({...npcForm, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50"
                      placeholder="NPC Name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-parchment/40 uppercase tracking-widest mb-2">Race</label>
                      <input 
                        type="text" 
                        value={npcForm.race}
                        onChange={(e) => setNpcForm({...npcForm, race: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50"
                        placeholder="Human"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-parchment/40 uppercase tracking-widest mb-2">Class</label>
                      <input 
                        type="text" 
                        value={npcForm.charClass}
                        onChange={(e) => setNpcForm({...npcForm, charClass: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50"
                        placeholder="Warrior"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-parchment/40 uppercase tracking-widest mb-2">Role / Function</label>
                    <input 
                      type="text" 
                      value={npcForm.role}
                      onChange={(e) => setNpcForm({...npcForm, role: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50"
                      placeholder="Shopkeeper, Villain, etc."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-parchment/40 uppercase tracking-widest mb-2">Image URL</label>
                    <input 
                      type="text" 
                      value={npcForm.appearance}
                      onChange={(e) => setNpcForm({...npcForm, appearance: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-parchment/40 uppercase tracking-widest mb-2">Description (Optional)</label>
                    <textarea 
                      value={npcForm.description}
                      onChange={(e) => setNpcForm({...npcForm, description: e.target.value})}
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 resize-none"
                      placeholder="A brief history or personality traits..."
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  onClick={() => setIsNPCModalOpen(false)}
                  className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    if (editingNPC) {
                      await updateNPC(editingNPC.id, npcForm);
                    } else {
                      await createNPC(npcForm);
                    }
                    setIsNPCModalOpen(false);
                  }}
                  className="flex-1 py-4 bg-gold text-midnight rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(201,160,61,0.3)]"
                >
                  {editingNPC ? 'Save Changes' : 'Create NPC'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Item Delivery Modal */}
      <AnimatePresence>
        {isItemModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsItemModalOpen(false)} className="absolute inset-0 bg-midnight/80 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-3xl glass-card p-10 overflow-hidden flex flex-col h-[80vh]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-display font-black text-gold uppercase tracking-tighter">Deliver Treasure</h2>
                  <p className="text-parchment/40 text-sm">Select an item for {campaignCharacters.find(c => c.id === selectedCharId)?.name}</p>
                </div>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/40" size={18} />
                  <input type="text" placeholder="Search items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-midnight/40 border border-gold/20 rounded-xl py-2 pl-12 pr-4 text-sm text-parchment focus:outline-none focus:border-gold" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-4">
                {filteredItems.map(item => (
                  <div key={item.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:border-gold/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
                        {item.category === 'Weapon' ? <Sword size={24} /> : item.category === 'Armor' ? <Shield size={24} /> : item.category === 'Potion' ? <Heart size={24} /> : <ScrollIcon size={24} />}
                      </div>
                      <div>
                        <div className="font-bold text-parchment group-hover:text-gold transition-colors">{item.name}</div>
                        <div className="flex items-center gap-2">
                          <div className="text-[10px] text-parchment/40 uppercase font-bold">{item.rarity} • {item.category}</div>
                          {item.ac && <span className="text-[9px] text-gold/60 font-black">AC {item.ac}</span>}
                          {item.damage && <span className="text-[9px] text-red-400/60 font-black">{item.damage}</span>}
                          {item.consumable && <span className="text-[9px] text-gold font-black uppercase tracking-tighter">Consumível</span>}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleGiveItem(item)} className="px-6 py-2 bg-gold text-midnight rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all">Deliver</button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Confirmation Modal */}
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
              className="relative w-full max-w-md liquid-glass p-8 border-gold/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <Trash2 className="text-red-500" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-parchment">{confirmModal.title}</h3>
                  <p className="text-xs text-gold/60 font-black uppercase tracking-widest">Ação Crítica</p>
                </div>
              </div>
              
              <p className="text-parchment/70 mb-8 leading-relaxed">
                {confirmModal.message}
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                  className="flex-1 px-6 py-3 rounded-xl border border-white/10 text-parchment font-bold hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal({ ...confirmModal, isOpen: false });
                  }}
                  className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
