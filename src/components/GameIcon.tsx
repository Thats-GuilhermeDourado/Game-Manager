import React from 'react';
import { cn } from '../lib/utils';

interface GameIconProps {
  icon: string;
  className?: string;
  unlocked?: boolean;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export const GameIcon: React.FC<GameIconProps> = ({ icon, className, unlocked = false, tier }) => {
  // Mapping of icon keys to SVG paths from Game Icons (simplified/representative)
  const iconPaths: Record<string, React.ReactNode> = {
    'dinosaur': (
      <path d="M18,3L15,6L12,5L10,7L11,10L9,12L6,11L4,13L5,16L3,18L5,21L8,20L10,22L13,21L15,23L18,21L21,22L20,19L22,17L21,14L23,12L21,9L22,6L19,5L18,3M15,9A1,1 0 0,1 16,10A1,1 0 0,1 15,11A1,1 0 0,1 14,10A1,1 0 0,1 15,9Z" fill="currentColor"/>
    ),
    'jungle': (
      <path d="M17,11C15.5,11 14.15,11.5 13.1,12.35L11,10.25L11,4L12,3L11,2L10,3L11,4L11,10.25L8.9,12.35C7.85,11.5 6.5,11 5,11A5,5 0 0,0 0,16C0,18.76 2.24,21 5,21C6.5,21 7.85,20.5 8.9,19.65L11,21.75L11,22L10,23L11,22L12,23L11,22L11,21.75L13.1,19.65C14.15,20.5 15.5,21 17,21A5,5 0 0,0 22,16C22,13.24 19.76,11 17,11Z" fill="currentColor"/>
    ),
    'skull': (
      <path d="M12,2A9,9 0 0,0 3,11C3,14.03 4.53,16.82 7,18.47V22H9V19H11V22H13V19H15V22H17V18.46C19.47,16.81 21,14.03 21,11A9,9 0 0,0 12,2M8,11A2,2 0 0,1 10,13A2,2 0 0,1 8,15A2,2 0 0,1 6,13A2,2 0 0,1 8,11M16,11A2,2 0 0,1 18,13A2,2 0 0,1 16,15A2,2 0 0,1 14,13A2,2 0 0,1 16,11Z" fill="currentColor"/>
    ),
    'wave': (
      <path d="M12,18C9.79,18 8,16.21 8,14C8,11.79 9.79,10 12,10C14.21,10 16,11.79 16,14C16,16.21 14.21,18 12,18M20,14C20,18.42 16.42,22 12,22C7.58,22 4,18.42 4,14C4,9.58 7.58,6 12,6C16.42,6 20,9.58 20,14M12,2L7,7H17L12,2Z" fill="currentColor"/>
    ),
    'meat': (
      <path d="M12,2C15.31,2 18,4.69 18,8C18,11.31 15.31,14 12,14C8.69,14 6,11.31 6,8C6,4.69 8.69,2 12,2M12,16C15.31,16 18,18.69 18,22H6C6,18.69 8.69,16 12,16Z" fill="currentColor"/>
    ),
    'city': (
      <path d="M15,11V5l-3-3-3,3v2H3v14h18V11H15M7,19H5v-2h2V19m0-4H5v-2h2V15m0-4H5V9h2V11m6,8h-2v-2h2V19m0-4h-2v-2h2V15m0-4h-2V9h2V11m0-4h-2V5h2V7m6,12h-2v-2h2V19m0-4h-2v-2h2V15" fill="currentColor"/>
    ),
    'wizard': (
      <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" fill="currentColor"/>
    ),
    'treasure': (
      <path d="M5,4H19A2,2 0 0,1 21,6V18A2,2 0 0,1 19,20H5A2,2 0 0,1 3,18V6A2,2 0 0,1 5,4M5,8V18H19V8H5M11,14H13V16H11V14M7,10H17V12H7V10Z" fill="currentColor"/>
    ),
    'temple': (
      <path d="M12,2L1,21H23L12,2M12,5.91L18.84,19H5.16L12,5.91M11,10H13V13H11V10M11,14H13V16H11V14Z" fill="currentColor"/>
    ),
    'labyrinth': (
      <path d="M2,2H22V22H2V2M4,4V20H20V4H4M6,6H18V18H6V6M8,8V16H16V8H8M10,10H14V14H10V10Z" fill="currentColor"/>
    ),
    'ghost': (
      <path d="M12,2A9,9 0 0,0 3,11V22L6,19L9,22L12,19L15,22L18,19L21,22V11A9,9 0 0,0 12,2M9,8A2,2 0 0,1 11,10A2,2 0 0,1 9,12A2,2 0 0,1 7,10A2,2 0 0,1 9,8M15,8A2,2 0 0,1 17,10A2,2 0 0,1 15,12A2,2 0 0,1 13,10A2,2 0 0,1 15,8Z" fill="currentColor"/>
    ),
    'broken-shield': (
      <path d="M12,2L4,5V11C4,16.55 7.84,21.74 12,22.91C16.16,21.74 20,16.55 20,11V5L12,2M12,4.41L18,6.66V11C18,15.42 15.44,19.57 12,20.83V4.41M12,20.83C8.56,19.57 6,15.42 6,11V6.66L12,4.41V20.83Z" fill="currentColor"/>
    ),
    'dragon': (
      <path d="M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M15.89,16.55L14.5,15.16L13.11,16.55L12,15.44L10.89,16.55L9.5,15.16L8.11,16.55L7,15.44L8.39,14.05L7,12.66L8.11,11.55L9.5,12.94L10.89,11.55L12,12.66L13.11,11.55L14.5,12.94L15.89,11.55L17,12.66L15.61,14.05L17,15.44L15.89,16.55Z" fill="currentColor"/>
    ),
    'brain': (
      <path d="M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M12,20C7.58,20 4,16.42 4,12C4,7.58 7.58,4 12,4C16.42,4 20,7.58 20,12C20,16.42 16.42,20 12,20M11,7H13V13H11V7M11,15H13V17H11V15Z" fill="currentColor"/>
    ),
    'lich': (
      <path d="M12,2L9,7L3,8L7,12L6,18L12,15L18,18L17,12L21,8L15,7L12,2Z" fill="currentColor"/>
    ),
    'trophy': (
      <path d="M18,2H6V4H18V2M18,7H6V9C6,12.31 8.69,15 12,15C15.31,15 18,12.31 18,9V7M12,17C8.69,17 6,19.69 6,23H18C18,19.69 15.31,17 12,17Z" fill="currentColor"/>
    ),
  };

  // Fallback icon
  const defaultIcon = (
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
  );

  const getTierColor = () => {
    if (!unlocked) return 'text-parchment/20';
    switch (tier) {
      case 'bronze': return 'text-orange-400';
      case 'silver': return 'text-slate-300';
      case 'gold': return 'text-gold';
      case 'platinum': return 'text-purple-400';
      default: return 'text-gold';
    }
  };

  return (
    <svg 
      viewBox="0 0 24 24" 
      className={cn(
        "w-6 h-6 transition-all duration-700",
        unlocked ? "opacity-100 scale-110 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" : "opacity-60 grayscale",
        getTierColor(),
        className
      )}
    >
      {iconPaths[icon] || defaultIcon}
    </svg>
  );
};
