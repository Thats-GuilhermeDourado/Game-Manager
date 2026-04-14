import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Users, 
  Target, 
  TrendingUp, 
  Coins, 
  MessageSquare, 
  Scroll as ScrollIcon,
  X,
  ChevronRight,
  Plus,
  ArrowUpRight,
  Lock,
  Star,
  Zap,
  Crown,
  Map,
  Sword,
  Search,
  Settings
} from 'lucide-react';
import { useCharacter, Guild, Character } from '../contexts/CharacterContext';
import { cn } from '../lib/utils';

import { GuildChat } from './GuildChat';

interface GuildHallProps {
  guild: Guild;
  onClose: () => void;
  onViewProfile?: (charId: string, userId: string) => void;
}

export function GuildHall({ guild, onClose, onViewProfile }: GuildHallProps) {
  const { 
    user,
    currentCharacter, 
    allCharacters, 
    updateGuildRank, 
    depositToGuildVault, 
    withdrawFromGuildVault, 
    addGuildNote,
    sendGuildMessage,
    guildMessages
  } = useCharacter();
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'quests' | 'economy' | 'social'>('overview');
  const [noteText, setNoteText] = useState('');

  const isLeader = guild.leaderId === currentCharacter?.id;
  const memberRank = guild.memberRefs.find(m => m.charId === currentCharacter?.id)?.rank || 'Recruta';

  const tabs = [
    { id: 'overview', icon: Shield, label: 'Visão Geral' },
    { id: 'members', icon: Users, label: 'Membros' },
    { id: 'quests', icon: Target, label: 'Missões' },
    { id: 'economy', icon: Coins, label: 'Economia' },
    { id: 'social', icon: MessageSquare, label: 'Social' },
  ];

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-black/40">Nível</h3>
            <TrendingUp size={14} className="text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-black">{guild.level}</div>
          <div className="mt-4 h-1 bg-black/5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: '45%' }} />
          </div>
          <div className="mt-2 text-[9px] font-medium text-black/30">450 / 1000 XP</div>
        </div>

        <div className="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-black/40">Reputação</h3>
            <Star size={14} className="text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-black">{guild.reputation}</div>
          <div className="mt-2 text-[9px] font-medium text-black/30">Influência Global</div>
        </div>

        <div className="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-black/40">Foco</h3>
            <Zap size={14} className="text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-black uppercase tracking-tight">{guild.specialization || 'Equilibrada'}</div>
          <div className="mt-2 text-[9px] font-medium text-black/30">Especialização</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-black/60 flex items-center gap-2 px-1">
            <Map size={14} className="text-emerald-500" /> Base da Guilda
          </h4>
          <div className="relative h-56 rounded-2xl overflow-hidden border border-white/60 shadow-md group">
            <img 
              src="https://picsum.photos/seed/guildbase/800/600" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              alt="Guild Base"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4">
              <div className="text-lg font-bold text-white leading-tight">{guild.resources?.base || 'Acampamento Inicial'}</div>
              <div className="text-[10px] font-medium text-white/70">Floresta dos Murmúrios</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold text-black/60 flex items-center gap-2 px-1">
            <ScrollIcon size={14} className="text-emerald-500" /> Notas Recentes
          </h4>
          <div className="bg-white/40 backdrop-blur-md border border-white/60 p-4 rounded-2xl space-y-3 min-h-[224px] flex flex-col shadow-sm">
            <div className="flex-1 space-y-2">
              {guild.notes?.map((note, i) => (
                <div key={i} className="p-3 bg-black/5 rounded-xl text-xs text-black/70 leading-relaxed">
                  {note}
                </div>
              ))}
            </div>
            {isLeader && (
              <div className="flex gap-2 pt-3 border-t border-black/5">
                <input 
                  type="text" 
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Nova nota..."
                  className="flex-1 bg-black/5 border border-transparent rounded-lg px-3 py-1.5 text-xs text-black outline-none focus:bg-white focus:border-emerald-500/30 transition-all"
                />
                <button 
                  onClick={() => {
                    if (noteText) {
                      addGuildNote(guild.id, noteText);
                      setNoteText('');
                    }
                  }}
                  className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-sm"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMembers = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-bold text-black tracking-tight">Membros da Guilda</h3>
        <div className="text-[10px] font-bold text-black/40 uppercase tracking-wider bg-black/5 px-3 py-1 rounded-full">
          {guild.memberRefs.length} Ativos
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guild.memberRefs.map((ref, i) => {
          const char = allCharacters.find(c => c.id === ref.charId);
          const profileImage = char?.profile?.customImage || char?.appearance || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ref.charId}`;
          
          return (
            <div key={i} className="bg-white/40 backdrop-blur-md border border-white/60 p-4 rounded-2xl flex items-center gap-4 group hover:bg-white/60 transition-all shadow-sm">
              <button 
                onClick={() => onViewProfile?.(ref.charId, ref.userId)}
                className="w-12 h-12 rounded-xl overflow-hidden border border-black/5 shadow-inner hover:scale-105 transition-transform"
              >
                <img 
                  src={profileImage} 
                  className="w-full h-full object-cover" 
                  alt="" 
                  referrerPolicy="no-referrer"
                />
              </button>
              <div className="flex-1 min-w-0">
                <button 
                  onClick={() => onViewProfile?.(ref.charId, ref.userId)}
                  className="text-sm font-bold text-black truncate hover:text-emerald-600 transition-colors block text-left w-full"
                >
                  {char?.name || 'Membro'}
                </button>
                <div className="flex items-center gap-1.5">
                  <Crown size={10} className={cn(ref.rank === 'Líder' ? "text-amber-500" : "text-emerald-500/50")} />
                  <span className="text-[10px] font-medium text-black/40 uppercase tracking-wider">{ref.rank}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isLeader && ref.charId !== currentCharacter?.id && (
                  <select 
                    value={ref.rank}
                    onChange={(e) => updateGuildRank(guild.id, ref.charId, e.target.value as any)}
                    className="bg-black/5 border-none rounded-lg px-2 py-1 text-[10px] font-bold text-black/60 outline-none hover:bg-black/10 transition-all"
                  >
                    <option value="Recruta">Recruta</option>
                    <option value="Membro">Membro</option>
                    <option value="Veterano">Veterano</option>
                    <option value="Oficial">Oficial</option>
                    <option value="Líder">Líder</option>
                  </select>
                )}
                <button className="p-2 text-black/20 hover:text-black transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderQuests = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-bold text-black tracking-tight">Mural de Missões</h3>
        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full">
          Novas em 14h
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {guild.dailyQuests?.map((quest: any) => (
          <div key={quest.id} className="bg-white/40 backdrop-blur-md border border-white/60 p-5 flex items-center justify-between rounded-2xl hover:bg-white/60 transition-all shadow-sm group">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-500/10 group-hover:scale-105 transition-transform">
                {quest.type === 'Explorar' ? <Map size={20} /> : <Sword size={20} />}
              </div>
              <div>
                <div className="text-sm font-bold text-black">{quest.title}</div>
                <div className="text-[10px] font-medium text-black/40 uppercase tracking-wider">{quest.type} • {quest.reward} PO</div>
              </div>
            </div>
            <button className="px-5 py-2 bg-emerald-500 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-600 transition-all shadow-sm">
              Aceitar
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEconomy = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-600 p-8 rounded-3xl space-y-6 shadow-lg shadow-emerald-600/20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-sm font-bold uppercase tracking-wider opacity-70">Cofre da Guilda</h3>
            <Coins size={20} className="text-emerald-200" />
          </div>
          <div className="text-5xl font-bold relative z-10 flex items-baseline gap-2">
            {guild.economy?.vault || 0} <span className="text-lg opacity-40">PO</span>
          </div>
          <div className="grid grid-cols-2 gap-3 relative z-10">
            <button 
              onClick={() => depositToGuildVault(guild.id, 100)}
              className="py-2.5 bg-white text-emerald-600 rounded-xl text-[11px] font-bold hover:bg-emerald-50 transition-all shadow-sm"
            >
              Depositar
            </button>
            {isLeader && (
              <button 
                onClick={() => withdrawFromGuildVault(guild.id, 100)}
                className="py-2.5 bg-emerald-700 text-white rounded-xl text-[11px] font-bold hover:bg-emerald-800 transition-all"
              >
                Retirar
              </button>
            )}
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-3xl space-y-6 shadow-sm">
          <h3 className="text-sm font-bold text-black/60 uppercase tracking-wider">Ajustes Fiscais</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-black/5 rounded-2xl">
              <div>
                <div className="text-[10px] font-bold text-black/40 uppercase tracking-wider">Taxa de Loot</div>
                <div className="text-[10px] text-black/20 font-medium">Automático</div>
              </div>
              <div className="text-2xl font-bold text-black">{((guild.economy?.taxRate || 0.1) * 100).toFixed(0)}%</div>
            </div>
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-black/40 uppercase tracking-wider px-1">Investimentos</div>
              <div className="bg-black/5 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-black/40">
                  <span>Expansão de Base</span>
                  <span className="flex items-center gap-1 font-bold"><Lock size={10} /> 5k PO</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-black/40">
                  <span>Forja Mágica</span>
                  <span className="flex items-center gap-1 font-bold"><Lock size={10} /> 12k PO</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSocial = () => {
    return <GuildChat guild={guild} />;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      
      {/* Background Particles - More subtle */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: Math.random() * 1000 }}
            animate={{ 
              opacity: [0.05, 0.2, 0.05],
              y: [Math.random() * 1000, Math.random() * 1000 - 400]
            }}
            transition={{ duration: 20 + Math.random() * 30, repeat: Infinity }}
            className="absolute w-1 h-1 bg-white rounded-full blur-[2px]"
            style={{ left: `${Math.random() * 100}%` }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-6xl h-[80vh] flex bg-white/70 backdrop-blur-[50px] border border-white/40 rounded-[1.25rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
      >
        {/* macOS Sidebar Style */}
        <div className="w-20 sm:w-64 bg-black/5 border-r border-black/5 flex flex-col p-4">
          {/* Close Button */}
          <div className="mb-8 px-2">
            <button 
              onClick={onClose} 
              className="w-6 h-6 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black/40 hover:text-black transition-all group"
            >
              <X size={14} />
            </button>
          </div>

          {/* Sidebar Navigation */}
          <div className="flex-1 flex flex-col gap-1">
            <div className="px-2 mb-2 text-[10px] font-bold text-black/30 uppercase tracking-wider">Menu</div>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group outline-none",
                    isActive 
                      ? "bg-black/10 text-black shadow-sm" 
                      : "text-black/50 hover:bg-black/5 hover:text-black"
                  )}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive ? "text-emerald-600" : "text-black/40")} />
                  <span className={cn(
                    "hidden sm:block text-sm font-medium tracking-tight",
                    isActive ? "font-semibold" : "font-normal"
                  )}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Profile/Settings */}
          <div className="mt-auto pt-4 border-t border-black/5 flex flex-col gap-1">
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-black/50 hover:bg-black/5 hover:text-black transition-all">
              <Settings size={18} />
              <span className="hidden sm:block text-sm font-medium">Ajustes</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white/30">
          {/* Top Bar / Header */}
          <div className="px-8 py-6 flex items-center justify-between border-b border-black/5">
            <div>
              <h2 className="text-xl font-bold text-black tracking-tight flex items-center gap-3">
                <span className="opacity-30 font-normal">Guilda</span>
                <span className="w-1 h-1 rounded-full bg-black/20" />
                {guild.name}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="bg-black/5 border border-black/5 rounded-md pl-9 pr-4 py-1.5 text-xs outline-none focus:bg-white/50 transition-all w-48"
                />
              </div>
              <button className="p-2 text-black/40 hover:text-black transition-all">
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Content Scroll Area */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-8">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'members' && renderMembers()}
              {activeTab === 'quests' && renderQuests()}
              {activeTab === 'economy' && renderEconomy()}
              {activeTab === 'social' && renderSocial()}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
