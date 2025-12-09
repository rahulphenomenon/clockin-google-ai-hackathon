import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCw, X, ArrowRight, Loader2, Download, CloudUpload } from 'lucide-react';
import { Button } from '../ui/Button';
import { useUser } from '../../context/UserContext';
import { analyzeResume } from '../../utils/gemini';
import { SAMPLE_RESUME_BASE64, SAMPLE_RESUME_FILENAME } from '../../data/sampleResume';

export const ResumeOptimizer: React.FC = () => {
  const { user, updateUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }

    if (file.size > 4 * 1024 * 1024) { 
       setError('File size too large. Please upload a PDF smaller than 4MB.');
       return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      await processResume(base64, file.name);
    };
    reader.readAsDataURL(file);
    // Reset input
    e.target.value = '';
  };

  const loadSampleResume = async () => {
    const base64 = `data:application/pdf;base64,${SAMPLE_RESUME_BASE64}`;
    await processResume(base64, SAMPLE_RESUME_FILENAME);
  };

  const processResume = async (base64: string, fileName: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Analyze immediately
      const analysis = await analyzeResume(base64, user?.targetRoles || []);
      
      // Update User Context (Saves to localStorage)
      updateUser({
        resumeData: {
          fileName,
          base64,
          lastUpdated: new Date().toISOString()
        },
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
         await processResume(base64, file.name);
       };
       reader.readAsDataURL(file);
    } else {
        setError('Please drop a PDF file.');
    }
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
      
      <h3 className="text-lg font-medium text-zinc-900 mb-1">Click to upload</h3>
      <p className="text-zinc-500 text-sm">Upload a PDF file (Max 4 MB)</p>
      
      {error && (
          <div className="mt-4 p-2 bg-red-50 text-red-600 text-sm rounded-md inline-flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
          </div>
      )}
    </div>
  );

  const CurrentResumeCard = () => {
    if (!user?.resumeData) return null;

    return (
        <div className="bg-white border border-zinc-200 rounded-xl p-6 relative group hover:border-zinc-300 transition-colors">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h4 className="font-medium text-zinc-900 text-lg">{user.resumeData.fileName}</h4>
                        <p className="text-sm text-zinc-500">
                            Uploaded on {new Date(user.resumeData.lastUpdated).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                
                {/* Upload New Button - Top Right */}
                <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <CloudUpload size={16} />
                    Upload New
                </Button>
            </div>
            {/* Hidden Input for "Upload New" functionality */}
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

                {/* Decorative Elements */}
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

  // --- Main Render ---

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div>
        <h2 className="text-4xl font-serif text-zinc-900 mb-4">Resume Optimizer</h2>
        <p className="text-zinc-500 text-lg">Upload your current resume and let our AI tailor it for your dream job.</p>
        
        {/* Wireframe-like Tabs */}
        <div className="flex gap-8 mt-8 border-b border-zinc-200">
            <button className="pb-3 border-b-2 border-zinc-900 text-zinc-900 font-medium text-sm">Optimize</button>
            <button className="pb-3 border-b-2 border-transparent text-zinc-500 hover:text-zinc-800 font-medium text-sm transition-colors cursor-not-allowed opacity-50">Create (Coming Soon)</button>
        </div>
      </div>

      {/* Current Resume Section */}
      <section className="space-y-6">
         <h3 className="text-2xl font-serif text-zinc-900">Current Resume</h3>
         
         {isAnalyzing ? (
             <div className="border border-zinc-200 rounded-xl p-12 bg-white flex flex-col items-center justify-center text-center space-y-4">
                 <Loader2 className="w-8 h-8 text-zinc-900 animate-spin" />
                 <p className="text-zinc-600 font-medium">Analyzing your resume...</p>
                 <p className="text-zinc-400 text-sm">Checking ATS compatibility and impact metrics.</p>
             </div>
         ) : user?.resumeData ? (
             <CurrentResumeCard />
         ) : (
             <>
                <UploadBox />
                {/* Sample Resume Banner */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h4 className="font-medium text-zinc-900 text-lg">Use sample resume</h4>
                        <p className="text-sm text-zinc-500">John Doe, aspiring product manager</p>
                    </div>
                    <Button onClick={loadSampleResume} variant="secondary" className="bg-white shadow-sm border border-zinc-200">
                        <CloudUpload className="w-4 h-4 mr-2" /> Upload
                    </Button>
                </div>
             </>
         )}
      </section>

      {/* Analysis Section */}
      {user?.resumeAnalysis && !isAnalyzing && (
          <section className="space-y-6 pt-6 border-t border-zinc-100">
              <h3 className="text-2xl font-serif text-zinc-900">Analysis</h3>
              <AnalysisResults />
          </section>
      )}

    </div>
  );
};