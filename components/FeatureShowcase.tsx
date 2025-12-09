import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Video, Users, GraduationCap, CheckCircle2 } from 'lucide-react';
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
    id: 'mentorship',
    title: 'Mentorship',
    description: 'Connect with industry experts. Find mentors from top companies who can guide your career path and provide actionable advice.',
    icon: Users,
    mockupType: 'mentorship'
  },
  {
    id: 'upskill',
    title: 'Upskill',
    description: 'Curated paths to fill knowledge gaps. Get personalized learning roadmaps based on your target role and current skills.',
    icon: GraduationCap,
    mockupType: 'upskill'
  }
];

// --- Mockup Components for inside the browser ---

const ResumeMockup = () => (
  <div className="p-8 w-full h-full bg-zinc-50 flex justify-center items-start overflow-hidden">
    <div className="w-[80%] bg-white shadow-lg h-[120%] border border-zinc-100 p-8 flex flex-col gap-6 scale-95 origin-top">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-zinc-100 pb-6">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-zinc-900 rounded-md"></div>
          <div className="h-3 w-32 bg-zinc-200 rounded-md"></div>
        </div>
        <div className="flex gap-2">
           <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
             <CheckCircle2 className="w-3 h-3" /> ATS Score: 98
           </div>
        </div>
      </div>
      {/* Content */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2 relative group">
            <div className="h-4 w-32 bg-zinc-200 rounded-md"></div>
            <div className="h-2 w-full bg-zinc-100 rounded-md"></div>
            <div className="h-2 w-[90%] bg-zinc-100 rounded-md"></div>
            {i === 1 && (
              <div className="absolute -right-4 top-0 bg-black text-white text-[10px] px-2 py-1 rounded shadow-lg translate-x-full animate-pulse">
                Action verb optimized
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const InterviewMockup = () => (
  <div className="w-full h-full bg-zinc-900 flex flex-col">
    <div className="flex-1 p-4 flex gap-4">
      {/* Main Speaker */}
      <div className="flex-1 bg-zinc-800 rounded-lg relative overflow-hidden flex items-center justify-center">
         <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
           <Users size={48} className="opacity-20" />
         </div>
         <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded text-white text-xs">
           AI Interviewer
         </div>
         {/* Audio Wave */}
         <div className="flex gap-1 items-center h-8">
            {[...Array(10)].map((_, i) => (
                <div key={i} className="w-1 bg-white animate-bounce" style={{ height: `${Math.random() * 20 + 10}px`, animationDelay: `${i * 0.1}s` }}></div>
            ))}
         </div>
      </div>
      {/* Sidebar / Analysis */}
      <div className="w-64 bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50 hidden md:block">
        <h4 className="text-zinc-400 text-xs uppercase font-semibold mb-4">Real-time Analysis</h4>
        <div className="space-y-4">
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-300"><span>Confidence</span><span>92%</span></div>
                <div className="h-1 bg-zinc-700 rounded-full overflow-hidden"><div className="h-full w-[92%] bg-green-500"></div></div>
            </div>
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-300"><span>Pacing</span><span>Good</span></div>
                <div className="h-1 bg-zinc-700 rounded-full overflow-hidden"><div className="h-full w-[70%] bg-blue-500"></div></div>
            </div>
            <div className="bg-zinc-800 p-2 rounded text-xs text-zinc-400 mt-4 border border-zinc-700">
                Tip: Maintain eye contact when answering the STAR method question.
            </div>
        </div>
      </div>
    </div>
    <div className="h-16 border-t border-zinc-800 flex items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white"><Video size={18} /></div>
        <div className="w-10 h-10 rounded-full bg-zinc-700"></div>
    </div>
  </div>
);

const MentorshipMockup = () => (
  <div className="w-full h-full bg-white flex flex-col p-6">
    <div className="mb-6">
      <h3 className="text-xl font-serif mb-1">Your Mentors</h3>
      <p className="text-zinc-500 text-sm">Suggested based on your career goals</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map(i => (
             <div key={i} className="border border-zinc-200 rounded-lg p-4 flex gap-4 items-start hover:border-zinc-900 transition-colors cursor-pointer group">
             <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                 <span className="font-serif italic text-lg">{i === 1 ? 'SJ' : 'MK'}</span>
             </div>
             <div>
                 <h4 className="font-medium text-sm">Senior Engineer</h4>
                 <p className="text-xs text-zinc-500 mb-2">Google • 8 years exp</p>
                 <div className="flex gap-1 flex-wrap">
                     <span className="px-2 py-0.5 bg-zinc-100 text-[10px] rounded-full">System Design</span>
                     <span className="px-2 py-0.5 bg-zinc-100 text-[10px] rounded-full">Leadership</span>
                 </div>
                 <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="text-[10px] bg-black text-white px-2 py-1 rounded">Connect</button>
                 </div>
             </div>
         </div>
        ))}
    </div>
  </div>
);

const UpskillMockup = () => (
  <div className="w-full h-full bg-zinc-50 p-6 flex gap-6">
    {/* Sidebar */}
    <div className="w-48 hidden md:block space-y-2">
        <div className="h-8 w-full bg-zinc-200 rounded animate-pulse mb-4"></div>
        <div className="h-4 w-3/4 bg-zinc-200 rounded"></div>
        <div className="h-4 w-2/3 bg-zinc-200 rounded"></div>
        <div className="h-4 w-4/5 bg-zinc-200 rounded"></div>
    </div>
    {/* Content */}
    <div className="flex-1 space-y-6">
        <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] uppercase font-bold rounded">In Progress</div>
                <div className="text-xs text-zinc-400">2h left</div>
            </div>
            <h3 className="font-serif text-xl mb-2">Advanced React Patterns</h3>
            <div className="w-full bg-zinc-100 h-2 rounded-full mb-4 overflow-hidden">
                <div className="bg-black w-[65%] h-full"></div>
            </div>
            <button className="w-full py-2 border border-zinc-200 rounded text-sm hover:bg-zinc-50">Continue Learning</button>
        </div>
        <div className="grid grid-cols-2 gap-4 opacity-50">
            <div className="bg-white h-24 rounded border border-zinc-200"></div>
            <div className="bg-white h-24 rounded border border-zinc-200"></div>
        </div>
    </div>
  </div>
);

// --- Main Component ---

export const FeatureShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-cycle logic
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % FEATURES.length);
    }, 4000); // 4 seconds per slide

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    setIsPaused(true);
  };

  const renderMockup = useCallback(() => {
    switch (FEATURES[activeTab].mockupType) {
      case 'resume': return <ResumeMockup />;
      case 'interview': return <InterviewMockup />;
      case 'mentorship': return <MentorshipMockup />;
      case 'upskill': return <UpskillMockup />;
      default: return <ResumeMockup />;
    }
  }, [activeTab]);

  const activeFeature = FEATURES[activeTab];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24">
      {/* Top Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-12 sm:mb-20">
        {FEATURES.map((feature, index) => {
          const isActive = index === activeTab;
          const Icon = feature.icon;
          return (
            <button
              key={feature.id}
              onClick={() => handleTabClick(index)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-all duration-300
                border
                ${isActive 
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-md transform scale-105' 
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                }
              `}
            >
              <Icon size={18} />
              {feature.title}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Side: Description */}
        <div className="lg:col-span-5 space-y-6 animate-in fade-in duration-500">
           <h3 key={activeFeature.title} className="text-3xl md:text-4xl font-serif text-zinc-900 animate-in fade-in slide-in-from-bottom-2 duration-300">
             {activeFeature.title}
           </h3>
           <p key={activeFeature.description} className="text-lg text-zinc-500 leading-relaxed animate-in fade-in slide-in-from-bottom-3 duration-300 delay-75">
             {activeFeature.description}
           </p>
        </div>

        {/* Right Side: Mockup */}
        <div className="lg:col-span-7">
          <BrowserFrame url={`clockin.ai/${activeFeature.mockupType}`}>
              {renderMockup()}
          </BrowserFrame>
        </div>
      </div>
    </section>
  );
};