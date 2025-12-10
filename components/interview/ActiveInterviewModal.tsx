import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Video, Loader2, Play, Square, Settings, Volume2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { generateInterviewQuestions, generateSpeech } from '../../utils/gemini';
import { useUser } from '../../context/UserContext';
import { InterviewSession } from '../../types';

interface ActiveInterviewModalProps {
  onClose: () => void;
  onComplete: (session: InterviewSession, fullAudioBlob: Blob, answerBlobs: Blob[]) => void;
}

type InterviewState = 'setup' | 'preparing' | 'interviewing' | 'completed';
type TurnState = 'ai_speaking' | 'user_speaking' | 'processing';

// Helper to decode raw PCM data from Gemini
const decodePCM = (base64: string, ctx: AudioContext): AudioBuffer => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Convert 8-bit bytes to 16-bit integers (PCM)
  const dataInt16 = new Int16Array(bytes.buffer);
  const numChannels = 1;
  const sampleRate = 24000; // Gemini TTS standard sample rate
  const frameCount = dataInt16.length / numChannels;
  
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  const channelData = buffer.getChannelData(0);
  
  for (let i = 0; i < frameCount; i++) {
    // Normalize 16-bit integer to float [-1.0, 1.0]
    channelData[i] = dataInt16[i] / 32768.0;
  }
  
  return buffer;
}

