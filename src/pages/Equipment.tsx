import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Shield, 
  Sword, 
  Hammer, 
  Backpack, 
  Sparkles, 
  ChevronRight,
  Info,
  Coins,
  Weight,
  Plus
} from 'lucide-react';
import { EQUIPMENT, EquipmentItem } from '../data/equipment';
import { cn } from '../lib/utils';
import { useCharacter } from '../contexts/CharacterContext';

export default function Equipment() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | null>(null);
  const [filter, setFilter] = useState<EquipmentItem['type'] | 'all'>('all');
  const { giveItemToCharacter, currentCharacter } = useCharacter();

  const filteredEquipment = EQUIPMENT.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || item.type === filter;
    return matchesSearch && matchesFilter;
  });

  const handleGiveItem = (item: EquipmentItem) => {
    if (!currentCharacter) return;
    giveItemToCharacter(currentCharacter.id, item);
  };

  const getTypeIcon = (type: EquipmentItem['type']) => {
    switch (type) {
      case 'weapon': return <Sword className="w-5 h-5" />;
      case 'armor': return <Shield className="w-5 h-5" />;
      case 'tool': return <Hammer className="w-5 h-5" />;
      case 'magic-item': return <Sparkles className="w-5 h-5" />;
      default: return <Backpack className="w-5 h-5" />;
    }
  };

  const getRarityColor = (rarity: EquipmentItem['rarity']) => {
    switch (rarity) {
      case 'legendary': return 'text-orange-500 border-orange-500/20 bg-orange-500/10';
      case 'very-rare': return 'text-purple-500 border-purple-500/20 bg-purple-500/10';
      case 'rare': return 'text-blue-500 border-blue-500/20 bg-blue-500/10';
      case 'uncommon': return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10';
      default: return 'text-parchment/40 border-white/10 bg-white/5';
    }
  };

  return (
    <div className="flex h-full gap-8">
      {/* Equipment List */}
      <div className="flex-1 space-y-8 overflow-y-auto pr-4 custom-scrollbar">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-display font-black text-gold uppercase tracking-tighter">Equipment</h1>
            <p className="text-parchment/40 font-medium tracking-widest uppercase text-xs mt-2">Gear, Weapons & Artifacts</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold/40 group-focus-within:text-gold transition-colors" />
              <input 
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 bg-midnight/40 border border-gold/10 rounded-2xl py-3 pl-12 pr-6 text-parchment placeholder:text-parchment/20 focus:outline-none focus:border-gold/40 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['all', 'weapon', 'armor', 'magic-item', 'tool', 'adventuring-gear'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t as any)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all",
                filter === t 
                  ? "bg-gold text-midnight border-gold shadow-lg shadow-gold/20" 
                  : "bg-midnight/40 text-gold/40 border-gold/10 hover:border-gold/30 hover:text-gold"
              )}
            >
              {t.replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredEquipment.map((item) => (
            <motion.div
              key={item.id}
              layoutId={item.id}
              onClick={() => setSelectedItem(item)}
              className={cn(
                "group relative p-6 bg-midnight/40 border border-gold/10 rounded-3xl cursor-pointer transition-all hover:border-gold/30 hover:bg-midnight/60",
                selectedItem?.id === item.id && "border-gold/50 bg-midnight/80"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                  {getTypeIcon(item.type)}
                </div>
                <div className={cn(
                  "px-3 py-1 border rounded-full text-[10px] font-bold uppercase tracking-widest",
                  getRarityColor(item.rarity)
                )}>
                  {item.rarity}
                </div>
              </div>

              <h3 className="text-xl font-display font-black text-parchment uppercase tracking-tight mb-1">{item.name}</h3>
              <p className="text-xs text-parchment/40 font-medium italic mb-4">{item.type.replace('-', ' ')}</p>

              <div className="flex items-center gap-4">
                {item.cost && (
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-gold/40" />
                    <span className="text-sm font-bold text-parchment/80">{item.cost}</span>
                  </div>
                )}
                {item.weight && (
                  <div className="flex items-center gap-2">
                    <Weight className="w-4 h-4 text-parchment/20" />
                    <span className="text-sm font-bold text-parchment/80">{item.weight}</span>
                  </div>
                )}
              </div>

              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-5 h-5 text-gold" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Item Details Sidebar */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="w-[450px] bg-midnight/60 border-l border-gold/10 p-8 overflow-y-auto custom-scrollbar backdrop-blur-xl"
          >
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="text-xs font-bold text-gold/40 hover:text-gold uppercase tracking-widest transition-colors"
                >
                  Close Details
                </button>
                <div className={cn(
                  "px-3 py-1 border rounded-full text-[10px] font-bold uppercase tracking-widest",
                  getRarityColor(selectedItem.rarity)
                )}>
                  {selectedItem.rarity}
                </div>
              </div>

              <div>
                <h2 className="text-4xl font-display font-black text-gold uppercase tracking-tighter mb-2">{selectedItem.name}</h2>
                <p className="text-sm text-parchment/40 font-medium italic">{selectedItem.type.replace('-', ' ')}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <Coins className="w-5 h-5 text-gold/40 mb-2" />
                  <div className="text-lg font-bold text-parchment">{selectedItem.cost || '—'}</div>
                  <div className="text-[10px] text-parchment/40 uppercase font-bold">Cost</div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <Weight className="w-5 h-5 text-parchment/20 mb-2" />
                  <div className="text-lg font-bold text-parchment">{selectedItem.weight || '—'}</div>
                  <div className="text-[10px] text-parchment/40 uppercase font-bold">Weight</div>
                </div>
              </div>

              {/* Stats Section */}
              {(selectedItem.damage || selectedItem.ac) && (
                <div className="p-6 bg-gold/5 rounded-3xl border border-gold/10">
                  <div className="grid grid-cols-2 gap-8">
                    {selectedItem.damage && (
                      <div>
                        <div className="text-[10px] font-bold text-gold uppercase tracking-widest mb-1">Damage</div>
                        <div className="text-2xl font-display font-black text-parchment">{selectedItem.damage}</div>
                      </div>
                    )}
                    {selectedItem.ac && (
                      <div>
                        <div className="text-[10px] font-bold text-gold uppercase tracking-widest mb-1">Armor Class</div>
                        <div className="text-2xl font-display font-black text-parchment">{selectedItem.ac}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <h3 className="text-xl font-display font-black text-gold uppercase tracking-widest flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Description
                </h3>
                <p className="text-sm text-parchment/60 leading-relaxed italic">
                  "{selectedItem.description}"
                </p>
              </div>

              {selectedItem.properties && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gold uppercase tracking-widest">Properties</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.properties.map(p => (
                      <span key={p} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-parchment/60 uppercase">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              {currentCharacter && (
                <button
                  onClick={() => handleGiveItem(selectedItem)}
                  className="w-full py-4 bg-gold text-midnight font-display font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-gold/20"
                >
                  <Plus className="w-5 h-5" />
                  Add to Inventory
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
