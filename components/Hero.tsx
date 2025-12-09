import React from 'react';
import { Button } from './ui/Button';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  return (
    <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        
        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-zinc-900 mb-8">
          <span className="font-serif font-normal block sm:inline">Land your </span>
          <span className="font-serif italic font-normal">dream job</span>
        </h1>

        {/* Subheading */}
        <p className="max-w-2xl text-lg sm:text-xl text-zinc-500 mb-10 leading-relaxed font-light">
          Consolidate your resume building, interview prep, and mentorship into one integrated, easy-to-use platform.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button 
            size="lg" 
            shimmer 
            className="h-12 text-base shadow-xl shadow-zinc-200 hover:shadow-2xl transition-all"
            onClick={onGetStarted}
          >
            Get Started <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="h-12 text-base border-zinc-200 text-zinc-600 hover:bg-zinc-50"
          >
            View Demo
          </Button>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-zinc-100 to-transparent rounded-full opacity-50 blur-3xl -z-10 pointer-events-none"></div>
    </div>
  );
};