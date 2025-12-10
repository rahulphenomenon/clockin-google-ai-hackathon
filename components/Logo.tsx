import React from 'react';
import { Lock } from 'lucide-react';

interface LogoProps {
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const Logo: React.FC<LogoProps> = ({ onClick, className = '', size = 'md' }) => {
  const textClass = size === 'sm' ? 'text-xl' : 'text-2xl';
  const iconSize = size === 'sm' ? 18 : 22;
  const spacing = size === 'sm' ? 'gap-1' : 'gap-1.5';

  return (
    <div 
      className={`flex items-end ${spacing} select-none ${onClick ? 'cursor-pointer' : ''} ${className}`} 
      onClick={onClick}
    >
      <Lock 
        size={iconSize} 
        className="text-zinc-900 mb-0.5" 
        strokeWidth={2}
      />
      <div className="flex items-end leading-none -mb-1">
        <span className={`${textClass} font-poppins font-light text-zinc-900 tracking-tight`}>
          c
        </span>
        <span className={`${textClass} font-poppins font-semibold text-zinc-900 tracking-tight`}>
          lockin
        </span>
      </div>
    </div>
  );
};