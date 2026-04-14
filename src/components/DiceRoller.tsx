import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice5, X, RotateCcw, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSound } from '../hooks/useSound';

type DieType = 4 | 6 | 8 | 10 | 12 | 20 | 100;

interface RollResult {
  id: string;
  die: DieType;
  value: number;
  timestamp: number;
}

interface DiceRollerProps {
  onOpenDiceTray?: () => void;
}

export default function DiceRoller({ onOpenDiceTray }: DiceRollerProps) {
  const { playSound } = useSound();
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<RollResult[]>([]);
  const [isRolling, setIsRolling] = useState(false);

  const rollDie = (die: DieType) => {
    setIsRolling(true);
    playSound('dice');
    setTimeout(() => {
      const value = Math.floor(Math.random() * die) + 1;
      const newResult: RollResult = {
        id: Math.random().toString(36).substr(2, 9),
        die,
        value,
        timestamp: Date.now()
      };
      setResults(prev => [newResult, ...prev].slice(0, 10));
      setIsRolling(false);
    }, 400);
  };

  const clearResults = () => setResults([]);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(true);
          playSound('click');
        }}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gold shadow-[0_0_20px_rgba(242,125,38,0.5)] flex items-center justify-center text-midnight z-[300] group"
      >
        <Dice5 size={32} className="group-hover:rotate-12 transition-transform" />
      </motion.button>

      {/* Roller Panel */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[400] flex items-end justify-end p-8 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="w-full max-w-sm glass-card p-8 pointer-events-auto space-y-8 border-gold/20 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-display font-black text-gold uppercase tracking-tighter">Dice Vault</h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-parchment/40 hover:text-gold transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Dice Grid */}
              <div className="grid grid-cols-4 gap-3">
                {[4, 6, 8, 10, 12, 20, 100].map((die) => (
                  <button
                    key={die}
                    onClick={() => rollDie(die as DieType)}
                    disabled={isRolling}
                    className="h-12 rounded-xl bg-midnight/40 border border-gold/10 text-xs font-black text-parchment hover:border-gold/40 hover:bg-gold/5 transition-all flex items-center justify-center"
                  >
                    d{die}
                  </button>
                ))}
                <button
                  onClick={clearResults}
                  className="h-12 rounded-xl bg-ruby/10 border border-ruby/20 text-ruby hover:bg-ruby/20 transition-all flex items-center justify-center"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              {/* Results History */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-parchment/40">
                  <span>Recent Rolls</span>
                  {isRolling && <span className="text-gold animate-pulse">Rolling...</span>}
                </div>
                <div className="h-48 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                  {results.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                      <Dice5 size={32} className="mb-2" />
                      <p className="text-[10px] uppercase font-bold">No rolls yet</p>
                    </div>
                  ) : (
                    results.map((res) => (
                      <motion.div
                        key={res.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-[10px] font-black text-gold">
                            d{res.die}
                          </div>
                          <div className="text-[10px] text-parchment/40 font-bold uppercase">
                            {new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                        </div>
                        <div className={cn(
                          "text-xl font-display font-black",
                          res.value === res.die ? "text-gold animate-bounce" : 
                          res.value === 1 ? "text-ruby" : "text-parchment"
                        )}>
                          {res.value}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Action */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <button 
                  onClick={() => rollDie(20)}
                  disabled={isRolling}
                  className="w-full btn-magic btn-magic-primary py-4 text-xs flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} /> Quick d20 Roll
                </button>

                {onOpenDiceTray && (
                  <button 
                    onClick={() => {
                      onOpenDiceTray();
                      setIsOpen(false);
                    }}
                    className="w-full p-4 rounded-xl bg-gold/10 border border-gold/20 text-gold text-[10px] font-black uppercase tracking-widest hover:bg-gold/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Dice5 size={16} /> Open 3D Dice Tray
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
