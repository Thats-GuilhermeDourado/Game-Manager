import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCharacter } from '../contexts/CharacterContext';
import { ITEMS } from '../data/items';
import { cn } from '../lib/utils';
import { X, ShoppingBag, MessageCircle, ArrowLeft, Coins } from 'lucide-react';

const TALK_OPTIONS = [
  {
    question: "Quem é você?",
    answer: "Eu sou Chôro, um simples colecionador de curiosidades. Viajo por estas terras em busca de histórias e artefatos que outros descartam."
  },
  {
    question: "De onde vêm esses itens?",
    answer: "Ah, um pouco de cada lugar. Alguns foram trocados por segredos, outros encontrados em ruínas que o tempo esqueceu. Cada um tem uma alma própria."
  },
  {
    question: "Tem algo especial hoje?",
    answer: "Para olhos treinados, tudo aqui é especial. Mas aquela Vassoura... ela tem uma vontade própria que pode te levar longe."
  }
];

export default function MerchantEvent() {
  const { currentCampaign, buyFromMerchant, closeMerchantEvent, currentCharacter } = useCharacter();
  const [view, setView] = useState<'main' | 'buy' | 'talk' | 'sell'>('main');
  const [dialogue, setDialogue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const merchant = currentCampaign?.merchantEvent;

  useEffect(() => {
    if (merchant?.active) {
      typeDialogue("O que temos aqui? Pode entrar. Seja muito bem vindo.");
    }
  }, [merchant?.active]);

  const typeDialogue = (text: string) => {
    setDialogue("");
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDialogue(prev => prev + text[i]);
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 30);
  };

  const playSound = (url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const handleAction = (action: 'buy' | 'talk' | 'main' | 'sell') => {
    playSound('https://www.soundjay.com/buttons/sounds/button-16.mp3');
    if (action === 'sell') {
      typeDialogue("Sinto muito, mas hoje só estou interessado em vender ou trocar histórias. Quem sabe na próxima?");
      return;
    }
    setView(action);
    if (action === 'buy') {
      typeDialogue("Dê uma olhada. Apenas o melhor para quem tem ouro no bolso.");
    } else if (action === 'talk') {
      typeDialogue("Curioso, não é? Pergunte o que quiser, o tempo é o único recurso que não vendo.");
    } else {
      typeDialogue("Algo mais que desperte seu interesse?");
    }
  };

  if (!merchant?.active) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12 bg-midnight/90 backdrop-blur-2xl"
      >
        <div className="relative w-full max-w-6xl h-[85vh] flex flex-col md:flex-row gap-8 overflow-hidden">
          
          {/* NPC Portrait Section */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-full md:w-1/3 flex flex-col items-center justify-center space-y-6"
          >
            <div className="relative group">
              <div className="absolute -inset-4 bg-gold/20 rounded-full blur-2xl group-hover:bg-gold/30 transition-all duration-1000" />
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-gold/50 overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.3)]">
                <img 
                  src={merchant.npcImage} 
                  alt={merchant.npcName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-[2000ms]"
                />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-5xl font-display font-black text-gold uppercase tracking-tighter drop-shadow-2xl">
                {merchant.npcName}
              </h2>
              <div className="text-[10px] text-parchment/40 font-black uppercase tracking-[0.4em] mt-2">Mercador Misterioso</div>
            </div>
          </motion.div>

          {/* Interaction Section */}
          <div className="flex-1 flex flex-col gap-8 h-full">
            {/* Dialogue Box */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="liquid-glass p-8 md:p-12 border-gold/20 relative min-h-[200px] flex flex-col justify-center"
            >
              <div className="absolute top-0 left-12 -translate-y-1/2 px-4 py-1 bg-midnight border border-gold/30 rounded-full text-[10px] font-black text-gold uppercase tracking-widest">
                Chôro diz:
              </div>
              <p className="text-xl md:text-2xl font-medium text-parchment/90 leading-relaxed italic">
                "{dialogue}"
                {isTyping && <span className="inline-block w-1 h-6 bg-gold ml-1 animate-pulse" />}
              </p>
            </motion.div>

            {/* Actions/Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
              <AnimatePresence mode="wait">
                {view === 'main' && (
                  <motion.div 
                    key="main"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  >
                    {[
                      { id: 'buy', label: 'Comprar', icon: ShoppingBag, color: 'text-gold' },
                      { id: 'sell', label: 'Vender', icon: Coins, color: 'text-emerald-400' },
                      { id: 'talk', label: 'Conversar', icon: MessageCircle, color: 'text-blue-400' }
                    ].map(action => (
                      <button
                        key={action.id}
                        onClick={() => handleAction(action.id as any)}
                        className="bento-item p-10 flex flex-col items-center justify-center gap-6 group hover:border-gold/40 transition-all"
                      >
                        <div className={cn("w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6", action.color)}>
                          <action.icon size={40} strokeWidth={2} />
                        </div>
                        <span className="text-lg font-black uppercase tracking-widest text-parchment/60 group-hover:text-parchment transition-colors">
                          {action.label}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}

                {view === 'buy' && (
                  <motion.div 
                    key="buy"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <button 
                      onClick={() => handleAction('main')}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-parchment/40 hover:text-gold transition-colors mb-4"
                    >
                      <ArrowLeft size={16} /> Voltar
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {merchant.inventory.map((itemSlot) => {
                        const item = ITEMS[itemSlot.itemKey];
                        if (!item) return null;
                        return (
                          <div 
                            key={itemSlot.itemKey}
                            className={cn(
                              "glass-card p-6 flex items-center gap-6 group transition-all",
                              itemSlot.sold ? "opacity-50 grayscale" : "hover:border-gold/30"
                            )}
                          >
                            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center text-gold/40 group-hover:text-gold transition-colors">
                              <ShoppingBag size={32} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-parchment">{item.name}</h4>
                              <div className="text-[10px] text-gold font-black">{item.price} GP</div>
                            </div>
                            {itemSlot.sold ? (
                              <div className="px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-xl text-[10px] font-black text-red-400 uppercase tracking-widest">
                                Vendido
                              </div>
                            ) : (
                              <button 
                                onClick={() => {
                                  playSound('https://www.soundjay.com/buttons/sounds/button-16.mp3');
                                  buyFromMerchant(itemSlot.itemKey);
                                }}
                                disabled={currentCharacter && currentCharacter.gold < item.price}
                                className="px-6 py-3 bg-gold text-midnight rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-30 disabled:hover:scale-100"
                              >
                                Comprar
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {view === 'talk' && (
                  <motion.div 
                    key="talk"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <button 
                      onClick={() => handleAction('main')}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-parchment/40 hover:text-gold transition-colors mb-4"
                    >
                      <ArrowLeft size={16} /> Voltar
                    </button>
                    <div className="space-y-4">
                      {TALK_OPTIONS.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            playSound('https://www.soundjay.com/buttons/sounds/button-16.mp3');
                            typeDialogue(opt.answer);
                          }}
                          className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:border-blue-400/40 hover:bg-blue-400/5 transition-all group"
                        >
                          <div className="text-sm font-bold text-parchment group-hover:text-blue-400 transition-colors">
                            {opt.question}
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Close Button */}
          <button 
            onClick={() => {
              playSound('https://www.soundjay.com/buttons/sounds/button-16.mp3');
              closeMerchantEvent();
            }}
            className="absolute top-0 right-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-parchment/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
          >
            <X size={24} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
