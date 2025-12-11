
import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Video, GraduationCap, CheckCircle2, Camera, User, Sparkles, BrainCircuit, Mic, BarChart2, Briefcase, Users } from 'lucide-react';
import { BrowserFrame } from './ui/BrowserFrame';
import { Feature } from '../types';

const FEATURES: Feature[] = [
  {
    id: 'resume',
    title: 'Resume AI',
    description: 'Optimize your CV to pass ATS filters. Our AI analyzes your resume against job descriptions to ensure you stand out.',
    icon: FileText,
    mockupType: 'resume'
  },
  {
    id: 'interview',
    title: 'Mock Interview',
    description: 'Practice with real-time feedback. Simulate behavioral and technical interviews with an AI that adapts to your responses.',
    icon: Video,
    mockupType: 'interview'
  },
  {
    id: 'upskill',
    title: 'Upskill & Learn',
    description: 'Curated paths to fill knowledge gaps. Get personalized learning roadmaps based on your target role and current skills.',
    icon: GraduationCap,
    mockupType: 'upskill'
  },
  {
    id: 'photo-booth',
    title: 'Photo Booth',
    description: 'Turn any photo of you into a professional headshot. Customize your setting and outfit to create the perfect LinkedIn profile picture.',
    icon: Camera,
    mockupType: 'photo-booth'
  },
  {
    id: 'job-match',
    title: 'Job Match',
    description: 'Stop searching, start applying. We curate jobs that fit your profile and our AI fills out the applications for you in one click.',
    icon: Briefcase,
    mockupType: 'job-match'
  },
  {
    id: 'mentor-match',
    title: 'Mentor Match',
    description: 'Connect with mentors at your target companies for application referrals and insider interview tips.',
    icon: Users,
    mockupType: 'mentorship'
  }
];

// --- Mockup Components ---

const ResumeMockup = () => (
  <div className="w-full h-full bg-zinc-50/50 p-6 md:p-8 flex items-center justify-center">
     <div className="w-full h-full flex gap-6">
        {/* Left: Score Card */}
        <div className="w-1/3 min-w-[140px] bg-zinc-900 rounded-2xl p-5 flex flex-col justify-between text-white shadow-2xl relative overflow-hidden border border-zinc-800">
            <div className="relative z-10">
               <div className="flex items-center gap-2 mb-1 opacity-70">
                   <BarChart2 size={14} />
                   <span className="text-[10px] uppercase tracking-wider font-semibold">ATS Score</span>
               </div>
               <div className="text-5xl md:text-6xl font-serif">85</div>
            </div>
            
            <div className="relative z-10 space-y-3">
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-400">
                        <span>Impact</span>
                        <span>High</span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full w-[85%] bg-white rounded-full"></div>
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-400">
                        <span>Keywords</span>
                        <span>Med</span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full w-[60%] bg-zinc-500 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Background Blob */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 blur-3xl rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 blur-2xl rounded-full pointer-events-none"></div>
        </div>

        {/* Right: Content Analysis */}
        <div className="flex-1 bg-white rounded-2xl border border-zinc-200/60 p-5 shadow-lg shadow-zinc-200/50 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <FileText size={64} />
            </div>
            
            <div className="space-y-2 relative z-10">
                <div className="h-4 w-24 bg-zinc-100 rounded-md"></div>
                <div className="h-6 w-3/4 bg-zinc-900 rounded-md opacity-90"></div>
            </div>

            <div className="space-y-3 mt-2 relative z-10">
                <div className="p-3 bg-green-50/50 border border-green-100 rounded-xl flex items-start gap-3">
                    <div className="p-1 bg-green-100 rounded-full text-green-600 mt-0.5"><CheckCircle2 size={12} /></div>
                    <div className="space-y-1.5 flex-1">
                        <div className="h-2 w-16 bg-green-200/50 rounded-full"></div>
                        <div className="h-1.5 w-full bg-green-100/50 rounded-full"></div>
                        <div className="h-1.5 w-4/5 bg-green-100/50 rounded-full"></div>
                    </div>
                </div>
                <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl flex items-start gap-3 opacity-60">
                    <div className="p-1 bg-zinc-200 rounded-full text-zinc-400 mt-0.5"><div className="w-3 h-3"></div></div>
                    <div className="space-y-1.5 flex-1">
                         <div className="h-2 w-20 bg-zinc-200 rounded-full"></div>
                         <div className="h-1.5 w-full bg-zinc-100 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
     </div>
  </div>
);

