import React from 'react';
import { 
  Hammer, 
  Wind, 
  Footprints, 
  Fingerprint, 
  Flame, 
  Lightbulb, 
  Sparkles, 
  Axe, 
  Skull,
  Shield,
  Droplets
} from 'lucide-react';
import { cn } from '../lib/utils';

interface RaceIconProps {
  race: string;
  className?: string;
  iconClassName?: string;
}

export const RaceIcon = ({ race, className, iconClassName }: RaceIconProps) => {
  const getIcon = () => {
    const r = race?.toLowerCase() || '';
    
    // Anão -> Martelo (Artesanato/Força)
    if (r.includes('anão')) return { Icon: Hammer, color: 'text-amber-600/70', bg: 'bg-amber-900/20' };
    
    // Elfo -> Vento/Sopro (Elegância/Orelhas Pontudas/Agilidade)
    if (r.includes('elfo') && !r.includes('meio')) return { Icon: Wind, color: 'text-emerald-400/70', bg: 'bg-emerald-900/20' };
    
    // Halfling -> Pegadas (Pés peludos icônicos)
    if (r.includes('halfling')) return { Icon: Footprints, color: 'text-orange-400/70', bg: 'bg-orange-900/20' };
    
    // Humano -> Digital (Versatilidade/Identidade Única)
    if (r.includes('humano')) return { Icon: Fingerprint, color: 'text-blue-400/70', bg: 'bg-blue-900/20' };
    
    // Draconato -> Chama (Sopro Dracônico)
    if (r.includes('draconato')) return { Icon: Flame, color: 'text-red-500/70', bg: 'bg-red-900/20' };
    
    // Gnomo -> Lâmpada (Invenção/Curiosidade)
    if (r.includes('gnomo')) return { Icon: Lightbulb, color: 'text-yellow-400/70', bg: 'bg-yellow-900/20' };
    
    // Meio-Elfo -> Brilhos (Mistura de mundos/Carisma)
    if (r.includes('meio-elfo')) return { Icon: Sparkles, color: 'text-cyan-400/70', bg: 'bg-cyan-900/20' };
    
    // Meio-Orc -> Machado (Força Bruta)
    if (r.includes('meio-orc')) return { Icon: Axe, color: 'text-slate-400/70', bg: 'bg-slate-900/20' };
    
    // Tiefling -> Caveira (Herança Infernal)
    if (r.includes('tiefling')) return { Icon: Skull, color: 'text-violet-500/70', bg: 'bg-violet-900/20' };
    
    // Grung -> Gotas (Anfíbio/Dependência de Água)
    if (r.includes('grung')) return { Icon: Droplets, color: 'text-lime-400/70', bg: 'bg-lime-900/20' };
    
    return { Icon: Shield, color: 'text-gold/40', bg: 'bg-gold/5' };
  };

  const { Icon, color, bg } = getIcon();

  return (
    <div className={cn("flex items-center justify-center border border-white/10 shadow-inner", bg, className)}>
      <Icon className={cn("w-1/2 h-1/2", color, iconClassName)} />
    </div>
  );
};
