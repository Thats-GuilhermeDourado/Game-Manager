import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Sword, Skull, Users, Search, Play } from 'lucide-react';
import { useCharacter, Character } from '../../contexts/CharacterContext';
import { MONSTERS, Monster } from '../../data/monsters';
import { cn } from '../../lib/utils';

interface CombatSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CombatSetupModal: React.FC<CombatSetupModalProps> = ({ isOpen, onClose }) => {
  const { campaignCharacters, startCombat } = useCharacter();
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(campaignCharacters.map(c => c.id));
  const [selectedMonsters, setSelectedMonsters] = useState<{ monster: Monster; count: number }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMonsters = MONSTERS.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePlayer = (id: string) => {
    setSelectedPlayers(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const addMonster = (monster: Monster) => {
    setSelectedMonsters(prev => {
      const existing = prev.find(m => m.monster.id === monster.id);
      if (existing) {
        return prev.map(m => m.monster.id === monster.id ? { ...m, count: m.count + 1 } : m);
      }
      return [...prev, { monster, count: 1 }];
    });
  };

  const removeMonster = (monsterId: string) => {
    setSelectedMonsters(prev => {
      const existing = prev.find(m => m.monster.id === monsterId);
      if (existing && existing.count > 1) {
        return prev.map(m => m.monster.id === monsterId ? { ...m, count: m.count - 1 } : m);
      }
      return prev.filter(m => m.monster.id !== monsterId);
    });
  };

  const handleStartCombat = async () => {
    const participants: any[] = [];

    // Add Players
    selectedPlayers.forEach(id => {
      const char = campaignCharacters.find(c => c.id === id);
      if (char) {
        participants.push({
          id: char.id,
          name: char.name,
          initiative: Math.floor(Math.random() * 20) + 1 + (char.initiative || 0),
          type: 'player',
          hp: { current: char.hp.current, max: char.hp.max },
          ac: char.ac,
          attack: Math.floor((char.attributes.str - 10) / 2) + 5, // Base attack power
          imageUrl: char.profile?.customImage || char.appearance || `https://api.dicebear.com/7.x/avataaars/svg?seed=${char.id}`,
          charClass: char.charClass,
          attributes: char.attributes,
          conditions: []
        });
      }
    });

    // Add Monsters
    selectedMonsters.forEach(({ monster, count }) => {
      for (let i = 0; i < count; i++) {
        const monsterId = `${monster.id}-${Date.now()}-${i}`;
        participants.push({
          id: monsterId,
          name: count > 1 ? `${monster.name} ${i + 1}` : monster.name,
          initiative: Math.floor(Math.random() * 20) + 1 + Math.floor((monster.attributes.Dexterity - 10) / 2),
          type: 'monster',
          hp: { current: monster.hp, max: monster.hp },
          ac: monster.ac,
          attack: Math.floor((monster.attributes.Strength - 10) / 2) + 5, // Base attack power
          imageUrl: monster.imageUrl || 'https://i.pinimg.com/1200x/6d/8d/6d/6d8d6d8d6d8d6d8d6d8d6d8d6d8d6d8d.jpg',
          monsterType: monster.id,
          attributes: monster.attributes,
          cr: monster.challenge,
          conditions: []
        });
      }
    });

    await startCombat(participants);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-midnight/90 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-6xl h-[90vh] glass-card flex flex-col overflow-hidden border-gold/20"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20">
                  <Sword size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-black text-gold uppercase tracking-widest">Configurar Combate</h2>
                  <p className="text-[10px] text-parchment/40 uppercase font-bold tracking-widest">Prepare o campo de batalha para seus jogadores</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-parchment/40">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Players Selection */}
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar border-r border-white/5">
                <h3 className="text-xs font-black text-gold uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Users size={14} /> Selecionar Jogadores
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {campaignCharacters.map(char => (
                    <button
                      key={char.id}
                      onClick={() => togglePlayer(char.id)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group",
                        selectedPlayers.includes(char.id)
                          ? "bg-gold/10 border-gold shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                          : "bg-white/5 border-white/10 hover:border-gold/30"
                      )}
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10">
                        <img src={char.profile?.customImage || char.appearance || `https://api.dicebear.com/7.x/avataaars/svg?seed=${char.id}`} alt={char.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs font-black uppercase truncate", selectedPlayers.includes(char.id) ? "text-gold" : "text-parchment")}>
                          {char.name}
                        </p>
                        <p className="text-[9px] text-parchment/40 uppercase font-bold">{char.race} {char.charClass}</p>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                        selectedPlayers.includes(char.id) ? "bg-gold border-gold text-midnight" : "border-white/10 group-hover:border-gold/30"
                      )}>
                        {selectedPlayers.includes(char.id) && <Plus size={14} strokeWidth={3} />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Monsters Selection */}
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-black/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
                    <Skull size={14} /> Adicionar Inimigos
                  </h3>
                  <div className="relative w-48">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-parchment/20" />
                    <input 
                      type="text"
                      placeholder="BUSCAR..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-[10px] font-bold text-parchment focus:outline-none focus:border-gold/30"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredMonsters.map(monster => {
                    const selected = selectedMonsters.find(sm => sm.monster.id === monster.id);
                    return (
                      <div 
                        key={monster.id}
                        className={cn(
                          "flex items-center gap-4 p-3 rounded-xl border transition-all",
                          selected ? "bg-red-500/5 border-red-500/30" : "bg-white/5 border-white/10"
                        )}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0">
                          <img src={monster.imageUrl || 'https://i.pinimg.com/1200x/6d/8d/6d/6d8d6d8d6d8d6d8d6d8d6d8d6d8d6d8d.jpg'} alt={monster.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-parchment uppercase truncate">{monster.name}</p>
                          <p className="text-[8px] text-red-400/60 uppercase font-black tracking-widest">CR {monster.challenge}</p>
                        </div>
                        
                        {selected ? (
                          <div className="flex items-center gap-3 bg-black/40 rounded-lg px-2 py-1 border border-white/10">
                            <button onClick={() => removeMonster(monster.id)} className="p-1 hover:text-red-400 transition-colors">
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-black text-parchment w-4 text-center">{selected.count}</span>
                            <button onClick={() => addMonster(monster)} className="p-1 hover:text-emerald-400 transition-colors">
                              <Plus size={12} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => addMonster(monster)}
                            className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all text-parchment/20"
                          >
                            <Plus size={16} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-white/5 bg-white/5 flex items-center justify-between">
              <div className="flex gap-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gold/40 uppercase tracking-widest">Jogadores</span>
                  <span className="text-lg font-display font-black text-parchment">{selectedPlayers.length}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-red-400/40 uppercase tracking-widest">Inimigos</span>
                  <span className="text-lg font-display font-black text-parchment">
                    {selectedMonsters.reduce((acc, curr) => acc + curr.count, 0)}
                  </span>
                </div>
              </div>

              <button
                disabled={selectedPlayers.length === 0 || selectedMonsters.length === 0}
                onClick={handleStartCombat}
                className="flex items-center gap-3 px-12 py-4 bg-gold text-midnight rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)] disabled:opacity-30 disabled:grayscale disabled:hover:scale-100"
              >
                Iniciar Batalha <Sword size={18} fill="currentColor" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