export const ActiveInterviewModal: React.FC<ActiveInterviewModalProps> = ({ onClose, onComplete }) => {
  const { user } = useUser();
  
  // Setup Form State
  const [role, setRole] = useState(user?.targetRoles?.[0] || '');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [duration, setDuration] = useState(10);
  const [context, setContext] = useState('');
  const [voice, setVoice] = useState<'Male' | 'Female'>('Female');

  // Interview Logic State
  const [currentState, setCurrentState] = useState<InterviewState>('setup');
  const [turn, setTurn] = useState<TurnState>('processing');
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [interviewType, setInterviewType] = useState<'Behavioral' | 'Technical' | 'Mixed'>('Behavioral');
  const [loadingProgress, setLoadingProgress] = useState('');
  const [initializationError, setInitializationError] = useState<string | null>(null);

  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const aiSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const userStreamRef = useRef<MediaStream | null>(null);
  const aiAnalyserRef = useRef<AnalyserNode | null>(null);
  const userAnalyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Recording Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const currentAnswerChunksRef = useRef<Blob[]>([]);
  const completedAnswerBlobsRef = useRef<Blob[]>([]);

  // Optimization Refs
  const audioCache = useRef<{ [key: number]: AudioBuffer }>({});
  const prefetchInProgress = useRef<Set<number>>(new Set());

  // Visualization State
  const [aiVolume, setAiVolume] = useState(0);
  const [userVolume, setUserVolume] = useState(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      stopMediaTracks();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const stopAudio = () => {
    if (aiSourceRef.current) {
      try {
        aiSourceRef.current.stop();
      } catch (e) {
        // Ignore if already stopped
      }
      aiSourceRef.current = null;
    }
  };

  const stopMediaTracks = () => {
     if (userStreamRef.current) {
        userStreamRef.current.getTracks().forEach(track => track.stop());
      }
  };

  const initAudio = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    // AI Analyser
    aiAnalyserRef.current = audioContextRef.current.createAnalyser();
    aiAnalyserRef.current.fftSize = 256;

    // User Analyser & Mic
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      userStreamRef.current = stream;
      userAnalyserRef.current = audioContextRef.current.createAnalyser();
      userAnalyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(userAnalyserRef.current);
      
      // Initialize MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
            currentAnswerChunksRef.current.push(event.data);
        }
      };

      // Start Visualizer Loop
      visualize();
    } catch (err) {
      console.error("Microphone access denied:", err);
      // We don't block here, just warn, but usually mic is required
    }
  };

  const startRecording = () => {
    // Reset chunks for the new answer
    currentAnswerChunksRef.current = [];
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
        mediaRecorderRef.current.start();
    }
  };

  const stopRecording = (): Promise<Blob> => {
    return new Promise((resolve) => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
             // Resolve with empty blob if not recording
             resolve(new Blob([], { type: 'audio/webm' }));
             return;
        }

        // Define the handler for when stop completes
        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(currentAnswerChunksRef.current, { type: 'audio/webm' });
            currentAnswerChunksRef.current = []; // Clear for next time
            resolve(blob);
        };
        
        mediaRecorderRef.current.stop();
    });
  };

  const visualize = () => {
    const aiData = new Uint8Array(aiAnalyserRef.current?.frequencyBinCount || 0);
    const userData = new Uint8Array(userAnalyserRef.current?.frequencyBinCount || 0);

    const update = () => {
      if (aiAnalyserRef.current) {
        aiAnalyserRef.current.getByteFrequencyData(aiData);
        // Average volume
        const aiAvg = aiData.reduce((a, b) => a + b, 0) / aiData.length;
        setAiVolume(aiAvg);
      }

      if (userAnalyserRef.current) {
        userAnalyserRef.current.getByteFrequencyData(userData);
        const userAvg = userData.reduce((a, b) => a + b, 0) / userData.length;
        setUserVolume(userAvg);
      }

      animationFrameRef.current = requestAnimationFrame(update);
    };
    update();
  };

  // Helper to prefetch and cache audio
  const prefetchAudio = async (index: number, text: string) => {
    if (audioCache.current[index] || prefetchInProgress.current.has(index)) return;
    
    prefetchInProgress.current.add(index);
    try {
      const base64 = await generateSpeech(text, voice);
      if (audioContextRef.current) {
         const buffer = decodePCM(base64, audioContextRef.current);
         audioCache.current[index] = buffer;
      }
    } catch (err) {
      console.error(`Failed to prefetch audio for q ${index}`, err);
      // If this is the first question, we want to propagate the error
      if (index === 0) throw err;
    } finally {
      prefetchInProgress.current.delete(index);
    }
  };

  const handleStart = async () => {
    setCurrentState('preparing');
    setInitializationError(null);
    setLoadingProgress('Initializing audio...');
    completedAnswerBlobsRef.current = []; // Reset stored answers
    
    try {
      await initAudio();
      
      setLoadingProgress('Generating interview questions...');
      // Pass candidate name
      const candidateName = user?.name ? user.name.split(' ')[0] : "Candidate";
      const result = await generateInterviewQuestions(role, company, jobDescription, duration, context, candidateName);
      
      setQuestions(result.questions);
      setInterviewType(result.type);
      
      if (!result.questions || result.questions.length === 0) {
        throw new Error("Failed to generate questions.");
      }

      setLoadingProgress('Preparing interviewer voice...');
      
      // Add a timeout race to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Voice generation timed out. Please check your connection and try again.")), 20000)
      );

      await Promise.race([
        prefetchAudio(0, result.questions[0]),
        timeoutPromise
      ]);
      
      if (!audioCache.current[0]) {
        throw new Error("Failed to load audio for the first question.");
      }

      const initialFetchCount = Math.min(3, result.questions.length);
      for (let i = 1; i < initialFetchCount; i++) {
        prefetchAudio(i, result.questions[i]);
      }

      setCurrentState('interviewing');
      setStartTime(Date.now());
      
      setTimeout(() => playQuestion(0, result.questions), 500);

    } catch (err) {
      console.error(err);
      setInitializationError(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  };

  const playQuestion = async (index: number, qList: string[] = questions) => {
    if (index >= qList.length) {
      handleFinishInterview();
      return;
    }

    setTurn('ai_speaking');
    setCurrentQuestionIndex(index);
    // Note: We don't record while AI speaks

    const LOOKAHEAD = 3;
    for (let i = 1; i <= LOOKAHEAD; i++) {
        const nextIdx = index + i;
        if (nextIdx < qList.length) {
            prefetchAudio(nextIdx, qList[nextIdx]);
        }
    }

    try {
      let buffer = audioCache.current[index];
      
      if (!buffer) {
        await prefetchAudio(index, qList[index]);
        buffer = audioCache.current[index];
      }

      if (buffer) {
        await playAudioBuffer(buffer);
      } else {
        throw new Error("Audio buffer missing");
      }
      
      // AI finished speaking, now user turn
      setTurn('user_speaking');
      startRecording();

    } catch (err) {
      console.error("Audio Playback Error", err);
      // Fallback: let user speak even if audio failed
      setTurn('user_speaking');
      startRecording();
    }
  };

  const playAudioBuffer = async (buffer: AudioBuffer) => {
    if (!audioContextRef.current || !aiAnalyserRef.current) return;

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(aiAnalyserRef.current);
    aiAnalyserRef.current.connect(audioContextRef.current.destination);
    
    aiSourceRef.current = source;
    source.start(0);

    return new Promise<void>((resolve) => {
      source.onended = () => {
        aiSourceRef.current = null;
        resolve();
      };
    });
  };

  const handleFinishAnswer = async () => {
    // 1. Stop Recording
    const answerBlob = await stopRecording();
    
    // 2. Save the blob for this question
    completedAnswerBlobsRef.current.push(answerBlob);

    // 3. Stop any current audio (safeguard)
    stopAudio();

    // 4. Move to next question
    playQuestion(currentQuestionIndex + 1);
  };

  const handleFinishInterview = async () => {
    // Ensure recording is stopped if we forced finish
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
         const lastBlob = await stopRecording();
         completedAnswerBlobsRef.current.push(lastBlob);
    }
    
    stopMediaTracks();
    stopAudio();
    
    const endTime = Date.now();
    const durationSec = Math.floor((endTime - startTime) / 1000);
    
    // Concatenate all answer blobs into one single session file
    const fullAudioBlob = new Blob(completedAnswerBlobsRef.current, { type: 'audio/webm' });

    const session: InterviewSession = {
        id: crypto.randomUUID(),
        role,
        company: company || 'General',
        date: new Date().toISOString(),
        durationSeconds: durationSec,
        questionCount: questions.length,
        type: interviewType,
        questionsList: questions
    };

    onComplete(session, fullAudioBlob, completedAnswerBlobsRef.current);
  };

  // --- Render Helpers ---

  const getScale = (vol: number) => 1 + (vol / 255) * 0.5;

  if (currentState === 'setup') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
          <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
            <h2 className="text-xl font-serif text-zinc-900">New Interview Session</h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
             <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Target Role</label>
                <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                >
                    {user?.targetRoles.map(r => <option key={r} value={r}>{r}</option>)}
                    <option value="General Software Engineer">General Software Engineer</option>
                    <option value="Product Manager">Product Manager</option>
                </select>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">Company (Optional)</label>
                    <input 
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g. Google"
                        className="w-full h-10 px-3 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">Duration (Min)</label>
                    <input 
                        type="number"
                        min={1}
                        max={10}
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full h-10 px-3 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Job Description (Optional)</label>
                <textarea 
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the JD here for tailored questions..."
                    className="w-full min-h-[80px] px-3 py-2 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
                />
             </div>

             <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Context (Optional)</label>
                <textarea 
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Enter details you know about the person who is interviewing you..."
                    className="w-full min-h-[80px] px-3 py-2 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
                />
             </div>

             <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Interviewer Voice</label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={voice === 'Male'} onChange={() => setVoice('Male')} className="accent-zinc-900" />
                        <span className="text-sm text-zinc-600">Male</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={voice === 'Female'} onChange={() => setVoice('Female')} className="accent-zinc-900" />
                        <span className="text-sm text-zinc-600">Female</span>
                    </label>
                </div>
             </div>
          </div>

          <div className="p-6 pt-0 flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button onClick={handleStart} className="flex-1" disabled={!role}>Start Interview</Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentState === 'preparing') {
    if (initializationError) {
        return (
            <div className="fixed inset-0 z-50 bg-zinc-900 flex flex-col items-center justify-center text-white space-y-6 animate-in fade-in">
                 <div className="text-center space-y-4 max-w-md px-6">
                     <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                        <AlertCircle size={32} />
                     </div>
                     <h2 className="text-2xl font-serif">Something went wrong</h2>
                     <p className="text-zinc-400">{initializationError}</p>
                     
                     <div className="flex gap-3 justify-center pt-4">
                        <Button variant="outline" onClick={onClose} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                            Cancel
                        </Button>
                        <Button onClick={handleStart} className="bg-white text-zinc-900 hover:bg-zinc-200">
                            Retry
                        </Button>
                     </div>
                 </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-zinc-900 flex flex-col items-center justify-center text-white space-y-6 animate-in fade-in">
             <div className="relative">
                 <div className="w-16 h-16 border-4 border-zinc-700 border-t-white rounded-full animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={24} className="animate-pulse" />
                 </div>
             </div>
             <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-2">
                 <h2 className="text-2xl font-serif">Preparing your interview...</h2>
                 <p className="text-zinc-400">{loadingProgress || "Reviewing your profile..."}</p>
             </div>
             <Button 
                variant="outline" 
                onClick={onClose} 
                className="mt-8 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
             >
                Cancel
             </Button>
        </div>
    );
  }

  // Active Interview View
  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col animate-in fade-in duration-500">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur border-b border-zinc-800">
            <div className="flex items-center gap-4">
                 <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors" title="Discard Session">
                    <X size={24} />
                 </button>
                 <div className="flex items-center gap-3 border-l border-zinc-700 pl-4">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-zinc-200 font-medium tracking-wide">REC</span>
                    <span className="text-zinc-500 text-sm ml-2 hidden sm:inline-block">
                        {role} {company ? `@ ${company}` : ''}
                    </span>
                 </div>
            </div>
            <Button variant="secondary" size="sm" onClick={handleFinishInterview} className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-zinc-700">
                End Interview
            </Button>
        </div>

        {/* Main Stage */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20 p-8">
            
            {/* AI Avatar */}
            <div className="flex flex-col items-center gap-4 relative">
                <div 
                    className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-zinc-800 flex items-center justify-center relative transition-transform duration-75"
                    style={{ transform: `scale(${turn === 'ai_speaking' ? getScale(aiVolume) : 1})` }}
                >
                    <div className="absolute inset-0 rounded-full border border-zinc-700"></div>
                    {turn === 'ai_speaking' && (
                        <div className="absolute inset-0 rounded-full border-2 border-blue-500/50 animate-ping"></div>
                    )}
                    <span className="text-4xl md:text-6xl font-serif text-zinc-500 select-none">AI</span>
                </div>
                <div className="text-center space-y-1">
                    <h3 className="text-zinc-300 font-medium">Interviewer</h3>
                    <p className="text-xs text-zinc-500 h-4">{turn === 'ai_speaking' ? 'Speaking...' : 'Listening'}</p>
                </div>
            </div>

            {/* User Avatar */}
            <div className="flex flex-col items-center gap-4 relative">
                <div 
                    className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-zinc-100 flex items-center justify-center relative transition-transform duration-75"
                    style={{ transform: `scale(${turn === 'user_speaking' ? getScale(userVolume) : 1})` }}
                >
                    <div className="absolute inset-0 rounded-full border border-zinc-200"></div>
                     {turn === 'user_speaking' && (
                        <div className="absolute inset-0 rounded-full border-2 border-green-500/50 animate-ping"></div>
                    )}
                    <span className="text-4xl md:text-6xl font-serif text-zinc-800 select-none">
                        {user?.name ? user.name.substring(0, 2).toUpperCase() : 'ME'}
                    </span>
                </div>
                <div className="text-center space-y-1">
                     <h3 className="text-white font-medium">You</h3>
                     <p className="text-xs text-zinc-500 h-4 flex items-center justify-center gap-1">
                        <Mic size={10} className={turn === 'user_speaking' ? 'text-green-500' : 'text-zinc-600'} />
                        {turn === 'user_speaking' ? 'Mic Active' : 'Muted'}
                     </p>
                </div>
            </div>

        </div>

        {/* Controls / Footer */}
        <div className="h-40 bg-zinc-900 border-t border-zinc-800 flex flex-col items-center justify-center gap-4 pb-4 px-6">
             <div className="w-full max-w-3xl h-16 overflow-y-auto rounded-lg bg-zinc-900/50 p-2 text-center flex items-center justify-center">
                 <p className="text-zinc-300 text-lg leading-relaxed">
                     {turn === 'ai_speaking' 
                        ? <span className="text-zinc-500 animate-pulse italic">Listening to interviewer...</span>
                        : questions[currentQuestionIndex]
                     }
                 </p>
             </div>

             <div className="flex gap-4">
                 {turn === 'user_speaking' && (
                     <Button 
                        size="lg" 
                        className="bg-red-600 hover:bg-red-700 text-white px-8 rounded-full animate-pulse shadow-lg shadow-red-900/20"
                        onClick={handleFinishAnswer}
                     >
                        <Square className="w-4 h-4 mr-2 fill-current" /> Finish Answering
                     </Button>
                 )}
                 {turn === 'ai_speaking' && (
                     <Button size="lg" variant="secondary" className="rounded-full opacity-50 cursor-not-allowed text-zinc-400 bg-zinc-800 border-zinc-700">
                        <Volume2 className="w-4 h-4 mr-2" /> Interviewer Speaking
                     </Button>
                 )}
             </div>
        </div>
    </div>
  );
};