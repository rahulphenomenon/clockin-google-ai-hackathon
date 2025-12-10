import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, CheckCircle2, Mic, FileText, BarChart2, AlertCircle, PlayCircle, Clock, Circle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useUser } from '../../context/UserContext';
import { InterviewSession, TranscriptItem } from '../../types';
import { analyzeInterviewAudio, analyzeInterviewContent } from '../../utils/gemini';

interface SessionAnalysisProps {
    session: InterviewSession;
    audioBlob?: Blob; // The full session audio
    answerBlobs?: Blob[]; // Array of individual answer blobs
    onBack: () => void;
}

type StepStatus = 'pending' | 'loading' | 'success' | 'error';

interface AnalysisProgress {
    transcript: StepStatus;
    audioStats: StepStatus;
    content: StepStatus;
}

export const SessionAnalysis: React.FC<SessionAnalysisProps> = ({ session, audioBlob, answerBlobs, onBack }) => {
    const { updateUser, user } = useUser();
    const [activeTab, setActiveTab] = useState<'overview' | 'transcript'>('overview');
    
    // Detailed progress state
    const [progress, setProgress] = useState<AnalysisProgress>({
        transcript: 'pending',
        audioStats: 'pending',
        content: 'pending'
    });
    
    const [globalError, setGlobalError] = useState<string | null>(null);

    // Ref to track if component is mounted to prevent state updates on unmounted component
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        // If we have an answer blobs and missing analysis, start the process
        if (answerBlobs && answerBlobs.length > 0 && (!session.audioAnalysis || !session.contentAnalysis)) {
            runAnalysis();
        } else if (session.audioAnalysis && session.contentAnalysis) {
             setProgress({
                 transcript: 'success',
                 audioStats: 'success',
                 content: 'success'
             });
        }
    }, [answerBlobs, session]);

    const runAnalysis = async () => {
        if (!answerBlobs || answerBlobs.length === 0) return;
        setGlobalError(null);

        // --- Step 1 & 2: Audio Analysis (Transcript + Audio Stats) ---
        if (!session.audioAnalysis || !session.transcript) {
            if (isMounted.current) {
                setProgress(prev => ({ ...prev, transcript: 'loading', audioStats: 'loading' }));
            }
            
            try {
                // Use the questions list from the session if available, otherwise fallback
                const questionsList = session.questionsList && session.questionsList.length > 0 
                    ? session.questionsList 
                    : Array(session.questionCount).fill("Unknown Question");

                // Pass the array of answer blobs instead of single blob
                const audioResult = await analyzeInterviewAudio(answerBlobs, questionsList);
                
                // Get the structured transcript directly from the result
                const transcript = audioResult.transcript;

                // Update session locally and context
                const updatedSession = { 
                    ...session, 
                    transcript, 
                    audioAnalysis: audioResult.audioAnalysis 
                };
                updateSessionInContext(updatedSession);
                
                if (isMounted.current) {
                    setProgress(prev => ({ ...prev, transcript: 'success', audioStats: 'success' }));
                }

                // Continue to next step
                await runContentAnalysis(updatedSession);

            } catch (error) {
                console.error("Audio Analysis Error:", error);
                if (isMounted.current) {
                    setProgress(prev => ({ ...prev, transcript: 'error', audioStats: 'error' }));
                    setGlobalError("Failed to transcribe audio. Please check your internet connection.");
                }
            }
        } else {
            // Already have audio data, just ensure progress is marked success
             if (isMounted.current) {
                setProgress(prev => ({ ...prev, transcript: 'success', audioStats: 'success' }));
            }
            // Ensure content analysis runs if missing
            if (!session.contentAnalysis) {
                await runContentAnalysis(session);
            }
        }
    };

    const runContentAnalysis = async (currentSession: InterviewSession) => {
        if (!currentSession.contentAnalysis && currentSession.transcript) {
            if (isMounted.current) {
                setProgress(prev => ({ ...prev, content: 'loading' }));
            }

            try {
                const contentResult = await analyzeInterviewContent(currentSession.transcript);
                
                const finalSession = {
                    ...currentSession,
                    contentAnalysis: contentResult
                };
                updateSessionInContext(finalSession);

                if (isMounted.current) {
                    setProgress(prev => ({ ...prev, content: 'success' }));
                }
            } catch (error) {
                console.error("Content Analysis Error:", error);
                if (isMounted.current) {
                    setProgress(prev => ({ ...prev, content: 'error' }));
                    setGlobalError("Failed to analyze answer content.");
                }
            }
        } else if (currentSession.contentAnalysis) {
             if (isMounted.current) {
                setProgress(prev => ({ ...prev, content: 'success' }));
            }
        }
    };

    const updateSessionInContext = (updatedSession: InterviewSession) => {
        if (user?.interviewSessions) {
            const updatedSessions = user.interviewSessions.map(s => 
                s.id === updatedSession.id ? updatedSession : s
            );
            updateUser({ interviewSessions: updatedSessions });
        }
    };

    // Helper to render status icon
    const StatusIcon = ({ status }: { status: StepStatus }) => {
        if (status === 'loading') return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
        if (status === 'success') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
        if (status === 'error') return <AlertCircle className="w-5 h-5 text-red-500" />;
        return <Circle className="w-5 h-5 text-zinc-200" />;
    };

    const isProcessing = Object.values(progress).some(s => s === 'loading');
    const hasError = Object.values(progress).some(s => s === 'error');
    const isComplete = Object.values(progress).every(s => s === 'success');

    // Loading / Progress Screen
    if (!isComplete && (isProcessing || hasError || progress.transcript === 'pending')) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto animate-in fade-in">
                <div className="w-full bg-white border border-zinc-200 rounded-xl p-8 shadow-sm space-y-8">
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-serif text-zinc-900">
                           {hasError ? 'Analysis Interrupted' : 'Analyzing Interview'}
                        </h3>
                        <p className="text-zinc-500">Please wait while we generate your report.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 rounded-lg border border-transparent transition-colors">
                            <StatusIcon status={progress.transcript} />
                            <span className={`flex-1 font-medium ${progress.transcript === 'loading' ? 'text-blue-600' : 'text-zinc-700'}`}>
                                Transcribing conversation
                            </span>
                        </div>
                        <div className="flex items-center gap-4 p-3 rounded-lg border border-transparent transition-colors">
                            <StatusIcon status={progress.audioStats} />
                            <span className={`flex-1 font-medium ${progress.audioStats === 'loading' ? 'text-blue-600' : 'text-zinc-700'}`}>
                                Analyzing audio characteristics
                            </span>
                        </div>
                        <div className="flex items-center gap-4 p-3 rounded-lg border border-transparent transition-colors">
                            <StatusIcon status={progress.content} />
                            <span className={`flex-1 font-medium ${progress.content === 'loading' ? 'text-blue-600' : 'text-zinc-700'}`}>
                                Evaluating answer quality
                            </span>
                        </div>
                    </div>

                    {hasError && (
                         <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex items-start gap-3">
                             <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                             <div>
                                 <p className="text-sm font-medium text-red-900">Analysis Failed</p>
                                 <p className="text-sm text-red-700 mt-1">{globalError || "An unexpected error occurred."}</p>
                             </div>
                         </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" className="flex-1" onClick={onBack} disabled={isProcessing}>
                            Back to List
                        </Button>
                        {hasError && answerBlobs && (
                            <Button className="flex-1" onClick={runAnalysis}>
                                Retry Analysis
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (!session.audioAnalysis || !session.contentAnalysis) {
        return null; // Should be handled by loading state above, fallback just in case
    }

    const { audioAnalysis, contentAnalysis } = session;
    const averageScore = Math.round((audioAnalysis.confidenceScore + audioAnalysis.clarityScore + contentAnalysis.overallScore) / 3);

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <div>
                    <h2 className="text-2xl font-serif text-zinc-900">Interview Analysis</h2>
                    <p className="text-zinc-500 text-sm">
                        {session.role} • {new Date(session.date).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-zinc-900 text-white p-6 rounded-xl flex flex-col justify-between relative overflow-hidden">
                     <div className="relative z-10">
                         <h4 className="text-zinc-400 text-xs uppercase tracking-wider font-medium">Overall Performance</h4>
                         <span className="text-5xl font-serif mt-2 block">{averageScore}</span>
                     </div>
                     <div className="relative z-10 mt-4">
                         <div className="flex items-center gap-2 text-xs text-zinc-400">
                             <Clock size={12} /> {Math.floor(session.durationSeconds / 60)}m {session.durationSeconds % 60}s duration
                         </div>
                     </div>
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                </div>

                <div className="bg-white border border-zinc-200 p-6 rounded-xl space-y-4">
                     <h4 className="text-zinc-500 text-xs uppercase tracking-wider font-medium flex items-center gap-2">
                         <Mic size={14} /> Confidence
                     </h4>
                     <div className="flex items-end gap-2">
                         <span className="text-3xl font-medium text-zinc-900">{audioAnalysis.confidenceScore}</span>
                         <span className="text-sm text-zinc-400 mb-1">/100</span>
                     </div>
                     <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                         <div className="bg-blue-500 h-full rounded-full" style={{ width: `${audioAnalysis.confidenceScore}%` }}></div>
                     </div>
                </div>

                <div className="bg-white border border-zinc-200 p-6 rounded-xl space-y-4">
                     <h4 className="text-zinc-500 text-xs uppercase tracking-wider font-medium flex items-center gap-2">
                         <FileText size={14} /> Content Quality
                     </h4>
                     <div className="flex items-end gap-2">
                         <span className="text-3xl font-medium text-zinc-900">{contentAnalysis.overallScore}</span>
                         <span className="text-sm text-zinc-400 mb-1">/100</span>
                     </div>
                     <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                         <div className="bg-green-500 h-full rounded-full" style={{ width: `${contentAnalysis.overallScore}%` }}></div>
                     </div>
                </div>

                <div className="bg-white border border-zinc-200 p-6 rounded-xl space-y-4">
                     <h4 className="text-zinc-500 text-xs uppercase tracking-wider font-medium flex items-center gap-2">
                         <BarChart2 size={14} /> Clarity
                     </h4>
                     <div className="flex items-end gap-2">
                         <span className="text-3xl font-medium text-zinc-900">{audioAnalysis.clarityScore}</span>
                         <span className="text-sm text-zinc-400 mb-1">/100</span>
                     </div>
                     <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                         <div className="bg-purple-500 h-full rounded-full" style={{ width: `${audioAnalysis.clarityScore}%` }}></div>
                     </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="flex gap-6 border-b border-zinc-200">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'overview' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
                >
                    Detailed Feedback
                </button>
                <button 
                    onClick={() => setActiveTab('transcript')}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'transcript' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
                >
                    Transcript
                </button>
            </div>

            {activeTab === 'overview' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Strengths/Weaknesses */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white border border-zinc-200 rounded-xl p-6">
                            <h3 className="font-serif text-xl text-zinc-900 mb-4">Question Analysis</h3>
                            <div className="space-y-6">
                                {contentAnalysis.questionFeedback.map((item, idx) => (
                                    <div key={idx} className="pb-6 border-b border-zinc-100 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium text-zinc-900 text-base">Question {idx + 1}</h4>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                                item.score >= 80 ? 'bg-green-100 text-green-700' : 
                                                item.score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {item.score}/100
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-500 italic mb-4">"{item.question}"</p>
                                        
                                        {/* Individual Audio Player for this answer */}
                                        {answerBlobs && answerBlobs[idx] && (
                                            <div className="mb-4 bg-zinc-50 rounded-lg p-2 border border-zinc-100">
                                                <div className="flex items-center gap-2 mb-1">
                                                     <Mic size={12} className="text-zinc-400" />
                                                     <span className="text-xs font-medium text-zinc-500">Your Answer Recording</span>
                                                </div>
                                                <audio 
                                                    controls 
                                                    src={URL.createObjectURL(answerBlobs[idx])} 
                                                    className="w-full h-8" 
                                                />
                                            </div>
                                        )}

                                        <div className="bg-zinc-50 p-4 rounded-lg space-y-4">
                                            <div>
                                                <span className="text-xs font-semibold text-zinc-400 uppercase">Your Answer (Transcript)</span>
                                                <p className="text-sm text-zinc-800 mt-1">{item.userAnswer}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-semibold text-zinc-400 uppercase">Feedback</span>
                                                <p className="text-sm text-zinc-700 mt-1">{item.feedback}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-semibold text-zinc-400 uppercase">Better Answer Idea</span>
                                                <p className="text-sm text-zinc-600 mt-1">{item.improvedAnswer}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Audio & General Stats */}
                    <div className="space-y-6">
                        <div className="bg-white border border-zinc-200 rounded-xl p-6">
                            <h3 className="font-serif text-lg text-zinc-900 mb-4">Audio Insights</h3>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs text-zinc-500 uppercase">Tone</span>
                                    <p className="font-medium text-zinc-900">{audioAnalysis.tone}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-zinc-500 uppercase">Pace</span>
                                    <p className="font-medium text-zinc-900">{audioAnalysis.pace}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-zinc-500 uppercase">General Feedback</span>
                                    <p className="text-sm text-zinc-600 mt-1">{audioAnalysis.feedback}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-zinc-200 rounded-xl p-6">
                            <h3 className="font-serif text-lg text-zinc-900 mb-4">Key Takeaways</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-green-600 mb-2 flex items-center gap-2">
                                        <CheckCircle2 size={14} /> Strengths
                                    </h4>
                                    <ul className="space-y-2">
                                        {contentAnalysis.strengths.map((s, i) => (
                                            <li key={i} className="text-sm text-zinc-600 pl-2 border-l-2 border-zinc-100">{s}</li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div>
                                    <h4 className="text-sm font-medium text-amber-600 mb-2 flex items-center gap-2">
                                        <AlertCircle size={14} /> Improvements
                                    </h4>
                                    <ul className="space-y-2">
                                        {contentAnalysis.improvements.map((s, i) => (
                                            <li key={i} className="text-sm text-zinc-600 pl-2 border-l-2 border-zinc-100">{s}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-6">
                    {session.transcript?.map((item, idx) => (
                        <div key={idx} className={`flex gap-4 ${item.role === 'User' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                item.role === 'AI' ? 'bg-zinc-100 text-zinc-500' : 'bg-zinc-900 text-white'
                            }`}>
                                {item.role === 'AI' ? 'AI' : 'Me'}
                            </div>
                            <div className={`flex-1 max-w-2xl p-4 rounded-xl ${
                                item.role === 'AI' ? 'bg-zinc-50 rounded-tl-none' : 'bg-blue-50/50 rounded-tr-none'
                            }`}>
                                <p className="text-sm text-zinc-800 whitespace-pre-wrap">{item.text}</p>
                            </div>
                        </div>
                    ))}
                    {(!session.transcript || session.transcript.length === 0) && (
                        <div className="text-center text-zinc-500 py-12">No transcript available for this session.</div>
                    )}
                </div>
            )}
        </div>
    );
};