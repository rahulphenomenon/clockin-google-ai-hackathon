import React from 'react';

interface LogoProps {
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const Logo: React.FC<LogoProps> = ({ onClick, className = '', size = 'md' }) => {
  // Styles based on size
  const iconBoxClass = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';
  const iconTextClass = size === 'sm' ? 'text-sm' : 'text-xl';
  const textClass = size === 'sm' ? 'text-lg' : 'text-xl';
  const gapClass = size === 'sm' ? 'gap-3' : 'gap-2';

  return (
    <div 
      className={`flex items-center ${gapClass} select-none ${onClick ? 'cursor-pointer' : ''} ${className}`} 
      onClick={onClick}
    >
      <span className={` ${iconTextClass}`}>🫡</span>
      <span className={`${textClass} text-zinc-900`}>
        <span className=" font-light">c</span>
        <span className="font-bold">Lockin</span>
      </span>
    </div>
  );
};