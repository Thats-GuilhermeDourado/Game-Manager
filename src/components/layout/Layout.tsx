import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Briefcase, 
  Compass, 
  Rocket, 
  Heart, 
  Settings, 
  Search, 
  Bell, 
  LogOut,
  Scroll,
  Backpack,
  Sword,
  Sparkles,
  Skull,
  LayoutDashboard,
  Zap,
  Users,
  Clock,
  CheckCircle2,
  Info,
  AlertCircle,
  X,
  MapPin,
  Trophy,
  Trash2,
  Dices
} from 'lucide-react';
import { useCharacter } from '../../contexts/CharacterContext';
import { cn } from '../../lib/utils';
import DiceRoller from '../DiceRoller';
import { DiceTray } from '../DiceTray';
import AIAssistant from '../AIAssistant';
import MerchantEvent from '../MerchantEvent';
import MagicSchoolSelection from '../MagicSchoolSelection';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TOA_ACHIEVEMENTS } from '../../data/achievements';
import { RaceIcon } from '../RaceIcon';
import { GameIcon } from '../GameIcon';
import { toast } from 'sonner';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { 
    currentCharacter, 
    user, 
    logout, 
    currentCampaign, 
    clearNotifications,
    campaignCharacters,
    updateQuest,
    deleteQuest,
    diceTrayConfig,
    closeDiceTray
  } = useCharacter();

  const isDM = !!currentCampaign && !!user && currentCampaign.dmId === user.uid;

  const [isDiceTrayOpen, setIsDiceTrayOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMagicSchoolSelectionOpen, setIsMagicSchoolSelectionOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [questSubTab, setQuestSubTab] = useState<'missions' | 'achievements'>('missions');

  // Reset category on navigation
  React.useEffect(() => {
    setActiveCategory('All Items');
  }, [location.pathname]);

  const notifications = (currentCampaign?.notifications || [])
    .filter(n => Date.now() - n.timestamp < 3 * 24 * 60 * 60 * 1000)
    .sort((a, b) => b.timestamp - a.timestamp);

  const wizardNotification = (currentCharacter?.charClass === 'Mago' && currentCharacter?.level >= 2 && !currentCharacter?.magicSchool)
    ? [{
        id: 'magic-school-selection',
        type: 'alert' as const,
        message: 'Uma nova Tradição Arcana chama por você! Escolha sua escola de magia.',
        timestamp: Date.now(),
        isVirtual: true
      }]
    : [];

  const allNotifications = [...wizardNotification, ...notifications];

  const hasUnread = allNotifications.length > 0;

  const sidebarItems = [
    { icon: LayoutDashboard, path: '/dashboard', label: 'Dashboard' },
    { icon: Scroll, path: '/character', label: 'Ficha' },
    { icon: Backpack, path: '/inventory', label: 'Inventário' },
    { icon: Sword, path: '/equipment', label: 'Equipamento' },
    { icon: Sparkles, path: '/spells', label: 'Grimório' },
    { icon: Users, path: '/social', label: 'Social Hub' },
    ...(isDM ? [{ icon: Zap, path: '/dm', label: 'DM Dashboard' }] : []),
  ];

  const categories = [
    'All Items', 'Conquistas & Missões', 'Locations', 'Loot', 'Lore'
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className={cn(
      "flex flex-col lg:flex-row min-h-screen text-parchment selection:bg-gold/30 selection:text-gold-bright p-2 sm:p-4 lg:p-6 gap-2 sm:gap-4 lg:gap-6 transition-colors duration-1000",
      activeCategory === 'Conquistas & Missões' && questSubTab === 'achievements' ? "bg-[#0a1a0a]" : "bg-midnight"
    )}>
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-24 flex-col items-center py-8 liquid-glass z-50 sticky top-6 h-[calc(100vh-3rem)]">
        <div className="mb-12">
          <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-gold to-gold-bright flex items-center justify-center shadow-[0_10px_30px_rgba(212,175,55,0.3)] transform hover:rotate-12 transition-transform duration-500">
            <span className="font-display text-3xl font-black text-midnight">D</span>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-8">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "p-4 rounded-[1.25rem] transition-all duration-500 group relative",
                location.pathname === item.path 
                  ? "bg-gold text-midnight shadow-[0_10px_25px_rgba(212,175,55,0.4)] scale-110" 
                  : "text-parchment/30 hover:text-parchment hover:bg-white/5 hover:scale-105"
              )}
            >
              <item.icon size={26} strokeWidth={2.5} />
              {/* Tooltip */}
              <span className="absolute left-full ml-6 px-4 py-2 liquid-glass text-gold text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 translate-x-[-10px] group-hover:translate-x-0">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          <button 
            onClick={handleLogout}
            className="p-4 text-parchment/30 hover:text-ruby transition-all duration-300 group relative hover:scale-110"
          >
            <LogOut size={26} />
            <span className="absolute left-full ml-6 px-4 py-2 bg-ruby/20 backdrop-blur-xl border border-ruby/30 text-ruby text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 translate-x-[-10px] group-hover:translate-x-0">
              Sair da Conta
            </span>
          </button>
        </div>
      </aside>

      {/* Bottom Navigation (Mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 liquid-glass border-t border-white/5 z-[100] flex items-center justify-around px-4">
        {sidebarItems.slice(0, 5).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "p-3 rounded-2xl transition-all duration-300",
              location.pathname === item.path 
                ? "bg-gold text-midnight shadow-lg scale-110" 
                : "text-parchment/30"
            )}
          >
            <item.icon size={20} strokeWidth={2.5} />
          </Link>
        ))}
        <button 
          onClick={handleLogout}
          className="p-3 text-parchment/30"
        >
          <LogOut size={20} />
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-4 lg:gap-6 pb-24 lg:pb-0">
        {/* Topbar */}
        <header className="h-auto lg:h-24 flex flex-col lg:flex-row items-center p-6 lg:px-10 liquid-glass sticky top-4 lg:top-6 z-40 gap-4 lg:gap-10">
          <div className="w-full lg:flex-1 flex flex-col lg:flex-row items-center gap-4 lg:gap-10">
            {/* Search */}
            <div className="relative w-full lg:w-96 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-parchment/20 group-focus-within:text-gold transition-all duration-300" size={18} />
              <input 
                type="text" 
                placeholder="Search items, quests, spells..." 
                className="w-full h-12 lg:h-14 pl-14 pr-6 bg-white/2 border border-white/5 rounded-2xl focus:outline-none focus:border-gold/30 focus:bg-white/5 transition-all duration-500 font-medium text-xs lg:text-sm placeholder:text-parchment/20"
              />
            </div>

            {/* Categories - Hidden on mobile for space */}
            <div className="hidden lg:flex items-center gap-4">
              {categories.map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                    activeCategory === cat 
                      ? "bg-white/5 text-gold shadow-inner border border-white/5" 
                      : "text-parchment/20 hover:text-parchment hover:bg-white/5"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-auto flex items-center justify-between lg:justify-end gap-4 lg:gap-8">

            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={cn(
                  "relative w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-2xl bg-white/2 border transition-all duration-500 group",
                  isNotificationsOpen ? "border-gold bg-gold/5" : "border-white/5 hover:bg-white/5 hover:border-white/10"
                )}
              >
                <Bell size={20} className={cn("transition-colors", isNotificationsOpen ? "text-gold" : "text-parchment/40 group-hover:text-gold")} />
                {hasUnread && (
                  <span className="absolute top-3 right-3 lg:top-4 lg:right-4 w-2 h-2 lg:w-2.5 lg:h-2.5 bg-ruby rounded-full border-2 border-midnight shadow-[0_0_10px_rgba(255,0,0,0.5)]"></span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsNotificationsOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-80 lg:w-96 liquid-glass border border-white/10 shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
                        <div className="flex items-center gap-3">
                          <Bell size={16} className="text-gold" />
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-parchment">Notificações</h3>
                        </div>
                        {isDM && notifications.length > 0 && (
                          <button 
                            onClick={clearNotifications}
                            className="text-[8px] font-black uppercase tracking-widest text-parchment/30 hover:text-ruby transition-colors"
                          >
                            Limpar Tudo
                          </button>
                        )}
                      </div>

                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {allNotifications.length === 0 ? (
                          <div className="p-12 text-center space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-parchment/10">
                              <Bell size={24} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-parchment/20">Nenhuma notificação recente</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-white/5">
                            {allNotifications.map((n) => (
                              <div key={n.id} className="p-6 hover:bg-white/2 transition-colors group">
                                <div className="flex gap-4">
                                  <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                    n.type === 'voting' ? "bg-emerald-500/10 text-emerald-400" :
                                    n.type === 'alert' ? "bg-ruby/10 text-ruby" : "bg-gold/10 text-gold"
                                  )}>
                                    {n.type === 'voting' ? <Zap size={18} /> : 
                                     n.type === 'alert' ? <AlertCircle size={18} /> : <Info size={18} />}
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <p className="text-xs font-bold text-parchment leading-relaxed">{n.message}</p>
                                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-parchment/30">
                                      <Clock size={10} />
                                      {formatDistanceToNow(n.timestamp, { addSuffix: true, locale: ptBR })}
                                    </div>
                                  </div>
                                </div>
                                {n.type === 'voting' && (
                                  <Link 
                                    to={`/campaign/${currentCampaign?.id}`}
                                    onClick={() => setIsNotificationsOpen(false)}
                                    className="mt-4 w-full py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[8px] font-black text-emerald-400 uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                  >
                                    <CheckCircle2 size={12} />
                                    Participar da Votação
                                  </Link>
                                )}
                                {(n as any).isVirtual && n.id === 'magic-school-selection' && (
                                  <button 
                                    onClick={() => {
                                      setIsMagicSchoolSelectionOpen(true);
                                      setIsNotificationsOpen(false);
                                    }}
                                    className="mt-4 w-full py-2.5 bg-gold/10 border border-gold/20 rounded-lg text-[8px] font-black text-gold uppercase tracking-widest hover:bg-gold hover:text-midnight transition-all flex items-center justify-center gap-2"
                                  >
                                    <Sparkles size={12} />
                                    Escolher Tradição
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 lg:gap-5 lg:pl-8 lg:border-l lg:border-white/5">
              <div className="text-right">
                <div className="text-xs lg:text-sm font-black text-parchment tracking-tight">{user?.displayName || 'Adventurer'}</div>
                <div className="text-[8px] lg:text-[9px] text-gold/60 font-black tracking-[0.2em] uppercase">Level {currentCharacter?.level || 1} • {currentCharacter?.charClass || 'Class'}</div>
              </div>
              <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-1 lg:p-1.5 shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <img 
                  src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'default'}`} 
                  alt="Avatar" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-[0.75rem] lg:rounded-[0.85rem] object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            {activeCategory === 'All Items' ? (
              <motion.div
                key="page-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            ) : activeCategory === 'Conquistas & Missões' ? (
              <motion.div 
                key="quests-container"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-8 sm:space-y-12 relative min-h-[700px] p-6 sm:p-10 rounded-[3rem] transition-colors duration-1000"
              >
                {/* Sub-tabs Toggle */}
                <div className="flex justify-center mb-12">
                  <div className="bg-midnight/40 p-1.5 rounded-2xl border border-white/5 flex gap-2 backdrop-blur-md">
                    <button 
                      onClick={() => setQuestSubTab('missions')}
                      className={cn(
                        "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                        questSubTab === 'missions' ? "bg-gold text-midnight shadow-lg scale-105" : "text-parchment/40 hover:text-parchment"
                      )}
                    >
                      Missões
                    </button>
                    <button 
                      onClick={() => setQuestSubTab('achievements')}
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
                              {currentCampaign?.quests?.filter(q => q.type === type).map(quest => (
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
                              {(!currentCampaign?.quests || currentCampaign.quests.filter(q => q.type === type).length === 0) && (
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
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-transparent to-midnight" />
                      </div>

                      <div className="text-center space-y-4">
                        <h2 className="text-4xl sm:text-6xl font-display font-black text-parchment uppercase tracking-tighter leading-none drop-shadow-2xl">Salão de Conquistas</h2>
                        <p className="text-gold font-black tracking-[0.4em] uppercase text-[9px] sm:text-[10px]">Glória Eterna aos Heróis de Chult</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {(currentCampaign?.achievements || TOA_ACHIEVEMENTS).map(achievement => {
                          const unlockedBy = campaignCharacters.filter(c => c.profile?.achievements?.some(a => a.id === achievement.id));
                          const isUnlocked = unlockedBy.length > 0;
                          
                          return (
                            <motion.div 
                              key={achievement.id}
                              whileHover={{ y: -4, scale: 1.02 }}
                              className={cn(
                                "relative group overflow-hidden rounded-3xl p-6 transition-all duration-500",
                                "bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 hover:border-gold/30",
                                "shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-gold/10"
                              )}
                            >
                              {/* Texture Overlay */}
                              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                              
                              <div className="flex gap-5 relative z-10">
                                {/* Icon Section */}
                                <div className="flex-shrink-0">
                                  <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700",
                                    isUnlocked ? "bg-gold/10 shadow-[0_0_20px_rgba(212,175,55,0.15)]" : "bg-white/5"
                                  )}>
                                    <GameIcon 
                                      icon={achievement.icon} 
                                      tier={achievement.tier} 
                                      unlocked={isUnlocked}
                                      className="w-8 h-8"
                                    />
                                  </div>
                                </div>

                                {/* Content Section */}
                                <div className="flex-1 min-w-0 space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <h3 className={cn(
                                      "text-sm font-display font-black uppercase tracking-tight transition-colors duration-500",
                                      isUnlocked ? "text-parchment group-hover:text-gold" : "text-parchment/40"
                                    )}>
                                      {achievement.name}
                                    </h3>
                                    <div className={cn(
                                      "px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border shrink-0",
                                      achievement.tier === 'bronze' ? "bg-orange-900/20 text-orange-400 border-orange-500/30" :
                                      achievement.tier === 'silver' ? "bg-slate-400/20 text-slate-300 border-slate-400/30" :
                                      achievement.tier === 'gold' ? "bg-gold/20 text-gold border-gold/30" :
                                      "bg-purple-500/20 text-purple-400 border-purple-500/30"
                                    )}>
                                      {achievement.tier}
                                    </div>
                                  </div>

                                  <p className="text-[10px] text-parchment/30 leading-relaxed italic line-clamp-2 group-hover:line-clamp-none transition-all">
                                    {achievement.description}
                                  </p>

                                  {/* Rewards */}
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {achievement.reward.xp && (
                                      <span className="text-[8px] font-black text-gold/40 uppercase tracking-tighter">+{achievement.reward.xp} XP</span>
                                    )}
                                    {achievement.reward.gold && (
                                      <span className="text-[8px] font-black text-amber-500/40 uppercase tracking-tighter">+{achievement.reward.gold} GP</span>
                                    )}
                                    {achievement.reward.item && (
                                      <span className="text-[8px] font-black text-emerald-400/40 uppercase tracking-tighter">[{achievement.reward.item}]</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Unlocked By Section */}
                              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                                <div className="flex -space-x-2">
                                  {unlockedBy.length > 0 ? unlockedBy.slice(0, 5).map(char => (
                                    <div 
                                      key={char.id}
                                      className="w-6 h-6 rounded-lg overflow-hidden border-2 border-midnight shadow-lg ring-1 ring-white/5"
                                      title={char.name}
                                    >
                                      {char.appearance ? (
                                        <img src={char.appearance} alt={char.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                      ) : (
                                        <RaceIcon race={char.race} className="w-full h-full" />
                                      )}
                                    </div>
                                  )) : (
                                    <span className="text-[8px] text-parchment/10 uppercase font-black tracking-widest">Não conquistado</span>
                                  )}
                                  {unlockedBy.length > 5 && (
                                    <div className="w-6 h-6 rounded-lg bg-white/5 border-2 border-midnight flex items-center justify-center text-[8px] font-black text-parchment/40">
                                      +{unlockedBy.length - 5}
                                    </div>
                                  )}
                                </div>
                                {isUnlocked && (
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1 h-1 rounded-full bg-gold animate-pulse" />
                                    <span className="text-[8px] font-black text-gold/60 uppercase tracking-widest">Conquistado</span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="p-10 text-center text-parchment/20 uppercase font-black tracking-widest">
                Conteúdo de {activeCategory} em desenvolvimento
              </div>
            )}
          </AnimatePresence>
        </main>

        {/* Floating Dice Roller */}
        <DiceRoller onOpenDiceTray={() => currentCampaign && setIsDiceTrayOpen(true)} />

        {/* Global Dice Tray */}
        {(isDiceTrayOpen || (diceTrayConfig && diceTrayConfig.isOpen)) && currentCampaign && (
          <DiceTray 
            campaignId={currentCampaign.id}
            userId={user?.uid || ''}
            character={currentCharacter || undefined}
            onClose={() => {
              setIsDiceTrayOpen(false);
              closeDiceTray();
            }}
            onRollComplete={diceTrayConfig?.onRollComplete}
            initialDc={diceTrayConfig?.initialDc}
            initialAttr={diceTrayConfig?.initialAttr}
          />
        )}

        {/* AI Assistant */}
        <AIAssistant />

        {/* Merchant Event */}
        <MerchantEvent />

        {/* Magic School Selection */}
        <MagicSchoolSelection 
          isOpen={isMagicSchoolSelectionOpen} 
          onClose={() => setIsMagicSchoolSelectionOpen(false)} 
        />
      </div>
    </div>
  );
}
