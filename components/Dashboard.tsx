import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Video, 
  Users, 
  GraduationCap, 
  User, 
  LogOut,
  Plus,
  X,
  Save
} from 'lucide-react';
import { DashboardTab } from '../types';
import { Logo } from './Logo';
import { useUser } from '../context/UserContext';
import { Button } from './ui/Button';

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
  const { user, updateUser, clearUser } = useUser();
  const [activeTab, setActiveTab] = useState<DashboardTab>('resume');

  // Profile Edit State
  const [editName, setEditName] = useState('');
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [editRoleInput, setEditRoleInput] = useState('');
  const [editDate, setEditDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state with user context on load/change
  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditRoles(user.targetRoles || []);
      setEditDate(user.startDate);
    }
  }, [user]);

  const handleSignOut = () => {
    clearUser();
    onNavigateHome();
  };

  const handleSaveProfile = () => {
    setIsSaving(true);
    // Simulate network delay for "snappy" feel but realistic feedback
    setTimeout(() => {
      updateUser({
        name: editName,
        targetRoles: editRoles,
        startDate: editDate
      });
      setIsSaving(false);
    }, 600);
  };

  const addRole = () => {
    if (editRoleInput.trim() && !editRoles.includes(editRoleInput.trim())) {
      setEditRoles([...editRoles, editRoleInput.trim()]);
      setEditRoleInput('');
    }
  };

  const removeRole = (role: string) => {
    setEditRoles(editRoles.filter(r => r !== role));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'resume':
        return (
          <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div>
              <h2 className="text-4xl font-serif text-zinc-900 mb-4">Resume Optimizer</h2>
              <p className="text-zinc-500 text-lg">Upload your current resume and let our AI tailor it for your dream job.</p>
            </div>
            <div className="h-96 w-full border-2 border-dashed border-zinc-200 rounded-xl flex items-center justify-center bg-white hover:bg-zinc-50 transition-colors cursor-pointer group">
              <div className="text-center space-y-4">
                 <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-zinc-200 transition-colors">
                    <FileText className="w-8 h-8 text-zinc-400 group-hover:text-zinc-600" />
                 </div>
                 <div>
                    <span className="text-zinc-900 font-medium">Click to upload</span>
                    <span className="text-zinc-400 block text-sm mt-1">PDF or DOCX (Max 10MB)</span>
                 </div>
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64 bg-white border border-zinc-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                        <User size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-xl mb-2">Behavioral</h3>
                        <p className="text-zinc-500">Master your stories and soft skills with STAR method analysis.</p>
                    </div>
                </div>
                <div className="h-64 bg-white border border-zinc-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                        <Video size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-xl mb-2">Technical</h3>
                        <p className="text-zinc-500">Live coding challenges and system design deep dives.</p>
                    </div>
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
                    <div key={i} className="bg-white border border-zinc-200 rounded-xl p-6 flex gap-6 items-center shadow-sm">
                        <div className="w-16 h-16 bg-zinc-100 rounded-full shrink-0"></div>
                        <div className="flex-1 space-y-2">
                             <div className="h-4 w-48 bg-zinc-100 rounded"></div>
                             <div className="h-3 w-32 bg-zinc-50 rounded"></div>
                        </div>
                        <Button variant="outline" size="sm">Connect</Button>
                    </div>
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
             <div className="grid grid-cols-1 gap-6">
                <div className="bg-white border border-zinc-200 rounded-xl p-8">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                             <h3 className="text-xl font-medium mb-1">Recommended Path</h3>
                             <p className="text-zinc-500 text-sm">Based on your target roles</p>
                        </div>
                        <div className="bg-zinc-100 px-3 py-1 rounded-full text-xs font-semibold">AI Generated</div>
                     </div>
                     <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                             <div key={i} className="flex items-center gap-4 p-3 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-zinc-100">
                                 <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-medium">{i}</div>
                                 <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                                     <div className="h-full bg-zinc-300 w-1/3"></div>
                                 </div>
                             </div>
                        ))}
                     </div>
                </div>
             </div>
          </div>
        );
      case 'profile':
        return (
          <div className="max-w-2xl space-y-8 animate-in fade-in duration-500">
            <div>
              <h2 className="text-4xl font-serif text-zinc-900 mb-4">Profile Settings</h2>
              <p className="text-zinc-500 text-lg">Manage your personal information and preferences.</p>
            </div>
            
            <div className="bg-white border border-zinc-200 rounded-xl p-8 space-y-6 shadow-sm">
                {/* Name */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">Display Name</label>
                    <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                    />
                </div>

                {/* Target Roles */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">Target Roles</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {editRoles.map(role => (
                            <span key={role} className="inline-flex items-center gap-1 bg-zinc-100 px-2 py-1 rounded text-sm text-zinc-800">
                                {role}
                                <button onClick={() => removeRole(role)} className="hover:text-red-500"><X size={14}/></button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={editRoleInput}
                            onChange={(e) => setEditRoleInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addRole()}
                            placeholder="Add a new role..."
                            className="flex-1 h-9 px-3 text-sm rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                        />
                        <Button type="button" size="sm" variant="secondary" onClick={addRole}>
                            <Plus size={16} />
                        </Button>
                    </div>
                </div>

                {/* Date */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">Target Start Date</label>
                    <input 
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                         className="w-full h-10 px-3 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all bg-transparent"
                    />
                </div>

                {/* Action */}
                <div className="pt-4 flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full sm:w-auto">
                        {isSaving ? (
                            <>Saving...</>
                        ) : (
                            <><Save className="mr-2 w-4 h-4" /> Save Changes</>
                        )}
                    </Button>
                </div>
            </div>
            
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6">
                <h4 className="font-medium text-zinc-900 mb-2">Data Privacy</h4>
                <p className="text-sm text-zinc-500">
                    Your data is stored locally on this device. Clearing your browser cache will remove your profile.
                </p>
            </div>
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
            {user?.name ? user.name.split(' ')[0] : 'Profile'}
          </button>
          <button
            onClick={handleSignOut}
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