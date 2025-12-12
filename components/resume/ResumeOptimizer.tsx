
import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCw, X, ArrowRight, Loader2, Download, CloudUpload, PenTool, Copy, Check, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { useUser } from '../../context/UserContext';
import { analyzeResume, generateCoverLetter } from '../../utils/gemini';

const SAMPLE_JD = `Project Manager — ACME Technologies
Location: Hybrid (SF / Remote)
Employment Type: Full-time

About ACME
ACME Technologies is a fast-growing software company building intelligent, scalable products that power the next generation of digital experiences. We combine deep technical expertise with a relentless focus on user-centric design to solve complex problems elegantly.

Role Overview
We are looking for a highly organized, execution-focused Project Manager to lead cross-functional teams and deliver high-impact projects across ACME’s product ecosystem. You’ll partner closely with engineering, design, and business stakeholders to bring clarity, alignment, and predictable delivery to fast-moving initiatives.

What You’ll Do

Own end-to-end project planning, tracking, and delivery across multiple product teams

Translate business goals into actionable project plans, timelines, and resource requirements

Facilitate sprint planning, standups, retrospectives, and cross-team syncs

Identify risks early and build mitigation strategies to keep projects on track

Drive alignment across engineering, design, marketing, and leadership

Maintain clear communication channels and ensure stakeholders stay informed

Continuously improve processes, workflows, and project documentation

Ensure delivery quality and uphold ACME's standards of excellence

What You Bring

3–6 years of project or program management experience in tech/software

Strong understanding of Agile/Scrum methodologies

Proven ability to manage multiple complex projects simultaneously

Exceptional communication, prioritization, and problem-solving skills

Experience using tools like Jira, Asana, Linear, Notion, or equivalents

Ability to thrive in a fast-paced, ambiguous environment

Bonus: prior experience with SaaS, AI/ML products, or developer tools

Why ACME

Work with talented teams building products used by millions

Competitive compensation and benefits

Flexible work culture and remote-friendly policies

Clear growth pathways and opportunities to lead large initiatives

A culture that values ownership, innovation, and continuous learning`;

