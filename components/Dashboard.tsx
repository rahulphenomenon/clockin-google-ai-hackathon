
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  FileText, 
  Video, 
  Users, 
  GraduationCap, 
  User, 
  LogOut,
  Plus,
  X,
  Save,
  Download,
  Home,
  CheckCircle2,
  Circle,
  Layout,
  Briefcase,
  Camera,
  Sparkles,
  Search,
  MessageSquare,
  Upload,
  CloudUpload
} from 'lucide-react';
import { DashboardTab } from '../types';
import { Logo } from './Logo';
import { useUser } from '../context/UserContext';
import { Button } from './ui/Button';
import { ResumeOptimizer } from './resume/ResumeOptimizer';
import { PipelineBoard } from './pipeline/PipelineBoard';
import { InterviewPrep } from './interview/InterviewPrep';
import { UpskillTab } from './upskill/UpskillTab';
import { PhotoBooth } from './photo-booth/PhotoBooth';
import { BrowserFrame } from './ui/BrowserFrame';

interface DashboardProps {
  onNavigateHome: () => void;
}

const MAIN_NAV_ITEMS: { id: DashboardTab; label: string; icon: any }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'resume', label: 'Resume', icon: FileText },
  { id: 'pipeline', label: 'Pipeline', icon: Layout },
  { id: 'interview', label: 'Interview Prep', icon: Video },
  { id: 'upskill', label: 'Upskill and Learn', icon: GraduationCap },
  { id: 'photo-booth', label: 'Photo Booth', icon: Camera },
];

