import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Check, Plus, X, Calendar, Info } from 'lucide-react';
import { Button } from '../ui/Button';
import { Logo } from '../Logo';
import { useUser } from '../../context/UserContext';

interface OnboardingFlowProps {
  onComplete: () => void;
  onExit: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onExit }) => {
  const { user, updateUser } = useUser();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Form State - Initialize from context if available
  const [name, setName] = useState(user?.name || '');
  const [roles, setRoles] = useState<string[]>(user?.targetRoles || []);
  const [currentRoleInput, setCurrentRoleInput] = useState('');
  const [startDate, setStartDate] = useState(user?.startDate || '');

  // Auto-save to localStorage via context whenever fields change
  useEffect(() => {
    const timer = setTimeout(() => {
      updateUser({
        name,
        targetRoles: roles,
        startDate
      });
    }, 500); // Debounce to prevent excessive writes

    return () => clearTimeout(timer);
  }, [name, roles, startDate, updateUser]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Final save is handled by useEffect, but we ensure it's called before completing
      updateUser({
        name,
        targetRoles: roles,
        startDate
      });
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const addRole = () => {
    if (currentRoleInput.trim() && !roles.includes(currentRoleInput.trim())) {
      setRoles([...roles, currentRoleInput.trim()]);
      setCurrentRoleInput('');
    }
  };

  const removeRole = (roleToRemove: string) => {
    setRoles(roles.filter(r => r !== roleToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (step === 2) {
        addRole();
      } else if (step === 1 && name) {
        handleNext();
      }
    }
  };

  // Handle Logo Click
  const handleExit = () => {
    // Explicit save before exiting
    updateUser({
        name,
        targetRoles: roles,
        startDate
    });
    onExit();
  };

  const progressPercentage = ((step - 1) / totalSteps) * 100;
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Progress Bar */}
      <div className="h-1 w-full bg-zinc-100">
        <div 
          className="h-full bg-zinc-900 transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Header */}
      <header className="p-6">
        <Logo size="sm" onClick={handleExit} />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-2xl mx-auto w-full animate-fade">
        
        {/* Step 1: Name */}
        {step === 1 && (
          <div className="w-full space-y-8">
            <div className="space-y-4">
              <label className="block text-2xl md:text-3xl font-medium text-zinc-900">
                What should we call you?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your first name..."
                className="w-full text-2xl md:text-3xl border-b-2 border-zinc-200 py-2 focus:outline-none focus:border-zinc-900 placeholder:text-zinc-300 transition-colors bg-transparent"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Step 2: Roles */}
        {step === 2 && (
          <div className="w-full space-y-8">
            <div className="space-y-4">
              <label className="block text-2xl md:text-3xl font-medium text-zinc-900">
                What roles are you targeting?
              </label>
              <p className="text-zinc-500">Add as many as you like.</p>
              
              <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                {roles.map((role) => (
                  <span key={role} className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-700 border border-zinc-200 px-3 py-1.5 rounded-md text-sm animate-fadeScale group hover:border-zinc-300 transition-colors">
                    {role}
                    <button onClick={() => removeRole(role)} className="text-zinc-400 hover:text-zinc-700 ml-1">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={currentRoleInput}
                    onChange={(e) => setCurrentRoleInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. Product Manager"
                    className="w-full text-xl border-b-2 border-zinc-200 py-2 pr-10 focus:outline-none focus:border-zinc-900 placeholder:text-zinc-300 transition-colors bg-transparent"
                    autoFocus
                  />
                  {currentRoleInput && (
                    <button 
                      onClick={addRole}
                      className="absolute right-0 top-2 text-zinc-900 hover:scale-110 transition-transform"
                    >
                      <Check size={24} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Date */}
        {step === 3 && (
          <div className="w-full space-y-8">
            <div className="space-y-4">
              <label className="block text-2xl md:text-3xl font-medium text-zinc-900">
                When do you want to start your new job?
              </label>
              <p className="text-zinc-500">An estimate helps us prioritize your roadmap.</p>
              
              <div className="relative mt-6">
                <input
                  type="date"
                  min={today}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xl border border-zinc-200 rounded-md py-4 px-4 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="w-full mt-12 pt-8 border-t border-zinc-100">
            <div className="flex justify-between items-center">
                <Button 
                    variant="ghost" 
                    onClick={handleBack} 
                    disabled={step === 1}
                    className={step === 1 ? 'invisible' : ''}
                >
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </Button>

                <Button 
                    onClick={handleNext}
                    size="lg"
                    className="px-6" // Reduced horizontal padding from default lg (px-8)
                    disabled={
                    (step === 1 && !name) || 
                    (step === 2 && roles.length === 0) ||
                    (step === 3 && !startDate)
                    }
                >
                    {step === totalSteps ? 'Go to dashboard' : 'Continue'} 
                    {step !== totalSteps && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
            </div>

            {/* Banner moved to footer for Step 1 */}
            {step === 1 && (
                <div className="mt-6 flex justify-center animate-in fade-in slide-in-from-top-2 duration-500">
                    <p className="text-xs text-zinc-400 text-center max-w-md">
                        <Info className="w-3 h-3 inline mr-1 mb-0.5" />
                        For demo purposes, all data is stored locally in your browser (Client Side). No login/password is required.
                    </p>
                </div>
            )}
        </div>

      </main>
    </div>
  );
};