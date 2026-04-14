import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Zap, Droplets, Wind, Sparkles, Skull } from 'lucide-react';
import { useSound } from '../hooks/useSound';
import { Spell } from '../data/spells';
import { cn } from '../lib/utils';

interface RunicStudyGameProps {
  spell: Spell;
  onSuccess: () => void;
  onFailure: (damage: number) => void;
  onCancel: () => void;
}

const RUNES = [
  { id: 0, icon: Flame, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', sound: 'note1' as const },
  { id: 1, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', sound: 'note2' as const },
  { id: 2, icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', sound: 'note3' as const },
  { id: 3, icon: Wind, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', sound: 'note4' as const },
];

export const RunicStudyGame: React.FC<RunicStudyGameProps> = ({ spell, onSuccess, onFailure, onCancel }) => {
  const { playSound } = useSound();
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'idle' | 'showing' | 'playing' | 'success' | 'failure'>('idle');
  const [activeRune, setActiveRune] = useState<number | null>(null);
  const [message, setMessage] = useState('Prepare-se para o estudo rúnico...');

  const sequenceLength = 3 + spell.level;

  const generateSequence = useCallback(() => {
    const newSequence = [];
    for (let i = 0; i < sequenceLength; i++) {
      newSequence.push(Math.floor(Math.random() * RUNES.length));
    }
    setSequence(newSequence);
    setUserSequence([]);
    setGameState('showing');
  }, [sequenceLength]);

  useEffect(() => {
    if (gameState === 'idle') {
      const timer = setTimeout(() => {
        generateSequence();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState, generateSequence]);

  useEffect(() => {
    if (gameState === 'showing') {
      let i = 0;
      setMessage('Observe a sequência rúnica...');
      const interval = setInterval(() => {
        if (i < sequence.length) {
          const runeId = sequence[i];
          setActiveRune(runeId);
          playSound(RUNES[runeId].sound);
          
          setTimeout(() => {
            setActiveRune(null);
          }, 600);
          
          i++;
        } else {
          clearInterval(interval);
          setGameState('playing');
          setMessage('Sua vez! Repita a sequência.');
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState, sequence, playSound]);

  const handleRuneClick = (runeId: number) => {
    if (gameState !== 'playing') return;

    setActiveRune(runeId);
    playSound(RUNES[runeId].sound);
    setTimeout(() => setActiveRune(null), 300);

    const newUserSequence = [...userSequence, runeId];
    setUserSequence(newUserSequence);

    // Check if correct so far
    const currentIndex = newUserSequence.length - 1;
    if (newUserSequence[currentIndex] !== sequence[currentIndex]) {
      setGameState('failure');
      setMessage('Falha na ressonância rúnica!');
      const damage = Math.floor(Math.random() * 4) + 1; // 1d4
      onFailure(damage);
      return;
    }

    // Check if finished
    if (newUserSequence.length === sequence.length) {
      setGameState('success');
      setMessage('Ressonância perfeita! Magia aprendida.');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }
  };

  const retry = () => {
    setGameState('idle');
    setMessage('Tentando novamente...');
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-8 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-display font-black text-gold uppercase tracking-tighter">Estudo de {spell.name}</h3>
        <p className={cn(
          "text-sm font-medium transition-colors duration-500",
          gameState === 'failure' ? "text-red-500" : gameState === 'success' ? "text-emerald-500" : "text-parchment/60"
        )}>
          {message}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {RUNES.map((rune) => (
          <motion.button
            key={rune.id}
            whileHover={{ scale: gameState === 'playing' ? 1.05 : 1 }}
            whileTap={{ scale: gameState === 'playing' ? 0.95 : 1 }}
            onClick={() => handleRuneClick(rune.id)}
            disabled={gameState !== 'playing'}
            className={cn(
              "w-24 h-24 rounded-3xl border-2 flex items-center justify-center transition-all duration-300 relative overflow-hidden",
              rune.bg,
              rune.border,
              activeRune === rune.id ? "scale-110 shadow-[0_0_30px_rgba(212,175,55,0.4)] border-gold bg-gold/20" : "opacity-60",
              gameState === 'playing' ? "cursor-pointer hover:opacity-100" : "cursor-default"
            )}
          >
            <rune.icon className={cn("w-10 h-10", rune.color, activeRune === rune.id && "text-white")} />
            
            {/* Flash effect */}
            <AnimatePresence>
              {activeRune === rune.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1.5 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/20 rounded-full blur-xl"
                />
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      <div className="flex gap-4 w-full">
        {gameState === 'failure' ? (
          <button
            onClick={retry}
            className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all flex items-center justify-center gap-2"
          >
            <Skull size={14} /> Tentar Novamente (1d4 Dano)
          </button>
        ) : (
          <button
            onClick={onCancel}
            className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-parchment/40 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
          >
            Cancelar Estudo
          </button>
        )}
      </div>

      {/* Progress indicators */}
      <div className="flex gap-2">
        {Array.from({ length: sequenceLength }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-500",
              i < userSequence.length ? "bg-gold scale-125 shadow-[0_0_10px_rgba(212,175,55,0.5)]" : "bg-white/10"
            )}
          />
        ))}
      </div>
    </div>
  );
};
