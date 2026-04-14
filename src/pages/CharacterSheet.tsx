import React, { useState } from "react";
import { 
  useCharacter, 
  Character
} from "../contexts/CharacterContext";
import { 
  calculateAC, 
  calculateInitiative, 
  calculatePassivePerception,
  calculateModifier, 
  SKILLS, 
  CLASSES, 
  RACES, 
  REGIONS 
} from "../data/rules";
import { motion, AnimatePresence } from "motion/react";
import { useSound } from "../hooks/useSound";
import { 
  Shield, 
  Heart, 
  Zap, 
  Wind, 
  Eye, 
  Sword, 
  Book, 
  User as UserIcon, 
  Star,
  Sparkles,
  Plus,
  Minus,
  Save,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Camera,
  Palette,
  Trophy,
  Users
} from "lucide-react";
import { TOA_ACHIEVEMENTS } from "../data/achievements";
import { GameIcon } from "../components/GameIcon";
import { cn } from "../lib/utils";
import { RaceIcon } from "../components/RaceIcon";
import { HPBar } from "../components/HPBar";
import { MagicSchoolSymbol } from "../components/MagicSchoolSymbol";
import { toast } from "sonner";

export default function CharacterSheet() {
  const { 
    currentCharacter, 
    saveCharacter, 
    addXP, 
    longRest, 
    loading, 
    guilds,
    user,
    setFeaturedAchievements 
  } = useCharacter();
  const { playSound } = useSound();
  const isOwner = currentCharacter?.userId === user?.uid;
  const [activeTab, setActiveTab] = useState<'stats' | 'combat' | 'features' | 'identity' | 'profile'>(
    currentCharacter?.userId === user?.uid ? 'stats' : 'profile'
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editedChar, setEditedChar] = useState<Character | null>(currentCharacter);
  const [showImageUrlModal, setShowImageUrlModal] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState("");

  React.useEffect(() => {
    if (currentCharacter) {
      setEditedChar(currentCharacter);
      if (currentCharacter.userId !== user?.uid) {
        setActiveTab('profile');
      }
    }
  }, [currentCharacter, user?.uid]);

  if (!currentCharacter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <UserIcon className="w-12 h-12 text-gold/40" />
        </div>
        <h2 className="text-3xl font-display font-black text-gold mb-2">No Adventurer Selected</h2>
        <p className="text-parchment/60 max-w-md">
          Please create or select a character from the dashboard to view their detailed sheet.
        </p>
      </div>
    );
  }

  const charToDisplay = isEditing && editedChar ? editedChar : currentCharacter;
  
  // Dynamic combat stats for immediate feedback
  const ac = calculateAC(charToDisplay);
  const initiative = calculateInitiative(charToDisplay);
  const passivePerception = calculatePassivePerception(charToDisplay);

  const handleSave = async () => {
    if (editedChar) {
      await saveCharacter(editedChar);
      setIsEditing(false);
      toast.success("Perfil atualizado com sucesso!");
    }
  };

  const toggleEditing = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
      setEditedChar(currentCharacter);
    }
  };

  const updateAttribute = (attr: string, value: number) => {
    if (!editedChar) return;
    setEditedChar({
      ...editedChar,
      attributes: {
        ...editedChar.attributes,
        [attr]: Math.max(1, Math.min(30, value))
      }
    });
  };

  const toggleSkill = (skillName: string) => {
    if (!editedChar) return;
    setEditedChar({
      ...editedChar,
      skills: {
        ...editedChar.skills,
        [skillName]: !editedChar.skills[skillName]
      }
    });
  };

  const updateHP = async (delta: number) => {
    if (!currentCharacter) return;
    const newHP = Math.max(0, Math.min(currentCharacter.hp?.max || 10, (currentCharacter.hp?.current || 0) + delta));
    await saveCharacter({ hp: { ...(currentCharacter.hp || { current: 10, max: 10 }), current: newHP } });
  };

  const updateSpellSlot = async (circle: string, delta: number) => {
    if (!currentCharacter || !currentCharacter.spellcasting?.slots) return;
    const slot = currentCharacter.spellcasting.slots[circle];
    if (!slot) return;
    
    const newCurrent = Math.max(0, Math.min(slot.max, slot.current + delta));
    await saveCharacter({
      spellcasting: {
        ...currentCharacter.spellcasting,
        slots: {
          ...currentCharacter.spellcasting.slots,
          [circle]: { ...slot, current: newCurrent }
        }
      }
    });
  };

  const StatCard = ({ label, value, ability }: { label: string, value: number, ability: string }) => {
    const safeValue = isNaN(value) ? 10 : value;
    const mod = calculateModifier(safeValue);
    const modDisplay = mod >= 0 ? `+${mod}` : mod;
    
    return (
      <motion.div 
        whileHover={{ y: -8, scale: 1.02 }}
        className="relative group h-full"
      >
        <div className="absolute inset-0 bg-gold/5 rounded-[1.5rem] sm:rounded-[2.5rem] blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
        <div className="relative bento-item h-full items-center justify-center overflow-hidden border-white/5 group-hover:border-gold/20 group-hover:bg-white/[0.03] transition-all duration-500 p-4 sm:p-6">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute -bottom-10 -right-10 w-24 sm:w-32 h-24 sm:h-32 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-all duration-700" />
          
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.4em] text-gold/40 mb-2 sm:mb-4 relative z-10">{label}</span>
          
          {isEditing ? (
            <div className="flex items-center gap-3 sm:gap-5 mb-3 sm:mb-5 relative z-10">
              <button 
                onClick={() => updateAttribute(label, safeValue - 1)}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gold hover:bg-gold/10 hover:border-gold/30 transition-all active:scale-90"
              >
                <Minus size={14} className="sm:w-4 sm:h-4" strokeWidth={3} />
              </button>
              <div className="text-3xl sm:text-5xl font-display font-black text-parchment w-12 sm:w-16 text-center drop-shadow-2xl">{safeValue}</div>
              <button 
                onClick={() => updateAttribute(label, safeValue + 1)}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gold hover:bg-gold/10 hover:border-gold/30 transition-all active:scale-90"
              >
                <Plus size={14} className="sm:w-4 sm:h-4" strokeWidth={3} />
              </button>
            </div>
          ) : (
            <div className="text-4xl sm:text-6xl font-display font-black text-parchment mb-3 sm:mb-5 drop-shadow-2xl tracking-tighter relative z-10">{safeValue}</div>
          )}
          
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/2 rounded-xl sm:rounded-[1.25rem] flex items-center justify-center border border-white/5 shadow-inner group-hover:border-gold/20 transition-all duration-500 relative z-10">
            <span className="text-xl sm:text-2xl font-display font-black text-gold drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">{modDisplay}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  const CombatStat = ({ icon: Icon, label, value, subValue, color = "gold" }: any) => (
    <div className="bento-item flex-row items-center gap-4 sm:gap-8 group relative overflow-hidden border-white/5 hover:border-gold/20 p-4 sm:p-6">
      <div className={cn("w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center border transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 shadow-2xl shrink-0", {
        "bg-gold/5 border-gold/20 text-gold": color === "gold",
        "bg-red-500/5 border-red-500/20 text-red-500": color === "red",
        "bg-blue-500/5 border-blue-500/20 text-blue-500": color === "blue",
        "bg-emerald-500/5 border-emerald-500/20 text-emerald-500": color === "emerald",
      })}>
        <Icon className="w-7 h-7 sm:w-10 sm:h-10" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-parchment/20 mb-1 sm:mb-2 truncate">{label}</div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            {label === "Hit Points" ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-5xl font-display font-black text-parchment leading-none tracking-tighter">{charToDisplay.hp.current}</span>
                  <span className="text-sm sm:text-xl font-display font-black text-parchment/20">/ {charToDisplay.hp.max}</span>
                </div>
                <HPBar 
                  current={charToDisplay.hp.current} 
                  max={charToDisplay.hp.max} 
                  showText={false}
                  className="mb-1 sm:mb-2"
                />
              </div>
            ) : (
              <div className="text-2xl sm:text-4xl font-display font-black text-parchment leading-none tracking-tighter truncate">{value}</div>
            )}
          </div>
          {isOwner && label === "Hit Points" && (
            <div className="flex gap-2">
              <button 
                onClick={() => updateHP(-1)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 flex items-center justify-center transition-all active:scale-90"
              >
                <Minus size={12} className="sm:w-3.5 sm:h-3.5" strokeWidth={3} />
              </button>
              <button 
                onClick={() => updateHP(1)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 flex items-center justify-center transition-all active:scale-90"
              >
                <Plus size={12} className="sm:w-3.5 sm:h-3.5" strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
        {subValue && <div className="text-[8px] sm:text-[10px] text-parchment/20 mt-2 sm:mt-3 font-black uppercase tracking-widest italic truncate">{subValue}</div>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-10 pb-20 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Header Section */}
      <div className="relative overflow-hidden liquid-glass p-6 sm:p-12 border-white/5 group">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-gold/10 to-transparent pointer-events-none opacity-50 transition-opacity duration-1000 group-hover:opacity-70" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row gap-8 sm:gap-12 items-center md:items-start relative z-10">
          <div className="relative group">
            <div className="absolute -inset-8 bg-gold/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000" />
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 border-white/10 p-2 bg-white/2 relative overflow-hidden shadow-2xl transform group-hover:scale-105 transition-transform duration-700">
              {currentCharacter.appearance ? (
                <img 
                  src={currentCharacter.appearance} 
                  alt={currentCharacter.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <RaceIcon 
                  race={currentCharacter.race} 
                  className="w-full h-full rounded-full" 
                />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gold rounded-[1.25rem] flex items-center justify-center border-4 border-midnight text-midnight font-black text-lg shadow-[0_10px_20px_rgba(212,175,55,0.4)]">
              {currentCharacter.level}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4 sm:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 sm:gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-6">
                <h1 className="text-4xl sm:text-6xl font-display font-black text-parchment tracking-tighter uppercase drop-shadow-2xl">
                  {currentCharacter.name}
                </h1>
                {currentCharacter.magicSchool && currentCharacter.profile?.showMagicSchoolSymbol && (
                  <MagicSchoolSymbol 
                    school={currentCharacter.magicSchool} 
                    size={48} 
                    className="hidden sm:flex"
                  />
                )}
                <div className="flex items-center gap-2 mb-1">
                  {currentCharacter.profile?.featuredAchievements?.map(achId => {
                    const ach = TOA_ACHIEVEMENTS.find(a => a.id === achId);
                    if (!ach) return null;
                    return (
                      <div 
                        key={ach.id} 
                        className={cn(
                          "w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center liquid-glass border border-white/10 shadow-xl group relative transition-all duration-500 hover:scale-110 hover:border-gold/40",
                          ach.tier === 'platinum' && "border-purple-500/30",
                          ach.tier === 'gold' && "border-gold/30"
                        )}
                        title={`${ach.name} (${ach.tier})`}
                      >
                        <GameIcon icon={ach.icon} tier={ach.tier} unlocked={true} className="w-6 h-6 sm:w-7 sm:h-7" />
                        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-2 bg-midnight/95 border border-white/10 rounded-xl text-[9px] font-black text-gold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-2xl z-50 whitespace-nowrap">
                          {ach.name}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-midnight/95" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3">
                <span className="px-3 sm:px-5 py-1.5 sm:py-2 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-gold shadow-inner">
                  {currentCharacter.race}
                </span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-parchment/20" />
                <span className="px-3 sm:px-5 py-1.5 sm:py-2 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-gold shadow-inner">
                  {currentCharacter.charClass} {currentCharacter.subclass && `(${currentCharacter.subclass})`}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 sm:gap-12 pt-2 sm:pt-4">
              <div className="flex flex-col gap-2 sm:gap-3 w-full sm:w-auto">
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-parchment/20">Experience</span>
                <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-6">
                  <div className="w-40 sm:w-56 h-2 sm:h-2.5 bg-white/2 rounded-full overflow-hidden border border-white/5 p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentCharacter.xp / 355000) * 100}%` }}
                      className="h-full bg-gradient-to-r from-gold to-gold-bright rounded-full shadow-[0_0_20px_rgba(212,175,55,0.5)]"
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs font-black text-gold tracking-[0.1em]">{currentCharacter.xp} XP</span>
                  {isOwner && (
                    <button 
                      onClick={() => addXP(100)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-gold hover:bg-gold/10 hover:border-gold/30 flex items-center justify-center transition-all active:scale-90"
                    >
                      <Plus size={12} className="sm:w-3.5 sm:h-3.5" strokeWidth={3} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="hidden sm:block h-14 w-px bg-white/5" />
              
              <div className="flex flex-col gap-1 items-center sm:items-start">
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-parchment/20">Proficiency</span>
                <span className="text-2xl sm:text-3xl font-display font-black text-parchment tracking-tighter">+{currentCharacter.proficiencyBonus || 0}</span>
              </div>

              <div className="hidden sm:block h-14 w-px bg-white/5" />

              <div className="flex flex-col gap-1 items-center sm:items-start">
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-parchment/20">Speed</span>
                <span className="text-2xl sm:text-3xl font-display font-black text-parchment tracking-tighter">{currentCharacter.speed || 30} ft</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            {isOwner && (
              <button 
                onClick={toggleEditing}
                className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 text-gold hover:bg-gold/10 hover:border-gold/30 transition-all duration-500 flex items-center justify-center shadow-xl group"
              >
                {isEditing ? <Save className="w-8 h-8 group-hover:scale-110 transition-transform" /> : <Book className="w-8 h-8 group-hover:scale-110 transition-transform" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs - Only show if owner */}
      {isOwner && (
        <div className="flex flex-wrap gap-2 sm:gap-3 p-2 liquid-glass w-full sm:w-fit mx-auto md:mx-0 border-white/5 justify-center sm:justify-start">
          {[
            { id: 'stats', label: 'Stats', icon: Star },
            { id: 'combat', label: 'Combat', icon: Sword },
            { id: 'features', label: 'Features', icon: Zap },
            { id: 'identity', label: 'Identity', icon: UserIcon },
            { id: 'profile', label: 'Profile', icon: Palette },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                playSound('click');
              }}
              className={cn(
                "flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-2.5 sm:py-3.5 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 rounded-xl sm:rounded-2xl relative",
                activeTab === tab.id 
                  ? "text-midnight bg-gold shadow-[0_10px_20px_rgba(212,175,55,0.4)] scale-105" 
                  : "text-parchment/20 hover:text-parchment hover:bg-white/5"
              )}
            >
              <tab.icon className={cn("w-3.5 h-3.5 sm:w-4 h-4", activeTab === tab.id ? "text-midnight" : "text-parchment/40")} />
              <span className={cn(activeTab === tab.id ? "block" : "hidden sm:block")}>{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Attributes */}
              <div className="lg:col-span-4 grid grid-cols-2 gap-4">
                {Object.entries(charToDisplay.attributes).map(([attr, val]) => (
                  <StatCard key={attr} label={attr} value={val} ability={attr} />
                ))}
              </div>

              {/* Skills */}
              <div className="lg:col-span-8 bg-midnight/40 border border-gold/10 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-display font-black text-gold uppercase tracking-widest">Skills & Proficiencies</h3>
                  <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-parchment/40">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gold" /> Proficient</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-midnight border border-gold/20" /> Standard</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  {SKILLS.map((skill) => {
                    const isProficient = currentCharacter.skills[skill.name];
                    const mod = calculateModifier(currentCharacter.attributes[skill.ability as keyof typeof currentCharacter.attributes]);
                    const total = mod + (isProficient ? currentCharacter.proficiencyBonus : 0);
                    
                    return (
                    <div 
                      key={skill.name}
                      onClick={() => isEditing && toggleSkill(skill.name)}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg transition-colors",
                        isProficient ? "bg-gold/5" : "hover:bg-white/5",
                        isEditing && "cursor-pointer"
                      )}
                    >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-4 h-4 rounded-full border flex items-center justify-center",
                            isProficient ? "bg-gold border-gold" : "border-gold/20"
                          )}>
                            {isProficient && <div className="w-1.5 h-1.5 bg-midnight rounded-full" />}
                          </div>
                          <span className={cn(
                            "text-sm font-medium",
                            isProficient ? "text-parchment" : "text-parchment/60"
                          )}>{skill.name}</span>
                          <span className="text-[10px] uppercase tracking-widest text-parchment/20">({skill.ability.substring(0, 3)})</span>
                        </div>
                        <span className={cn(
                          "text-sm font-bold",
                          isProficient ? "text-gold" : "text-parchment/40"
                        )}>{total >= 0 ? `+${total}` : total}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'combat' && (
            <div className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <CombatStat 
                icon={Shield} 
                label="Armor Class" 
                value={ac} 
                subValue="10 + Dex Mod"
              />
              <CombatStat 
                icon={Heart} 
                label="Hit Points" 
                value={`${charToDisplay.hp?.current || 0}/${charToDisplay.hp?.max || 0}`} 
                subValue={charToDisplay.hp?.temp && charToDisplay.hp.temp > 0 ? `+${charToDisplay.hp.temp} Temp` : "Healthy"}
                color="red"
              />
              <CombatStat 
                icon={Zap} 
                label="Initiative" 
                value={initiative >= 0 ? `+${initiative}` : initiative} 
                subValue="Dex Mod"
                color="emerald"
              />
              <CombatStat 
                icon={Eye} 
                label="Passive Perception" 
                value={passivePerception} 
                subValue="10 + Wis Mod + Prof"
                color="blue"
              />

              {currentCharacter.spellcasting && (
                <>
                  <CombatStat 
                    icon={Sparkles} 
                    label="Spell Save DC" 
                    value={currentCharacter.spellcasting.saveDC} 
                    subValue={`${currentCharacter.spellcasting.ability} Based`}
                    color="gold"
                  />
                  <CombatStat 
                    icon={Zap} 
                    label="Spell Attack" 
                    value={currentCharacter.spellcasting.attackBonus >= 0 ? `+${currentCharacter.spellcasting.attackBonus}` : currentCharacter.spellcasting.attackBonus} 
                    subValue="To Hit"
                    color="emerald"
                  />
                </>
              )}
              </div>
              
              <div className="md:col-span-2 lg:col-span-4 mt-4 sm:mt-8 liquid-glass border-gold/10 p-6 sm:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gold/5 to-transparent pointer-events-none" />
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 sm:mb-10 relative z-10 gap-6">
                  <div className="space-y-2">
                    <h3 className="text-3xl sm:text-4xl font-display font-black text-gold uppercase tracking-tighter drop-shadow-2xl">Círculos de Magia</h3>
                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-parchment/20 italic">A essência do seu poder arcano</p>
                  </div>
                  {isOwner && (
                    <button 
                      onClick={longRest}
                      className="w-full md:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gold text-midnight text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_10px_20px_rgba(212,175,55,0.3)] flex items-center justify-center gap-3"
                    >
                      <RefreshCw size={16} strokeWidth={3} />
                      Descanso Longo
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 relative z-10">
                  {currentCharacter.spellcasting?.slots && Object.entries(currentCharacter.spellcasting.slots).sort(([a], [b]) => Number(a) - Number(b)).map(([circle, slot]) => (
                    <div key={circle} className="group relative">
                      <div className="absolute inset-0 bg-gold/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className="relative flex flex-col items-center space-y-6">
                        <div className="relative w-28 h-28 flex items-center justify-center">
                          {/* Magic Circle SVG Background */}
                          <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(212,175,55,0.2)]" viewBox="0 0 100 100">
                            <circle 
                              cx="50" cy="50" r="45" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="1" 
                              className="text-white/5"
                            />
                            <circle 
                              cx="50" cy="50" r="45" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="3" 
                              strokeDasharray={`${(slot.current / slot.max) * 283} 283`}
                              className="text-gold transition-all duration-1000 ease-out"
                            />
                            {/* Decorative inner circles */}
                            <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold/20" strokeDasharray="2 4" />
                            <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold/10" />
                          </svg>
                          
                          <div className="flex flex-col items-center">
                            <span className="text-3xl font-display font-black text-parchment drop-shadow-2xl">{slot.current}</span>
                            <span className="text-[9px] font-black text-gold/40 uppercase tracking-widest">/ {slot.max}</span>
                          </div>
                        </div>

                        <div className="text-center space-y-3">
                          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/60 block">{circle}º Círculo</span>
                          {isOwner && (
                            <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 shadow-inner">
                              <button 
                                onClick={() => updateSpellSlot(circle, -1)}
                                className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-midnight transition-all flex items-center justify-center"
                              >
                                <Minus size={14} strokeWidth={3} />
                              </button>
                              <button 
                                onClick={() => updateSpellSlot(circle, 1)}
                                className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-midnight transition-all flex items-center justify-center"
                              >
                                <Plus size={14} strokeWidth={3} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!currentCharacter.spellcasting?.slots || Object.keys(currentCharacter.spellcasting.slots).length === 0) && (
                    <div className="col-span-full py-8 text-center text-parchment/40 italic border border-dashed border-gold/10 rounded-2xl">
                      No spell slots available for this level/class.
                    </div>
                  )}
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <h3 className="text-xl sm:text-2xl font-display font-black text-gold uppercase tracking-widest">Combat Actions</h3>
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 border border-gold/10 rounded-xl sm:rounded-2xl bg-midnight/20 flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gold/10 rounded-lg sm:rounded-xl flex items-center justify-center text-gold">
                            <Sword size={18} className="sm:w-6 sm:h-6" />
                          </div>
                          <div>
                            <div className="text-sm sm:text-base font-bold text-parchment">Unarmed Strike</div>
                            <div className="text-[10px] sm:text-xs text-parchment/40">Melee Attack</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-base sm:text-lg font-bold text-gold">+2 to hit</div>
                          <div className="text-[10px] sm:text-xs text-parchment/60">1 bludgeoning</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:gap-4">
                    <h3 className="text-xl sm:text-2xl font-display font-black text-gold uppercase tracking-widest">Prepared Spells</h3>
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      {currentCharacter.spellcasting?.spells.filter((s: any) => 
                        currentCharacter.spellcasting?.type === 'Known' || 
                        currentCharacter.spellcasting?.prepared?.includes(s.id)
                      ).map((spell: any) => (
                        <div key={spell.id} className="p-3 sm:p-4 border border-gold/10 rounded-xl sm:rounded-2xl bg-midnight/20 flex items-center justify-between">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gold/10 rounded-lg sm:rounded-xl flex items-center justify-center text-gold">
                              <Sparkles size={18} className="sm:w-6 sm:h-6" />
                            </div>
                            <div>
                              <div className="text-sm sm:text-base font-bold text-parchment">{spell.name}</div>
                              <div className="text-[10px] sm:text-xs text-parchment/40">Level {spell.level} {spell.school}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] sm:text-xs text-parchment/60">{spell.range}</div>
                            <div className="text-[8px] sm:text-[10px] text-gold uppercase font-bold">{spell.castingTime}</div>
                          </div>
                        </div>
                      ))}
                      {(!currentCharacter.spellcasting?.spells || currentCharacter.spellcasting.spells.length === 0) && (
                        <div className="p-4 text-center text-parchment/40 italic">No spells learned or prepared.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-xl sm:text-2xl font-display font-black text-gold uppercase tracking-widest">Racial Traits</h3>
                <div className="space-y-3 sm:space-y-4">
                  {(RACES[currentCharacter.race as keyof typeof RACES]?.traits || []).map((trait: string) => (
                    <div key={trait} className="p-3 sm:p-4 bg-midnight/40 border border-gold/10 rounded-xl sm:rounded-2xl">
                      <div className="text-sm sm:text-base font-bold text-gold mb-1">{trait}</div>
                      <div className="text-[10px] sm:text-sm text-parchment/60 leading-relaxed">
                        {(RACES[currentCharacter.race as keyof typeof RACES] as any)?.traitDescriptions?.[trait] || `Official PHB trait for ${currentCharacter.race}.`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-xl sm:text-2xl font-display font-black text-gold uppercase tracking-widest">Class Features</h3>
                <div className="p-6 sm:p-8 bg-midnight/40 border border-gold/10 rounded-2xl sm:rounded-3xl text-center">
                  <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-gold/20 mx-auto mb-4" />
                  <p className="text-xs sm:text-sm text-parchment/40 italic">
                    Level up to unlock more powerful class features.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'identity' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
              <div className="lg:col-span-4 space-y-4 sm:space-y-6">
                <div className="bg-midnight/40 border border-gold/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                  <h4 className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-gold/60 mb-2 sm:mb-4">Região de Origem</h4>
                  {isEditing ? (
                    <select 
                      value={editedChar?.region || ''}
                      onChange={(e) => setEditedChar(prev => prev ? { ...prev, region: e.target.value } : null)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-sm text-parchment outline-none focus:border-gold/40"
                    >
                      <option value="">Selecione uma região</option>
                      {REGIONS.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-lg sm:text-xl font-display font-black text-parchment uppercase tracking-tighter">
                      {REGIONS.find(r => r.id === charToDisplay.region)?.name || charToDisplay.region || "Desconhecida"}
                    </div>
                  )}
                </div>

                <div className="bg-midnight/40 border border-gold/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                  <h4 className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-gold/60 mb-2 sm:mb-4">Alignment</h4>
                  {isEditing ? (
                    <select 
                      value={editedChar?.alignment || ''}
                      onChange={(e) => setEditedChar(prev => prev ? { ...prev, alignment: e.target.value } : null)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-sm text-parchment outline-none focus:border-gold/40"
                    >
                      {['Leal e Bom', 'Neutro e Bom', 'Caótico e Bom', 'Leal e Neutro', 'Neutro Verdadeiro', 'Caótico e Neutro', 'Leal e Mau', 'Neutro e Mau', 'Caótico e Mau'].map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-lg sm:text-xl font-display font-black text-parchment uppercase tracking-tighter">
                      {charToDisplay.alignment || "True Neutral"}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-midnight/40 border border-gold/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                    <h4 className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-gold/60 mb-2 sm:mb-4">Size</h4>
                    <div className="text-lg sm:text-xl font-display font-black text-parchment uppercase tracking-tighter">
                      {RACES[currentCharacter.race as keyof typeof RACES]?.size || "Médio"}
                    </div>
                  </div>
                  <div className="bg-midnight/40 border border-gold/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                    <h4 className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-gold/60 mb-2 sm:mb-4">Speed</h4>
                    <div className="text-lg sm:text-xl font-display font-black text-parchment uppercase tracking-tighter">
                      {currentCharacter.speed || RACES[currentCharacter.race as keyof typeof RACES]?.speed || 30} ft
                    </div>
                  </div>
                </div>
                
                <div className="bg-midnight/40 border border-gold/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                  <h4 className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-gold/60 mb-2 sm:mb-4">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {(currentCharacter.languages || ["Comum"]).map(lang => (
                      <span key={lang} className="px-3 py-1 bg-gold/10 border border-gold/20 rounded-full text-[10px] font-bold text-gold">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4 sm:space-y-6">
                <div className="bg-midnight/40 border border-gold/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                  <h4 className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-gold/60 mb-4 sm:mb-6">Personality & Background</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-4">
                      <div>
                        <div className="text-[10px] sm:text-xs font-bold text-gold mb-1">Traits</div>
                        <p className="text-xs sm:text-sm text-parchment/60 leading-relaxed italic">
                          "{currentCharacter.personality?.traits || "I've seen it all and nothing surprises me anymore."}"
                        </p>
                      </div>
                      <div>
                        <div className="text-[10px] sm:text-xs font-bold text-gold mb-1">Ideals</div>
                        <p className="text-xs sm:text-sm text-parchment/60 leading-relaxed italic">
                          "{currentCharacter.personality?.ideals || "Freedom. Everyone should be free to pursue their own destiny."}"
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-[10px] sm:text-xs font-bold text-gold mb-1">Bonds</div>
                        <p className="text-xs sm:text-sm text-parchment/60 leading-relaxed italic">
                          "{currentCharacter.personality?.bonds || "I would do anything for the members of my old troupe."}"
                        </p>
                      </div>
                      <div>
                        <div className="text-[10px] sm:text-xs font-bold text-gold mb-1">Flaws</div>
                        <p className="text-xs sm:text-sm text-parchment/60 leading-relaxed italic">
                          "{currentCharacter.personality?.flaws || "I can't resist a pretty face or a game of chance."}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-midnight/40 border border-gold/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                  <h4 className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-gold/60 mb-2 sm:mb-4">Backstory</h4>
                  {isEditing ? (
                    <textarea 
                      value={editedChar?.history || ''}
                      onChange={(e) => setEditedChar(prev => prev ? { ...prev, history: e.target.value } : null)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-parchment/80 min-h-[150px] outline-none focus:border-gold/40"
                      placeholder="A história de origem do seu personagem..."
                    />
                  ) : (
                    <p className="text-xs sm:text-sm text-parchment/60 leading-relaxed">
                      {charToDisplay.history || "An adventurer with a mysterious past, seeking glory and gold in the forgotten realms."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'profile' && (
            <div className="space-y-8 sm:space-y-12">
              <div className={cn(
                "relative min-h-[500px] sm:min-h-[600px] rounded-[2rem] sm:rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl transition-all duration-1000",
                charToDisplay.profile?.backgroundStyle === 'sunset' ? "bg-gradient-to-br from-orange-500/20 via-pink-500/20 to-purple-900/40" :
                charToDisplay.profile?.backgroundStyle === 'forest' ? "bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-slate-900/40" :
                charToDisplay.profile?.backgroundStyle === 'ocean' ? "bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-indigo-900/40" :
                "bg-gradient-to-br from-midnight via-slate-900 to-black"
              )}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-midnight/50 to-midnight" />
                </div>

                <div className="relative z-10 p-6 sm:p-12 h-full flex flex-col lg:flex-row gap-8 sm:gap-16">
                  {/* Character Image Section */}
                  <div className="lg:w-1/3 flex flex-col items-center gap-6 sm:gap-8">
                    <div className="relative group w-full max-w-[280px] sm:max-w-none">
                      <div className="absolute -inset-4 bg-gold/20 rounded-[2rem] sm:rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                      <div className="w-full sm:w-80 h-[400px] sm:h-[480px] rounded-[2rem] sm:rounded-[2.5rem] bg-midnight/60 border-2 border-white/10 overflow-hidden relative shadow-2xl group-hover:border-gold/40 transition-all duration-500 mx-auto">
                        <img 
                          src={charToDisplay.profile?.customImage || charToDisplay.appearance || `https://api.dicebear.com/7.x/avataaars/svg?seed=${charToDisplay.id}`} 
                          alt={charToDisplay.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-transparent to-transparent opacity-60" />
                        
                        {charToDisplay.magicSchool && charToDisplay.profile?.showMagicSchoolSymbol && (
                          <div className="absolute top-6 left-6 z-20">
                            <MagicSchoolSymbol 
                              school={charToDisplay.magicSchool} 
                              size={80} 
                              glow={true}
                            />
                          </div>
                        )}

                        {isEditing && (
                          <button 
                            onClick={() => {
                              setTempImageUrl(charToDisplay.profile?.customImage || "");
                              setShowImageUrlModal(true);
                            }}
                            className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 p-3 sm:p-4 bg-gold text-midnight rounded-xl sm:rounded-2xl shadow-xl hover:scale-110 transition-all active:scale-90 flex items-center gap-2 group/btn"
                          >
                            <Camera size={18} className="sm:w-5 sm:h-5" strokeWidth={3} />
                            <span className="max-w-0 overflow-hidden group-hover/btn:max-w-[100px] transition-all duration-500 text-[8px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Alterar Foto</span>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-center space-y-2">
                      <h2 className="text-3xl sm:text-5xl font-display font-black text-white uppercase tracking-tighter italic drop-shadow-2xl">{charToDisplay.name}</h2>
                      <p className="text-gold font-black uppercase tracking-[0.4em] text-[8px] sm:text-[10px] opacity-60">
                        {charToDisplay.race} • {charToDisplay.charClass} Nível {charToDisplay.level}
                        {charToDisplay.profile?.showRegion && charToDisplay.region && (
                          <> • {REGIONS.find(r => r.id === charToDisplay.region)?.name || charToDisplay.region}</>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Profile Details Section */}
                  <div className="flex-1 space-y-8 sm:space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                      {/* Bio / Description */}
                      <div className="glass-card p-6 sm:p-8 space-y-4 border-white/5 hover:border-gold/20 transition-all">
                        <h3 className="text-[8px] sm:text-[10px] font-black text-gold uppercase tracking-[0.3em] flex items-center gap-3">
                          <Book size={14} />
                          História & Biografia
                        </h3>
                        {isEditing ? (
                          <textarea 
                            value={editedChar?.profile?.bio || ''}
                            onChange={(e) => setEditedChar(prev => prev ? { ...prev, profile: { ...prev.profile, bio: e.target.value } } : null)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 text-[10px] sm:text-xs text-parchment/80 min-h-[100px] sm:min-h-[120px] focus:border-gold/40 outline-none"
                            placeholder="Conte a história do seu herói..."
                          />
                        ) : (
                          <p className="text-xs sm:text-sm text-parchment/60 leading-relaxed italic">
                            {charToDisplay.profile?.bio || "Nenhuma história registrada ainda..."}
                          </p>
                        )}
                      </div>

                      {/* Guild & Achievements */}
                      <div className="glass-card p-6 sm:p-8 space-y-6 border-white/5 hover:border-gold/20 transition-all">
                        {charToDisplay.profile?.showGuild && charToDisplay.guildId && (
                          <div className="space-y-4">
                            <h3 className="text-[8px] sm:text-[10px] font-black text-gold uppercase tracking-[0.3em] flex items-center gap-3">
                              <Users size={14} />
                              Guilda & Afiliações
                            </h3>
                            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gold/10 rounded-lg sm:rounded-xl flex items-center justify-center text-gold">
                                <Shield size={20} className="sm:w-6 sm:h-6" />
                              </div>
                              <div>
                                <div className="text-[10px] sm:text-xs font-bold text-parchment">
                                  {guilds.find(g => g.id === charToDisplay.guildId)?.name || "Guilda Desconhecida"}
                                </div>
                                <div className="text-[8px] sm:text-[9px] text-parchment/40 uppercase font-black">Membro</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {charToDisplay.profile?.achievements && charToDisplay.profile.achievements.length > 0 && (
                          <div className="space-y-6">
                            <div className="space-y-4">
                              <h3 className="text-[8px] sm:text-[10px] font-black text-gold uppercase tracking-[0.3em] flex items-center gap-3">
                                <Trophy size={14} />
                                Conquistas em Destaque (Máx 3)
                              </h3>
                              <div className="grid grid-cols-1 gap-3">
                                {charToDisplay.profile.achievements.map(achData => {
                                  const ach = TOA_ACHIEVEMENTS.find(a => a.id === achData.id);
                                  if (!ach) return null;
                                  const isFeatured = charToDisplay.profile?.featuredAchievements?.includes(ach.id);
                                  const featuredIndex = charToDisplay.profile?.featuredAchievements?.indexOf(ach.id) ?? -1;

                                  return (
                                    <button 
                                      key={ach.id} 
                                      onClick={() => {
                                        const currentFeatured = charToDisplay.profile?.featuredAchievements || [];
                                        let newFeatured = [...currentFeatured];
                                        if (isFeatured) {
                                          newFeatured = newFeatured.filter(id => id !== ach.id);
                                        } else if (newFeatured.length < 3) {
                                          newFeatured.push(ach.id);
                                        } else {
                                          toast.error("Limite de 3 conquistas em destaque atingido!");
                                          return;
                                        }
                                        setFeaturedAchievements(charToDisplay.id, newFeatured);
                                      }}
                                      className={cn(
                                        "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 group relative overflow-hidden",
                                        isFeatured 
                                          ? "bg-gold/10 border-gold/40 shadow-[0_0_20px_rgba(212,175,55,0.1)]" 
                                          : "bg-white/5 border-white/5 hover:border-white/20"
                                      )}
                                    >
                                      <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500",
                                        isFeatured ? "bg-gold/20" : "bg-white/5"
                                      )}>
                                        <GameIcon icon={ach.icon} tier={ach.tier} unlocked={true} className="w-7 h-7" />
                                      </div>
                                      
                                      <div className="flex-1 text-left min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                          <h4 className={cn(
                                            "text-[11px] font-black uppercase tracking-tight truncate",
                                            isFeatured ? "text-gold" : "text-parchment/60"
                                          )}>
                                            {ach.name}
                                          </h4>
                                          {isFeatured && (
                                            <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center text-midnight text-[9px] font-black">
                                              {featuredIndex + 1}
                                            </div>
                                          )}
                                        </div>
                                        <p className="text-[9px] text-parchment/30 italic truncate">{ach.description}</p>
                                      </div>

                                      {/* Selection Indicator */}
                                      <div className={cn(
                                        "absolute inset-y-0 right-0 w-1 transition-all duration-500",
                                        isFeatured ? "bg-gold" : "bg-transparent"
                                      )} />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h3 className="text-[8px] sm:text-[10px] font-black text-gold uppercase tracking-[0.3em] flex items-center gap-3">
                                <Trophy size={14} />
                                Todas as Conquistas
                              </h3>
                              <div className="flex flex-wrap gap-2 sm:gap-3">
                                {charToDisplay.profile?.achievements?.map(achData => {
                                  const ach = TOA_ACHIEVEMENTS.find(a => a.id === achData.id);
                                  if (!ach) return null;
                                  return (
                                    <div 
                                      key={ach.id} 
                                      className={cn(
                                        "px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 group/ach hover:border-gold/30 transition-all",
                                        ach.tier === 'platinum' && "border-purple-500/30 bg-purple-500/5",
                                        ach.tier === 'gold' && "border-gold/30 bg-gold/5"
                                      )}
                                      title={ach.description}
                                    >
                                      <span className="text-lg group-hover/ach:scale-125 transition-transform">{ach.icon}</span>
                                      <div className="flex flex-col">
                                        <span className="text-[8px] sm:text-[9px] font-black text-parchment uppercase tracking-tight">{ach.name}</span>
                                        <span className={cn(
                                          "text-[6px] font-black uppercase tracking-widest",
                                          ach.tier === 'bronze' ? "text-orange-400" :
                                          ach.tier === 'silver' ? "text-slate-300" :
                                          ach.tier === 'gold' ? "text-gold" :
                                          "text-purple-400"
                                        )}>
                                          {ach.tier}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {charToDisplay.profile?.showProficiencies && (
                          <div className="space-y-4">
                            <h3 className="text-[8px] sm:text-[10px] font-black text-gold uppercase tracking-[0.3em] flex items-center gap-3">
                              <Sparkles size={14} />
                              Proficiências & Talentos
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(charToDisplay.skills || {})
                                .filter(([_, value]) => value)
                                .map(([skill]) => (
                                  <span key={skill} className="px-2 sm:px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-parchment/60">
                                    {SKILLS.find(s => s.name === skill)?.name || skill}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Customization Controls (Only if editing) */}
                    {isEditing && (
                      <div className="glass-card p-8 space-y-6 border-gold/20 bg-gold/5">
                        <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.3em] flex items-center gap-3">
                          <Palette size={14} />
                          Personalização de Perfil
                        </h3>
                        <div className="flex flex-wrap gap-4">
                          {(['dark', 'sunset', 'forest', 'ocean'] as const).map(style => (
                            <button
                              key={style}
                              onClick={() => setEditedChar(prev => prev ? { ...prev, profile: { ...prev.profile, backgroundStyle: style } } : null)}
                              className={cn(
                                "px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
                                editedChar?.profile?.backgroundStyle === style 
                                  ? "bg-gold text-midnight border-gold" 
                                  : "bg-white/5 text-parchment/40 border-white/10 hover:border-white/20"
                              )}
                            >
                              {style}
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <button
                            onClick={() => setEditedChar(prev => prev ? { ...prev, profile: { ...prev.profile, showRegion: !prev.profile?.showRegion } } : null)}
                            className={cn(
                              "flex items-center justify-between px-6 py-4 rounded-xl border transition-all",
                              editedChar?.profile?.showRegion ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-parchment/40"
                            )}
                          >
                            <span className="text-[9px] font-black uppercase tracking-widest">Mostrar Região</span>
                            <div className={cn("w-4 h-4 rounded-full border-2 transition-all", editedChar?.profile?.showRegion ? "bg-emerald-400 border-emerald-400" : "border-white/20")} />
                          </button>

                          <button
                            onClick={() => setEditedChar(prev => prev ? { ...prev, profile: { ...prev.profile, showProficiencies: !prev.profile?.showProficiencies } } : null)}
                            className={cn(
                              "flex items-center justify-between px-6 py-4 rounded-xl border transition-all",
                              editedChar?.profile?.showProficiencies ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-parchment/40"
                            )}
                          >
                            <span className="text-[9px] font-black uppercase tracking-widest">Mostrar Proficiências</span>
                            <div className={cn("w-4 h-4 rounded-full border-2 transition-all", editedChar?.profile?.showProficiencies ? "bg-emerald-400 border-emerald-400" : "border-white/20")} />
                          </button>

                          <button
                            onClick={() => setEditedChar(prev => prev ? { ...prev, profile: { ...prev.profile, showGuild: !prev.profile?.showGuild } } : null)}
                            className={cn(
                              "flex items-center justify-between px-6 py-4 rounded-xl border transition-all",
                              editedChar?.profile?.showGuild ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-parchment/40"
                            )}
                          >
                            <span className="text-[9px] font-black uppercase tracking-widest">Mostrar Guilda</span>
                            <div className={cn("w-4 h-4 rounded-full border-2 transition-all", editedChar?.profile?.showGuild ? "bg-emerald-400 border-emerald-400" : "border-white/20")} />
                          </button>

                          {currentCharacter.magicSchool && (
                            <button
                              onClick={() => setEditedChar(prev => prev ? { ...prev, profile: { ...prev.profile, showMagicSchoolSymbol: !prev.profile?.showMagicSchoolSymbol } } : null)}
                              className={cn(
                                "flex items-center justify-between px-6 py-4 rounded-xl border transition-all",
                                editedChar?.profile?.showMagicSchoolSymbol ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-parchment/40"
                              )}
                            >
                              <span className="text-[9px] font-black uppercase tracking-widest">Símbolo de Escola Arcana</span>
                              <div className={cn("w-4 h-4 rounded-full border-2 transition-all", editedChar?.profile?.showMagicSchoolSymbol ? "bg-emerald-400 border-emerald-400" : "border-white/20")} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Image URL Modal */}
      <AnimatePresence>
        {showImageUrlModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md liquid-glass p-8 border-white/10 space-y-6"
            >
              <div className="space-y-2">
                <h3 className="text-xl font-display font-black text-gold uppercase tracking-widest">Alterar Imagem</h3>
                <p className="text-xs text-parchment/40">Insira a URL da imagem personalizada para o seu perfil.</p>
              </div>

              <input 
                type="text"
                value={tempImageUrl}
                onChange={(e) => setTempImageUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.png"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-parchment outline-none focus:border-gold/40 transition-all"
                autoFocus
              />

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowImageUrlModal(false)}
                  className="flex-1 px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-parchment/40 hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    setEditedChar(prev => prev ? { ...prev, profile: { ...prev.profile, customImage: tempImageUrl } } : null);
                    setShowImageUrlModal(false);
                    playSound('success');
                  }}
                  className="flex-1 px-6 py-4 rounded-xl bg-gold text-midnight text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
