import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCharacter } from '../contexts/CharacterContext';
import { cn } from '../lib/utils';
import { ChevronLeft, ChevronRight, Sparkles, TreePine, Wind } from 'lucide-react';

const SCHOOLS = [
  {
    id: 'Abjuração',
    color: '#3b82f6',
    motto: "A ferida mais sábia é aquela que nunca se abre. Quem aprendeu a erguer o escudo, já contemplou o abismo. Não temas o golpe. Teme o espaço vazio entre ele e tua pele.",
    description: "Especialistas em proteção e banimento.",
    art: (color: string) => (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <filter id="shadow-abj">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.5"/>
          </filter>
        </defs>
        <path d="M100 20 L160 50 L160 110 C160 150 100 180 100 180 C100 180 40 150 40 110 L40 50 Z" fill={`${color}20`} filter="url(#shadow-abj)" />
        <path d="M100 40 L145 62 L145 105 C145 135 100 160 100 160 C100 160 55 135 55 105 L55 62 Z" fill={`${color}40`} filter="url(#shadow-abj)" />
        <path d="M100 60 L130 75 L130 100 C130 120 100 140 100 140 C100 140 70 120 70 100 L70 75 Z" fill={`${color}60`} filter="url(#shadow-abj)" />
        <circle cx="100" cy="95" r="15" fill="white" className="animate-pulse" />
      </svg>
    )
  },
  {
    id: 'Adivinhação',
    color: '#a855f7',
    motto: "O futuro é uma névoa de cinzas. O adivinho não vence a batalha. Ele apenas a testemunha antes que o primeiro sangue caia. Conhecimento não é poder. É a certeza do fracasso.",
    description: "Mestres do tempo e da percepção.",
    art: (color: string) => (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <filter id="shadow-adi">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.5"/>
          </filter>
        </defs>
        <ellipse cx="100" cy="100" rx="80" ry="50" fill={`${color}20`} filter="url(#shadow-adi)" />
        <circle cx="100" cy="100" r="40" fill={`${color}40`} filter="url(#shadow-adi)" />
        <circle cx="100" cy="100" r="25" fill={`${color}60`} filter="url(#shadow-adi)" />
        <path d="M80 100 Q100 70 120 100 Q100 130 80 100" fill="white" opacity="0.8" />
        <circle cx="100" cy="100" r="8" fill="black" />
      </svg>
    )
  },
  {
    id: 'Conjuração',
    color: '#10b981',
    motto: "Tragam pedras de outros mundos. Tragam servos que não conhecem o medo. O conjurador não anda até a montanha. Ele sussurra para o vazio, e o vazio vomita a montanha.",
    description: "Invocadores de outros planos.",
    art: (color: string) => (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <filter id="shadow-con">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.5"/>
          </filter>
        </defs>
        <path d="M100 20 A80 80 0 1 1 99.9 20" fill="none" stroke={`${color}20`} strokeWidth="15" strokeDasharray="20 10" className="animate-spin-slow" />
        <path d="M100 40 A60 60 0 1 1 99.9 40" fill="none" stroke={`${color}40`} strokeWidth="10" strokeDasharray="15 5" className="animate-spin-slow-reverse" />
        <circle cx="100" cy="100" r="30" fill={`${color}60`} filter="url(#shadow-con)" />
        <rect x="85" y="85" width="30" height="30" fill="white" transform="rotate(45 100 100)" />
      </svg>
    )
  },
  {
    id: 'Encantamento',
    color: '#ec4899',
    motto: "A vontade é uma muralha frágil. Não quebre o inimigo. Convence-o de que a corrente que ele usa é um colar. A pior prisão não é aquela com grades, mas aquela que a mente chama de 'lar'.",
    description: "Manipuladores da mente e emoções.",
    art: (color: string) => (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <filter id="shadow-enc">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.5"/>
          </filter>
        </defs>
        <path d="M100 170 C100 170 20 120 20 70 C20 40 50 20 75 40 C85 45 95 55 100 65 C105 55 115 45 125 40 C150 20 180 40 180 70 C180 120 100 170 100 170" fill={`${color}20`} filter="url(#shadow-enc)" />
        <path d="M100 150 C100 150 40 110 40 75 C40 55 60 40 75 55 C85 60 95 70 100 80 C105 70 115 60 125 55 C140 40 160 55 160 75 C160 110 100 150 100 150" fill={`${color}40`} filter="url(#shadow-enc)" />
        <circle cx="100" cy="90" r="20" fill={`${color}60`} filter="url(#shadow-enc)" />
      </svg>
    )
  },
  {
    id: 'Evocação',
    color: '#ef4444',
    motto: "Algumas feridas exigem um martelo. Por que negociar com o fogo, se você pode se tornar o fogo? A sutileza é para os que temem as consequências. O evocador abraça o clarão.",
    description: "Canalizadores de energia bruta.",
    art: (color: string) => (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <filter id="shadow-evo">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.5"/>
          </filter>
        </defs>
        <path d="M100 20 L120 70 L180 80 L130 110 L150 170 L100 140 L50 170 L70 110 L20 80 L80 70 Z" fill={`${color}20`} filter="url(#shadow-evo)" />
        <path d="M100 50 L112 85 L150 90 L120 110 L130 150 L100 130 L70 150 L80 110 L50 90 L88 85 Z" fill={`${color}40`} filter="url(#shadow-evo)" />
        <circle cx="100" cy="100" r="20" fill="white" filter="url(#shadow-evo)" />
      </svg>
    )
  },
  {
    id: 'Ilusão',
    color: '#6366f1',
    motto: "O que são olhos senão trapaceiros coniventes? A verdade não dói. A verdade é entediante. Melhor uma mentira dourada do que uma realidade de pedra. Assine abaixo.",
    description: "Mestres do engano e distorção.",
    art: (color: string) => (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <filter id="shadow-ilu">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.5"/>
          </filter>
        </defs>
        <rect x="40" y="40" width="120" height="120" fill={`${color}20`} transform="rotate(15 100 100)" filter="url(#shadow-ilu)" />
        <rect x="50" y="50" width="100" height="100" fill={`${color}40`} transform="rotate(-15 100 100)" filter="url(#shadow-ilu)" />
        <rect x="70" y="70" width="60" height="60" fill={`${color}60`} filter="url(#shadow-ilu)" />
      </svg>
    )
  },
  {
    id: 'Necromancia',
    color: '#4b5563',
    motto: "A vida é uma dívida impaga. O morto não sofre. O morto não mente. Ao abrir um peito, o necromante não busca o coração. Busca o eco do que o fazia bater.",
    description: "Manipuladores da vida e morte.",
    art: (color: string) => (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <filter id="shadow-nec">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.5"/>
          </filter>
        </defs>
        <path d="M100 30 C60 30 30 60 30 100 C30 140 60 170 100 170 C140 170 170 140 170 100 C170 60 140 30 100 30 M70 100 Q70 80 90 80 M130 100 Q130 80 110 80" fill="none" stroke={`${color}20`} strokeWidth="10" filter="url(#shadow-nec)" />
        <circle cx="75" cy="90" r="10" fill={`${color}40`} />
        <circle cx="125" cy="90" r="10" fill={`${color}40`} />
        <path d="M80 140 Q100 120 120 140" fill="none" stroke={`${color}60`} strokeWidth="5" />
      </svg>
    )
  },
  {
    id: 'Transmutação',
    color: '#f59e0b',
    motto: "O chumbo anseia ser ouro. O sapo sonha com asas. A transmutação é a mentira contada à realidade até que a realidade desista.",
    description: "Alteradores da matéria.",
    art: (color: string) => (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <filter id="shadow-tra">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.5"/>
          </filter>
        </defs>
        <path d="M40 40 L160 40 L100 160 Z" fill={`${color}20`} filter="url(#shadow-tra)" />
        <path d="M40 160 L160 160 L100 40 Z" fill={`${color}40`} filter="url(#shadow-tra)" opacity="0.6" />
        <circle cx="100" cy="100" r="30" fill={`${color}60`} filter="url(#shadow-tra)" />
        <path d="M100 70 L100 130 M70 100 L130 100" stroke="white" strokeWidth="4" />
      </svg>
    )
  }
];

