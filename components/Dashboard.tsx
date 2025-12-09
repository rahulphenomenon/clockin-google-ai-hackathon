import React, { useState } from 'react';
import { 
  FileText, 
  Video, 
  Users, 
  GraduationCap, 
  User, 
  LogOut
} from 'lucide-react';
import { DashboardTab } from '../types';
import { Logo } from './Logo';

interface DashboardProps {
  onNavigateHome: () => void;
}

const NAV_ITEMS: { id: DashboardTab; label: string; icon: any }[] = [
  { id: 'resume', label: 'Resume Optimizer', icon: FileText },
  { id: 'interview', label: 'Interview Prep', icon: Video },
  { id: 'mentor', label: 'Mentor Match', icon: Users },
  { id: 'upskill', label: 'Upskill and Learn', icon: GraduationCap },
];

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateHome }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('resume');

  const renderContent = () => {
    switch (activeTab) {
      case 'resume':
        return (
          <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div>
              <h2 className="text-4xl font-serif text-zinc-900 mb-4">Resume Optimizer</h2>
              <p className="text-zinc-500 text-lg">Upload your current resume and let our AI tailor it for your dream job.</p>
            </div>
            <div className="h-96 w-full border-2 border-dashed border-zinc-200 rounded-xl flex items-center justify-center bg-white">
              <span className="text-zinc-400 font-medium">Resume Upload Placeholder</span>
            </div>
          </div>
        );
      case 'interview':
        return (
          <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div>
              <h2 className="text-4xl font-serif text-zinc-900 mb-4">Interview Prep</h2>
              <p className="text-zinc-500 text-lg">Practice behavioral and technical questions with real-time AI feedback.</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="h-64 bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                    <div className="h-10 w-10 bg-zinc-100 rounded-lg mb-4"></div>
                    <h3 className="font-semibold text-lg mb-2">Behavioral</h3>
                    <p className="text-zinc-500 text-sm">Master your stories and soft skills.</p>
                </div>
                <div className="h-64 bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                    <div className="h-10 w-10 bg-zinc-100 rounded-lg mb-4"></div>
                    <h3 className="font-semibold text-lg mb-2">Technical</h3>
                    <p className="text-zinc-500 text-sm">Coding challenges and system design.</p>
                </div>
            </div>
          </div>
        );
      case 'mentor':
        return (
          <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div>
              <h2 className="text-4xl font-serif text-zinc-900 mb-4">Mentor Match</h2>
              <p className="text-zinc-500 text-lg">Find guidance from experienced professionals in your field.</p>
            </div>
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-white border border-zinc-200 rounded-xl w-full"></div>
                ))}
            </div>
          </div>
        );
      case 'upskill':
        return (
          <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div>
              <h2 className="text-4xl font-serif text-zinc-900 mb-4">Upskill & Learn</h2>
              <p className="text-zinc-500 text-lg">Curated learning paths to bridge your skill gaps.</p>
            </div>
            <div className="h-96 bg-white border border-zinc-200 rounded-xl w-full"></div>
          </div>
        );
      case 'profile':
        return (
          <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div>
              <h2 className="text-4xl font-serif text-zinc-900 mb-4">Profile Settings</h2>
              <p className="text-zinc-500 text-lg">Manage your personal information and preferences.</p>
            </div>
            <div className="h-64 bg-white border border-zinc-200 rounded-xl w-full"></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 flex">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-zinc-200 flex flex-col z-20">
        
        {/* Sidebar Header */}
        <div 
          className="h-16 flex items-center px-6 border-b border-zinc-100 cursor-pointer hover:bg-zinc-50 transition-colors" 
          onClick={onNavigateHome}
        >
          <Logo size="sm" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-zinc-900 text-white shadow-md' 
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  }
                `}
              >
                <Icon size={18} className={isActive ? 'text-zinc-300' : 'text-zinc-400'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-zinc-100 space-y-1">
          <button
             onClick={() => setActiveTab('profile')}
             className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200
                ${activeTab === 'profile' 
                  ? 'bg-zinc-900 text-white shadow-md' 
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                }
             `}
          >
            <User size={18} />
            Profile
          </button>
          <button
            onClick={onNavigateHome}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="h-full p-8 md:p-12">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};