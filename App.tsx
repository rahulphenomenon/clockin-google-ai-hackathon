import React, { useState, useEffect } from 'react';
import { Hero } from './components/Hero';
import { FeatureShowcase } from './components/FeatureShowcase';
import { Button } from './components/ui/Button';
import { Dashboard } from './components/Dashboard';
import { Logo } from './components/Logo';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { ViewState } from './types';
import { useUser } from './context/UserContext';

function App() {
  const [view, setView] = useState<ViewState>('landing');
  const { user } = useUser();

  const handleGetStarted = () => {
    // If user already has a profile, go to dashboard
    if (user && user.name) {
      setView('dashboard');
    } else {
      setView('onboarding');
    }
  };

  const handleOnboardingComplete = () => {
    setView('dashboard');
  };

  const handleNavigateHome = () => {
    setView('landing');
  };

  // Dashboard View
  if (view === 'dashboard') {
    return <Dashboard onNavigateHome={handleNavigateHome} />;
  }

  // Onboarding View
  if (view === 'onboarding') {
    return <OnboardingFlow onComplete={handleOnboardingComplete} onExit={handleNavigateHome} />;
  }

  // Landing Page View
  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans selection:bg-zinc-900 selection:text-white">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

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