interface MagicSchoolSelectionProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MagicSchoolSelection({ isOpen, onClose }: MagicSchoolSelectionProps) {
  const { currentCharacter, setMagicSchool } = useCharacter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const playSound = (type: 'hover' | 'select' | 'confirm' | 'swipe') => {
    const frequencies = {
      hover: 150,
      select: 300,
      confirm: 500,
      swipe: 100
    };
    
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequencies[type], audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {}
  };

  const handleNext = () => {
    if (isConfirmed) return;
    setActiveIndex((prev) => (prev + 1) % SCHOOLS.length);
    playSound('swipe');
  };

  const handlePrev = () => {
    if (isConfirmed) return;
    setActiveIndex((prev) => (prev - 1 + SCHOOLS.length) % SCHOOLS.length);
    playSound('swipe');
  };

  const handleConfirm = async () => {
    if (isConfirmed) return;
    setIsConfirmed(true);
    playSound('confirm');
    
    setTimeout(async () => {
      await setMagicSchool(SCHOOLS[activeIndex].id);
      onClose();
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#050805] overflow-hidden">
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] z-50" />
      
      {/* Forest Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* God Rays */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/10 via-transparent to-black/80" />
        <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-r from-transparent via-gold/5 to-transparent -rotate-12 blur-3xl opacity-30" />
        
        {/* Tree Silhouettes */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 0 }}
            animate={{ 
              x: [0, 5, 0],
              rotate: [0, 1, 0]
            }}
            transition={{ 
              duration: 10 + Math.random() * 10, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-[-10%] text-emerald-950/40"
            style={{ left: `${i * 10}%`, scale: 1.5 + Math.random() }}
          >
            <TreePine size={300} strokeWidth={0.5} />
          </motion.div>
        ))}

        {/* Floating Leaves/Particles */}
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: -20,
              rotate: 0
            }}
            animate={{ 
              y: window.innerHeight + 20,
              x: `calc(${Math.random() * 100}vw + ${Math.sin(i) * 50}px)`,
              rotate: 360
            }}
            transition={{ 
              duration: 15 + Math.random() * 20, 
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10
            }}
            className="absolute w-2 h-2 bg-emerald-500/20 rounded-full blur-[1px]"
          />
        ))}
      </div>

      <div className="relative w-full h-full flex flex-col items-center justify-center py-12 px-4 z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl lg:text-7xl font-display font-black text-parchment uppercase tracking-tighter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            O Despertar Arcano
          </h2>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="h-px w-16 bg-gold/20" />
            <p className="text-gold/60 font-black uppercase tracking-[0.6em] text-[10px]">
              Escolha sua Tradição
            </p>
            <div className="h-px w-16 bg-gold/20" />
          </div>
        </motion.div>

        {/* 3D Carousel */}
        <div className="relative w-full max-w-5xl h-[500px] flex items-center justify-center perspective-[2500px]">
          <AnimatePresence mode="popLayout">
            {SCHOOLS.map((school, index) => {
              const offset = (index - activeIndex + SCHOOLS.length) % SCHOOLS.length;
              const normalizedOffset = offset > SCHOOLS.length / 2 ? offset - SCHOOLS.length : offset;
              const isCenter = normalizedOffset === 0;
              const isVisible = Math.abs(normalizedOffset) <= 2;

              if (!isVisible && !isConfirmed) return null;
              if (isConfirmed && !isCenter) return null;

              return (
                <motion.div
                  key={school.id}
                  initial={{ opacity: 0, scale: 0.5, rotateY: normalizedOffset * 45 }}
                  animate={{ 
                    opacity: isConfirmed ? (isCenter ? 1 : 0) : 1 - Math.abs(normalizedOffset) * 0.3,
                    scale: isConfirmed ? (isCenter ? 1.2 : 0) : 1 - Math.abs(normalizedOffset) * 0.15,
                    x: isConfirmed ? 0 : normalizedOffset * 340,
                    z: isConfirmed ? 300 : -Math.abs(normalizedOffset) * 500,
                    rotateY: isConfirmed ? 0 : normalizedOffset * -40,
                    filter: isCenter ? 'none' : 'blur(4px) brightness(0.5)',
                  }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 120, 
                    damping: 20,
                    opacity: { duration: 0.4 }
                  }}
                  onClick={() => !isCenter && setActiveIndex(index)}
                  className={cn(
                    "absolute w-72 h-[480px] lg:w-80 lg:h-[540px] cursor-pointer preserve-3d",
                    isCenter ? "z-50" : "z-10"
                  )}
                >
                  {/* Card Body - Paper Cut Aesthetic */}
                  <div className={cn(
                    "relative w-full h-full rounded-[3rem] overflow-hidden transition-all duration-700",
                    "bg-[#0a0c0a] border-4 border-white/5 shadow-[0_40px_80px_rgba(0,0,0,0.9)]",
                    isCenter && "border-white/20 shadow-[0_0_100px_rgba(212,175,55,0.1)]"
                  )}>
                    {/* Paper Texture Overlay */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 z-20 pointer-events-none" />
                    
                    {/* Art Section */}
                    <div className="absolute inset-0 p-10 flex flex-col items-center justify-center">
                      <div className="relative w-full aspect-square mb-12 flex items-center justify-center">
                        {/* Shadow Layers for depth */}
                        <div className="absolute inset-4 bg-black/40 blur-2xl rounded-full translate-y-8" />
                        
                        <motion.div
                          animate={isCenter ? { 
                            y: [0, -15, 0],
                            rotate: [0, 2, 0]
                          } : {}}
                          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                          className="w-full h-full relative z-10"
                        >
                          {school.art(school.color)}
                        </motion.div>
                      </div>

                      {/* Text Section */}
                      <div className="text-center space-y-4 relative z-30">
                        <h3 className={cn(
                          "text-3xl font-display font-black uppercase tracking-tight transition-all duration-500",
                          isCenter ? "text-white scale-110" : "text-parchment/30"
                        )}>
                          {school.id}
                        </h3>
                        <div className={cn(
                          "h-px w-12 mx-auto transition-all duration-500",
                          isCenter ? "bg-gold/40 w-24" : "bg-white/5"
                        )} />
                        <p className={cn(
                          "text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-500",
                          isCenter ? "text-gold/80" : "text-gold/10"
                        )}>
                          {school.description}
                        </p>
                      </div>
                    </div>

                    {/* Inner Bezel */}
                    <div className="absolute inset-0 border-[12px] border-black/20 rounded-[3rem] pointer-events-none z-40" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Info & Controls */}
        <div className="mt-16 w-full max-w-3xl flex flex-col items-center gap-10 z-20">
          {/* Motto Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center px-12 py-8 liquid-glass border-white/5 rounded-[2.5rem] min-h-[140px] flex flex-col justify-center relative group"
            >
              <Wind className="absolute -top-3 -left-3 text-gold/20 group-hover:text-gold/40 transition-colors" size={24} />
              <p className="text-parchment/80 text-base lg:text-lg font-medium italic leading-relaxed max-w-xl">
                "{SCHOOLS[activeIndex].motto}"
              </p>
              <Wind className="absolute -bottom-3 -right-3 text-gold/20 group-hover:text-gold/40 transition-colors rotate-180" size={24} />
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center gap-16">
            <button
              onClick={handlePrev}
              disabled={isConfirmed}
              className="w-16 h-16 rounded-2xl liquid-glass border-white/10 flex items-center justify-center text-parchment/40 hover:text-gold hover:border-gold/40 transition-all hover:scale-110 disabled:opacity-0"
            >
              <ChevronLeft size={32} />
            </button>

            <button
              onClick={handleConfirm}
              disabled={isConfirmed}
              className={cn(
                "group relative px-20 py-6 rounded-2xl overflow-hidden transition-all duration-500",
                "bg-white/5 border border-white/10 hover:border-gold/50",
                isConfirmed && "opacity-0 scale-90"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/20 to-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className="relative flex items-center gap-4 text-xs font-black uppercase tracking-[0.4em] text-parchment group-hover:text-gold transition-colors">
                <Sparkles size={18} className="animate-pulse" />
                Abraçar Tradição
              </span>
            </button>

            <button
              onClick={handleNext}
              disabled={isConfirmed}
              className="w-16 h-16 rounded-2xl liquid-glass border-white/10 flex items-center justify-center text-parchment/40 hover:text-gold hover:border-gold/40 transition-all hover:scale-110 disabled:opacity-0"
            >
              <ChevronRight size={32} />
            </button>
          </div>
        </div>

        {/* Final Animation */}
        <AnimatePresence>
          {isConfirmed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-[1100] flex items-center justify-center pointer-events-none bg-white"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 100] }}
                transition={{ duration: 2.5, times: [0, 0.2, 1], ease: "easeInOut" }}
                className="w-40 h-40 rounded-full"
                style={{ backgroundColor: SCHOOLS[activeIndex].color }}
              />
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: [0, 1, 0], y: [50, 0, -50] }}
                transition={{ duration: 2.5 }}
                className="absolute text-center"
              >
                <h2 className="text-8xl font-display font-black text-white uppercase italic tracking-tighter">
                  {SCHOOLS[activeIndex].id}
                </h2>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-2500 { perspective: 2500px; }
        .preserve-3d { transform-style: preserve-3d; }
        .animate-spin-slow { animation: spin 20s linear infinite; }
        .animate-spin-slow-reverse { animation: spin-reverse 15s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
      `}} />
    </div>
  );
}
