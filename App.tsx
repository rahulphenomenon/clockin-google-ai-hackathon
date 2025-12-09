import React, { useState } from 'react';
import { Hero } from './components/Hero';
import { FeatureShowcase } from './components/FeatureShowcase';
import { Button } from './components/ui/Button';
import { ViewState } from './types';

function App() {
  const [view, setView] = useState<ViewState>('landing');

  const handleGetStarted = () => {
    setView('dashboard');
  };

  // Minimal Dashboard Placeholder
  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl border border-zinc-100 p-8 text-center">
           <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center text-white font-serif text-3xl italic mx-auto mb-6">L</div>
           <h2 className="text-2xl font-bold mb-2">Welcome to cLockin</h2>
           <p className="text-zinc-500 mb-6">Your AI assistant is ready to help you land that job.</p>
           <Button onClick={() => setView('landing')} variant="outline">Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans selection:bg-zinc-900 selection:text-white">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-zinc-900 rounded-md flex items-center justify-center text-white">
              <span className="font-serif italic text-xl pt-1">L</span>
            </div>
            <span className="text-xl tracking-tight">
              <span className="font-light">c</span>
              <span className="font-bold">Lockin</span>
            </span>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-4">
            <Button size="sm" onClick={handleGetStarted} className="">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col">
        <Hero onGetStarted={handleGetStarted} />
        
        <div className="bg-gradient-to-b from-white to-zinc-50/50 pb-20">
             <FeatureShowcase />
        </div>
      </main>

    </div>
  );
}

export default App;