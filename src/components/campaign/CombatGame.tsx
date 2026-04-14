import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sword, 
  Shield, 
  Heart, 
  Zap, 
  History as HistoryIcon, 
  ChevronRight, 
  X,
  Flame,
  Wand2,
  Package,
  Skull,
  Trophy,
  ArrowRight,
  RefreshCw,
  Users,
  Play,
  Dice5,
  Dices,
  CheckCircle2,
  Loader2,
  Target,
  Sparkles,
  Info,
  Link,
  Book
} from 'lucide-react';
import { useCharacter, Character, Campaign } from '../../contexts/CharacterContext';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { CombatCard, POOL_CARDS } from '../../data/combatCards';
import useSound from 'use-sound';

// Sound URLs
const SOUNDS = {
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  CONFIRM: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  HIT: 'https://assets.mixkit.co/active_storage/sfx/2577/2577-preview.mp3',
  HEAL: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
  TURN: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3',
  VICTORY: 'https://assets.mixkit.co/active_storage/sfx/2583/2583-preview.mp3',
  DRAW: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
  DEATH: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3',
  HOVER: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
  MISS: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
  FIRE: 'https://assets.mixkit.co/active_storage/sfx/2579/2579-preview.mp3',
  ICE: 'https://assets.mixkit.co/active_storage/sfx/2575/2575-preview.mp3',
  MAGIC: 'https://assets.mixkit.co/active_storage/sfx/2576/2576-preview.mp3',
  CRITICAL: 'https://assets.mixkit.co/active_storage/sfx/2582/2582-preview.mp3',
  SUMMON: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  SWORD: 'https://assets.mixkit.co/active_storage/sfx/2577/2577-preview.mp3',
  MONSTER: 'https://assets.mixkit.co/active_storage/sfx/2581/2581-preview.mp3',
  SHIELD: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3',
  SKELETON: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3',
  OWLBEAR: 'https://assets.mixkit.co/active_storage/sfx/2582/2582-preview.mp3',
  GHOST: 'https://assets.mixkit.co/active_storage/sfx/2576/2576-preview.mp3'
};

const YouTubeOST: React.FC<{ isPlaying: boolean; volume: number }> = ({ isPlaying }) => {
  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 pointer-events-none opacity-0 overflow-hidden w-12 h-12",
      !isPlaying && "hidden"
    )}>
      <iframe 
        key={isPlaying ? 'playing' : 'stopped'}
        width="100%" 
        height="100%" 
        src={isPlaying ? `https://www.youtube.com/embed/ayqJPTsXQq4?autoplay=1&loop=1&playlist=ayqJPTsXQq4&controls=0&modestbranding=1&rel=0&enablejsapi=1` : null}
        title="Combat OST"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
};

interface CombatGameProps {
  campaign: Campaign;
  isDM: boolean;
}

