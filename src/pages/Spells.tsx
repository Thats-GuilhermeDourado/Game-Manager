import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Book, 
  Sparkles, 
  Zap, 
  Shield, 
  Flame, 
  Droplets, 
  Wind, 
  Mountain,
  Plus,
  Info,
  ChevronDown,
  Star,
  Skull,
  Eye,
  Heart
} from 'lucide-react';
import { useCharacter } from '../contexts/CharacterContext';
import { spells, Spell } from '../data/spells';
import { cn } from '../lib/utils';
import Fuse from 'fuse.js';
import { RunicStudyGame } from '../components/RunicStudyGame';
import { toast } from 'sonner';

const SCHOOL_ICONS: Record<string, any> = {
  'Abjuração': Shield,
  'Adivinhação': Eye,
  'Convocação': Wind,
  'Encantamento': Heart,
  'Evocação': Flame,
  'Ilusão': Sparkles,
  'Necromancia': Skull,
  'Transmutação': Zap
};

export default function Spells() {
  const { currentCharacter, saveCharacter } = useCharacter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<number | 'All'>('All');
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [isCopyingScroll, setIsCopyingScroll] = useState(false);
  const [studyingSpell, setStudyingSpell] = useState<Spell | null>(null);

  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
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

  const spellcasting = currentCharacter?.spellcasting || {
    ability: 'Intelligence',
    saveDC: 8,
    attackBonus: 0,
    slots: {},
    prepared: [],
    spells: [],
    type: 'Known'
  };

  const learnedSpells = currentCharacter?.spellcasting?.spells || [];
  const preparedSpells = currentCharacter?.spellcasting?.prepared || [];
  const castingType = currentCharacter?.spellcasting?.type || 'Known';

  // Filter spells by class
  const classSpells = spells.filter(s => 
    s.classes.some(c => c.toLowerCase() === currentCharacter?.charClass?.toLowerCase())
  );

  const baseSpells = (castingType === 'Prepared' || castingType === 'Known') ? classSpells : learnedSpells;

  const fuse = new Fuse(baseSpells, {
    keys: ['name', 'description', 'school'],
    threshold: 0.3,
    ignoreLocation: true
  });

  const filteredSpells = searchTerm 
    ? fuse.search(searchTerm).map(result => result.item).filter(spell => filterLevel === 'All' || spell.level === filterLevel)
    : baseSpells.filter(spell => filterLevel === 'All' || spell.level === filterLevel);

  const handleLearnSpell = async (spell: Spell) => {
    if (!currentCharacter) return;
    
    if (learnedSpells.find((s: any) => s.id === spell.id)) return;

    const newSpells = [...learnedSpells, spell];
    await saveCharacter({
      spellcasting: {
        ...spellcasting,
        spells: newSpells
      }
    });
  };

  const handlePrepareSpell = async (spellId: string) => {
    if (!currentCharacter) return;
    
    let newPrepared = [...preparedSpells];
    if (newPrepared.includes(spellId)) {
      newPrepared = newPrepared.filter(id => id !== spellId);
    } else {
      newPrepared.push(spellId);
    }

    await saveCharacter({
      spellcasting: {
        ...spellcasting,
        prepared: newPrepared
      }
    });
  };

  const handleCopyScroll = async (spell: Spell) => {
    if (!currentCharacter) return;
    const cost = spell.level * 50 || 25;
    
    if (currentCharacter.gold < cost) {
      setConfirmModal({
        isOpen: true,
        title: 'Ouro Insuficiente',
        message: `Você precisa de ${cost} PO para copiar esta magia.`,
        onConfirm: () => {}
      });
      return;
    }

    // Deduct gold and start study game
    await saveCharacter({
      gold: currentCharacter.gold - cost
    });
    
    setStudyingSpell(spell);
    setIsCopyModalOpen(false);
  };

  const handleStudySuccess = async () => {
    if (!currentCharacter || !studyingSpell) return;
    
    await saveCharacter({
      spellcasting: {
        ...spellcasting,
        spells: [...learnedSpells, studyingSpell]
      }
    });
    
    toast.success(`Magia Aprendida!`, {
      description: `${studyingSpell.name} foi adicionada ao seu grimório.`
    });
    setStudyingSpell(null);
  };

  const handleStudyFailure = async (damage: number) => {
    if (!currentCharacter) return;
    
    const newHP = Math.max(0, (currentCharacter.hp?.current || 0) - damage);
    await saveCharacter({
      hp: { ...(currentCharacter.hp || { current: 10, max: 10 }), current: newHP }
    });
    
    toast.error(`Falha no Estudo!`, {
      description: `Você sofreu ${damage} de dano psíquico pela sobrecarga mental.`
    });
  };

  const handleRemoveSpell = async (spellId: string) => {
    const newSpells = learnedSpells.filter((s: any) => s.id !== spellId);
    const newPrepared = preparedSpells.filter(id => id !== spellId);
    await saveCharacter({
      spellcasting: {
        ...spellcasting,
        spells: newSpells,
        prepared: newPrepared
      }
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto px-4 pb-20">
      {/* Runic Study Game Modal */}
      <AnimatePresence>
        {studyingSpell && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-midnight/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg"
            >
              <RunicStudyGame 
                spell={studyingSpell}
                onSuccess={handleStudySuccess}
                onFailure={handleStudyFailure}
                onCancel={() => setStudyingSpell(null)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Spell List Section */}
      <div className="flex-1 space-y-10">
        <div className="liquid-glass p-10 border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <h2 className="text-5xl font-display font-black text-parchment uppercase tracking-tighter drop-shadow-2xl">
              {castingType === 'Spellbook' ? 'Grimório Arcano' : 'Poder Místico'}
            </h2>
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-gold uppercase tracking-[0.2em] shadow-inner">
                {castingType === 'Prepared' ? 'Conjurador Preparado' : castingType === 'Known' ? 'Magias Conhecidas' : 'Grimório'}
              </span>
              <p className="text-parchment/20 font-black uppercase tracking-widest text-[9px] italic">
                {castingType === 'Prepared' ? 'Acesso total à lista de classe' : 
                 castingType === 'Known' ? 'Conhecimento limitado e fixo' : 
                 'Preparação via estudo de grimório'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="relative flex-1 md:w-72 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-parchment/20 group-focus-within:text-gold transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Buscar magia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-14 bg-white/2 border border-white/5 rounded-2xl pl-14 pr-8 text-sm text-parchment focus:outline-none focus:border-gold/30 focus:bg-white/5 transition-all shadow-inner"
              />
            </div>
            <div className="flex gap-3 p-1.5 bg-white/2 border border-white/5 rounded-2xl shadow-inner">
              {['All', 0, 1, 2, 3].map(lvl => (
                <button 
                  key={lvl}
                  onClick={() => setFilterLevel(lvl as any)}
                  className={cn(
                    "w-11 h-11 rounded-xl text-[10px] font-black transition-all duration-500 border",
                    filterLevel === lvl 
                      ? "bg-gold border-gold text-midnight shadow-[0_5px_15px_rgba(212,175,55,0.3)] scale-110" 
                      : "bg-transparent border-transparent text-parchment/20 hover:text-parchment hover:bg-white/5"
                  )}
                >
                  {lvl === 'All' ? 'ALL' : lvl === 0 ? 'C' : lvl}
                </button>
              ))}
            </div>
            {castingType === 'Spellbook' && (
              <button 
                onClick={() => setIsCopyModalOpen(true)}
                className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 text-gold flex items-center justify-center hover:bg-gold/20 transition-all shadow-lg group"
                title="Copiar Pergaminhos"
              >
                <Plus size={24} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredSpells.length > 0 ? (
            filteredSpells.map((spell, i) => {
              const isLearned = learnedSpells.find((s: any) => s.id === spell.id);
              const isPrepared = preparedSpells.includes(spell.id);
              const Icon = SCHOOL_ICONS[spell.school] || Sparkles;
              
              return (
                <motion.div 
                  key={spell.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedSpell(spell)}
                  className={cn(
                    "bento-item p-8 cursor-pointer group relative overflow-hidden border-white/5",
                    (castingType === 'Prepared' || castingType === 'Spellbook') && isPrepared ? "border-gold/40 bg-gold/5 shadow-[0_0_30px_rgba(212,175,55,0.1)]" : 
                    castingType === 'Known' && isLearned ? "border-gold/20 bg-gold/2" : "hover:border-gold/20"
                  )}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 shadow-2xl",
                      isPrepared || (castingType === 'Known' && isLearned) ? "bg-gold/10 border-gold/30 text-gold" : "bg-white/5 border-white/10 text-parchment/20 group-hover:text-gold group-hover:border-gold/30"
                    )}>
                      <Icon size={28} strokeWidth={2.5} />
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-black text-gold uppercase tracking-[0.3em] mb-1">
                        {spell.level === 0 ? 'Truque' : `Nível ${spell.level}`}
                      </div>
                      <div className="text-[8px] text-parchment/20 uppercase font-black tracking-widest">{spell.school}</div>
                    </div>
                  </div>

                  <h3 className="text-xl font-display font-black text-parchment group-hover:text-gold transition-colors mb-4 tracking-tight">{spell.name}</h3>
                  
                  <div className="flex gap-6 text-[9px] text-parchment/20 font-black uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2 group-hover:text-parchment/40 transition-colors"><Zap size={12} strokeWidth={3} /> {spell.castingTime}</div>
                    <div className="flex items-center gap-2 group-hover:text-parchment/40 transition-colors"><Wind size={12} strokeWidth={3} /> {spell.range}</div>
                  </div>

                  {/* Preparation Toggle */}
                  {(castingType === 'Prepared' || castingType === 'Spellbook') && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePrepareSpell(spell.id); }}
                      className={cn(
                        "absolute bottom-6 right-6 px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-xl",
                        isPrepared ? "bg-gold text-midnight shadow-[0_5px_15px_rgba(212,175,55,0.3)]" : "bg-white/5 text-gold border border-white/10 hover:bg-gold hover:text-midnight hover:border-gold"
                      )}
                    >
                      {isPrepared ? 'Preparada' : 'Preparar'}
                    </button>
                  )}

                  {castingType === 'Known' && !isLearned && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleLearnSpell(spell); }}
                      className="absolute bottom-6 right-6 w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-gold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-gold hover:text-midnight hover:border-gold shadow-xl"
                    >
                      <Plus size={18} strokeWidth={3} />
                    </button>
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center space-y-6 opacity-30">
              <Sparkles size={48} className="mx-auto text-gold/20" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">Nenhuma magia encontrada nos planos astrais</p>
            </div>
          )}
        </div>
      </div>

      {/* Spell Details Sidebar */}
      <aside className="w-full lg:w-[400px] space-y-8">
        <AnimatePresence mode="wait">
          {selectedSpell ? (
            <motion.div 
              key={selectedSpell.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className="liquid-glass p-10 space-y-10 sticky top-32 border-white/5 shadow-2xl"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <h3 className="text-4xl font-display font-black text-parchment uppercase tracking-tighter leading-none drop-shadow-2xl">{selectedSpell.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-parchment/30 uppercase tracking-[0.3em] font-black">{selectedSpell.school}</span>
                    <div className="w-1 h-1 rounded-full bg-gold/40" />
                    <span className="text-[9px] text-gold uppercase tracking-[0.3em] font-black">
                      {selectedSpell.level === 0 ? 'Truque' : `Nível ${selectedSpell.level}`}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedSpell(null)}
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-parchment/20 hover:text-parchment transition-all duration-500"
                >
                  <ChevronDown className="rotate-90 w-6 h-6" strokeWidth={3} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Casting Time', value: selectedSpell.castingTime },
                  { label: 'Range', value: selectedSpell.range },
                  { label: 'Components', value: selectedSpell.components.join(', ') },
                  { label: 'Duration', value: selectedSpell.duration },
                ].map(stat => (
                  <div key={stat.label} className="bg-white/2 border border-white/5 rounded-2xl p-5 space-y-2 shadow-inner">
                    <div className="text-[8px] text-parchment/20 uppercase tracking-[0.3em] font-black">{stat.label}</div>
                    <div className="text-xs font-black text-parchment tracking-tight">{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/40 flex items-center gap-3">
                  <Info size={14} strokeWidth={3} /> Descrição Arcana
                </h4>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold/40 via-gold/10 to-transparent rounded-full" />
                  <p className="text-sm text-parchment/60 leading-relaxed italic pl-6 font-medium">
                    {selectedSpell.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                {castingType === 'Known' && (
                  learnedSpells.find((s: any) => s.id === selectedSpell.id) ? (
                    <button 
                      onClick={() => handleRemoveSpell(selectedSpell.id)}
                      className="w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500/10 transition-all duration-500"
                    >
                      Esquecer Magia
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleLearnSpell(selectedSpell)}
                      className="w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-gold text-midnight hover:scale-105 transition-all duration-500 shadow-[0_10px_20px_rgba(212,175,55,0.3)]"
                    >
                      Aprender Magia
                    </button>
                  )
                )}

                {(castingType === 'Prepared' || castingType === 'Spellbook') && (
                  <button 
                    onClick={() => handlePrepareSpell(selectedSpell.id)}
                    className={cn(
                      "w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border shadow-xl",
                      preparedSpells.includes(selectedSpell.id) 
                        ? "bg-gold border-gold text-midnight shadow-[0_10px_20px_rgba(212,175,55,0.3)] scale-105" 
                        : "bg-white/5 border-white/10 text-gold hover:bg-gold hover:text-midnight hover:border-gold"
                    )}
                  >
                    {preparedSpells.includes(selectedSpell.id) ? 'Despreparar Magia' : 'Preparar Magia'}
                  </button>
                )}

                {castingType === 'Spellbook' && !learnedSpells.find((s: any) => s.id === selectedSpell.id) && (
                  <button 
                    onClick={() => handleCopyScroll(selectedSpell)}
                    className="w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-gold text-midnight hover:scale-105 transition-all duration-500 shadow-[0_10px_20px_rgba(212,175,55,0.3)]"
                  >
                    Copiar para Grimório ({selectedSpell.level * 50 || 25} PO)
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="liquid-glass p-16 text-center space-y-8 sticky top-32 border-white/5 opacity-50">
              <div className="w-24 h-24 rounded-full bg-white/2 border border-white/5 mx-auto flex items-center justify-center shadow-inner">
                <Book size={40} className="text-parchment/10" strokeWidth={1.5} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-display font-black text-parchment uppercase tracking-tight">
                  {castingType === 'Spellbook' && learnedSpells.length === 0 ? 'Grimório Vazio' : 
                   castingType === 'Spellbook' && learnedSpells.length > 0 ? 'Selecione uma Magia' :
                   'Selecione uma Magia'}
                </h3>
                <p className="text-[10px] text-parchment/20 font-black uppercase tracking-widest leading-relaxed">
                  {castingType === 'Spellbook' && learnedSpells.length === 0 
                    ? 'Seu grimório ainda não possui registros. Copie pergaminhos para expandir seu poder.' 
                    : castingType === 'Spellbook' && learnedSpells.length > 0
                    ? 'Seu grimório possui segredos arcanos. Selecione uma magia para prepará-la.'
                    : 'Selecione uma magia para decifrar seus segredos arcanos e gerenciar sua preparação.'}
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </aside>

      {/* Wizard Copy Scroll Modal */}
      <AnimatePresence>
        {isCopyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCopyModalOpen(false)}
              className="absolute inset-0 bg-midnight/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl liquid-glass p-10 border-gold/20 bg-midnight/90 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold/5 to-transparent pointer-events-none" />
              
              <div className="flex justify-between items-center mb-10 relative z-10">
                <div className="space-y-2">
                  <h3 className="text-4xl font-display font-black text-gold uppercase tracking-tighter">Copiar Pergaminhos</h3>
                  <p className="text-[10px] text-parchment/30 font-black uppercase tracking-widest">Expanda seu conhecimento arcano através de estudo.</p>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-[9px] text-parchment/20 uppercase font-black tracking-[0.3em] mb-1">Seu Ouro</div>
                    <div className="text-3xl font-display font-black text-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">{currentCharacter?.gold} PO</div>
                  </div>
                  <button 
                    onClick={() => setIsCopyModalOpen(false)}
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-parchment/20 hover:text-parchment transition-all"
                  >
                    <ChevronDown className="rotate-90 w-6 h-6" strokeWidth={3} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar relative z-10">
                {classSpells.filter(s => !learnedSpells.find((ls: any) => ls.id === s.id)).map(spell => (
                  <div key={spell.id} className="bg-white/2 border border-white/5 rounded-[1.5rem] p-6 flex justify-between items-center hover:border-gold/20 transition-colors group shadow-inner">
                    <div>
                      <div className="text-lg font-display font-black text-parchment mb-1 group-hover:text-gold transition-colors">{spell.name}</div>
                      <div className="text-[9px] text-parchment/20 font-black uppercase tracking-widest">Nível {spell.level} • <span className="text-gold">{spell.level * 50 || 25} PO</span></div>
                    </div>
                    <button 
                      onClick={() => handleCopyScroll(spell)}
                      className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-gold hover:bg-gold hover:text-midnight hover:border-gold transition-all duration-500 flex items-center justify-center shadow-xl"
                    >
                      <Plus size={20} strokeWidth={3} />
                    </button>
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
                <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20">
                  <Sparkles className="text-gold" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-parchment">{confirmModal.title}</h3>
                  <p className="text-xs text-gold/60 font-black uppercase tracking-widest">Aviso</p>
                </div>
              </div>
              
              <p className="text-parchment/70 mb-8 leading-relaxed">
                {confirmModal.message}
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                  className="flex-1 px-6 py-3 rounded-xl bg-gold text-midnight font-bold hover:bg-gold-light transition-all shadow-lg shadow-gold/20"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