const InterviewMockup = () => (
  <div className="w-full h-full bg-zinc-950 flex flex-col relative overflow-hidden">
     {/* Background Grid */}
     <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
     
     <div className="relative z-10 flex-1 flex items-center justify-center gap-8 md:gap-16 px-8">
        {/* AI Avatar */}
        <div className="flex flex-col items-center gap-4">
             <div className="relative">
                 <div className="w-28 h-28 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl shadow-black/50">
                     <span className="font-serif text-3xl text-zinc-500">AI</span>
                 </div>
                 {/* Speaking Rings */}
                 <div className="absolute -inset-2 border border-blue-500/20 rounded-full animate-ping [animation-duration:2s]"></div>
                 <div className="absolute -inset-4 border border-blue-500/10 rounded-full animate-pulse"></div>
             </div>
             <div className="flex gap-1">
                 {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-blue-500/50 animate-bounce" style={{ animationDelay: `${i*0.1}s` }}></div>)}
             </div>
        </div>

        {/* User Avatar */}
        <div className="flex flex-col items-center gap-4 opacity-50 scale-90">
             <div className="w-24 h-24 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                 <span className="font-serif text-2xl text-zinc-400">You</span>
             </div>
        </div>
     </div>

     {/* Bottom Bar */}
     <div className="h-16 bg-zinc-900/80 backdrop-blur border-t border-zinc-800 flex items-center justify-between px-6">
         <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
             <div className="h-2 w-12 bg-zinc-800 rounded-full"></div>
         </div>
         <div className="flex gap-4">
             <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center"><Mic size={14} className="text-zinc-400" /></div>
             <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center"><Video size={14} className="text-red-500" /></div>
         </div>
     </div>
  </div>
);

const UpskillMockup = () => (
  <div className="w-full h-full bg-white p-8 flex flex-col gap-6">
      {/* Header Progress */}
      <div className="flex items-end justify-between">
          <div className="space-y-1">
              <div className="flex items-center gap-2">
                  <BrainCircuit size={16} className="text-zinc-400" />
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Knowledge Path</span>
              </div>
              <div className="h-6 w-32 bg-zinc-900 rounded-md"></div>
          </div>
          <div className="text-2xl font-serif text-zinc-900">42%</div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
          <div className="w-[42%] h-full bg-zinc-900 rounded-full"></div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="p-4 rounded-xl bg-zinc-900 text-white shadow-xl transform hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-3">
                  <div className="p-1.5 bg-zinc-800 rounded-lg"><CheckCircle2 size={14} className="text-green-400" /></div>
              </div>
              <div className="h-2 w-12 bg-zinc-700 rounded-full mb-2"></div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full mb-1"></div>
              <div className="h-1.5 w-3/4 bg-zinc-800 rounded-full"></div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 transition-colors">
               <div className="flex justify-between items-start mb-3">
                  <div className="p-1.5 bg-zinc-100 rounded-lg"><div className="w-3.5 h-3.5 border-2 border-zinc-300 rounded-full"></div></div>
              </div>
              <div className="h-2 w-16 bg-zinc-200 rounded-full mb-2"></div>
              <div className="h-1.5 w-full bg-zinc-100 rounded-full mb-1"></div>
              <div className="h-1.5 w-1/2 bg-zinc-100 rounded-full"></div>
          </div>
          
           <div className="p-4 rounded-xl border border-zinc-200 bg-white opacity-50">
               <div className="h-2 w-10 bg-zinc-200 rounded-full mb-3"></div>
               <div className="space-y-1">
                   <div className="h-1.5 w-full bg-zinc-100 rounded-full"></div>
                   <div className="h-1.5 w-full bg-zinc-100 rounded-full"></div>
               </div>
          </div>
           <div className="p-4 rounded-xl border border-zinc-200 bg-white opacity-50">
               <div className="h-2 w-10 bg-zinc-200 rounded-full mb-3"></div>
               <div className="space-y-1">
                   <div className="h-1.5 w-full bg-zinc-100 rounded-full"></div>
                   <div className="h-1.5 w-full bg-zinc-100 rounded-full"></div>
               </div>
          </div>
      </div>
  </div>
);

const PhotoBoothMockup = () => (
  <div className="w-full h-full bg-zinc-900 relative overflow-hidden flex items-center justify-center">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex items-center gap-6">
          {/* Input Card */}
          <div className="w-28 h-36 bg-zinc-800 rounded-xl border border-zinc-700 shadow-2xl rotate-[-6deg] flex flex-col items-center justify-center gap-2 p-2 opacity-60 backdrop-blur-sm">
              <div className="w-full h-full bg-zinc-700/50 rounded-lg flex items-center justify-center">
                  <User size={32} className="text-zinc-500" />
              </div>
          </div>

          {/* Transformation Arrow */}
          <div className="flex flex-col items-center gap-1 text-white/40">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
              <Sparkles size={16} className="text-yellow-400 animate-pulse" />
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          </div>

          {/* Output Card */}
          <div className="w-36 h-48 bg-white rounded-xl rotate-[3deg] shadow-2xl shadow-blue-500/20 p-1.5 relative animate-in zoom-in-95 duration-700">
               <div className="w-full h-full bg-zinc-100 rounded-lg overflow-hidden relative">
                   <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-200"></div>
                   <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-zinc-800 rounded-full translate-y-8"></div>
                   <div className="absolute top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-zinc-300 rounded-full border-4 border-white shadow-sm"></div>
                   {/* Shine */}
                   <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/40 to-transparent pointer-events-none"></div>
               </div>
               
               {/* Badge */}
               <div className="absolute -top-3 -right-3 bg-zinc-900 text-white text-[10px] font-medium px-2 py-1 rounded-full shadow-lg border border-zinc-700 flex items-center gap-1">
                   <Sparkles size={8} className="text-yellow-400" /> Pro
               </div>
          </div>
      </div>
  </div>
);

const JobMatchMockup = () => (
    <div className="w-full h-full bg-zinc-900 relative overflow-hidden flex items-center justify-center">
        {/* Abstract representation of matching */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-zinc-950"></div>
        
        {/* Central Hub */}
        <div className="relative z-10 w-24 h-24 bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-700 shadow-2xl">
             <Briefcase size={32} className="text-white" />
             {/* Emitting signals */}
             <div className="absolute -inset-4 border border-zinc-700/50 rounded-3xl animate-ping [animation-duration:3s]"></div>
        </div>

        {/* Orbiting Job Cards */}
        {[0, 1, 2].map((i) => (
            <div 
                key={i}
                className="absolute w-16 h-20 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm"
                style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 120}deg) translateY(-100px) rotate(-${i * 120}deg)`,
                }}
            ></div>
        ))}
        
        <div className="absolute bottom-8 text-center">
             <div className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium border border-blue-500/30">
                AI Auto-Apply
             </div>
        </div>
    </div>
);

const MentorshipMockup = () => (
  <div className="w-full h-full bg-zinc-50 p-6 flex flex-col items-center justify-center gap-8">
      {/* Mentor Profile Card */}
      <div className="w-64 bg-white rounded-xl shadow-xl border border-zinc-100 p-6 flex flex-col items-center text-center relative transform hover:scale-105 transition-transform duration-500">
          <div className="w-20 h-20 rounded-full bg-zinc-100 mb-4 overflow-hidden relative border-2 border-indigo-100">
               <div className="absolute inset-0 flex items-center justify-center bg-indigo-50 text-indigo-500 font-serif text-2xl">JS</div>
          </div>
          <h3 className="font-serif text-lg text-zinc-900">Sarah Jenkins</h3>
          <p className="text-xs text-zinc-500 mb-4">Senior PM @ Google</p>
          
          <div className="flex gap-2 w-full">
              <div className="flex-1 py-1.5 bg-indigo-50 text-indigo-700 text-[10px] uppercase tracking-wide rounded font-semibold">Referral</div>
              <div className="flex-1 py-1.5 bg-zinc-50 text-zinc-600 text-[10px] uppercase tracking-wide rounded font-semibold">Tips</div>
          </div>
          
          {/* Connection Line */}
           <div className="absolute -right-12 top-1/2 w-12 h-[2px] bg-indigo-200 hidden md:block"></div>
           <div className="absolute -right-12 top-1/2 -translate-y-[4px] w-2 h-2 bg-indigo-500 rounded-full hidden md:block animate-ping"></div>
      </div>
  </div>
);


// --- Main Component ---

export const FeatureShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Auto-cycle logic
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % FEATURES.length);
    }, 5000); 

    return () => clearInterval(interval);
  }, [activeTab]); // Reset interval whenever activeTab changes (e.g. user click)

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const renderMockup = useCallback(() => {
    switch (FEATURES[activeTab].mockupType) {
      case 'resume': return <ResumeMockup />;
      case 'interview': return <InterviewMockup />;
      case 'upskill': return <UpskillMockup />;
      case 'photo-booth': return <PhotoBoothMockup />;
      case 'job-match': return <JobMatchMockup />;
      case 'mentorship': return <MentorshipMockup />;
      default: return <ResumeMockup />;
    }
  }, [activeTab]);

  const activeFeature = FEATURES[activeTab];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24">
      {/* Styles for progress bar animation */}
      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 5s linear forwards;
        }
      `}</style>

      {/* Horizontal Tabs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12 sm:mb-16">
        {FEATURES.map((feature, index) => {
          const isActive = index === activeTab;
          const Icon = feature.icon;
          return (
            <button
              key={feature.id}
              onClick={() => handleTabClick(index)}
              className={`
                flex flex-col items-start gap-4 p-5 rounded-xl text-left transition-all duration-300 group relative overflow-hidden
                ${isActive 
                  ? 'bg-white shadow-xl shadow-zinc-200/50 border border-zinc-100 ring-1 ring-zinc-900/5 scale-[1.02]' 
                  : 'bg-transparent border border-transparent hover:bg-zinc-50'
                }
              `}
            >
              <div 
                className={`
                  p-2.5 rounded-lg transition-colors duration-300
                  ${isActive 
                    ? 'bg-zinc-900 text-white' 
                    : 'bg-white border border-zinc-200 text-zinc-500 group-hover:border-zinc-300 group-hover:text-zinc-700'
                  }
                `}
              >
                <Icon size={20} />
              </div>
              
              <span 
                className={`
                  font-medium text-sm md:text-base relative z-10
                  ${isActive ? 'text-zinc-900' : 'text-zinc-500 group-hover:text-zinc-900'}
                `}
              >
                {feature.title}
              </span>

              {/* Progress Bar */}
              {isActive && (
                <div className="absolute bottom-0 left-0 h-1 bg-zinc-100 w-full">
                  <div className="h-full bg-zinc-900 animate-progress"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Side: Description */}
        <div className="lg:col-span-5 pt-4">
           <div key={activeFeature.id} className="space-y-8 animate-fade">
             <div className="space-y-4">
                <h3 className="text-3xl md:text-4xl font-serif text-zinc-900">
                    {activeFeature.title}
                </h3>
                <p className="text-lg text-zinc-500 leading-relaxed">
                    {activeFeature.description}
                </p>
             </div>
           </div>
        </div>

        {/* Right Side: Mockup */}
        <div className="lg:col-span-7">
          <BrowserFrame url={`clockin.ai/${activeFeature.mockupType}`}>
              <div key={activeFeature.id} className="h-[400px] md:h-[500px] w-full animate-fadeScale overflow-hidden">
                {renderMockup()}
              </div>
          </BrowserFrame>
        </div>
      </div>
    </section>
  );
};
