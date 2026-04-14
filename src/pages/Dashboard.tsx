import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  ChevronRight,
  TrendingUp,
  Activity,
  User as UserIcon,
  Sword,
  Shield,
  Zap,
  X,
  Dice5,
  Sparkles,
  Settings,
  LogOut,
  RefreshCw,
  Loader2,
  Trash2,
  DoorOpen
} from 'lucide-react';
import { 
  useCharacter
} from '../contexts/CharacterContext';
import { 
  calculateAC, 
  calculateInitiative 
} from '../data/rules';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
import { toast } from 'sonner';
import { RACES, CLASSES, ALIGNMENTS, SKILLS, REGIONS } from '../data/rules';
import { cn } from '../lib/utils';
import { RaceIcon } from '../components/RaceIcon';
import { HPBar } from '../components/HPBar';
import { MagicSchoolSymbol } from '../components/MagicSchoolSymbol';

export default function Dashboard() {
  const { 
    currentCharacter, 
    characters, 
    loadCharacter, 
    createCharacter, 
    rollAttributes, 
    rollStartingGold,
    joinCampaign,
    currentCampaign,
    userCampaigns,
    user,
    loading,
    updateUserProfile,
    logout,
    createCampaign,
    setCurrentCampaign,
    deleteCharacter,
    deleteCampaign,
    leaveCampaign
  } = useCharacter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateCampaignModalOpen, setIsCreateCampaignModalOpen] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [newNickname, setNewNickname] = useState(user?.displayName || '');
  const [inviteCode, setInviteCode] = useState('');
  const [selectedCharForJoin, setSelectedCharForJoin] = useState<string | null>(null);
  const [createStep, setCreateStep] = useState(1);
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
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

  const handleJoinCampaign = async () => {
    if (!inviteCode || !selectedCharForJoin) return;
    setIsJoining(true);
    try {
      const trimmedCode = inviteCode.trim().toUpperCase();
      const success = await joinCampaign(trimmedCode, selectedCharForJoin);
      if (success) {
        setIsJoinModalOpen(false);
        setInviteCode('');
        setSelectedCharForJoin(null);
      } else {
        setConfirmModal({
          isOpen: true,
          title: 'Erro ao Entrar',
          message: 'Código de convite inválido ou campanha não encontrada.',
          onConfirm: () => {}
        });
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!campaignName) return;
    const campaignId = await createCampaign(campaignName);
    if (campaignId) {
      setIsCreateCampaignModalOpen(false);
      setCampaignName('');
      // The sidebar will automatically show the DM Dashboard now
    }
  };

  const handleRollAttributes = () => {
    const rolled = rollAttributes();
    setNewCharData({
      ...newCharData,
      attributes: {
        str: rolled.str,
        dex: rolled.dex,
        con: rolled.con,
        int: rolled.int,
        wis: rolled.wis,
        cha: rolled.cha
      }
    });
  };

  const handleRollGold = () => {
    const gold = rollStartingGold(newCharData.charClass);
    setNewCharData({ ...newCharData, gold });
  };

  const [newCharData, setNewCharData] = useState({
    name: '',
    race: 'Humano',
    charClass: 'Guerreiro',
    alignment: 'N',
    region: 'baldurs-gate',
    attributes: {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10
    },
    gold: 0,
    skills: {} as Record<string, boolean>
  });
  const [customRegion, setCustomRegion] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharData.name) {
      toast.error("Nome do personagem é obrigatório");
      setCreateStep(1);
      return;
    }
    
    setIsCreating(true);
    try {
      const finalRegion = newCharData.region === 'other' ? customRegion : newCharData.region;
      await createCharacter({ ...newCharData, region: finalRegion });
      setIsCreateModalOpen(false);
      setCreateStep(1);
      setCustomRegion('');
      setNewCharData({ 
        name: '', 
        race: 'Humano', 
        charClass: 'Guerreiro', 
        alignment: 'N',
        region: 'baldurs-gate',
        attributes: {
          str: 10,
          dex: 10,
          con: 10,
          int: 10,
          wis: 10,
          cha: 10
        },
        gold: 0,
        skills: {}
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!newNickname) return;
    await updateUserProfile(newNickname);
    setIsProfileModalOpen(false);
  };

  const toggleNewCharSkill = (skillName: string) => {
    const classData = CLASSES[newCharData.charClass as keyof typeof CLASSES];
    const maxSkills = classData?.skillChoicesCount || 2;
    const currentSkills = Object.values(newCharData.skills).filter(Boolean).length;

    if (!newCharData.skills[skillName] && currentSkills >= maxSkills) return;

    setNewCharData({
      ...newCharData,
      skills: {
        ...newCharData.skills,
        [skillName]: !newCharData.skills[skillName]
      }
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      {/* Left Column */}
      <div className="flex-1 space-y-12">
        {/* Hero Banner - Infinite Space Aesthetic */}
        <section className="relative min-h-[300px] md:min-h-[500px] -mt-4 sm:-mt-12 -mx-2 sm:-mx-8 lg:-mx-12 mb-8 sm:mb-12 overflow-hidden group border-none bg-midnight">
          {/* Deep Atmospheric Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#001a1a] via-[#000d0d] to-midnight" />
          
          {/* Subtle Light Effects */}
          <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-gold/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-emerald-500/5 rounded-full blur-[120px]" />

          {/* Vignette Overlay for Depth */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

          <div className="relative z-10 h-full min-h-[300px] md:min-h-[500px] flex flex-col justify-end items-center md:items-start px-6 md:px-24 py-12 md:py-24 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
              className="space-y-6 md:space-y-8 w-full md:w-auto"
            >
              <div className="space-y-4 md:space-y-6 flex flex-col items-center md:items-start">
                {/* Floating Glass Buttons */}
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="group relative w-full md:w-auto px-10 md:px-14 py-4 md:py-6 bg-gold/10 backdrop-blur-md border border-gold/30 text-gold rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.3em] hover:bg-gold hover:text-midnight transition-all duration-500 shadow-[0_0_40px_rgba(212,175,55,0.1)] hover:shadow-[0_0_60px_rgba(212,175,55,0.3)] hover:-translate-y-1 flex items-center justify-center gap-4"
                >
                  <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" /> 
                  Create Character
                </button>
                
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full md:w-auto">
                  <button 
                    onClick={() => setIsJoinModalOpen(true)}
                    className="w-full md:w-auto px-8 md:px-10 py-3 md:py-4 bg-white/2 backdrop-blur-sm border border-white/10 text-parchment/60 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 hover:text-parchment hover:border-white/20 transition-all duration-500 hover:-translate-y-1"
                  >
                    Join Campaign
                  </button>
                  <button 
                    onClick={() => setIsCreateCampaignModalOpen(true)}
                    className="w-full md:w-auto px-8 md:px-10 py-3 md:py-4 bg-gold/5 backdrop-blur-sm border border-gold/10 text-gold/60 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gold/10 hover:text-gold hover:border-gold/30 transition-all duration-500 flex items-center justify-center gap-3 hover:-translate-y-1"
                  >
                    <Zap size={18} strokeWidth={3} /> Create Campaign (DM)
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Fade to Content */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-midnight to-transparent" />
        </section>

        {/* My Characters */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-display font-bold flex items-center gap-3">
              <UserIcon className="text-gold" /> My Adventurers
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 border-4 border-gold/10 border-t-gold rounded-full animate-spin mb-6" />
                <p className="text-parchment/30 font-black uppercase tracking-[0.2em] text-[10px]">Summoning your adventurers...</p>
              </div>
            ) : characters.length === 0 ? (
              <div className="col-span-full py-20 liquid-glass border-dashed border-2 border-gold/10 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gold/5 rounded-[2rem] flex items-center justify-center mb-6">
                  <Dice5 className="text-gold/20 w-10 h-10" />
                </div>
                <p className="text-parchment/30 font-black uppercase tracking-[0.2em] text-[10px]">You haven't created any characters yet.</p>
              </div>
            ) : (
              characters.map((char) => (
                <motion.div 
                  key={char.id}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => loadCharacter(char.id)}
                  className={cn(
                    "glass-card p-8 cursor-pointer group relative overflow-hidden",
                    currentCharacter?.id === char.id ? "border-gold/30 bg-gold/5 shadow-[0_20px_50px_rgba(212,175,55,0.15)]" : "hover:border-gold/20"
                  )}
                >
                  {currentCharacter?.id === char.id && (
                    <div className="absolute top-4 left-4 z-20">
                      <div className="w-3 h-3 rounded-full bg-gold shadow-[0_0_15px_rgba(212,175,55,1)] animate-pulse" />
                    </div>
                  )}

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmModal({
                        isOpen: true,
                        title: 'Apagar Personagem',
                        message: `Tem certeza que deseja apagar o personagem ${char.name}? Esta ação não pode ser desfeita.`,
                        onConfirm: () => deleteCharacter(char.id)
                      });
                    }}
                    className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all z-30 hover:bg-red-600 shadow-xl hover:scale-110 active:scale-95"
                    title="Apagar Personagem"
                  >
                    <Trash2 size={14} strokeWidth={2.5} />
                  </button>
                  
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden border border-gold/10 p-1 bg-white/5">
                      {char.appearance && !char.appearance.includes('dicebear.com') ? (
                        <img 
                          src={char.appearance} 
                          alt={char.name} 
                          className="w-full h-full object-cover rounded-[1rem]"
                        />
                      ) : (
                        <RaceIcon 
                          race={char.race} 
                          className="w-full h-full rounded-[1rem]" 
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-parchment group-hover:text-gold transition-colors tracking-tight">{char.name}</h3>
                      <div className="text-[9px] text-gold/60 font-black uppercase tracking-[0.2em] mt-1">Level {char.level} • {char.charClass}</div>
                      {char.magicSchool && char.profile?.showMagicSchoolSymbol && (
                        <div className="mt-2 flex items-center gap-2">
                          <MagicSchoolSymbol school={char.magicSchool} size={24} glow={false} />
                          <span className="text-[7px] font-black uppercase tracking-widest text-gold/40">{char.magicSchool}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <HPBar 
                      current={char.hp?.current || 0} 
                      max={char.hp?.max || 0} 
                      showText={true}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/2 rounded-2xl p-3 text-center border border-white/5">
                        <div className="text-[8px] uppercase text-gold/40 font-black tracking-widest mb-1">AC</div>
                        <div className="text-base font-black text-parchment">{char.ac}</div>
                      </div>
                      <div className="bg-white/2 rounded-2xl p-3 text-center border border-white/5">
                        <div className="text-[8px] uppercase text-gold/40 font-black tracking-widest mb-1">Gold</div>
                        <div className="text-base font-black text-parchment">{char.gold}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Active Campaigns */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-display font-bold flex items-center gap-3">
              <Activity className="text-gold" /> Active Campaigns
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {userCampaigns.length === 0 ? (
              <div className="col-span-full glass-card p-8 flex items-center justify-center text-center border-dashed border-2 border-gold/10">
                <div className="space-y-4">
                  <Sparkles className="w-12 h-12 text-gold/20 mx-auto" />
                  <h3 className="text-xl font-display font-bold text-parchment/60">No Active Campaigns</h3>
                  <p className="text-sm text-parchment/40 max-w-xs">
                    Create a campaign as a DM or join your friends' adventures.
                  </p>
                </div>
              </div>
            ) : (
              userCampaigns.map((campaign) => (
                <motion.div 
                  key={campaign.id}
                  whileHover={{ y: -5 }}
                  className={cn(
                    "glass-card p-8 group relative overflow-hidden",
                    currentCampaign?.id === campaign.id ? "border-gold/50 bg-gold/5" : "hover:border-gold/30"
                  )}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-display font-bold text-parchment group-hover:text-gold transition-colors">
                        {campaign.name}
                      </h3>
                      <div className="text-[10px] text-parchment/40 uppercase tracking-widest mt-1">
                        Invite Code: <span className="text-gold font-bold">{campaign.inviteCode}</span>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-gold/10 border border-gold/20 text-[10px] font-bold text-gold uppercase tracking-widest">
                      {campaign.dmId === user?.uid ? 'Dungeon Master' : 'Player'}
                    </div>
                    {campaign.dmId === user?.uid ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmModal({
                            isOpen: true,
                            title: 'Apagar Campanha',
                            message: `Tem certeza que deseja apagar a campanha ${campaign.name}? Esta ação não pode ser desfeita.`,
                            onConfirm: () => deleteCampaign(campaign.id)
                          });
                        }}
                        className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-100 lg:opacity-40 lg:group-hover:opacity-100"
                        title="Apagar Campanha"
                      >
                        <Trash2 size={14} />
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmModal({
                            isOpen: true,
                            title: 'Sair da Campanha',
                            message: `Deseja realmente sair da campanha ${campaign.name}?`,
                            onConfirm: () => leaveCampaign(campaign.id)
                          });
                        }}
                        className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-100 lg:opacity-40 lg:group-hover:opacity-100"
                        title="Sair da Campanha"
                      >
                        <DoorOpen size={14} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {campaign.players.slice(0, 5).map((pId, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-midnight bg-white/5 overflow-hidden">
                          <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${pId}`} 
                            alt="Player" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ))}
                      {campaign.players.length > 5 && (
                        <div className="w-8 h-8 rounded-full border-2 border-midnight bg-white/10 flex items-center justify-center text-[10px] font-bold text-parchment/60">
                          +{campaign.players.length - 5}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-parchment/40 font-medium">
                      {(campaign.characterRefs?.length || 0)} Adventurers
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    {campaign.dmId === user?.uid && (
                      <Link 
                        to="/dm" 
                        onClick={() => setCurrentCampaign(campaign)}
                        className="flex-1 py-3 bg-gold text-midnight rounded-xl text-xs font-black uppercase tracking-widest text-center hover:scale-105 transition-all"
                      >
                        Manage
                      </Link>
                    )}
                    <Link 
                      to="/campaign"
                      onClick={() => setCurrentCampaign(campaign)}
                      className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-parchment/60 hover:bg-white/10 transition-all text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Right Column - Stats & Quick Info */}
      <aside className="w-full lg:w-96 space-y-12">
        {/* User Profile Quick Settings */}
        <section className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
              <UserIcon size={24} />
            </div>
            <div className="flex-1">
              <div className="text-[10px] text-parchment/40 uppercase font-bold tracking-widest">Logged in as</div>
              <div className="text-sm font-bold text-parchment">{user?.displayName || 'Adventurer'}</div>
            </div>
            <button 
              onClick={() => {
                setNewNickname(user?.displayName || '');
                setIsProfileModalOpen(true);
              }}
              className="p-2 text-gold hover:bg-gold/10 rounded-xl transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </section>

        {currentCharacter ? (
          <section className="glass-card p-10 space-y-10 border-gold/10 shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
            <div className="text-center space-y-4">
              <div className="w-32 h-32 rounded-full border-2 border-gold/30 mx-auto p-2 bg-white/2 overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.15)] transform hover:scale-110 transition-transform duration-700">
                {currentCharacter.appearance ? (
                  <img 
                    src={currentCharacter.appearance} 
                    alt="Avatar" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <RaceIcon 
                    race={currentCharacter.race} 
                    className="w-full h-full rounded-full" 
                  />
                )}
              </div>
              <div>
                <h2 className="text-3xl font-display font-black text-gold uppercase tracking-tighter mb-1">{currentCharacter.name}</h2>
                <div className="text-[10px] text-gold/40 font-black uppercase tracking-[0.3em]">
                  {currentCharacter.race} • {currentCharacter.charClass}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="bg-white/2 rounded-[1.5rem] p-5 border border-white/5 text-center group hover:border-gold/20 transition-all duration-500">
                <Shield className="w-6 h-6 text-gold/60 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-[9px] text-parchment/30 uppercase font-black tracking-widest mb-1">Armor Class</div>
                <div className="text-2xl font-black text-parchment">{calculateAC(currentCharacter)}</div>
              </div>
              <div className="bg-white/2 rounded-[1.5rem] p-5 border border-white/5 text-center group hover:border-emerald-500/20 transition-all duration-500">
                <Zap className="w-6 h-6 text-emerald-500/60 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-[9px] text-parchment/30 uppercase font-black tracking-widest mb-1">Initiative</div>
                <div className="text-2xl font-black text-parchment">
                  {calculateInitiative(currentCharacter) >= 0 ? `+${calculateInitiative(currentCharacter)}` : calculateInitiative(currentCharacter)}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-parchment/30">
                <span>XP Progress</span>
                <span className="text-gold">{currentCharacter.xp} XP</span>
              </div>
              <div className="h-3 bg-white/2 rounded-full overflow-hidden border border-white/5 p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentCharacter.xp / 355000) * 100}%` }}
                  className="h-full bg-gradient-to-r from-gold to-gold-bright rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                />
              </div>
            </div>

            <Link 
              to="/character" 
              className="w-full btn-magic btn-magic-primary py-5 text-xs text-center block shadow-[0_15px_30px_rgba(212,175,55,0.2)]"
            >
              Open Full Sheet
            </Link>
          </section>
        ) : (
          <section className="glass-card p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-gold/5 rounded-full flex items-center justify-center mx-auto">
              <UserIcon className="text-gold/20 w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-display font-bold text-parchment/60">No Character Selected</h3>
              <p className="text-sm text-parchment/40">Select an adventurer from your list to see quick stats.</p>
            </div>
          </section>
        )}
      </aside>

      {/* Create Campaign Modal */}
      <AnimatePresence>
        {isCreateCampaignModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateCampaignModalOpen(false)}
              className="absolute inset-0 bg-midnight/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-card p-10"
            >
              <h2 className="text-3xl font-display font-black text-gold uppercase tracking-tighter mb-6 text-center">Start New Adventure</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gold/60 tracking-widest mb-2">Campaign Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. The Lost Mine of Phandelver"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full bg-midnight/40 border border-gold/20 rounded-xl px-4 py-3 text-parchment focus:outline-none focus:border-gold"
                  />
                </div>
                
                <button 
                  onClick={handleCreateCampaign}
                  disabled={!campaignName}
                  className="w-full btn-magic btn-magic-primary py-4 text-sm font-black uppercase tracking-widest disabled:opacity-50"
                >
                  Create Campaign
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Join Campaign Modal */}
      <AnimatePresence>
        {isJoinModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsJoinModalOpen(false)}
              className="absolute inset-0 bg-midnight/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-card p-10"
            >
              <h2 className="text-3xl font-display font-black text-gold uppercase tracking-tighter mb-6 text-center">Join Campaign</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gold/60 tracking-widest mb-2">Invite Code</label>
                  <input 
                    type="text"
                    placeholder="ENTER-CODE"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="w-full bg-midnight/40 border border-gold/20 rounded-xl px-4 py-3 text-center text-xl font-black text-gold focus:outline-none focus:border-gold"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gold/60 tracking-widest mb-2">Select Hero</label>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {characters.length === 0 ? (
                      <div className="text-center py-4 text-parchment/40 text-xs italic">
                        No heroes available. Create one first!
                      </div>
                    ) : (
                      characters.map(char => (
                        <button
                          key={char.id}
                          type="button"
                          onClick={() => setSelectedCharForJoin(char.id)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all",
                            selectedCharForJoin === char.id 
                              ? "bg-gold/10 border-gold text-gold" 
                              : "bg-white/5 border-white/10 text-parchment/60 hover:border-gold/30"
                          )}
                        >
                          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={char.appearance} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <span className="font-bold text-sm">{char.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <button 
                  onClick={handleJoinCampaign}
                  disabled={!inviteCode || !selectedCharForJoin || isJoining}
                  className="w-full btn-magic btn-magic-primary py-4 text-sm font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isJoining ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Join Realms"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Settings Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute inset-0 bg-midnight/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-card p-10"
            >
              <h2 className="text-3xl font-display font-black text-gold uppercase tracking-tighter mb-6 text-center">Profile Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gold/60 tracking-widest mb-2">Your Nickname</label>
                  <input 
                    type="text"
                    placeholder="Enter your name"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    className="w-full bg-midnight/40 border border-gold/20 rounded-xl px-4 py-3 text-parchment focus:outline-none focus:border-gold"
                  />
                </div>
                
                <button 
                  onClick={handleUpdateProfile}
                  disabled={!newNickname}
                  className="w-full btn-magic btn-magic-primary py-4 text-sm font-black uppercase tracking-widest disabled:opacity-50"
                >
                  Update Nickname
                </button>

                <div className="pt-6 border-t border-white/5">
                  <button 
                    onClick={logout}
                    className="w-full py-4 text-sm font-black uppercase tracking-widest text-ruby hover:bg-ruby/10 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Character Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-midnight/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass-card p-10 overflow-hidden"
            >
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute top-6 right-6 text-parchment/40 hover:text-gold transition-colors"
              >
                <X size={24} />
              </button>

              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-4xl font-display font-black text-gold uppercase tracking-tighter">New Adventurer</h2>
                  <p className="text-parchment/40">Step {createStep} of 4: {
                    createStep === 1 ? 'Identity' : 
                    createStep === 2 ? 'Abilities' : 
                    createStep === 3 ? 'Skills & Wealth' :
                    'Region'
                  }</p>
                </div>

                <form onSubmit={handleCreate} className="space-y-6">
                  {createStep === 1 && (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gold/60 ml-2">Character Name</label>
                        <input 
                          type="text"
                          required
                          value={newCharData.name}
                          onChange={(e) => setNewCharData({...newCharData, name: e.target.value})}
                          placeholder="e.g. Valerius the Bold"
                          className="w-full h-14 bg-midnight/40 border border-gold/20 rounded-2xl px-6 text-parchment focus:outline-none focus:border-gold transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gold/60 ml-2">Race</label>
                          <select 
                            value={newCharData.race}
                            onChange={(e) => setNewCharData({...newCharData, race: e.target.value})}
                            className="w-full h-14 bg-midnight/40 border border-gold/20 rounded-2xl px-6 text-parchment focus:outline-none focus:border-gold transition-all appearance-none"
                          >
                            {Object.keys(RACES).map(race => (
                              <option key={race} value={race} className="bg-midnight">{race}</option>
                            ))}
                          </select>
                          {RACES[newCharData.race as keyof typeof RACES]?.description && (
                            <p className="text-[10px] text-parchment/40 px-2 leading-tight">
                              {RACES[newCharData.race as keyof typeof RACES].description}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gold/60 ml-2">Class</label>
                          <select 
                            value={newCharData.charClass}
                            onChange={(e) => setNewCharData({...newCharData, charClass: e.target.value, skills: {}})}
                            className="w-full h-14 bg-midnight/40 border border-gold/20 rounded-2xl px-6 text-parchment focus:outline-none focus:border-gold transition-all appearance-none"
                          >
                            {Object.keys(CLASSES).map(cls => (
                              <option key={cls} value={cls} className="bg-midnight">{cls}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gold/60 ml-2">Alignment</label>
                        <select 
                          value={newCharData.alignment}
                          onChange={(e) => setNewCharData({...newCharData, alignment: e.target.value})}
                          className="w-full h-14 bg-midnight/40 border border-gold/20 rounded-2xl px-6 text-parchment focus:outline-none focus:border-gold transition-all appearance-none"
                        >
                          {ALIGNMENTS.map(align => (
                            <option key={align.code} value={align.code} className="bg-midnight">{align.name}</option>
                          ))}
                        </select>
                      </div>

                      <button 
                        type="button" 
                        onClick={() => {
                          if (newCharData.name) {
                            setCreateStep(2);
                          } else {
                            toast.error("Nome do personagem é obrigatório");
                            // Trigger browser validation
                            const form = document.querySelector('form');
                            form?.reportValidity();
                          }
                        }}
                        className="w-full btn-magic btn-magic-primary py-5 text-sm font-black uppercase tracking-widest"
                      >
                        Next: Abilities
                      </button>
                    </>
                  )}

                  {createStep === 2 && (
                    <>
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-bold text-gold uppercase tracking-widest">Attributes (4d6 Drop Lowest)</h3>
                          <button 
                            type="button"
                            onClick={handleRollAttributes}
                            className="flex items-center gap-2 text-xs font-bold text-gold hover:text-gold-bright transition-colors"
                          >
                            <Dice5 size={16} /> Roll All
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          {Object.entries(newCharData.attributes).map(([attr, val]) => (
                            <div key={attr} className="space-y-1">
                              <label className="text-[8px] font-bold uppercase text-parchment/40 ml-1">{attr}</label>
                              <input 
                                type="number"
                                value={val}
                                onChange={(e) => setNewCharData({
                                  ...newCharData, 
                                  attributes: { ...newCharData.attributes, [attr]: Number(e.target.value) }
                                })}
                                className="w-full h-12 bg-midnight/40 border border-gold/20 rounded-xl text-center text-parchment focus:border-gold"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button 
                          type="button" 
                          onClick={() => setCreateStep(1)}
                          className="flex-1 py-5 text-sm font-black uppercase tracking-widest bg-white/5 border-white/10 rounded-2xl text-parchment hover:bg-white/10 transition-colors"
                        >
                          Back
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setCreateStep(3)}
                          className="flex-1 btn-magic btn-magic-primary py-5 text-sm font-black uppercase tracking-widest"
                        >
                          Next: Skills
                        </button>
                      </div>
                    </>
                  )}

                  {createStep === 3 && (
                    <>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gold uppercase tracking-widest">Skill Proficiencies</h3>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gold/60">
                              Pick {CLASSES[newCharData.charClass as keyof typeof CLASSES]?.skillChoicesCount || 2}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {SKILLS.map(skill => (
                              <button
                                key={skill.name}
                                type="button"
                                onClick={() => toggleNewCharSkill(skill.name)}
                                className={cn(
                                  "p-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all text-left flex items-center gap-2",
                                  newCharData.skills[skill.name]
                                    ? "bg-gold text-midnight border-gold"
                                    : "bg-midnight/40 border-white/10 text-parchment/40 hover:border-gold/30"
                                )}
                              >
                                <div className={cn(
                                  "w-2 h-2 rounded-full",
                                  newCharData.skills[skill.name] ? "bg-midnight" : "bg-white/10"
                                )} />
                                {skill.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gold/10">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gold uppercase tracking-widest">Starting Gold</h3>
                            <button 
                              type="button"
                              onClick={handleRollGold}
                              className="flex items-center gap-2 text-xs font-bold text-gold hover:text-gold-bright transition-colors"
                            >
                              <Dice5 size={16} /> Roll Gold
                            </button>
                          </div>
                          <div className="flex items-center gap-4">
                            <input 
                              type="number"
                              value={newCharData.gold}
                              onChange={(e) => setNewCharData({...newCharData, gold: Number(e.target.value)})}
                              className="flex-1 h-14 bg-midnight/40 border border-gold/20 rounded-2xl px-6 text-parchment focus:outline-none focus:border-gold transition-all"
                            />
                            <span className="text-gold font-bold">GP</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button 
                          type="button" 
                          onClick={() => setCreateStep(2)}
                          className="flex-1 py-5 text-sm font-black uppercase tracking-widest bg-white/5 border-white/10 rounded-2xl text-parchment hover:bg-white/10 transition-colors"
                        >
                          Back
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setCreateStep(4)}
                          className="flex-1 btn-magic btn-magic-primary py-5 text-sm font-black uppercase tracking-widest"
                        >
                          Next: Region
                        </button>
                      </div>
                    </>
                  )}

                  {createStep === 4 && (
                    <>
                      <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gold uppercase tracking-widest">Select Your Origin</h3>
                        <div className="grid grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                          {REGIONS.map(region => (
                            <button
                              key={region.id}
                              type="button"
                              onClick={() => setNewCharData({...newCharData, region: region.id})}
                              className={cn(
                                "relative group overflow-hidden rounded-2xl border transition-all duration-500",
                                newCharData.region === region.id 
                                  ? "border-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]" 
                                  : "border-white/10 hover:border-gold/30"
                              )}
                            >
                              <div className="aspect-video w-full overflow-hidden">
                                <img 
                                  src={region.image} 
                                  alt={region.name} 
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/40 to-transparent" />
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                                <div className="text-xs font-black text-gold uppercase tracking-widest mb-1">{region.name}</div>
                                <div className="text-[8px] text-parchment/60 line-clamp-2 leading-relaxed">{region.description}</div>
                              </div>
                              {newCharData.region === region.id && (
                                <div className="absolute top-3 right-3 w-6 h-6 bg-gold rounded-full flex items-center justify-center shadow-lg">
                                  <Sparkles size={12} className="text-midnight" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>

                        {newCharData.region === 'other' && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-2"
                          >
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gold/60 ml-2">Custom Region Name</label>
                            <input 
                              type="text"
                              required
                              value={customRegion}
                              onChange={(e) => setCustomRegion(e.target.value)}
                              placeholder="e.g. Waterdeep, Baldur's Gate..."
                              className="w-full h-14 bg-midnight/40 border border-gold/20 rounded-2xl px-6 text-parchment focus:outline-none focus:border-gold transition-all"
                            />
                          </motion.div>
                        )}
                      </div>

                      <div className="flex gap-4">
                        <button 
                          type="button" 
                          onClick={() => setCreateStep(3)}
                          className="flex-1 py-5 text-sm font-black uppercase tracking-widest bg-white/5 border-white/10 rounded-2xl text-parchment hover:bg-white/10 transition-colors"
                        >
                          Back
                        </button>
                        <button 
                          type="submit"
                          disabled={isCreating}
                          className="flex-1 btn-magic btn-magic-primary py-5 text-sm font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isCreating ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            "Create Hero"
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </form>
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
