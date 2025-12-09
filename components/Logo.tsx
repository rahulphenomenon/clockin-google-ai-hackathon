import React from 'react';

interface LogoProps {
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const Logo: React.FC<LogoProps> = ({ onClick, className = '', size = 'md' }) => {
  // Styles based on size
  const iconBoxClass = size === 'sm' ? 'w-6 h-6 rounded-md' : 'w-8 h-8 rounded-md';
  const lTextClass = size === 'sm' ? 'text-sm pt-0.5' : 'text-xl pt-1';
  const textClass = size === 'sm' ? 'text-lg' : 'text-xl';
  const gapClass = size === 'sm' ? 'gap-3' : 'gap-2';

  return (
    <div 
      className={`flex items-center ${gapClass} select-none ${onClick ? 'cursor-pointer' : ''} ${className}`} 
      onClick={onClick}
    >
      <div className={`${iconBoxClass} bg-zinc-900 flex items-center justify-center text-white`}>
        <span className={`font-serif italic ${lTextClass}`}>L</span>
      </div>
      <span className={`${textClass} tracking-tight text-zinc-900`}>
        <span className="font-light">c</span>
        <span className="font-bold">Lockin</span>
      </span>
    </div>
  );
};