const COMING_SOON_NAV_ITEMS: { id: DashboardTab; label: string; icon: any }[] = [
  { id: 'job-match', label: 'Job Match', icon: Briefcase },
  { id: 'mentor', label: 'Mentor Match', icon: Users },
];

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateHome }) => {
  const { user, updateUser, clearUser } = useUser();
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');

  // Profile Edit State
  const [editName, setEditName] = useState('');
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [editRoleInput, setEditRoleInput] = useState('');
  const [editDate, setEditDate] = useState('');
  const [newResume, setNewResume] = useState<{ fileName: string; base64: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with user context on load/change
  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditRoles(user.targetRoles || []);
      setEditDate(user.startDate);
      setNewResume(null); // Reset pending resume on user refresh
    }
  }, [user]);

  // Check for unsaved changes
  const hasChanges = useMemo(() => {
    if (!user) return false;
    const currentName = user.name || '';
    const currentRoles = user.targetRoles || [];
    const currentDate = user.startDate || '';

    const nameChanged = editName !== currentName;
    const dateChanged = editDate !== currentDate;
    // Simple array comparison (assuming order matters or is preserved)
    const rolesChanged = JSON.stringify(editRoles) !== JSON.stringify(currentRoles);
    const resumeChanged = !!newResume;

    return nameChanged || dateChanged || rolesChanged || resumeChanged;
  }, [user, editName, editRoles, editDate, newResume]);

  const handleSignOut = () => {
    clearUser();
    onNavigateHome();
  };

  const handleSaveProfile = () => {
    setIsSaving(true);
    // Simulate network delay for "snappy" feel but realistic feedback
    setTimeout(() => {
      const updates: any = {
        name: editName,
        targetRoles: editRoles,
        startDate: editDate
      };

      if (newResume) {
        updates.resumeData = {
            fileName: newResume.fileName,
            base64: newResume.base64,
            lastUpdated: new Date().toISOString()
        };
      }

      updateUser(updates);
      setNewResume(null);
      setIsSaving(false);
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setNewResume({
                fileName: file.name,
                base64: base64
            });
        };
        reader.readAsDataURL(file);
    }
    // Reset value to allow re-uploading same file if needed
    e.target.value = '';
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
  
  const handleDownloadResume = () => {
    if (user?.resumeData?.base64) {
      const link = document.createElement('a');
      link.href = user.resumeData.base64;
      link.download = user.resumeData.fileName || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenResume = () => {
    if (user?.resumeData?.base64) {
      try {
        // Convert base64 to blob to open in new tab
        const arr = user.resumeData.base64.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/pdf';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } catch (e) {
        console.error("Error opening resume:", e);
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'pipeline':
        return <PipelineBoard />;
      case 'resume':
        return <ResumeOptimizer />;
      case 'interview':
        return <InterviewPrep />;
      case 'photo-booth':
        return <PhotoBooth />;
      case 'mentor':
        return (
          <div className="max-w-4xl mx-auto h-full flex flex-col justify-center items-center text-center animate-in fade-in pb-20">
            {/* Graphic */}
            <div className="relative w-full max-w-lg aspect-video bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden mb-10 flex items-center justify-center shadow-2xl">
                 {/* Background Grid */}
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50"></div>
                 
                 {/* Ambient Glow */}
                 <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-[50px]"></div>
                 <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-[50px]"></div>

                 {/* Connection Visual */}
                 <div className="relative z-10 flex items-center gap-12 sm:gap-20">
                     {/* User Node */}
                     <div className="flex flex-col items-center gap-3">
                         <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center shadow-lg relative">
                             <User className="text-zinc-400 w-8 h-8" />
                             <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-zinc-900"></div>
                         </div>
                     </div>

                     {/* Flowing Line */}
                     <div className="w-24 sm:w-32 h-[2px] bg-zinc-800 relative">
                          <div className="absolute top-1/2 left-0 w-full h-full bg-gradient-to-r from-transparent via-blue-400 to-transparent -translate-y-1/2 animate-[shimmer_2s_infinite] opacity-70"></div>
                          {/* Floating Icon */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-zinc-800 rounded-full border border-zinc-700 flex items-center justify-center shadow-lg">
                              <MessageSquare size={12} className="text-white" />
                          </div>
                     </div>

                     {/* Mentor Node */}
                     <div className="flex flex-col items-center gap-3">
                         <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                             <Users className="text-indigo-300 w-8 h-8" />
                         </div>
                     </div>
                 </div>
            </div>

            <div className="max-w-md space-y-6">
                 <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 text-zinc-600 text-sm font-medium animate-shimmer bg-[linear-gradient(110deg,#f4f4f5,45%,#ffffff,55%,#f4f4f5)] bg-[length:200%_100%] shadow-sm">
                    Coming Soon
                 </div>
                 <div>
                    <h2 className="text-4xl font-serif text-zinc-900 mb-4">Find your career guide</h2>
                    <p className="text-zinc-500 text-lg leading-relaxed">
                        Connect with mentors for application referrals and interview tips.
                    </p>
                 </div>
            </div>
          </div>
        );
      case 'job-match':
          return (
            <div className="max-w-4xl mx-auto h-full flex flex-col justify-center items-center text-center animate-in fade-in pb-20">
                {/* Graphic */}
                <div className="relative w-full max-w-lg aspect-video bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden mb-10 flex items-center justify-center shadow-2xl">
                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                    
                    {/* Central Radar/Hub */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 border border-white/5 rounded-full animate-[spin_10s_linear_infinite]"></div>
                        <div className="absolute w-48 h-48 border border-white/5 rounded-full animate-[spin_8s_linear_infinite_reverse]"></div>
                    </div>

                    {/* Central Node */}
                    <div className="relative z-20 w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Search className="text-white w-8 h-8" />
                    </div>

                    {/* Job Nodes (Flying In) */}
                    <div className="absolute top-1/4 right-1/4 translate-x-1/2 -translate-y-1/2 bg-zinc-800 p-2 rounded-lg border border-zinc-700 shadow-xl flex items-center gap-2 animate-bounce [animation-duration:3s]">
                        <div className="w-6 h-6 bg-white/10 rounded"></div>
                        <div className="h-2 w-16 bg-white/10 rounded-full"></div>
                        <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-800"></div>
                    </div>
                    
                    <div className="absolute bottom-1/3 left-1/4 -translate-x-1/2 translate-y-1/2 bg-zinc-800 p-2 rounded-lg border border-zinc-700 shadow-xl flex items-center gap-2 animate-bounce [animation-duration:4s]">
                         <div className="w-6 h-6 bg-white/10 rounded"></div>
                         <div className="h-2 w-12 bg-white/10 rounded-full"></div>
                         <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-800"></div>
                    </div>

                    {/* Connecting Beams */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 via-transparent to-transparent pointer-events-none"></div>
                </div>

                <div className="max-w-xl space-y-6">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 text-zinc-600 text-sm font-medium animate-shimmer bg-[linear-gradient(110deg,#f4f4f5,45%,#ffffff,55%,#f4f4f5)] bg-[length:200%_100%] shadow-sm">
                        Coming Soon
                    </div>
                    <div>
                        <h2 className="text-4xl font-serif text-zinc-900 mb-4">Jobs perfect for you</h2>
                        <p className="text-zinc-500 text-lg leading-relaxed">
                            A curated feed of jobs that fit your profile and requirements. Apply in one click, AI handles all application formalities.
                        </p>
                    </div>
                </div>
            </div>
          );
      case 'upskill':
        return <UpskillTab onNavigateToResume={() => setActiveTab('resume')} />;
      case 'home':
        const hasResume = !!user?.resumeData;
        const hasJobs = (user?.jobs?.length || 0) > 0;
        const completedCount = (hasResume ? 1 : 0) + (hasJobs ? 1 : 0);
        const progress = Math.round((completedCount / 4) * 100);

        return (
          <div className="max-w-2xl space-y-10 animate-in fade-in duration-500 pb-12">
            <div>
              <h2 className="text-4xl font-serif text-zinc-900 mb-2">
                Welcome, {user?.name ? user.name.split(' ')[0] : 'there'}
              </h2>
              <p className="text-zinc-500 text-lg">Let's get you ready for your next big opportunity.</p>
            </div>

            {/* Checklist Section */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-serif text-xl text-zinc-900">Your Progress</h3>
                    <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-1 rounded-full">
                        {progress}% Complete
                    </span>
                </div>
                <div className="space-y-1">
                    {/* Resume Item */}
                    <div 
                        onClick={() => !hasResume && setActiveTab('resume')}
                        className={`flex items-center gap-4 p-3 rounded-lg transition-colors group ${!hasResume ? 'hover:bg-zinc-50 cursor-pointer' : 'cursor-default'}`}
                    >
                        {hasResume ? (
                            <CheckCircle2 className="text-green-600 w-6 h-6 shrink-0" />
                        ) : (
                            <Circle className="text-zinc-300 w-6 h-6 shrink-0 group-hover:text-zinc-400" />
                        )}
                        <div className="flex-1">
                            <span className={`block font-medium ${hasResume ? "text-zinc-900 line-through decoration-zinc-400" : "text-zinc-900"}`}>
                                Upload Resume
                            </span>
                        </div>
                        {hasResume && <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">Done</span>}
                    </div>

                    {/* Mock Interview */}
                     <div 
                         onClick={() => setActiveTab('interview')}
                         className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-50 transition-colors group cursor-pointer"
                     >
                        <Circle className="text-zinc-300 w-6 h-6 shrink-0 group-hover:text-zinc-400" />
                        <span className="text-zinc-700 font-medium">Perform one mock interview</span>
                    </div>

                    {/* Skill Assessment */}
                     <div 
                         onClick={() => setActiveTab('upskill')}
                         className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-50 transition-colors group cursor-pointer"
                     >
                        <Circle className="text-zinc-300 w-6 h-6 shrink-0 group-hover:text-zinc-400" />
                        <span className="text-zinc-700 font-medium">Take a skill assessment</span>
                    </div>

                    {/* Pipeline */}
                     <div 
                        onClick={() => !hasJobs && setActiveTab('pipeline')}
                        className={`flex items-center gap-4 p-3 rounded-lg transition-colors group ${!hasJobs ? 'hover:bg-zinc-50 cursor-pointer' : 'cursor-default'}`}
                     >
                         {hasJobs ? (
                            <CheckCircle2 className="text-green-600 w-6 h-6 shrink-0" />
                        ) : (
                            <Circle className="text-zinc-300 w-6 h-6 shrink-0 group-hover:text-zinc-400" />
                        )}
                        <div className="flex-1">
                            <span className={`block font-medium ${hasJobs ? "text-zinc-900 line-through decoration-zinc-400" : "text-zinc-900"}`}>
                                Add one job to the pipeline
                            </span>
                        </div>
                        {hasJobs && <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">Done</span>}
                    </div>
                </div>
            </div>
            
            {/* Profile Settings */}
            <div className="pt-8 border-t border-zinc-200">
                <h3 className="text-2xl font-serif text-zinc-900 mb-6">Profile Settings</h3>
                
                <div className="bg-white border border-zinc-200 rounded-xl p-8 space-y-6 shadow-sm">
                    {/* Resume Section */}
                    <div className="pb-6 border-b border-zinc-100">
                        <label className="text-sm font-medium text-zinc-700 block mb-3">Saved Resume</label>
                        
                        <input 
                            type="file" 
                            accept="application/pdf" 
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />

                        {newResume ? (
                            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-white border border-blue-100 rounded-md">
                                        <FileText className="text-blue-500 w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm text-zinc-900 truncate">{newResume.fileName}</p>
                                        <p className="text-xs text-blue-600 font-medium">Ready to save</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Button size="sm" variant="ghost" onClick={() => setNewResume(null)} className="text-zinc-500 hover:text-red-600">
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : user?.resumeData ? (
                            <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-lg transition-colors hover:border-zinc-300 hover:bg-zinc-100">
                                <div 
                                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                                    onClick={handleOpenResume}
                                    title="View Resume"
                                >
                                    <div className="p-2 bg-white border border-zinc-100 rounded-md">
                                        <FileText className="text-zinc-500 w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm text-zinc-900 hover:underline decoration-zinc-300 underline-offset-2 truncate">{user.resumeData.fileName}</p>
                                        <p className="text-xs text-zinc-500">Updated {new Date(user.resumeData.lastUpdated).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Button size="sm" variant="outline" onClick={handleDownloadResume}>
                                        <Download className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                        <CloudUpload className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div 
                                className="border-2 border-dashed border-zinc-200 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-zinc-50 hover:border-zinc-300 transition-all group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center mb-2 group-hover:bg-white border border-zinc-100">
                                    <Upload className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600" />
                                </div>
                                <p className="text-sm font-medium text-zinc-700">Upload Resume</p>
                                <p className="text-xs text-zinc-500">PDF up to 4MB</p>
                            </div>
                        )}
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Display Name</label>
                        <input 
                            type="text" 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full h-10 px-3 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all bg-white"
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
                                className="flex-1 h-9 px-3 text-sm rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all bg-white"
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
                            className="w-full h-10 px-3 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all bg-white"
                        />
                    </div>

                    {/* Action */}
                    {hasChanges && (
                        <div className="pt-4 flex justify-end animate-in fade-in slide-in-from-bottom-2">
                            <Button 
                                onClick={handleSaveProfile} 
                                disabled={isSaving} 
                                className="w-full sm:w-auto"
                            >
                                {isSaving ? (
                                    <>Saving...</>
                                ) : (
                                    <><Save className="mr-2 w-4 h-4" /> Save Changes</>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
                
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 mt-6">
                    <h4 className="font-medium text-zinc-900 mb-2">Data Privacy</h4>
                    <p className="text-sm text-zinc-500">
                        Your data is stored locally on this device. Clearing your browser cache will remove your profile.
                    </p>
                </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex">
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
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1 mb-6">
            {MAIN_NAV_ITEMS.map((item) => {
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
          </div>

          <div>
            <h3 className="px-3 text-xs font-semibold text-zinc-400/70 uppercase tracking-wider mb-2">Coming Soon</h3>
            <div className="space-y-1">
              {COMING_SOON_NAV_ITEMS.map((item) => {
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
            </div>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-zinc-100 space-y-1">
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
      <main className="flex-1 ml-64 min-h-screen h-screen overflow-hidden">
        <div className="h-full p-8 md:p-12 overflow-y-auto">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};