export const CombatGame: React.FC<CombatGameProps> = ({ campaign, isDM }) => {
  const { 
    nextTurn, 
    endCombat, 
    addCombatLog, 
    applyCombatDamage, 
    toggleDefend,
    user,
    submitInitiative,
    finalizeInitiative,
    openDiceTray,
    selectCombatAction,
    submitReaction,
    submitSavingThrow,
    startExecutionPhase,
    executeNextAction,
    endRound,
    cancelCombatAction,
    finalizeDeckSelection
  } = useCharacter();

  const [selectedMainActionId, setSelectedMainActionId] = useState<string | null>(null);
  const [selectedBonusActionId, setSelectedBonusActionId] = useState<string | null>(null);
  const [selectingType, setSelectingType] = useState<'main' | 'bonus'>('main');
  const [targetParticipant, setTargetParticipant] = useState<string | null>(null);
  const [mainTargetId, setMainTargetId] = useState<string | null>(null);
  const [bonusTargetId, setBonusTargetId] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState<{ id: string; value: string; x: number; y: number; type: 'damage' | 'heal'; isCritical?: boolean }[]>([]);
  const [particles, setParticles] = useState<{ id: string; x: number; y: number; targetX: number; targetY: number; color: string }[]>([]);
  const [dmSelectedMonsterId, setDmSelectedMonsterId] = useState<string | null>(null);
  const [comboCount, setComboCount] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [showTurnAnnouncement, setShowTurnAnnouncement] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [showDefeat, setShowDefeat] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [activeDiceRoll, setActiveDiceRoll] = useState<{ d20: number; mod: number; total: number; targetAC: number; isMiss: boolean; actorName: string; targetName: string } | null>(null);
  const [cinematicAction, setCinematicAction] = useState<{ actor: any; card: any; target?: any } | null>(null);

  // Sounds
  const [playClick] = useSound(SOUNDS.CLICK, { volume: 0.4 });
  const [playConfirm] = useSound(SOUNDS.CONFIRM, { volume: 0.5 });
  const [playHit] = useSound(SOUNDS.HIT, { volume: 0.5 });
  const [playHeal] = useSound(SOUNDS.HEAL, { volume: 0.5 });
  const [playTurn] = useSound(SOUNDS.TURN, { volume: 0.4 });
  const [playVictory] = useSound(SOUNDS.VICTORY, { volume: 0.6 });
  const [playDraw] = useSound(SOUNDS.DRAW, { volume: 0.3 });
  const [playDeath] = useSound(SOUNDS.DEATH, { volume: 0.5 });
  const [playHover] = useSound(SOUNDS.HOVER, { volume: 0.2 });
  const [playMiss] = useSound(SOUNDS.MISS, { volume: 0.4 });
  const [playFire] = useSound(SOUNDS.FIRE, { volume: 0.5 });
  const [playIce] = useSound(SOUNDS.ICE, { volume: 0.5 });
  const [playMagic] = useSound(SOUNDS.MAGIC, { volume: 0.5 });
  const [playCritical] = useSound(SOUNDS.CRITICAL, { volume: 0.6 });
  const [playSummon] = useSound(SOUNDS.SUMMON, { volume: 0.5 });
  const [playSword] = useSound(SOUNDS.SWORD, { volume: 0.5 });
  const [playMonster] = useSound(SOUNDS.MONSTER, { volume: 0.5 });
  const [playShield] = useSound(SOUNDS.SHIELD, { volume: 0.5 });
  const [playSkeleton] = useSound(SOUNDS.SKELETON, { volume: 0.5 });
  const [playOwlbear] = useSound(SOUNDS.OWLBEAR, { volume: 0.6 });
  const [playGhost] = useSound(SOUNDS.GHOST, { volume: 0.5 });

  const [isOstPlaying, setIsOstPlaying] = useState(false);
  const [ostVolume, setOstVolume] = useState(50);

  const combat = campaign.combat!;
  const myCharRef = campaign.characterRefs?.find(ref => ref.userId === user?.uid);
  
  const isInitiativePhase = combat.phase === 'initiative';
  const isDeckSelectionPhase = combat.phase === 'deck_selection';
  const isPreparationPhase = combat.phase === 'preparation';
  const isExecutionPhase = combat.phase === 'execution';
  
  const myParticipant = combat.order.find(p => p.id === myCharRef?.charId);
  const hasRolledInitiative = myParticipant ? combat.initiatives?.[myParticipant.id] !== undefined : false;
  const hasSelectedAction = myParticipant ? combat.selectedActions?.[myParticipant.id] !== undefined : false;

  const currentTurnParticipant = combat.order[combat.turn];
  const isMyTurn = isExecutionPhase && currentTurnParticipant?.id === myCharRef?.charId;
  const isDMTurn = isExecutionPhase && isDM && currentTurnParticipant?.type === 'monster';

  const myReaction = combat.reactionPrompt?.participantId === myCharRef?.charId ? combat.reactionPrompt : null;

  // Synergy Detection
  const getSynergyCards = () => {
    if (!myParticipant?.hand) return new Set<string>();
    const synergyIds = new Set<string>();
    const hand = myParticipant.hand;

    // 1. Hand-to-Hand Synergy
    for (let i = 0; i < hand.length; i++) {
      for (let j = 0; j < hand.length; j++) {
        if (i === j) continue;
        const cardA = hand[i];
        const cardB = hand[j];
        if (cardA.synergy && cardB.appliesTags?.includes(cardA.synergy.tag)) {
          synergyIds.add(cardA.id);
          synergyIds.add(cardB.id);
        }
      }
    }

    // 2. Hand-to-Target Synergy
    if (targetParticipant) {
      const target = combat.order.find(p => p.id === targetParticipant);
      if (target?.conditions) {
        hand.forEach(card => {
          if (card.synergy && target.conditions?.includes(card.synergy.tag)) {
            synergyIds.add(card.id);
          }
        });
      }
    }

    return synergyIds;
  };

  // Automatic combat closure
  useEffect(() => {
    if (showVictory || showDefeat) {
      const timer = setTimeout(() => {
        endCombat();
      }, 10000); // 10 seconds of display
      return () => clearTimeout(timer);
    }
  }, [showVictory, showDefeat]);

  const synergyCards = getSynergyCards();

  // Turn Announcement
  useEffect(() => {
    if (isExecutionPhase && currentTurnParticipant) {
      setShowTurnAnnouncement(true);
      playTurn();
      const timer = setTimeout(() => setShowTurnAnnouncement(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [combat.turn, isExecutionPhase]);

  // Automatic turn progression in execution phase
  useEffect(() => {
    if (isExecutionPhase && !combat.reactionPrompt && !activeDiceRoll) {
      const timer = setTimeout(() => {
        if (isDM) {
          executeNextAction();
        }
      }, 4000); // 4 second delay to allow reading
      return () => clearTimeout(timer);
    }
  }, [isExecutionPhase, combat.turn, combat.reactionPrompt, isDM, activeDiceRoll]);

  // Draw sound
  useEffect(() => {
    if (isPreparationPhase && myParticipant?.hand && myParticipant.hand.length > 0) {
      playDraw();
    }
  }, [isPreparationPhase, myParticipant?.hand?.length]);

  // Trigger floating numbers and particles when history changes
  useEffect(() => {
    if (combat.history.length > 0) {
      const lastLog = combat.history[combat.history.length - 1];
      
      if (lastLog.type === 'death') {
        playDeath();
        const allMonstersDead = monsters.every(m => m.hp?.current === 0);
        const allPlayersDead = players.every(p => p.hp?.current === 0);
        
        if (allMonstersDead) {
          setShowVictory(true);
          playVictory();
        } else if (allPlayersDead) {
          setShowDefeat(true);
        }
      }
      
      // Update combo count
      if (lastLog.type === 'attack') {
        setComboCount(prev => {
          const newCount = prev + 1;
          if (newCount > 1) {
            setShowCombo(true);
            setTimeout(() => setShowCombo(false), 1500);
          }
          return newCount;
        });
      } else if (lastLog.type === 'info' && lastLog.message.includes('Rodada')) {
        setComboCount(0);
      }

      if ((lastLog.type === 'attack' || lastLog.type === 'heal' || lastLog.type === 'damage') && lastLog.targetId && lastLog.value !== undefined) {
        // Find target element to get position
        const targetEl = document.getElementById(`participant-${lastLog.targetId}`);
        const actorEl = lastLog.actorId ? document.getElementById(`participant-${lastLog.actorId}`) : null;
        
        if (lastLog.type === 'attack' || lastLog.type === 'damage') {
          if (lastLog.isMiss || lastLog.message.includes('errou')) {
            playMiss();
          } else {
            if (lastLog.isCritical) {
              playCritical();
            } else {
              playHit();
            }
            
            // Damage type effects
            const isFire = lastLog.message.toLowerCase().includes('fogo') || lastLog.message.toLowerCase().includes('fire');
            const isIce = lastLog.message.toLowerCase().includes('gelo') || lastLog.message.toLowerCase().includes('ice');
            const isMagic = lastLog.message.toLowerCase().includes('magia') || lastLog.message.toLowerCase().includes('magic');
            const isSword = lastLog.message.toLowerCase().includes('espada') || lastLog.message.toLowerCase().includes('ataque') || lastLog.message.toLowerCase().includes('sword') || lastLog.message.toLowerCase().includes('cimitarra') || lastLog.message.toLowerCase().includes('arco');
            const isMonster = lastLog.message.toLowerCase().includes('goblin') || lastLog.message.toLowerCase().includes('monstro') || lastLog.message.toLowerCase().includes('monster');
            const isSkeleton = lastLog.message.toLowerCase().includes('esqueleto') || lastLog.message.toLowerCase().includes('skeleton');
            const isOwlbear = lastLog.message.toLowerCase().includes('coruja') || lastLog.message.toLowerCase().includes('owlbear');
            const isGhost = lastLog.message.toLowerCase().includes('fantasma') || lastLog.message.toLowerCase().includes('ghost');

            if (isFire) playFire();
            if (isIce) playIce();
            if (isMagic) playMagic();
            if (isSword) playSword();
            if (isMonster) playMonster();
            if (isSkeleton) playSkeleton();
            if (isOwlbear) playOwlbear();
            if (isGhost) playGhost();

            // Trigger cinematic action overlay
            const actor = combat.order.find(p => p.id === lastLog.actorId);
            const target = combat.order.find(p => p.id === lastLog.targetId);
            const card = actor?.deck?.find(c => lastLog.message.includes(c.name));
            
            if (actor && card) {
              setCinematicAction({ actor, card, target });
              setTimeout(() => setCinematicAction(null), 2500);
            }

            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
          }
        } else if (lastLog.type === 'heal') {
          playHeal();
        }

        // Show Dice Roll Overlay if it's an attack
        if (lastLog.diceRoll) {
          const actor = combat.order.find(p => p.id === lastLog.actorId);
          const target = combat.order.find(p => p.id === lastLog.targetId);
          setActiveDiceRoll({
            ...lastLog.diceRoll,
            isMiss: !!lastLog.isMiss,
            actorName: actor?.name || 'Atacante',
            targetName: target?.name || 'Alvo'
          });
          setTimeout(() => setActiveDiceRoll(null), 3500);
        }
        
        if (targetEl) {
          const rect = targetEl.getBoundingClientRect();
          const id = Math.random().toString(36).substr(2, 9);
          
          // Floating Number
          setFloatingNumbers(prev => [...prev, {
            id,
            value: `${lastLog.type === 'heal' ? '+' : '-'}${lastLog.value}`,
            x: rect.left + rect.width / 2,
            y: rect.top,
            type: lastLog.type === 'heal' ? 'heal' : 'damage',
            isCritical: lastLog.isCritical
          }]);

          // Particles
          if (actorEl) {
            const actorRect = actorEl.getBoundingClientRect();
            setParticles(prev => [...prev, {
              id: `p-${id}`,
              x: actorRect.left + actorRect.width / 2,
              y: actorRect.top + actorRect.height / 2,
              targetX: rect.left + rect.width / 2,
              targetY: rect.top + rect.height / 2,
              color: lastLog.type === 'heal' ? '#10b981' : '#ef4444'
            }]);
            
            setTimeout(() => {
              setParticles(prev => prev.filter(p => p.id !== `p-${id}`));
            }, 1000);
          }
          
          setTimeout(() => {
            setFloatingNumbers(prev => prev.filter(fn => fn.id !== id));
          }, 2000);
        }
      }
    }
  }, [combat.history.length]);

  const handleSelectCard = (cardId: string) => {
    console.log("Card selected:", cardId);
    if (selectingType === 'main') {
      setSelectedMainActionId(cardId);
      setMainTargetId(null);
    } else {
      setSelectedBonusActionId(cardId);
      setBonusTargetId(null);
    }
    playClick();
  };

  const handleConfirmAction = async () => {
    const actorId = isDM && isPreparationPhase && dmSelectedMonsterId 
      ? dmSelectedMonsterId 
      : (isDM && isExecutionPhase && currentTurnParticipant?.type === 'monster' ? currentTurnParticipant.id : myParticipant?.id);
      
    if (!actorId) return;
    if (!selectedMainActionId && !selectedBonusActionId) return;

    if (selectedMainActionId) {
      await selectCombatAction(actorId, selectedMainActionId, 'main', mainTargetId || undefined);
    }
    if (selectedBonusActionId) {
      await selectCombatAction(actorId, selectedBonusActionId, 'bonus', bonusTargetId || undefined);
    }

    playConfirm();
    playSummon();
    
    if (isDM && dmSelectedMonsterId) {
      setDmSelectedMonsterId(null);
    }
    
    setSelectedMainActionId(null);
    setSelectedBonusActionId(null);
    setMainTargetId(null);
    setBonusTargetId(null);
    setTargetParticipant(null);
    toast.success("Ações confirmadas!");
  };

  const handleParticipantClick = (id: string) => {
    if (isPreparationPhase || (isExecutionPhase && currentTurnParticipant?.type === 'monster' && isDM)) {
      const participant = combat.order.find(p => p.id === id);
      if (isDM && isPreparationPhase && participant?.type === 'monster') {
        setDmSelectedMonsterId(id);
        setSelectedMainActionId(null);
        setSelectedBonusActionId(null);
        setTargetParticipant(null);
      } else {
        if (selectingType === 'main') {
          setMainTargetId(id);
        } else {
          setBonusTargetId(id);
        }
        setTargetParticipant(id);
      }
    }
  };

  const players = [...combat.order].filter(p => p.type === 'player').sort((a, b) => a.id.localeCompare(b.id));
  const monsters = [...combat.order].filter(p => p.type === 'monster').sort((a, b) => a.id.localeCompare(b.id));
  const allRolled = combat.order.every(p => combat.initiatives?.[p.id] !== undefined);
  
  const livingParticipants = combat.order.filter(p => p.hp && p.hp.current > 0);
  const allSelected = livingParticipants.every(p => combat.selectedActions?.[p.id] !== undefined);
  const missingActions = livingParticipants.filter(p => combat.selectedActions?.[p.id] === undefined);

  return (
    <div className="fixed inset-0 z-[200] bg-[#050505] flex flex-col overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1a1a2e_0%,#050505_70%)] opacity-50" />
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-500/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gold/5 to-transparent" />
      </div>

      {/* Particles */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, scale: 1, opacity: 1 }}
            animate={{ x: p.targetX, y: p.targetY, scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="fixed z-[450] pointer-events-none w-4 h-4 rounded-full blur-sm"
            style={{ backgroundColor: p.color, boxShadow: `0 0 20px ${p.color}` }}
          />
        ))}
      </AnimatePresence>

      {/* Floating Numbers */}
      <AnimatePresence>
        {floatingNumbers.map(fn => (
          <motion.div
            key={fn.id}
            initial={{ opacity: 0, y: fn.y, x: fn.x, scale: fn.isCritical ? 0.5 : 1 }}
            animate={{ 
              opacity: 1, 
              y: fn.y - 150,
              scale: fn.isCritical ? [1, 2, 1.5] : 1.2,
              rotate: fn.isCritical ? [0, 10, -10, 0] : 0
            }}
            exit={{ opacity: 0, scale: 0 }}
            className={cn(
              "fixed z-[500] pointer-events-none font-black font-display drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]",
              fn.type === 'damage' ? (fn.isCritical ? "text-orange-500 text-6xl" : "text-red-500 text-3xl") : "text-emerald-500 text-3xl",
              fn.isCritical && "animate-pulse"
            )}
          >
            {fn.value}{fn.isCritical && "!"}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Dice Roll Overlay */}
      <AnimatePresence>
        {activeDiceRoll && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.2, y: -50 }}
            className="fixed inset-0 z-[650] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-black/80 backdrop-blur-3xl border-2 border-gold/30 rounded-[3rem] p-12 flex flex-col items-center gap-6 shadow-[0_0_100px_rgba(212,175,55,0.4)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent pointer-events-none" />
              
              <div className="flex flex-col items-center gap-2 relative z-10 text-center">
                <span className="text-gold font-black uppercase tracking-[0.4em] text-xs drop-shadow-sm">{activeDiceRoll.actorName} ataca {activeDiceRoll.targetName}</span>
                <div className="h-px w-48 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
              </div>
              
              <div className="flex items-center gap-8 relative z-10">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-2xl bg-white/5 border-2 border-white/10 flex items-center justify-center relative overflow-hidden group shadow-inner">
                    <motion.div 
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="text-4xl font-display font-black text-parchment drop-shadow-md"
                    >
                      {activeDiceRoll.d20}
                    </motion.div>
                    <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-[10px] font-black text-parchment/40 uppercase mt-2 tracking-widest">Dado (d20)</span>
                </div>

                <div className="text-4xl font-display font-black text-gold animate-pulse">+</div>

                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-2xl bg-white/5 border-2 border-white/10 flex items-center justify-center shadow-inner">
                    <span className="text-4xl font-display font-black text-parchment drop-shadow-md">{activeDiceRoll.mod}</span>
                  </div>
                  <span className="text-[10px] font-black text-parchment/40 uppercase mt-2 tracking-widest">Modificador</span>
                </div>

                <div className="text-4xl font-display font-black text-gold">=</div>

                <div className="flex flex-col items-center">
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "w-32 h-32 rounded-3xl border-4 flex flex-col items-center justify-center shadow-2xl transition-all duration-500",
                      activeDiceRoll.isMiss ? "border-red-500/50 bg-red-500/20 shadow-red-500/20" : "border-emerald-500/50 bg-emerald-500/20 shadow-emerald-500/20"
                    )}
                  >
                    <span className="text-5xl font-display font-black text-parchment drop-shadow-xl">{activeDiceRoll.total}</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-60">Total</span>
                  </motion.div>
                  <span className="text-[10px] font-black text-parchment/40 uppercase mt-2 tracking-widest">vs CA {activeDiceRoll.targetAC}</span>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className={cn(
                  "px-12 py-4 rounded-full font-black uppercase tracking-[0.4em] text-xl shadow-2xl border-2",
                  activeDiceRoll.isMiss ? "bg-red-500 text-white border-red-400" : "bg-emerald-500 text-white border-emerald-400"
                )}
              >
                {activeDiceRoll.isMiss ? "ERROU!" : "ACERTOU!"}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Turn Announcement */}
      <AnimatePresence>
        {showTurnAnnouncement && currentTurnParticipant && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5, y: 100 }}
            className="fixed inset-0 z-[600] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-black/60 backdrop-blur-3xl border-y border-gold/20 w-full py-12 flex flex-col items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute opacity-10"
              >
                <Skull size={300} className="text-gold" />
              </motion.div>
              <span className="text-gold font-black uppercase tracking-[0.5em] text-sm">Turno de</span>
              <h2 className="text-7xl font-display font-black text-parchment uppercase tracking-tighter drop-shadow-2xl">
                {currentTurnParticipant.name}
              </h2>
              <div className="h-1 w-64 bg-gradient-to-r from-transparent via-gold to-transparent" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory Announcement */}
      <AnimatePresence>
        {showVictory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[700] bg-black/80 backdrop-blur-3xl flex flex-col items-center justify-center gap-8"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10 }}
            >
              <Trophy size={120} className="text-gold drop-shadow-[0_0_50px_rgba(212,175,55,0.6)]" />
            </motion.div>
            <div className="text-center space-y-2">
              <h2 className="text-8xl font-display font-black text-parchment uppercase tracking-tighter">Vitória!</h2>
              <p className="text-gold font-black uppercase tracking-[0.4em]">Os inimigos foram derrotados</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <button 
                onClick={endCombat}
                className="px-12 py-4 bg-gold text-midnight font-black uppercase tracking-widest rounded-full hover:scale-110 transition-all shadow-2xl"
              >
                Finalizar Combate
              </button>
              <p className="text-parchment/40 text-[10px] font-black uppercase tracking-widest animate-pulse">Fechando automaticamente em instantes...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Defeat Announcement */}
      <AnimatePresence>
        {showDefeat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[700] bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center gap-8"
          >
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10 }}
            >
              <Skull size={120} className="text-red-600 drop-shadow-[0_0_50px_rgba(220,38,38,0.6)]" />
            </motion.div>
            <div className="text-center space-y-2">
              <h2 className="text-8xl font-display font-black text-red-600 uppercase tracking-tighter">Derrota</h2>
              <p className="text-red-400/60 font-black uppercase tracking-[0.4em]">O grupo sucumbiu em batalha</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <button 
                onClick={endCombat}
                className="px-12 py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-full hover:scale-110 transition-all shadow-2xl"
              >
                Retornar
              </button>
              <p className="text-parchment/40 text-[10px] font-black uppercase tracking-widest animate-pulse">Retornando automaticamente em instantes...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OST Player */}
      <YouTubeOST key={isOstPlaying ? 'playing' : 'stopped'} isPlaying={isOstPlaying} volume={ostVolume} />

      {/* Top UI Bar */}
      <div className="relative z-[110] flex items-center justify-between p-6 bg-black/40 backdrop-blur-md border-b border-white/5 h-24 shrink-0">
        <div className="flex items-center gap-6">
          <button 
            onClick={endCombat}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-parchment/40 hover:bg-red-500/20 hover:text-red-400 transition-all group"
          >
            <X size={18} className="group-hover:rotate-90 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Sair</span>
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">Campaign Combat</span>
            <span className="text-lg font-display font-black text-parchment uppercase tracking-tighter">{campaign.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 pr-4">
            <button
              onClick={() => setIsOstPlaying(!isOstPlaying)}
              className={cn(
                "p-2 rounded-xl transition-all duration-500",
                isOstPlaying 
                  ? "bg-gold text-midnight shadow-[0_0_15px_rgba(212,175,55,0.4)]" 
                  : "bg-white/5 text-white/40 hover:bg-white/10"
              )}
              title={isOstPlaying ? "Pausar OST" : "Tocar OST"}
            >
              {isOstPlaying ? <Sparkles className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4" />}
            </button>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-gold/60 uppercase tracking-widest">Combat OST</span>
              <span className="text-[10px] font-black text-parchment uppercase tracking-tight truncate max-w-[100px]">
                {isOstPlaying ? "Playing..." : "Paused"}
              </span>
            </div>
          </div>

          {comboCount > 1 && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center"
            >
              <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Combo</span>
              <div className="flex items-center gap-1">
                <Flame size={16} className="text-orange-500 animate-pulse" />
                <span className="text-xl font-black text-orange-500">x{comboCount}</span>
              </div>
            </motion.div>
          )}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-gold/40 uppercase tracking-widest">Round</span>
            <span className="text-2xl font-display font-black text-gold">{combat.round}</span>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-gold/40 uppercase tracking-widest">Fase Atual</span>
            <span className="text-sm font-bold text-parchment uppercase tracking-widest">
              {isDeckSelectionPhase ? 'Seleção de Deck' : isInitiativePhase ? 'Iniciativa' : isPreparationPhase ? 'Preparação' : 'Execução'}
            </span>
          </div>
        </div>
      </div>

      {/* Inventory Overlay */}
      <AnimatePresence>
        {showInventory && myParticipant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[300] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-8"
          >
            <div className="max-w-5xl w-full h-full flex flex-col gap-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-display font-black text-parchment uppercase tracking-tighter">Grimório & Inventário</h2>
                  <p className="text-gold/60 text-xs font-black uppercase tracking-widest">Magias, Itens e Equipamentos</p>
                </div>
                <button 
                  onClick={() => setShowInventory(false)}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-full transition-all"
                >
                  <X size={32} className="text-parchment" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {myParticipant.deck?.filter(c => c.category === 'item' || c.category === 'consumable' || c.category === 'spell').map(card => (
                    <CombatActionCard 
                      key={card.id}
                      card={card}
                      selected={selectedMainActionId === card.id || selectedBonusActionId === card.id}
                      onClick={() => {
                        if (card.type === 'action' || card.type === 'bonus') {
                          handleSelectCard(card.id);
                          setShowInventory(false);
                        } else {
                          toast.info("Este item ou magia é passivo ou situacional.");
                        }
                      }}
                      quantity={card.charges !== undefined ? card.charges : 1}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Monster Deck Panel (DM Only) */}
      <AnimatePresence>
        {isDM && (isExecutionPhase || (isPreparationPhase && dmSelectedMonsterId)) && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="fixed right-0 top-1/2 -translate-y-1/2 w-80 bg-black/80 backdrop-blur-xl border-l border-white/10 p-6 z-[200] rounded-l-3xl shadow-2xl"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <Skull className="text-red-500" />
                  <h3 className="text-lg font-display font-black text-parchment uppercase tracking-tighter">
                    {isPreparationPhase ? "Preparar Monstro" : "Painel do Mestre"}
                  </h3>
                </div>
                {isPreparationPhase && (
                  <button onClick={() => setDmSelectedMonsterId(null)} className="text-parchment/40 hover:text-parchment">
                    <X size={20} />
                  </button>
                )}
              </div>

              {((isExecutionPhase && currentTurnParticipant?.type === 'monster') || (isPreparationPhase && dmSelectedMonsterId)) && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">
                      {isPreparationPhase ? "Selecionado" : "Turno Atual"}
                    </p>
                    <p className="text-sm font-black text-parchment uppercase">
                      {isPreparationPhase 
                        ? combat.order.find(p => p.id === dmSelectedMonsterId)?.name 
                        : currentTurnParticipant.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {(isPreparationPhase 
                      ? combat.order.find(p => p.id === dmSelectedMonsterId)?.deck 
                      : currentTurnParticipant.deck)?.map(card => (
                      <button
                        key={card.id}
                        onClick={() => handleSelectCard(card.id)}
                        className={cn(
                          "w-full p-4 bg-white/5 border rounded-2xl transition-all text-left group",
                          (selectedMainActionId === card.id || selectedBonusActionId === card.id) || 
                          combat.selectedActions?.[isPreparationPhase ? dmSelectedMonsterId! : currentTurnParticipant.id]?.mainActionId === card.id ||
                          combat.selectedActions?.[isPreparationPhase ? dmSelectedMonsterId! : currentTurnParticipant.id]?.bonusActionId === card.id
                            ? "border-gold bg-gold/10" 
                            : "border-white/10 hover:bg-white/10"
                        )}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black text-gold uppercase tracking-widest">{card.name}</span>
                          <span className="text-[8px] font-bold text-parchment/40 uppercase">{card.type}</span>
                        </div>
                        <p className="text-[9px] text-parchment/60 line-clamp-2">{card.effect}</p>
                      </button>
                    ))}
                  </div>

                  {(selectedMainActionId || selectedBonusActionId) && (
                    <div className="pt-4 border-t border-white/5 space-y-4">
                      <p className="text-[10px] font-black text-gold/60 uppercase tracking-widest text-center">
                        {targetParticipant 
                          ? `Alvo: ${combat.order.find(p => p.id === targetParticipant)?.name}` 
                          : "Clique em um alvo no campo"}
                      </p>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={handleConfirmAction}
                          disabled={!targetParticipant}
                          className={cn(
                            "w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all",
                            targetParticipant ? "bg-gold text-midnight" : "bg-white/10 text-parchment/20 cursor-not-allowed"
                          )}
                        >
                          {isPreparationPhase ? "Confirmar Ação do Monstro" : "Atualizar Ação"}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMainActionId(null);
                            setSelectedBonusActionId(null);
                            setTargetParticipant(null);
                            if (isPreparationPhase && dmSelectedMonsterId) {
                              cancelCombatAction(dmSelectedMonsterId);
                            }
                          }}
                          className="text-[8px] font-black text-parchment/20 uppercase tracking-widest hover:text-red-400 text-center transition-colors"
                        >
                          Cancelar Seleção
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deck Selection Phase Overlay */}
      <AnimatePresence>
        {isDeckSelectionPhase && myParticipant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[400] bg-black/95 backdrop-blur-3xl flex flex-col p-8 overflow-hidden"
          >
            <div className="max-w-6xl mx-auto w-full flex flex-col h-full gap-8">
              <div className="text-center space-y-2">
                <h2 className="text-5xl font-display font-black text-parchment uppercase tracking-tighter">Monte seu Deck</h2>
                <p className="text-gold font-black uppercase tracking-[0.3em] text-xs">Escolha 5 cartas adicionais para o combate</p>
                <div className="flex justify-center gap-4 mt-4">
                  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                    <span className="text-[10px] font-black text-parchment/40 uppercase block">Base Fixa</span>
                    <span className="text-lg font-bold text-parchment">7 Cartas</span>
                  </div>
                  <div className="px-4 py-2 bg-gold/10 border border-gold/40 rounded-xl">
                    <span className="text-[10px] font-black text-gold/40 uppercase block">Adicionais</span>
                    <span className="text-lg font-bold text-gold">{(combat.deckSelections?.[myParticipant.id]?.length || 0)} / 5</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-4">
                  {POOL_CARDS.map(card => {
                    const isSelected = (combat.deckSelections?.[myParticipant.id] || []).includes(card.id);
                    return (
                      <CombatActionCard
                        key={card.id}
                        card={card}
                        selected={isSelected}
                        onClick={() => {
                          const currentSelection = combat.deckSelections?.[myParticipant.id] || [];
                          if (isSelected) {
                            finalizeDeckSelection(myParticipant.id, currentSelection.filter(id => id !== card.id));
                          } else if (currentSelection.length < 5) {
                            finalizeDeckSelection(myParticipant.id, [...currentSelection, card.id]);
                          } else {
                            toast.error("Você já escolheu 5 cartas!");
                          }
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-center pb-8">
                <button
                  onClick={() => {
                    const selection = combat.deckSelections?.[myParticipant.id] || [];
                    if (selection.length === 5) {
                      // We don't need to do anything here as finalizeDeckSelection handles the transition
                      // but we can show a final toast
                      toast.success("Deck confirmado!");
                    } else {
                      toast.error("Escolha exatamente 5 cartas!");
                    }
                  }}
                  disabled={(combat.deckSelections?.[myParticipant.id]?.length || 0) < 5}
                  className={cn(
                    "px-12 py-4 rounded-full font-black uppercase tracking-widest transition-all shadow-2xl",
                    (combat.deckSelections?.[myParticipant.id]?.length || 0) === 5
                      ? "bg-gold text-midnight hover:scale-110"
                      : "bg-white/5 text-parchment/20 cursor-not-allowed"
                  )}
                >
                  Confirmar Deck
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reaction Phase Overlay */}
      <AnimatePresence>
        {myReaction && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[250] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-8"
          >
            <div className="max-w-4xl w-full space-y-8 text-center">
              <div className="space-y-2">
                <div className="w-20 h-20 rounded-full bg-blue-500/20 border-2 border-blue-500/40 flex items-center justify-center text-blue-400 mx-auto animate-pulse">
                  <Zap size={40} />
                </div>
                <h2 className="text-4xl font-display font-black text-parchment uppercase tracking-tighter">Oportunidade de Reação!</h2>
                <p className="text-blue-400 font-black tracking-[0.2em] uppercase text-xs">{myReaction.message}</p>
              </div>

              <div className="flex gap-6 justify-center overflow-x-auto py-8">
                {myReaction.availableReactions.map(card => (
                  <CombatActionCard 
                    key={card.id} 
                    card={card} 
                    selected={false}
                    onClick={() => {
                      submitReaction(myParticipant!.id, card.id);
                      toast.success(`Reação ${card.name} usada!`);
                    }}
                  />
                ))}
                <button
                  onClick={() => submitReaction(myParticipant!.id, null)}
                  className="w-40 h-56 rounded-xl border-2 border-white/10 bg-white/5 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-4 group"
                >
                  <X size={32} className="text-parchment/20 group-hover:text-parchment/40 transition-colors" />
                  <span className="text-[10px] font-black text-parchment/20 uppercase tracking-widest">Passar Reação</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preparation Phase Overlay */}
      <AnimatePresence>
        {isPreparationPhase && !hasSelectedAction && myParticipant && myParticipant.hp && myParticipant.hp.current > 0 && (
          <motion.div 
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            className="absolute bottom-0 left-0 w-full z-[150] p-8 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-auto"
          >
            <div className="max-w-6xl mx-auto flex flex-col items-center gap-8 pointer-events-auto">
              <div className="text-center relative w-full">
                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-2xl font-display font-black text-parchment uppercase tracking-tighter">Base Fixa</h3>
                  <div className="flex items-center gap-4">
                    <div className="h-px w-12 bg-gold/20" />
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                      <button 
                        onClick={() => setSelectingType('main')}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                          selectingType === 'main' ? "bg-gold text-midnight shadow-lg" : "text-parchment/40 hover:text-parchment"
                        )}
                      >
                        Ação Principal
                      </button>
                      <button 
                        onClick={() => setSelectingType('bonus')}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                          selectingType === 'bonus' ? "bg-blue-500 text-white shadow-lg" : "text-parchment/40 hover:text-parchment"
                        )}
                      >
                        Ação Bônus
                      </button>
                    </div>
                    <div className="h-px w-12 bg-gold/20" />
                  </div>
                </div>

                {myParticipant.bonusPool && myParticipant.bonusPool.length > 0 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full border border-gold/40 bg-gold/10 flex items-center justify-center text-gold relative group">
                      <Package size={20} />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-black text-[10px] font-black rounded-full flex items-center justify-center">
                        {myParticipant.bonusPool.length}
                      </div>
                      <div className="absolute bottom-full mb-2 right-0 w-48 p-3 bg-black/95 border border-gold/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 backdrop-blur-xl text-left">
                        <p className="text-gold font-black uppercase text-[10px] mb-1">Reserva de Bônus</p>
                        <p className="text-parchment/60 text-[8px] leading-relaxed">
                          Você selecionou {myParticipant.bonusPool.length} cartas de bônus. 
                          Uma delas será adicionada à sua mão aleatoriamente a cada 3 rodadas.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] font-black text-gold/40 uppercase tracking-widest">Próximo Bônus</span>
                      <span className="text-[10px] font-bold text-gold">Rodada {Math.ceil((combat.round + 1) / 3) * 3}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.05 } }
                }}
                className="flex gap-2 py-8 w-full justify-center perspective-1000"
              >
                {myParticipant.hand?.map((card, idx) => {
                  const totalCards = myParticipant.hand!.length;
                  const middle = (totalCards - 1) / 2;
                  const offset = idx - middle;
                  const rotation = offset * 5; // More pronounced rotation
                  const yOffset = Math.abs(offset) * 12; // More pronounced yOffset
                  const xOffset = offset * 10; // Add xOffset for better fanning

                  return (
                    <motion.div
                      key={`${card.id}-${idx}`}
                      variants={{
                        hidden: { opacity: 0, scale: 0.5, y: 200, rotate: 0 },
                        visible: { 
                          opacity: 1, 
                          scale: 1, 
                          y: yOffset, 
                          x: xOffset,
                          rotate: rotation,
                          transition: { type: "spring", damping: 15 }
                        }
                      }}
                      whileHover={{ 
                        y: -50, 
                        scale: 1.2, 
                        rotate: 0, 
                        zIndex: 50,
                        transition: { duration: 0.2 }
                      }}
                      className="relative -mx-4 first:ml-0 last:mr-0"
                    >
                      <CombatActionCard 
                        card={card} 
                        selected={selectedMainActionId === card.id || selectedBonusActionId === card.id}
                        onClick={() => handleSelectCard(card.id)}
                        onHover={() => playHover()}
                        hasSynergy={synergyCards.has(card.id)}
                      />
                      {selectedMainActionId === card.id && (
                        <div className="absolute -top-2 -left-2 bg-gold text-midnight text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg z-50">PRINCIPAL</div>
                      )}
                      {selectedBonusActionId === card.id && (
                        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg z-50">BÔNUS</div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>

              {(selectedMainActionId || selectedBonusActionId) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-4">
                      {selectedMainActionId && (
                        <div className="flex items-center gap-3 px-6 py-3 bg-gold/10 border border-gold/40 rounded-2xl text-gold">
                          <Target size={20} />
                          <span className="text-xs font-black uppercase tracking-widest">
                            Principal: {mainTargetId 
                              ? combat.order.find(p => p.id === mainTargetId)?.name 
                              : "Selecione um alvo"}
                          </span>
                        </div>
                      )}
                      {selectedBonusActionId && (
                        <div className="flex items-center gap-3 px-6 py-3 bg-blue-500/10 border border-blue-500/40 rounded-2xl text-blue-400">
                          <Target size={20} />
                          <span className="text-xs font-black uppercase tracking-widest">
                            Bônus: {bonusTargetId 
                              ? combat.order.find(p => p.id === bonusTargetId)?.name 
                              : "Selecione um alvo"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={handleConfirmAction}
                    className="px-12 py-4 bg-gold text-midnight font-black uppercase tracking-[0.2em] rounded-full shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:scale-105 transition-all"
                  >
                    Confirmar Ações
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedMainActionId(null);
                      setSelectedBonusActionId(null);
                      setMainTargetId(null);
                      setBonusTargetId(null);
                      setTargetParticipant(null);
                      if (myParticipant) cancelCombatAction(myParticipant.id);
                    }}
                    className="text-[10px] font-black text-parchment/40 uppercase tracking-widest hover:text-red-400 transition-colors"
                  >
                    Desistir das Ações
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Battlefield */}
      <div className="relative z-10 flex-1 flex flex-row min-h-0">
        {/* Left: History */}
        <div className="w-64 p-6 flex flex-col gap-4 border-r border-white/5 bg-black/20 backdrop-blur-sm min-h-0 shrink-0">
          <div className="flex items-center gap-2 text-[10px] font-black text-gold uppercase tracking-widest border-b border-white/5 pb-2 shrink-0">
            <HistoryIcon size={14} /> History
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 min-h-0">
            {combat.history.slice().reverse().map(log => (
              <div key={log.id} className={cn(
                "p-3 rounded-xl border transition-all animate-in fade-in slide-in-from-left-2",
                log.type === 'attack' ? "bg-red-500/5 border-red-500/10" : 
                log.type === 'heal' ? "bg-emerald-500/5 border-emerald-500/10" :
                log.type === 'death' ? "bg-gray-500/5 border-gray-500/10" : "bg-white/5 border-white/10"
              )}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[7px] font-mono text-parchment/20">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <div className="flex items-center gap-1">
                    {log.isCritical && <Sparkles size={8} className="text-gold animate-pulse" />}
                    <span className={cn(
                      "text-[6px] font-black uppercase px-1 py-0.5 rounded",
                      log.type === 'attack' ? "bg-red-500/20 text-red-400" : 
                      log.type === 'heal' ? "bg-emerald-500/20 text-emerald-400" :
                      "bg-white/10 text-parchment/40"
                    )}>{log.type}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    {log.type === 'attack' && <Sword size={10} className="text-red-400" />}
                    {log.type === 'heal' && <Heart size={10} className="text-emerald-400" />}
                    {log.type === 'death' && <Skull size={10} className="text-gray-400" />}
                    {log.type === 'info' && <Info size={10} className="text-blue-400" />}
                  </div>
                  <p className={cn(
                    "text-[9px] leading-tight",
                    log.isCritical ? "text-gold font-bold" : "text-parchment/60"
                  )}>{log.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Battlefield */}
        <motion.div 
          animate={isShaking ? {
            x: [0, -10, 10, -10, 10, 0],
            y: [0, 5, -5, 5, -5, 0]
          } : {}}
          transition={{ duration: 0.4 }}
          className="flex-1 flex flex-col relative overflow-hidden min-h-0"
        >
          {/* Combo Counter */}
          <AnimatePresence>
            {showCombo && comboCount > 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, x: 100 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 1.5, x: -100 }}
                className="absolute top-20 right-10 z-50 flex flex-col items-end"
              >
                <span className="text-gold font-black italic text-6xl drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]">
                  {comboCount}x COMBO!
                </span>
                <div className="h-1 bg-gold w-full origin-right animate-shrink" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Round Indicator */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-10">
            <span className="text-[12rem] font-display font-black text-white uppercase tracking-tighter select-none">R{combat.round}</span>
          </div>

          {/* Enemy Side */}
          <div className="flex-1 flex items-center justify-center gap-8 px-10 border-b border-white/5 bg-red-500/[0.02] min-h-[300px]">
            <AnimatePresence mode="popLayout">
              {monsters.map(m => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <LoRCard 
                    participant={m}
                    isCurrentTurn={isExecutionPhase && currentTurnParticipant?.id === m.id}
                    onClick={() => handleParticipantClick(m.id)}
                    isTarget={targetParticipant === m.id}
                    isSelected={isPreparationPhase && combat.selectedActions?.[m.id] !== undefined}
                    isHealing={combat.history[combat.history.length - 1]?.type === 'heal' && combat.history[combat.history.length - 1]?.targetId === m.id}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Player Side */}
          <div className="flex-1 flex items-center justify-center gap-8 px-10 bg-gold/[0.02] min-h-[300px]">
            <AnimatePresence mode="popLayout">
              {players.map(p => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <LoRCard 
                    participant={p}
                    isCurrentTurn={isExecutionPhase && currentTurnParticipant?.id === p.id}
                    onClick={() => handleParticipantClick(p.id)}
                    isTarget={targetParticipant === p.id}
                    isSelected={isPreparationPhase && combat.selectedActions?.[p.id] !== undefined}
                    isHealing={combat.history[combat.history.length - 1]?.type === 'heal' && combat.history[combat.history.length - 1]?.targetId === p.id}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Right: DM Controls & Turn Order */}
        <div className="w-80 p-6 flex flex-col gap-6 border-l border-white/5 bg-black/20 backdrop-blur-sm min-h-0 shrink-0">
          <div className="flex flex-col gap-2 min-h-0 flex-1">
            <span className="text-[10px] font-black text-gold/40 uppercase tracking-widest shrink-0">Ordem de Turno</span>
            <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 min-h-0 flex-1">
              {combat.order.map((p, idx) => (
                <div 
                  key={p.id} 
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg border transition-all",
                    isExecutionPhase && combat.turn === idx ? "bg-gold/20 border-gold/40" : "bg-white/5 border-white/10 opacity-60"
                  )}
                >
                  <div className="w-8 h-8 rounded-md overflow-hidden border border-white/10">
                    <img src={p.imageUrl || null} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-parchment truncate uppercase">{p.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-bold text-gold">INIT: {p.initiative}</span>
                      {combat.selectedActions?.[p.id] && (
                        <span className="text-[8px] font-bold text-emerald-400 uppercase">PRONTO</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isDM && (
            <div className="mt-auto space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <span className="text-[10px] font-black text-gold uppercase tracking-widest block text-center">Controles do Mestre</span>
                
                {isPreparationPhase && (
                  <div className="space-y-2">
                    <button 
                      onClick={startExecutionPhase}
                      disabled={!allSelected}
                      className={cn(
                        "w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2",
                        allSelected ? "bg-emerald-500 text-white shadow-lg" : "bg-white/10 text-parchment/20 cursor-not-allowed"
                      )}
                    >
                      <Play size={16} /> Iniciar Execução
                    </button>
                    {!allSelected && missingActions.length > 0 && (
                      <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-[8px] font-black text-red-400 uppercase tracking-widest text-center mb-1">Aguardando:</p>
                        <div className="flex flex-wrap justify-center gap-1">
                          {missingActions.map(p => (
                            <span key={p.id} className="text-[7px] font-bold text-parchment/40 uppercase bg-white/5 px-1 rounded">{p.name}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isExecutionPhase && (
                  <div className="space-y-2">
                    {combat.reactionPrompt ? (
                      <div className="p-3 bg-blue-500/10 border border-blue-500/40 rounded-xl text-center animate-pulse">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Aguardando Reação...</p>
                        <p className="text-[8px] text-parchment/40 uppercase">{combat.order.find(p => p.id === combat.reactionPrompt?.participantId)?.name}</p>
                      </div>
                    ) : (
                      (isDM || currentTurnParticipant?.id === myParticipant?.id) && (
                        <button 
                          onClick={executeNextAction}
                          className="w-full py-3 bg-gold text-midnight rounded-xl font-black uppercase tracking-widest text-xs shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                        >
                          <ArrowRight size={16} /> {currentTurnParticipant?.id === myParticipant?.id ? "Executar Minha Ação" : "Próxima Ação"}
                        </button>
                      )
                    )}
                  </div>
                )}

                <button 
                  onClick={() => setShowInventory(!showInventory)}
                  className="w-full py-3 bg-white/5 border border-white/10 text-parchment rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <Book size={16} /> Grimório & Itens
                </button>

                <button 
                  onClick={endCombat}
                  className="w-full py-3 bg-red-500/20 text-red-400 border border-red-500/40 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-500/30 transition-all"
                >
                  Encerrar Combate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cinematic Action Overlay */}
      <AnimatePresence>
        {cinematicAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1200] pointer-events-none flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            
            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 1.2, y: -50, opacity: 0 }}
              className="relative flex flex-col items-center gap-8"
            >
              <div className="flex items-center gap-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 rounded-full border-4 border-gold/40 overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.3)]">
                    <img src={cinematicAction.actor.imageUrl || null} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-gold font-black uppercase tracking-widest text-sm">{cinematicAction.actor.name}</span>
                </div>

                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  <CombatActionCard card={cinematicAction.card} selected={true} onClick={() => {}} />
                </motion.div>

                {cinematicAction.target && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-full border-4 border-red-500/40 overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                      <img src={cinematicAction.target.imageUrl || null} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-red-400 font-black uppercase tracking-widest text-sm">{cinematicAction.target.name}</span>
                  </div>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-display font-black text-parchment uppercase tracking-tighter text-center"
              >
                {cinematicAction.card.name}!
              </motion.div>
            </motion.div>

            {/* Damage Type Overlays */}
            {cinematicAction.card.damageType === 'Fogo' && (
              <div className="absolute inset-0 fire-glow pointer-events-none" />
            )}
            {cinematicAction.card.damageType === 'Gelo' && (
              <div className="absolute inset-0 ice-glow pointer-events-none" />
            )}
            {cinematicAction.card.tags.includes('Magia') && (
              <div className="absolute inset-0 magic-glow pointer-events-none" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saving Throw Overlay */}
      <AnimatePresence>
        {combat.savingThrowPrompt && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-[1100] bg-black/80 backdrop-blur-md flex items-center justify-center p-8"
          >
            <div className="max-w-md w-full bg-midnight border border-blue-500/30 rounded-3xl p-8 text-center space-y-6 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full mx-auto flex items-center justify-center text-blue-400 border border-blue-500/40">
                <Shield size={40} className="animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-black text-blue-400 uppercase tracking-tighter">Teste de Resistência!</h3>
                <p className="text-parchment/60 text-sm leading-relaxed">{combat.savingThrowPrompt.message}</p>
              </div>

              {combat.savingThrowPrompt.participantId === myParticipant?.id ? (
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black text-parchment/40 uppercase tracking-widest mb-1">Atributo</p>
                    <p className="text-xl font-black text-gold uppercase">{combat.savingThrowPrompt.attribute}</p>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-2">Dificuldade (CD): {combat.savingThrowPrompt.dc}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      const attr = combat.savingThrowPrompt!.attribute.toLowerCase().substring(0, 3);
                      openDiceTray({
                        initialDc: combat.savingThrowPrompt!.dc,
                        initialAttr: attr,
                        onRollComplete: (total) => submitSavingThrow(myParticipant!.id, total)
                      });
                    }}
                    className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all shadow-lg flex items-center justify-center gap-3"
                  >
                    <Dices size={20} /> Rolar Dados
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-4">
                  <Loader2 size={32} className="text-blue-400 animate-spin" />
                  <p className="text-[10px] font-black text-parchment/40 uppercase tracking-widest">Aguardando jogador...</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory/Defeat Overlay */}
      <AnimatePresence>
        {(combat.phase as string) === 'ended' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-[1000] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-8"
          >
            <div className="text-center space-y-8">
              <motion.div
                initial={{ scale: 0.5, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                className={cn(
                  "w-32 h-32 rounded-full mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)]",
                  (combat as any).result === 'victory' ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                )}
              >
                {(combat as any).result === 'victory' ? <Trophy size={64} /> : <Skull size={64} />}
              </motion.div>
              
              <div className="space-y-2">
                <h2 className={cn(
                  "text-7xl font-display font-black uppercase tracking-tighter",
                  (combat as any).result === 'victory' ? "text-emerald-400" : "text-red-400"
                )}>
                  {(combat as any).result === 'victory' ? "Vitória!" : "Derrota..."}
                </h2>
                <p className="text-parchment/60 font-black tracking-[0.3em] uppercase text-xs">
                  {(combat as any).result === 'victory' ? "Os monstros foram derrotados" : "O grupo sucumbiu ao mal"}
                </p>
              </div>

              {isDM && (
                <button
                  onClick={endCombat}
                  className="px-12 py-4 bg-gold text-midnight font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-xl"
                >
                  Encerrar Combate
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Initiative Phase Overlay (Existing) */}
      <AnimatePresence>
        {isInitiativePhase && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-8"
          >
            <div className="w-full max-w-4xl space-y-12">
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 rounded-full bg-gold/10 border-2 border-gold/40 flex items-center justify-center text-gold mx-auto shadow-[0_0_50px_rgba(212,175,55,0.2)]"
                >
                  <Dices size={48} />
                </motion.div>
                <h2 className="text-5xl font-display font-black text-parchment uppercase tracking-tighter">Rolem Iniciativa!</h2>
                <p className="text-gold font-black tracking-[0.4em] uppercase text-xs">O destino da batalha será decidido agora</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {combat.order.map(p => (
                  <div key={p.id} className="relative group">
                    <div className={cn(
                      "glass-card p-4 border transition-all duration-500 flex flex-col items-center gap-4",
                      combat.initiatives?.[p.id] !== undefined ? "border-emerald-500/40 bg-emerald-500/5" : "border-white/10"
                    )}>
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/5 relative">
                        <img src={p.imageUrl || null} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        {combat.initiatives?.[p.id] !== undefined && (
                          <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 size={24} className="text-emerald-400" />
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-black text-parchment uppercase truncate w-24">{p.name}</p>
                        <div className="mt-2">
                          {combat.initiatives?.[p.id] !== undefined ? (
                            <span className="text-2xl font-display font-black text-emerald-400">{combat.initiatives[p.id]}</span>
                          ) : (
                            <span className="text-[8px] font-black text-parchment/20 uppercase tracking-widest">Aguardando...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {isDM && (
                <div className="flex justify-center pt-8">
                  <button
                    onClick={finalizeInitiative}
                    className={cn(
                      "group relative px-12 py-6 rounded-[2rem] text-xl font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-[0_0_50px_rgba(212,175,55,0.4)] overflow-hidden",
                      allRolled ? "bg-gold text-midnight" : "bg-white/10 text-parchment/20 border border-white/10"
                    )}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <span className="relative z-10 flex items-center gap-4">
                      {allRolled ? "COMEÇAR COMBATE" : "FINALIZAR INICIATIVA"} <Play size={32} />
                    </span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CombatActionCard: React.FC<{ card: CombatCard; selected: boolean; onClick: () => void; quantity?: number; onHover?: () => void; hasSynergy?: boolean }> = ({ card, selected, onClick, quantity, onHover, hasSynergy }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotate({ x: y * 20, y: -x * 20 });
  };

  const handleMouseEnter = () => {
    onHover?.();
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <motion.button
      id={`card-${card.id}`}
      type="button"
      style={{
        perspective: 1000,
        rotateX: rotate.x,
        rotateY: rotate.y,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "relative w-40 h-56 rounded-xl border-2 transition-all overflow-hidden flex flex-col group cursor-pointer backdrop-blur-md",
        selected 
          ? "border-gold bg-gold/20 shadow-[0_0_40px_rgba(212,175,55,0.4)]" 
          : "border-white/10 bg-white/5 hover:border-white/30",
        card.tags.includes('Raro') && "shadow-[0_0_20px_rgba(168,85,247,0.3)] border-purple-500/30",
        card.id.startsWith('ghost-') && "border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]",
        quantity === 0 && "opacity-50 grayscale pointer-events-none"
      )}
    >
      {/* Ghostly Card Background */}
      {card.id.startsWith('ghost-') && (
        <div className="absolute inset-0 bg-cyan-900/10 mix-blend-overlay pointer-events-none" />
      )}
      {quantity === 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60">
          <span className="text-xl font-black text-red-500 uppercase tracking-tighter rotate-12 border-4 border-red-500 px-4 py-2">ESGOTADO</span>
        </div>
      )}
      {/* Card Header */}
      <div className="p-2 border-b border-white/5 bg-black/60 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-[8px] font-black text-gold uppercase tracking-widest">{card.type}</span>
          {hasSynergy && (
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Link size={10} className="text-gold" />
            </motion.div>
          )}
        </div>
        {card.cost && <span className="text-[8px] font-bold text-parchment/40">{card.cost}</span>}
      </div>

      {/* Card Content */}
      <div className="flex-1 p-3 flex flex-col gap-2 relative">
        <div className="flex justify-between items-start gap-2">
          <h4 className="text-[10px] font-black text-parchment uppercase leading-tight">{card.name}</h4>
          <div className="flex flex-col items-end gap-1">
            {card.damageType && (
              <span className="text-[7px] font-black text-red-400 bg-red-400/10 px-1 rounded border border-red-400/20 uppercase whitespace-nowrap">
                {card.damageType}
              </span>
            )}
            <div className="flex gap-1">
              {card.staminaCost && (
                <span className="text-[7px] font-black text-orange-400 bg-orange-400/10 px-1 rounded border border-orange-400/20 uppercase">
                  {card.staminaCost} ST
                </span>
              )}
              {card.manaCost && (
                <span className="text-[7px] font-black text-blue-400 bg-blue-400/10 px-1 rounded border border-blue-400/20 uppercase">
                  {card.manaCost} MP
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center relative">
          <motion.div
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            {card.category === 'attack' && <Sword size={32} className="text-red-400 opacity-40" />}
            {card.category === 'spell' && <Wand2 size={32} className="text-blue-400 opacity-40" />}
            {card.category === 'consumable' && <Package size={32} className="text-emerald-400 opacity-40" />}
          </motion.div>
          
          {card.synergy && (
            <div className="absolute -right-1 top-0 group/synergy">
              <Sparkles size={16} className="text-gold animate-pulse" />
              <div className="absolute left-full ml-2 top-0 w-32 p-2 bg-black/95 border border-gold/20 rounded text-[7px] text-gold opacity-0 group-hover/synergy:opacity-100 transition-opacity z-50 backdrop-blur-xl">
                <p className="font-black uppercase mb-1">Sinergia: {card.synergy.tag}</p>
                <p className="text-parchment/60">{card.synergy.description}</p>
              </div>
            </div>
          )}
        </div>
        <p className="text-[8px] text-parchment/60 leading-tight line-clamp-3">{card.effect}</p>
      </div>

      {/* Quantity Counter */}
      {quantity !== undefined && (
        <div className="absolute bottom-10 right-2 bg-black/80 border border-white/10 rounded px-1.5 py-0.5">
          <span className="text-[8px] font-black text-gold">x{quantity}</span>
        </div>
      )}

      {/* Card Footer */}
      <div className="p-2 bg-black/60 flex flex-wrap gap-1">
        {card.keywords?.map(kw => (
          <span key={kw} className="text-[6px] font-black px-1 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-blue-300 uppercase flex items-center gap-0.5">
            <Zap size={6} /> {kw}
          </span>
        ))}
        {card.tags.map(tag => (
          <span key={tag} className="text-[6px] font-bold px-1 py-0.5 bg-white/10 rounded text-parchment/60 uppercase">{tag}</span>
        ))}
      </div>

      {selected && (
        <div className="absolute inset-0 bg-gold/10 pointer-events-none animate-pulse" />
      )}
      
      {/* Shimmer Effect */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"
      />
    </motion.button>
  );
};

const LoRCard: React.FC<{ 
  participant: any; 
  isCurrentTurn: boolean; 
  onClick: () => void;
  isTarget?: boolean;
  isSelected?: boolean;
  isHealing?: boolean;
}> = ({ participant, isCurrentTurn, onClick, isTarget, isSelected, isHealing }) => {
  const hpPercent = (participant.hp.current / (participant.hp.max || 1)) * 100;
  const isDead = participant.hp.current <= 0;
  const isEthereal = participant.conditions?.includes('Etéreo');
  const isGhost = participant.monsterType === 'Undead' && participant.name.toLowerCase().includes('fantasma');
  const isPossessed = participant.conditions?.includes('Possuído');
  
  return (
    <motion.div
      id={`participant-${participant.id}`}
      layout
      whileHover={isDead ? {} : { y: -5, scale: 1.05 }}
      onClick={isDead ? undefined : onClick}
      animate={{
        opacity: isDead ? 0.5 : (isEthereal ? 0.4 : (isSelected ? 1 : 0.8)),
        filter: isDead ? 'grayscale(1) brightness(0.5)' : (isEthereal ? 'blur(1px) brightness(1.2)' : 'none'),
        boxShadow: isHealing ? [
          "0 0 0px rgba(16, 185, 129, 0)",
          "0 0 40px rgba(16, 185, 129, 0.8)",
          "0 0 0px rgba(16, 185, 129, 0)"
        ] : (isPossessed ? [
          "0 0 10px rgba(59, 130, 246, 0.3)",
          "0 0 30px rgba(59, 130, 246, 0.6)",
          "0 0 10px rgba(59, 130, 246, 0.3)"
        ] : (isGhost ? "0 0 20px rgba(103, 232, 249, 0.3)" : "none")),
        scale: isDead ? 0.9 : (isPossessed ? [1, 1.02, 1] : (isCurrentTurn ? 1.1 : 1))
      }}
      transition={isPossessed ? { duration: 2, repeat: Infinity } : {}}
      className={cn(
        "relative w-36 h-52 rounded-3xl border-2 transition-all cursor-pointer group overflow-hidden",
        isCurrentTurn ? "border-gold shadow-[0_0_40px_rgba(212,175,55,0.5)] z-20" : "border-white/10 hover:border-white/30",
        isTarget ? "border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)] scale-105" : "",
        isHealing && "border-emerald-500 z-30",
        isGhost && "border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.2)]",
        isPossessed && "border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)]",
        isDead && "border-red-900/50 cursor-not-allowed"
      )}
    >
      {/* Targeting Reticle */}
      {isTarget && (
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 z-40 border-4 border-dashed border-red-500/60 rounded-3xl scale-110 pointer-events-none"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white p-1 rounded-full">
            <Target size={16} />
          </div>
        </motion.div>
      )}

      {/* Dead Overlay */}
      {isDead && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <Skull size={48} className="text-red-500/60 mb-2" />
          <span className="text-[10px] font-black text-red-500/60 uppercase tracking-[0.3em]">Morto</span>
        </div>
      )}
      {/* Possession Glow Overlay */}
      {isPossessed && (
        <motion.div 
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-blue-500/20 mix-blend-overlay z-10"
        />
      )}
      {/* Ghostly Background Aura */}
      {isGhost && (
        <motion.div 
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-cyan-500/10 mix-blend-screen"
        />
      )}

      {/* Status Effects (Top Right) */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
        {participant.conditions?.map((cond: string, idx: number) => (
          <motion.div 
            key={idx}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 rounded-lg bg-black/80 border border-white/20 flex items-center justify-center text-parchment group/cond relative"
          >
            {cond === 'Queimando' && <Flame size={12} className="text-orange-500" />}
            {cond === 'Sangrando' && <Skull size={12} className="text-red-600" />}
            {cond === 'Silenciado' && <Zap size={12} className="text-blue-400" />}
            {cond === 'Etéreo' && <Loader2 size={12} className="text-cyan-300 animate-spin-slow" />}
            {cond === 'Atordoado' && <Zap size={12} className="text-yellow-400 animate-pulse" />}
            {!['Queimando', 'Sangrando', 'Silenciado', 'Etéreo', 'Atordoado'].includes(cond) && <Info size={12} className="text-gold" />}
            
            <div className="absolute right-full mr-2 top-0 w-32 p-2 bg-black/95 border border-white/10 rounded text-[7px] text-parchment opacity-0 group-hover/cond:opacity-100 transition-opacity z-50 backdrop-blur-xl pointer-events-none">
              <p className="font-black uppercase mb-1 text-gold">{cond}</p>
              <p className="text-parchment/60">Efeito de status ativo no personagem.</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Character Image */}
      <div className={cn("absolute inset-0 transition-opacity duration-1000", isEthereal ? "opacity-30" : "opacity-100")}>
        <img 
          src={participant.imageUrl || null} 
          alt="" 
          referrerPolicy="no-referrer"
          className={cn(
            "w-full h-full object-cover",
            isGhost && "hue-rotate-180 brightness-150 saturate-0 contrast-125 mix-blend-screen"
          )} 
        />
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent",
          isGhost && "mix-blend-overlay bg-cyan-900/40"
        )} />
      </div>

      {/* Ghostly Particles */}
      {isGhost && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [-20, -120],
                x: [0, (i - 4) * 8],
                opacity: [0, 0.6, 0],
                scale: [0.5, 2],
                rotate: [0, 180]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "linear"
              }}
              className="absolute bottom-0 left-1/2 w-1 h-1 bg-cyan-300/40 rounded-full blur-[2px]"
            />
          ))}
        </div>
      )}

      {/* Keywords Overlay (Top Left) */}
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
        {participant.keywords?.map((kw: string, idx: number) => (
          <div 
            key={idx} 
            className="w-5 h-5 rounded-full bg-black/60 border border-gold/40 flex items-center justify-center text-gold group/passive relative"
          >
            <Zap size={10} />
            <div className="absolute left-full ml-2 top-0 w-32 p-2 bg-black/95 border border-gold/20 rounded text-[7px] text-gold opacity-0 group-hover/passive:opacity-100 transition-opacity z-50 backdrop-blur-xl pointer-events-none">
              <p className="font-black uppercase mb-1">Palavra-Chave</p>
              <p className="text-parchment/60">{kw}</p>
            </div>
          </div>
        ))}
      </div>

      {/* HP Bar (Vertical on the side like LoR) */}
      <div className="absolute left-0 bottom-0 w-2 h-full bg-black/40 border-r border-white/5">
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: `${hpPercent}%` }}
          className={cn(
            "w-full absolute bottom-0 transition-all",
            hpPercent > 50 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : 
            hpPercent > 20 ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : 
            "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
          )}
        >
          <div className="w-full h-full bg-gradient-to-t from-white/20 to-transparent" />
        </motion.div>
      </div>

      {/* Stats Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent z-20">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black text-parchment uppercase tracking-tighter truncate flex-1">{participant.name}</span>
            <span className="text-[8px] font-bold text-parchment/40 uppercase shrink-0">{participant.charClass || participant.monsterType}</span>
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <div className="flex items-center gap-1 bg-red-500/20 px-2 py-0.5 rounded-full border border-red-500/30">
              <Heart size={10} className="text-red-400" />
              <span className="text-[12px] font-black text-parchment">{participant.hp.current}</span>
            </div>
            <div className="flex items-center gap-1 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">
              <Shield size={10} className="text-blue-400" />
              <span className="text-[12px] font-black text-parchment">{participant.ac}</span>
            </div>
          </div>

          {/* Stamina & Mana Bars */}
          <div className="flex flex-col gap-1 mt-1">
            {participant.stamina && (
              <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(participant.stamina.current / participant.stamina.max) * 100}%` }}
                  className="h-full bg-orange-500"
                />
              </div>
            )}
            {participant.mana && (
              <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(participant.mana.current / participant.mana.max) * 100}%` }}
                  className="h-full bg-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
          <CheckCircle2 size={14} className="text-white" />
        </div>
      )}

      {/* Target Indicator */}
      {isTarget && (
        <div className="absolute inset-0 border-4 border-red-500 animate-pulse rounded-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Target size={48} className="text-red-500 opacity-40" />
          </div>
        </div>
      )}

      {/* Current Turn Indicator */}
      {isCurrentTurn && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <ChevronRight size={24} className="text-gold rotate-90" />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
