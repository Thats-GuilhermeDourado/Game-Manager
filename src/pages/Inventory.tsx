import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Plus, 
  Minus, 
  Trash2, 
  Shield, 
  Sword, 
  Zap, 
  Heart, 
  Coins, 
  Weight, 
  Package,
  Info,
  ShoppingCart,
  ArrowRight,
  Users,
  Sparkles,
  Flame,
  Droplets,
  Wind,
  Mountain
} from 'lucide-react';
import { useCharacter, Character } from '../contexts/CharacterContext';
import { ITEMS as items, itemCategories, Item } from '../data/items';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function Inventory() {
  const { currentCharacter, saveCharacter, campaignCharacters, friendships, tradeItem } = useCharacter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  const inventory = currentCharacter?.inventory || [];
  const gold = currentCharacter?.gold || 0;

  const acceptedFriends = friendships.filter(f => f.status === 'accepted');
  const friendCharacters = campaignCharacters.filter(c => 
    c.id !== currentCharacter?.id && 
    acceptedFriends.some(f => f.charIds.includes(c.id))
  );

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || 
                           (filterCategory === 'Consumable' ? item.consumable : item.category === filterCategory);
    return matchesSearch && matchesCategory;
  });

  const totalWeight = inventory.reduce((sum, item) => sum + (item.weight * (item.quantity || 1)), 0);
  const maxWeight = (currentCharacter?.attributes?.Strength || 10) * 15;

  const handleAddItem = async (itemKey: string) => {
    const itemData = items[itemKey as keyof typeof items];
    if (!itemData || gold < itemData.price) return;

    const existingItemIndex = inventory.findIndex(i => i.id === itemKey);
    let newInventory = [...inventory];

    if (existingItemIndex > -1) {
      newInventory[existingItemIndex].quantity = (newInventory[existingItemIndex].quantity || 1) + 1;
    } else {
      newInventory.push({ ...itemData, id: itemKey, quantity: 1, equipped: false });
    }

    await saveCharacter({ 
      inventory: newInventory,
      gold: gold - itemData.price
    });
  };

  const handleToggleEquip = async (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    const isEquipping = !item?.equipped;

    const newInventory = inventory.map(item => {
      if (item.id === itemId) {
        return { ...item, equipped: !item.equipped };
      }
      return item;
    });
    await saveCharacter({ inventory: newInventory });
    
    if (isEquipping) {
      toast.success(`${item?.name} Equipado!`, {
        icon: <Shield className="w-4 h-4 text-gold" />,
        description: "Bônus aplicados à sua ficha."
      });
    } else {
      toast.info(`${item?.name} Desequipado.`);
    }

    if (selectedItem?.id === itemId) {
      setSelectedItem({ ...selectedItem, equipped: !selectedItem.equipped });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const newInventory = inventory.filter(i => i.id !== itemId);
    await saveCharacter({ inventory: newInventory });
  };

  const handleUpdateQuantity = async (itemId: string, delta: number) => {
    const newInventory = inventory.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(1, (item.quantity || 1) + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    await saveCharacter({ inventory: newInventory });
  };

  return (
    <div className="space-y-12">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Gold', value: `${gold} GP`, icon: Coins, color: 'text-gold' },
          { label: 'Weight', value: `${totalWeight.toFixed(1)} / ${maxWeight} lbs`, icon: Weight, color: 'text-parchment' },
          { label: 'Inventory Slots', value: `${inventory.length} / 20`, icon: Package, color: 'text-parchment' },
          { label: 'Equipped Items', value: inventory.filter(i => i.equipped).length, icon: Shield, color: 'text-gold-bright' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bento-item p-8 flex-row items-center gap-8 border-white/5 hover:border-gold/20 group"
          >
            <div className={cn("w-16 h-16 rounded-[1.5rem] bg-white/2 border border-white/5 flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 shadow-2xl", stat.color)}>
              <stat.icon size={28} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[9px] font-black text-parchment/20 uppercase tracking-[0.3em] mb-2">{stat.label}</div>
              <div className="text-3xl font-display font-black tracking-tighter">{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Inventory Grid */}
        <div className="flex-1 space-y-10">
          <div className="liquid-glass p-8 border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <h2 className="text-4xl font-display font-black text-parchment uppercase tracking-tighter drop-shadow-2xl">Mochila</h2>
              <div className="flex items-center gap-3 p-1.5 bg-white/2 border border-white/5 rounded-2xl shadow-inner">
                {['All', 'Weapon', 'Armor', 'Potion', 'Consumable', 'Equipment'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 border",
                      filterCategory === cat 
                        ? "bg-gold border-gold text-midnight shadow-[0_5px_15px_rgba(212,175,55,0.3)] scale-105" 
                        : "bg-transparent border-transparent text-parchment/20 hover:text-parchment hover:bg-white/5"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={() => setIsShopOpen(true)}
              className="w-full md:w-auto px-8 py-4 rounded-2xl bg-gold text-midnight text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-all duration-500"
            >
              <ShoppingCart size={18} strokeWidth={3} /> Abrir Loja
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {filteredInventory.map((item, i) => (
              <motion.div 
                key={item.id}
                layoutId={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => setSelectedItem(item)}
                className={cn(
                  "bento-item p-6 space-y-6 cursor-pointer group relative overflow-hidden border-white/5",
                  item.equipped && "border-gold/40 bg-gold/5 shadow-[0_0_30px_rgba(212,175,55,0.1)]"
                )}
              >
                {item.equipped && (
                  <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
                    <div className="absolute top-3 right-[-25px] w-24 h-7 bg-gold text-midnight text-[8px] font-black uppercase flex items-center justify-center rotate-45 shadow-2xl">
                      Equipado
                    </div>
                  </div>
                )}

                <div className="relative aspect-square rounded-[2rem] bg-white/2 border border-white/5 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-gold/20 transition-all duration-700">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <AnimatePresence>
                    {item.equipped && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: [0, 1, 0] }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        <Sparkles className="text-gold w-16 h-16 opacity-50" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className={cn(
                    "w-1/2 h-1/2 flex items-center justify-center transition-all duration-1000 group-hover:scale-125",
                    item.equipped ? "text-gold drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" : "text-parchment/20"
                  )}>
                    {item.category === 'Weapon' ? <Sword size={48} /> : 
                     item.category === 'Armor' ? <Shield size={48} /> : 
                     item.category === 'Potion' ? <Flame size={48} /> : 
                     <Package size={48} />}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-base font-display font-black text-parchment truncate tracking-tight group-hover:text-gold transition-colors">{item.name}</div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <div className="text-[9px] text-parchment/20 uppercase font-black tracking-[0.2em]">{item.category}</div>
                      {item.consumable && <div className="text-[7px] text-gold font-black uppercase tracking-tighter">Consumível</div>}
                    </div>
                    <div className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black text-gold shadow-inner">{item.quantity || 1}x</div>
                  </div>
                </div>

                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleUpdateQuantity(item.id, 1); }}
                    className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-parchment/40 hover:bg-gold/10 hover:text-gold hover:border-gold/30 transition-all active:scale-90"
                  >
                    <Plus size={16} strokeWidth={3} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleUpdateQuantity(item.id, -1); }}
                    className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-parchment/40 hover:bg-gold/10 hover:text-gold hover:border-gold/30 transition-all active:scale-90"
                  >
                    <Minus size={16} strokeWidth={3} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.id); }}
                    className="flex-1 h-10 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-500/40 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all active:scale-90"
                  >
                    <Trash2 size={16} strokeWidth={3} />
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: Math.max(0, 12 - filteredInventory.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="bento-item p-6 aspect-square border-dashed border-white/5 opacity-10 flex items-center justify-center shadow-none hover:shadow-none hover:border-white/5 cursor-default">
                <Package size={48} className="text-white/20" strokeWidth={1} />
              </div>
            ))}
          </div>
        </div>

        {/* Item Details Sidebar */}
        <aside className="w-full lg:w-[400px] space-y-8">
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div 
                key={selectedItem.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                className="liquid-glass p-10 space-y-10 sticky top-32 border-white/5 shadow-2xl"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <h3 className="text-4xl font-display font-black text-parchment uppercase tracking-tighter leading-none drop-shadow-2xl">{selectedItem.name}</h3>
                    <div className="text-[9px] text-parchment/30 uppercase tracking-[0.3em] font-black">{selectedItem.category}</div>
                  </div>
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-parchment/20 hover:text-parchment transition-all duration-500"
                  >
                    <ChevronDown className="rotate-90 w-6 h-6" strokeWidth={3} />
                  </button>
                </div>

                <div className="aspect-square rounded-[3rem] bg-white/2 border border-white/5 p-12 flex items-center justify-center shadow-inner group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent opacity-30" />
                  <div className="w-1/2 h-1/2 flex items-center justify-center text-gold drop-shadow-[0_0_40px_rgba(212,175,55,0.4)] transform hover:scale-110 transition-transform duration-1000">
                    {selectedItem.category === 'Weapon' ? <Sword size={120} /> : 
                     selectedItem.category === 'Armor' ? <Shield size={120} /> : 
                     selectedItem.category === 'Potion' ? <Flame size={120} /> : 
                     <Package size={120} />}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/2 border border-white/5 rounded-2xl p-5 space-y-2 shadow-inner">
                    <div className="text-[8px] text-parchment/20 uppercase tracking-[0.3em] font-black">Weight</div>
                    <div className="text-sm font-black text-parchment tracking-tight">{selectedItem.weight} lbs</div>
                  </div>
                  <div className="bg-white/2 border border-white/5 rounded-2xl p-5 space-y-2 shadow-inner">
                    <div className="text-[8px] text-parchment/20 uppercase tracking-[0.3em] font-black">Value</div>
                    <div className="text-sm font-black text-gold tracking-tight drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">{selectedItem.price} GP</div>
                  </div>
                  {selectedItem.ac && (
                    <div className="bg-white/2 border border-white/5 rounded-2xl p-5 space-y-2 shadow-inner">
                      <div className="text-[8px] text-parchment/20 uppercase tracking-[0.3em] font-black">AC</div>
                      <div className="text-sm font-black text-parchment tracking-tight">{selectedItem.ac}</div>
                    </div>
                  )}
                  {selectedItem.damage && (
                    <div className="bg-white/2 border border-white/5 rounded-2xl p-5 space-y-2 shadow-inner">
                      <div className="text-[8px] text-parchment/20 uppercase tracking-[0.3em] font-black">Dano</div>
                      <div className="text-sm font-black text-parchment tracking-tight">{selectedItem.damage}</div>
                    </div>
                  )}
                  {selectedItem.strengthRequirement && (
                    <div className="bg-white/2 border border-white/5 rounded-2xl p-5 space-y-2 shadow-inner">
                      <div className="text-[8px] text-parchment/20 uppercase tracking-[0.3em] font-black">Força Mín.</div>
                      <div className="text-sm font-black text-red-400 tracking-tight">{selectedItem.strengthRequirement}</div>
                    </div>
                  )}
                  {selectedItem.stealthDisadvantage && (
                    <div className="bg-white/2 border border-white/5 rounded-2xl p-5 space-y-2 shadow-inner col-span-2">
                      <div className="text-[8px] text-parchment/20 uppercase tracking-[0.3em] font-black">Furtividade</div>
                      <div className="text-sm font-black text-red-400 tracking-tight">Desvantagem</div>
                    </div>
                  )}
                  {selectedItem.consumable && (
                    <div className="bg-gold/10 border border-gold/20 rounded-2xl p-5 space-y-2 shadow-inner col-span-2">
                      <div className="text-[8px] text-gold uppercase tracking-[0.3em] font-black">Tipo</div>
                      <div className="text-sm font-black text-gold tracking-tight">Consumível</div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-parchment/20 flex items-center gap-3">
                    <Info size={14} strokeWidth={3} /> Descrição do Item
                  </h4>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold/40 via-gold/10 to-transparent rounded-full" />
                    <p className="text-sm text-parchment/60 leading-relaxed italic pl-6 font-medium">
                      "{selectedItem.description || 'Nenhuma descrição disponível para este artefato místico.'}"
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/5">
                  <button 
                    onClick={() => handleToggleEquip(selectedItem.id)}
                    className={cn(
                      "w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border shadow-xl",
                      selectedItem.equipped 
                        ? "bg-red-500/5 border-red-500/10 text-red-500 hover:bg-red-500/10" 
                        : "bg-gold text-midnight hover:scale-105 shadow-[0_10px_20px_rgba(212,175,55,0.3)]"
                    )}
                  >
                    {selectedItem.equipped ? 'Desequipar Item' : 'Equipar Item'}
                  </button>
                  <button 
                    onClick={() => setIsTradeModalOpen(true)}
                    className="w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 border border-white/10 text-gold hover:bg-gold/10 hover:border-gold/30 transition-all duration-500 shadow-xl"
                  >
                    Trocar com Amigo
                  </button>
                  <button className="w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-white/2 border border-white/5 text-parchment/40 hover:text-parchment hover:bg-white/5 transition-all duration-500">
                    Usar Item
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="liquid-glass p-16 text-center space-y-8 sticky top-32 border-white/5 opacity-50">
                <div className="w-24 h-24 rounded-full bg-white/2 border border-white/5 mx-auto flex items-center justify-center shadow-inner">
                  <Package size={40} className="text-parchment/10" strokeWidth={1.5} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-display font-black text-parchment uppercase tracking-tight">Mochila Vazia</h3>
                  <p className="text-[10px] text-parchment/20 font-black uppercase tracking-widest leading-relaxed">Selecione um item da sua mochila para ver suas propriedades místicas e ações.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </aside>
      </div>

      {/* Shop Modal */}
      <AnimatePresence>
        {isShopOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShopOpen(false)}
              className="absolute inset-0 bg-midnight/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl h-full bg-[#1a1c2a] rounded-[40px] border border-white/10 shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-12 flex justify-between items-center border-b border-white/5">
                <div className="space-y-2">
                  <h2 className="text-4xl font-display font-black text-gold">The Adventurer's Emporium</h2>
                  <p className="text-parchment/40 font-medium">Browse the finest gear from across the Sword Coast.</p>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-[10px] text-parchment/40 uppercase tracking-widest font-bold">Your Balance</div>
                    <div className="text-2xl font-display font-black text-gold">{gold} GP</div>
                  </div>
                  <button 
                    onClick={() => setIsShopOpen(false)}
                    className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-parchment/40 hover:text-parchment transition-all"
                  >
                    <Plus className="rotate-45" size={28} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="grid grid-cols-4 gap-8">
                  {Object.entries(items).map(([key, item]: [string, Item], i) => (
                    <motion.div 
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card p-6 space-y-6 group"
                    >
                      <div className="relative aspect-square rounded-2xl bg-white/5 flex items-center justify-center overflow-hidden">
                        <div className="w-1/2 h-1/2 flex items-center justify-center text-parchment/20 transition-transform duration-500 group-hover:scale-125">
                          {item.category === 'Weapon' ? <Sword size={64} /> : 
                           item.category === 'Armor' ? <Shield size={64} /> : 
                           item.category === 'Potion' ? <Flame size={64} /> : 
                           <Package size={64} />}
                        </div>
                        <div className="absolute inset-0 bg-midnight/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6">
                          <p className="text-[10px] text-center italic text-parchment/80 leading-relaxed">
                            "{item.description}"
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold truncate group-hover:text-gold transition-colors">{item.name}</h3>
                          <div className="text-[10px] text-parchment/40 uppercase tracking-widest">{item.category}</div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1 text-gold">
                            <Coins size={14} />
                            <span className="text-xs font-black">{item.price} GP</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="text-[10px] text-parchment/40">{item.weight} lbs</div>
                            {item.ac && <div className="text-[9px] text-gold/60 font-black">AC {item.ac}</div>}
                            {item.damage && <div className="text-[9px] text-red-400/60 font-black">{item.damage}</div>}
                            {item.consumable && <div className="text-[9px] text-gold font-black uppercase tracking-tighter">Consumível</div>}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleAddItem(key)}
                          disabled={gold < item.price}
                          className={cn(
                            "w-full btn-magic py-3 text-[10px] flex items-center justify-center gap-2",
                            gold >= item.price ? "btn-magic-primary" : "opacity-30 cursor-not-allowed"
                          )}
                        >
                          <Plus size={14} /> Buy Item
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Trade Modal */}
      <AnimatePresence>
        {isTradeModalOpen && selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTradeModalOpen(false)}
              className="absolute inset-0 bg-midnight/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-card p-10 space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-display font-black text-gold uppercase tracking-tighter">Trade Item</h2>
                <p className="text-xs text-parchment/40">Select an ally to receive your <span className="text-gold font-bold">{selectedItem.name}</span></p>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {friendCharacters.map(friend => (
                  <button 
                    key={friend.id}
                    onClick={async () => {
                      await tradeItem(friend.id, selectedItem.id);
                      setIsTradeModalOpen(false);
                      setSelectedItem(null);
                    }}
                    className="w-full flex items-center justify-between p-4 bg-midnight/40 rounded-2xl border border-white/5 hover:border-gold/50 hover:bg-gold/5 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-gold/20">
                        <img src={friend.appearance} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-parchment group-hover:text-gold transition-colors">{friend.name}</div>
                        <div className="text-[10px] text-parchment/40 uppercase">{friend.charClass}</div>
                      </div>
                    </div>
                    <ArrowRight className="text-gold/40 group-hover:text-gold group-hover:translate-x-1 transition-all" size={20} />
                  </button>
                ))}
                {friendCharacters.length === 0 && (
                  <div className="py-12 text-center space-y-4 opacity-50">
                    <Users className="mx-auto text-gold/20" size={48} />
                    <p className="text-xs text-parchment/40">You need accepted friends to trade items. Visit the Social Hub!</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setIsTradeModalOpen(false)}
                className="w-full py-4 text-xs font-bold uppercase tracking-widest text-parchment/40 hover:text-parchment transition-colors"
              >
                Cancel Trade
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
