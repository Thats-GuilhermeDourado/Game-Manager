import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface MagicSchoolSymbolProps {
  school: string;
  className?: string;
  size?: number;
  glow?: boolean;
}

export const MagicSchoolSymbol: React.FC<MagicSchoolSymbolProps> = ({ 
  school, 
  className, 
  size = 120,
  glow = true 
}) => {
  const getSchoolColor = (schoolName: string) => {
    switch (schoolName) {
      case 'Abjuração': return '#60a5fa'; // Blue
      case 'Adivinhação': return '#fcd34d'; // Gold
      case 'Conjuração': return '#a855f7'; // Purple
      case 'Encantamento': return '#f472b6'; // Pink
      case 'Evocação': return '#ef4444'; // Red
      case 'Ilusão': return '#2dd4bf'; // Teal
      case 'Necromancia': return '#4b5563'; // Gray/Dark
      case 'Transmutação': return '#fb923c'; // Orange
      default: return '#d4af37';
    }
  };

  const color = getSchoolColor(school);

  const renderArt = () => {
    switch (school) {
      case 'Abjuração':
        return (
          <g>
            <motion.path
              d="M50 15 L85 30 V60 C85 80 50 90 50 90 C50 90 15 80 15 60 V30 L50 15Z"
              fill="none"
              stroke={color}
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            />
            <motion.path
              d="M50 25 L75 35 V55 C75 70 50 80 50 80 C50 80 25 70 25 55 V35 L50 25Z"
              fill={color}
              fillOpacity="0.2"
              stroke={color}
              strokeWidth="1"
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <circle cx="50" cy="50" r="10" fill={color} className="blur-sm" />
          </g>
        );
      case 'Adivinhação':
        return (
          <g>
            <motion.ellipse
              cx="50" cy="50" rx="40" ry="25"
              fill="none"
              stroke={color}
              strokeWidth="2"
              animate={{ ry: [25, 5, 25] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <circle cx="50" cy="50" r="15" fill="none" stroke={color} strokeWidth="2" />
            <motion.circle
              cx="50" cy="50" r="8"
              fill={color}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <path d="M20 50 Q50 20 80 50" fill="none" stroke={color} strokeWidth="1" strokeDasharray="4 4" />
            <path d="M20 50 Q50 80 80 50" fill="none" stroke={color} strokeWidth="1" strokeDasharray="4 4" />
          </g>
        );
      case 'Conjuração':
        return (
          <g>
            {[0, 120, 240].map((rot, i) => (
              <motion.path
                key={i}
                d="M50 20 Q80 50 50 80 Q20 50 50 20"
                fill="none"
                stroke={color}
                strokeWidth="2"
                animate={{ rotate: [rot, rot + 360] }}
                transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
              />
            ))}
            <circle cx="50" cy="50" r="5" fill={color} />
            <motion.circle
              cx="50" cy="50" r="30"
              fill="none"
              stroke={color}
              strokeWidth="0.5"
              strokeDasharray="5 5"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
          </g>
        );
      case 'Encantamento':
        return (
          <g>
            <motion.path
              d="M50 80 C20 60 10 40 10 25 C10 10 25 10 35 15 C40 18 45 22 50 30 C55 22 60 18 65 15 C75 10 90 10 90 25 C90 40 80 60 50 80Z"
              fill="none"
              stroke={color}
              strokeWidth="2"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            {[1, 2, 3].map(i => (
              <motion.path
                key={i}
                d="M50 80 C20 60 10 40 10 25 C10 10 25 10 35 15 C40 18 45 22 50 30 C55 22 60 18 65 15 C75 10 90 10 90 25 C90 40 80 60 50 80Z"
                fill="none"
                stroke={color}
                strokeWidth="0.5"
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 4, delay: i * 1.3, repeat: Infinity, ease: "easeOut" }}
              />
            ))}
          </g>
        );
      case 'Evocação':
        return (
          <g>
            {[0, 45, 90, 135, 180, 225, 270, 315].map(rot => (
              <motion.path
                key={rot}
                d="M50 50 L50 10 L45 25 L50 50"
                fill={color}
                initial={{ rotate: rot }}
                animate={{ scaleY: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, delay: rot / 360, repeat: Infinity }}
              />
            ))}
            <circle cx="50" cy="50" r="12" fill={color} className="blur-md" />
            <circle cx="50" cy="50" r="6" fill="white" />
          </g>
        );
      case 'Ilusão':
        return (
          <g>
            <motion.rect
              x="25" y="25" width="50" height="50"
              fill="none"
              stroke={color}
              strokeWidth="2"
              animate={{ skewX: [0, 20, -20, 0], skewY: [0, -10, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
            <motion.rect
              x="35" y="35" width="30" height="30"
              fill={color}
              fillOpacity="0.2"
              stroke={color}
              strokeWidth="1"
              animate={{ x: [35, 45, 25, 35], y: [35, 25, 45, 35] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <path d="M10 10 L90 90 M90 10 L10 90" stroke={color} strokeWidth="0.5" strokeDasharray="2 2" />
          </g>
        );
      case 'Necromancia':
        return (
          <g>
            <motion.path
              d="M30 30 Q50 10 70 30 Q80 50 70 70 Q50 90 30 70 Q20 50 30 30"
              fill="none"
              stroke={color}
              strokeWidth="2"
            />
            <motion.circle cx="40" cy="40" r="5" fill={color} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />
            <motion.circle cx="60" cy="40" r="5" fill={color} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2, delay: 1, repeat: Infinity }} />
            <path d="M40 65 Q50 75 60 65" fill="none" stroke={color} strokeWidth="2" />
            <motion.path
              d="M20 20 L80 80 M80 20 L20 80"
              stroke={color}
              strokeWidth="0.5"
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </g>
        );
      case 'Transmutação':
        return (
          <g>
            <motion.path
              d="M50 15 L85 75 L15 75 Z"
              fill="none"
              stroke={color}
              strokeWidth="2"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
            <motion.path
              d="M50 85 L15 25 L85 25 Z"
              fill="none"
              stroke={color}
              strokeWidth="2"
              animate={{ rotate: [360, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
            <motion.circle
              cx="50" cy="50" r="15"
              fill={color}
              fillOpacity="0.3"
              animate={{ r: [10, 20, 10] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {glow && (
        <div 
          className="absolute inset-0 rounded-full blur-2xl opacity-20"
          style={{ backgroundColor: color }}
        />
      )}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-2xl"
        style={{ filter: glow ? `drop-shadow(0 0 10px ${color}44)` : 'none' }}
      >
        {renderArt()}
      </svg>
    </div>
  );
};
