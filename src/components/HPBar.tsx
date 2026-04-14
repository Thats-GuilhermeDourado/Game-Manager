import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface HPBarProps {
  current: number;
  max: number;
  className?: string;
  showText?: boolean;
}

export function HPBar({ current, max, className, showText = true }: HPBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  const getBarColor = () => {
    if (percentage > 50) return 'bg-emerald-500';
    if (percentage > 20) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getLiquidColor = () => {
    if (percentage > 50) return 'from-emerald-400 to-emerald-600';
    if (percentage > 20) return 'from-amber-400 to-amber-600';
    return 'from-red-400 to-red-600';
  };

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {showText && (
        <div className="flex flex-wrap justify-between items-end px-1 gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-parchment/40 shrink-0">Pontos de Vida</span>
          <span className={cn(
            "text-xs font-black tabular-nums shrink-0",
            percentage > 50 ? "text-emerald-400" : percentage > 20 ? "text-amber-400" : "text-red-400"
          )}>
            {current} <span className="text-parchment/20">/</span> {max}
          </span>
        </div>
      )}
      <div className="h-2 w-full bg-midnight/60 rounded-full overflow-hidden border border-white/5 relative">
        {/* Background glow */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("absolute inset-0 opacity-20 blur-sm", getBarColor())}
        />
        
        {/* Main bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className={cn(
            "h-full rounded-full relative overflow-hidden bg-gradient-to-r shadow-[0_0_10px_rgba(0,0,0,0.5)]",
            getLiquidColor()
          )}
        >
          {/* Liquid effect overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
          
          {/* Shine effect */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 skew-x-[-45deg] -translate-x-full animate-[shine_3s_infinite]" />
        </motion.div>
      </div>
    </div>
  );
}