export const ResumeOptimizer: React.FC = () => {
  const { user, updateUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'analyze' | 'cover_letter'>('analyze');
  
  // Analyze Tab State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cover Letter Tab State
  const [clJobDescription, setClJobDescription] = useState('');
  const [clWordCount, setClWordCount] = useState<string>('');
  const [clResult, setClResult] = useState('');
  const [clIsGenerating, setClIsGenerating] = useState(false);
  const [clError, setClError] = useState<string | null>(null);
  const [clCopied, setClCopied] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      const msg = 'Please upload a PDF file.';
      activeTab === 'analyze' ? setError(msg) : setClError(msg);
      return;
    }

    if (file.size > 4 * 1024 * 1024) { 
       const msg = 'File size too large. Please upload a PDF smaller than 4MB.';
       activeTab === 'analyze' ? setError(msg) : setClError(msg);
       return;
    }

    if (activeTab === 'analyze') setError(null);
    else setClError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      await uploadResume(base64, file.name);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };
    const loadSampleResume = async () => {
        if (activeTab === 'analyze') {
            setError(null);
        } else {
            setClError(null);
        }

        try {
            // Fetch the actual PDF from your public/data folder
            const response = await fetch('../../data/sample_resume.pdf');
            const blob = await response.blob();
            
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
            
            await uploadResume(base64, 'sample_resume.pdf');
        } catch (err) {
            console.error(err);
            const msg = "Failed to load sample resume.";
            if (activeTab === 'analyze') {
                setError(msg);
            } else {
                setClError(msg);
            }
        }
    };

  // Only uploads the resume to state, does NOT analyze
  const uploadResume = async (base64: string, fileName: string) => {
     updateUser({
        resumeData: {
            fileName,
            base64,
            lastUpdated: new Date().toISOString()
        },
        // IMPORTANT: Clear previous analysis when a new resume is uploaded
        // so the user sees the "Analyze" button again.
        resumeAnalysis: undefined 
     });
  };

  const handleAnalyzeCurrentResume = async () => {
    if (!user?.resumeData) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const analysis = await analyzeResume(user.resumeData.base64, user.targetRoles || []);
      updateUser({
        resumeAnalysis: analysis
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
       const reader = new FileReader();
       reader.onload = async (event) => {
         const base64 = event.target?.result as string;
         await uploadResume(base64, file.name);
       };
       reader.readAsDataURL(file);
    } else {
        const msg = 'Please drop a PDF file.';
        activeTab === 'analyze' ? setError(msg) : setClError(msg);
    }
  };

  const handleGenerateCoverLetter = async () => {
      if (!user?.resumeData?.base64 || !clJobDescription) return;

      setClIsGenerating(true);
      setClError(null);
      setClResult('');

      try {
          const wordCount = clWordCount ? parseInt(clWordCount) : undefined;
          const result = await generateCoverLetter(user.resumeData.base64, clJobDescription, wordCount);
          setClResult(result);
      } catch (err) {
          console.error(err);
          setClError("Failed to generate cover letter. Please try again.");
      } finally {
          setClIsGenerating(false);
      }
  };

  const handleCopy = () => {
      navigator.clipboard.writeText(clResult);
      setClCopied(true);
      setTimeout(() => setClCopied(false), 2000);
  };

  // --- Subcomponents ---

  const UploadBox = () => (
    <div 
      className="border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50 p-12 text-center transition-all hover:bg-zinc-100/50 hover:border-zinc-300 relative group cursor-pointer"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        accept="application/pdf" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      
      <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-zinc-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
         <FileText className="w-6 h-6 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
      </div>
      
      <h3 className="text-lg font-medium text-zinc-900 mb-1">Click to upload resume</h3>
      <p className="text-zinc-500 text-sm">Upload a PDF file (Max 4 MB)</p>
      
      {(error || clError) && (
          <div className="mt-4 p-2 bg-red-50 text-red-600 text-sm rounded-md inline-flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error || clError}
          </div>
      )}
    </div>
  );

  const CurrentResumeCard = () => {
    if (!user?.resumeData) return null;

    const handleOpenResume = () => {
        if (!user?.resumeData?.base64) return;
        try {
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
    };

    return (
        <div className="bg-white border border-zinc-200 rounded-xl p-4 md:p-6 relative group hover:border-zinc-300 transition-colors">
            <div className="flex items-center justify-between gap-4">
                <div 
                    className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
                    onClick={handleOpenResume}
                    title="View Resume"
                >
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                        <FileText size={24} />
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-medium text-zinc-900 text-base md:text-lg group-hover:underline decoration-zinc-200 underline-offset-4 decoration-2 transition-all truncate">
                            {user.resumeData.fileName}
                        </h4>
                        <p className="text-xs md:text-sm text-zinc-500 truncate">
                            Uploaded {new Date(user.resumeData.lastUpdated).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                
                <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-2 shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <CloudUpload size={16} />
                    <span className="hidden sm:inline">Replace</span>
                </Button>
            </div>
            <input 
                type="file" 
                accept="application/pdf" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
            />
        </div>
    );
  };

  const AnalysisResults = () => {
    if (!user?.resumeAnalysis) return null;
    const { overallScore, overview, categories } = user.resumeAnalysis;

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Score & Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Overall Score */}
            <div className="md:col-span-1 bg-zinc-900 text-white rounded-xl p-8 flex flex-col justify-between relative overflow-hidden min-h-[240px]">
                <div className="relative z-10">
                   <h4 className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2">Overall Score</h4>
                   <div className="flex items-baseline gap-1">
                      <span className="text-7xl font-serif">{overallScore}</span>
                      <span className="text-zinc-500 text-xl">/100</span>
                   </div>
                </div>
                
                <div className="relative z-10">
                     <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-white transition-all duration-1000 ease-out" style={{ width: `${overallScore}%` }}></div>
                     </div>
                     <p className="text-zinc-400 text-xs mt-2 text-right">Based on AI analysis</p>
                </div>

                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            </div>

            {/* Executive Summary */}
            <div className="md:col-span-2 bg-white border border-zinc-200 rounded-xl p-8 flex flex-col justify-center">
                <h3 className="font-serif text-2xl text-zinc-900 mb-4">Executive Summary</h3>
                <p className="text-zinc-600 leading-relaxed mb-6">
                    {overview.summary}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-2">
                         <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Strengths</span>
                         {overview.strengths.slice(0, 2).map((item, i) => (
                             <div key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                                 <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                 {item}
                             </div>
                         ))}
                     </div>
                     <div className="space-y-2">
                         <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Focus Areas</span>
                         {overview.improvements.slice(0, 2).map((item, i) => (
                             <div key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                                 <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                 {item}
                             </div>
                         ))}
                     </div>
                </div>
            </div>
        </div>

        {/* Detailed Breakdown */}
        <div>
            <h3 className="font-serif text-2xl text-zinc-900 mb-6">Category Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category, idx) => (
                    <div key={idx} className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-zinc-900">{category.name}</h4>
                            <span className={`text-sm font-medium px-2 py-0.5 rounded
                                ${category.score >= 80 ? 'bg-green-100 text-green-700' : 
                                  category.score >= 60 ? 'bg-amber-100 text-amber-700' : 
                                  'bg-red-100 text-red-700'}`
                            }>
                                {category.score}/100
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden mb-3">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ${
                                  category.score >= 80 ? 'bg-green-500' : 
                                  category.score >= 60 ? 'bg-amber-500' : 
                                  'bg-red-500'
                                }`} 
                                style={{ width: `${category.score}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-zinc-500 leading-snug">
                            {category.feedback}
                        </p>
                    </div>
                ))}
            </div>
        </div>

      </div>
    );
  };

  const CoverLetterView = () => (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="flex flex-col gap-8">
              {/* Input Section */}
              <div className="space-y-6">
                   <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 block">Resume</label>
                        {user?.resumeData ? (
                             <div className="flex items-center justify-between p-3 bg-white border border-zinc-200 rounded-lg shadow-sm">
                                <div className="flex items-center gap-3 overflow-hidden">
                                     <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shrink-0">
                                        <FileText size={20} />
                                     </div>
                                     <div className="min-w-0">
                                         <p className="text-sm font-medium text-zinc-900 truncate">{user.resumeData.fileName}</p>
                                         <p className="text-xs text-zinc-500">Ready for generation</p>
                                     </div>
                                </div>
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        accept="application/pdf" 
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full"
                                        onChange={handleFileUpload}
                                    />
                                    <Button variant="outline" size="sm" className="pointer-events-none">
                                        Replace
                                    </Button>
                                </div>
                             </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50 p-6 text-center transition-all hover:bg-zinc-100/50 hover:border-zinc-300 relative group cursor-pointer">
                                    <input 
                                        type="file" 
                                        accept="application/pdf" 
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleFileUpload}
                                    />
                                    <div className="w-10 h-10 bg-white rounded-full shadow-sm border border-zinc-100 flex items-center justify-center mx-auto mb-2">
                                        <Upload className="w-5 h-5 text-zinc-400" />
                                    </div>
                                    <p className="text-sm font-medium text-zinc-900">Upload Resume</p>
                                    <p className="text-xs text-zinc-500">PDF up to 4MB</p>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-zinc-900">Use sample resume</p>
                                        <p className="text-xs text-zinc-500 truncate">Sample Project Manager Resume</p>
                                    </div>
                                    <Button onClick={loadSampleResume} variant="secondary" size="sm" className="bg-white shadow-sm border border-zinc-200 shrink-0">
                                        <CloudUpload className="w-3 h-3 mr-2" /> Upload
                                    </Button>
                                </div>
                            </div>
                        )}
                   </div>

                   <div>
                       <div className="flex justify-between items-center mb-2">
                           <label className="text-sm font-medium text-zinc-700 block">Job Description</label>
                           <button 
                               onClick={() => setClJobDescription(SAMPLE_JD)}
                               className="text-xs text-zinc-500 hover:text-zinc-900 hover:underline transition-colors"
                           >
                               Sample job description
                           </button>
                       </div>
                       <textarea 
                          value={clJobDescription}
                          onChange={(e) => setClJobDescription(e.target.value)}
                          placeholder="Paste the full job description here..."
                          className="w-full h-64 p-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none bg-white shadow-sm transition-all"
                       />
                   </div>
                   
                   <div>
                       <label className="text-sm font-medium text-zinc-700 block mb-2">Maximum Word Count (Optional)</label>
                       <input 
                          type="number"
                          value={clWordCount}
                          onChange={(e) => setClWordCount(e.target.value)}
                          placeholder="e.g. 300"
                          className="w-full h-10 px-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                       />
                   </div>

                   <Button 
                      onClick={handleGenerateCoverLetter} 
                      disabled={clIsGenerating || !clJobDescription || !user?.resumeData}
                      className="w-full h-12 text-base"
                   >
                       {clIsGenerating ? (
                           <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                       ) : (
                           <><PenTool className="w-4 h-4 mr-2" /> Generate Cover Letter</>
                       )}
                   </Button>

                   {clError && (
                       <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start justify-between">
                           <div className="flex items-start gap-3">
                               <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                               <div>
                                   <p className="text-sm font-medium text-red-900">Generation Failed</p>
                                   <p className="text-sm text-red-700 mt-1">{clError}</p>
                               </div>
                           </div>
                           <Button size="sm" variant="outline" onClick={handleGenerateCoverLetter} className="bg-white border-red-200 text-red-700 hover:bg-red-50">
                               Retry
                           </Button>
                       </div>
                   )}
              </div>

              {/* Output Section */}
              <div className="relative h-full min-h-[500px] bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden flex flex-col">
                  {clResult ? (
                      <>
                        <div className="flex items-center justify-between p-4 border-b border-zinc-200 bg-white">
                            <h4 className="font-medium text-zinc-900">Generated Cover Letter</h4>
                            <Button size="sm" variant="ghost" onClick={handleCopy} className="text-zinc-500 hover:text-zinc-900">
                                {clCopied ? <Check size={16} className="mr-1" /> : <Copy size={16} className="mr-1" />}
                                {clCopied ? 'Copied' : 'Copy'}
                            </Button>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto whitespace-pre-wrap text-zinc-800 leading-relaxed font-sans text-lg">
                            {clResult}
                        </div>
                      </>
                  ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400">
                          {clIsGenerating ? (
                              <>
                                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-zinc-300" />
                                  <p>AI is writing your cover letter...</p>
                              </>
                          ) : (
                              <>
                                  <FileText className="w-12 h-12 mb-4 text-zinc-300" />
                                  <p className="max-w-xs">Enter a job description and click generate to see your tailored cover letter here.</p>
                              </>
                          )}
                      </div>
                  )}
              </div>
          </div>
      </div>
  );

  // --- Main Render ---

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header & Tabs */}
      <div className="space-y-6">
           <div>
               <h2 className="text-4xl font-serif text-zinc-900 mb-2">Resume & Cover Letter</h2>
               <p className="text-zinc-500 text-lg">Optimize your resume and generate tailored cover letters.</p>
           </div>
           
           <div className="flex gap-8 border-b border-zinc-200">
              <button 
                  onClick={() => setActiveTab('analyze')}
                  className={`pb-3 border-b-2 text-sm font-medium transition-colors ${activeTab === 'analyze' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
              >
                  Resume Analysis
              </button>
              <button 
                  onClick={() => setActiveTab('cover_letter')}
                  className={`pb-3 border-b-2 text-sm font-medium transition-colors ${activeTab === 'cover_letter' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
              >
                  Create Cover Letter
              </button>
           </div>
      </div>

      {activeTab === 'analyze' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {isAnalyzing ? (
                    <div className="border border-zinc-200 rounded-xl p-12 bg-white flex flex-col items-center justify-center text-center space-y-4">
                        <Loader2 className="w-8 h-8 text-zinc-900 animate-spin" />
                        <p className="text-zinc-600 font-medium">Analyzing your resume...</p>
                        <p className="text-zinc-400 text-sm">Checking ATS compatibility and impact metrics.</p>
                    </div>
               ) : user?.resumeData ? (
                   <>
                       <CurrentResumeCard />
                       {user.resumeAnalysis ? (
                           <AnalysisResults />
                       ) : (
                           <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 flex items-center justify-between">
                               <div>
                                   <h3 className="font-medium text-zinc-900">Ready to Analyze</h3>
                                   <p className="text-sm text-zinc-500">Get a detailed score and feedback for your resume.</p>
                               </div>
                               <div className="flex items-center gap-2">
                                    <Button onClick={handleAnalyzeCurrentResume} disabled={isAnalyzing} className="shadow-md">
                                        <Sparkles className="w-4 h-4 mr-2" /> Analyze Now
                                    </Button>
                               </div>
                           </div>
                       )}
                       {error && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-red-900">Analysis Failed</p>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                </div>
                            </div>
                       )}
                   </>
               ) : (
                   <>
                       <UploadBox />
                       {/* Sample Resume Banner */}
                       <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h4 className="font-medium text-zinc-900 text-lg">Use sample resume</h4>
                                <p className="text-sm text-zinc-500">Sample Project Manager Resume</p>
                            </div>
                            <Button onClick={loadSampleResume} variant="secondary" className="bg-white shadow-sm border border-zinc-200">
                                <CloudUpload className="w-4 h-4 mr-2" /> Upload
                            </Button>
                        </div>
                   </>
               )}
          </div>
      )}

      {activeTab === 'cover_letter' && (
          <CoverLetterView />
      )}
    </div>
  );
};
