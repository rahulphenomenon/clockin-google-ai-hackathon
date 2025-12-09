import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  shimmer?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  shimmer = false,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground"
  };

  const sizes = {
    sm: "h-9 px-3",
    md: "h-10 py-2 px-4",
    lg: "h-11 px-8"
  };

  const shimmerEffect = shimmer 
    ? "animate-shimmer bg-[linear-gradient(135deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] text-white"
    : "";

  const finalVariant = shimmer ? "" : variants[variant];

  return (
    <button 
      className={`${baseStyles} ${finalVariant} ${sizes[size]} ${shimmerEffect} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};