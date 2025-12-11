import React, { useState } from 'react';
import { Plus, Clock, CheckCircle2, XCircle, ArrowRight, RotateCcw, Award } from 'lucide-react';
import { Button } from '../ui/Button';
import { QuizQuestion, QuizSession } from '../../types';
import { generateQuiz } from '../../utils/gemini';
import { useUser } from '../../context/UserContext';

interface SkillAssessmentViewProps {
  onSessionComplete: (session: QuizSession) => void;
}

type QuizState = 'idle' | 'creating' | 'active' | 'results';

export const SkillAssessmentView: React.FC<SkillAssessmentViewProps> = ({ onSessionComplete }) => {
  const { user } = useUser();
  const [state, setState] = useState<QuizState>('idle');
  
  // Creation Form
  const [targetRole, setTargetRole] = useState(user?.targetRoles?.[0] || '');
  const [company, setCompany] = useState('');
  const [jd, setJd] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  // Active Quiz
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Results
  const [score, setScore] = useState(0);

  const handleCreateQuiz = async () => {
    setIsGenerating(true);
    try {
      const generatedQuestions = await generateQuiz(targetRole, company, jd, questionCount);
      setQuestions(generatedQuestions);
      setState('active');
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setSelectedOption(null);
    } catch (error) {
      console.error(error);
      // Ideally show error toast
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) return;
    
    const newAnswers = [...userAnswers, selectedOption];
    setUserAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Finish Quiz
      const calculatedScore = newAnswers.reduce((acc, ans, idx) => {
        return acc + (ans === questions[idx].correctOptionIndex ? 1 : 0);
      }, 0);
      
      const finalScore = Math.round((calculatedScore / questions.length) * 100);
      setScore(finalScore);

      const session: QuizSession = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        role: targetRole,
        company,
        score: finalScore,
        totalQuestions: questions.length,
        questions,
        userAnswers: newAnswers
      };
      
      onSessionComplete(session);
      setState('results');
    }
  };

  // --- Render Sub-Components ---

  if (state === 'creating') {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-8 max-w-2xl mx-auto shadow-sm animate-in zoom-in-95">
        <h3 className="text-2xl font-serif text-zinc-900 mb-6">Create Skill Assessment</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
             <label className="text-sm font-medium text-zinc-700">Target Role</label>
             <select 
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-zinc-200 bg-white"
             >
                {user?.targetRoles.map(r => <option key={r} value={r}>{r}</option>)}
                <option value="General">General</option>
             </select>
          </div>
          
          <div className="space-y-2">
             <label className="text-sm font-medium text-zinc-700">Target Company (Optional)</label>
             <input 
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google"
                className="w-full h-10 px-3 rounded-md border border-zinc-200"
             />
          </div>

          <div className="space-y-2">
             <label className="text-sm font-medium text-zinc-700">Job Description Context (Optional)</label>
             <textarea 
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste requirements here..."
                className="w-full min-h-[80px] px-3 py-2 rounded-md border border-zinc-200 resize-none"
             />
          </div>

          <div className="space-y-2">
             <label className="text-sm font-medium text-zinc-700">Number of Questions: {questionCount}</label>
             <input 
               type="range" min="1" max="10" 
               value={questionCount} 
               onChange={(e) => setQuestionCount(Number(e.target.value))}
               className="w-full accent-zinc-900" 
             />
          </div>

          <div className="pt-4 flex gap-3">
             <Button variant="outline" className="flex-1" onClick={() => setState('idle')}>Cancel</Button>
             <Button className="flex-1" onClick={handleCreateQuiz} disabled={isGenerating}>
               {isGenerating ? 'Generating...' : 'Start Quiz'}
             </Button>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'active') {
    const question = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / questions.length) * 100;

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
        {/* Progress Bar */}
        <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
          <div className="h-full bg-zinc-900 transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-sm">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Question {currentQuestionIndex + 1} of {questions.length}</span>
          <h3 className="text-xl font-medium text-zinc-900 mt-2 mb-6">{question.question}</h3>
          
          <div className="space-y-3">
            {question.options.map((option, idx) => (
               <button
                 key={idx}
                 onClick={() => setSelectedOption(idx)}
                 className={`w-full text-left p-4 rounded-lg border transition-all ${
                   selectedOption === idx 
                     ? 'bg-zinc-900 text-white border-zinc-900' 
                     : 'bg-white border-zinc-200 hover:bg-zinc-50'
                 }`}
               >
                 <span className="inline-block w-6 font-medium opacity-50">{String.fromCharCode(65 + idx)}.</span> {option}
               </button>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <Button onClick={handleNextQuestion} disabled={selectedOption === null}>
              {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'results') {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
        <div className="bg-zinc-900 text-white rounded-xl p-8 text-center relative overflow-hidden">
           <div className="relative z-10">
              <Award className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
              <h2 className="text-3xl font-serif mb-2">Quiz Complete!</h2>
              <div className="text-6xl font-bold font-serif my-4">{score}%</div>
              <p className="text-zinc-400">You answered {userAnswers.filter((ans, idx) => ans === questions[idx].correctOptionIndex).length} out of {questions.length} correctly.</p>
           </div>
           <div className="absolute inset-0 bg-white/5 opacity-50 blur-3xl"></div>
        </div>

        <div className="space-y-4">
           {questions.map((q, idx) => {
             const userAns = userAnswers[idx];
             const isCorrect = userAns === q.correctOptionIndex;
             
             return (
               <div key={q.id} className={`bg-white border rounded-xl p-6 ${isCorrect ? 'border-zinc-200' : 'border-red-200'}`}>
                  <div className="flex gap-3">
                     <div className="mt-1">
                        {isCorrect ? <CheckCircle2 className="text-green-600 w-5 h-5" /> : <XCircle className="text-red-500 w-5 h-5" />}
                     </div>
                     <div className="flex-1">
                        <h4 className="font-medium text-zinc-900 mb-2">{q.question}</h4>
                        <div className="space-y-1 text-sm">
                           <p className={isCorrect ? "text-green-700 font-medium" : "text-red-600 line-through"}>
                              Your Answer: {q.options[userAns]}
                           </p>
                           {!isCorrect && (
                             <p className="text-green-700 font-medium">
                               Correct Answer: {q.options[q.correctOptionIndex]}
                             </p>
                           )}
                        </div>
                        <div className="mt-3 text-sm text-zinc-500 bg-zinc-50 p-3 rounded">
                           <span className="font-medium text-zinc-700">Explanation:</span> {q.explanation}
                        </div>
                     </div>
                  </div>
               </div>
             );
           })}
        </div>

        <div className="flex justify-center pt-4">
           <Button onClick={() => setState('idle')} variant="outline">
              <RotateCcw className="mr-2 w-4 h-4" /> Take Another Quiz
           </Button>
        </div>
      </div>
    );
  }

  // Idle State
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-12 text-center">
         <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-zinc-400" />
         </div>
         <h3 className="text-xl font-serif text-zinc-900 mb-2">Test Your Knowledge</h3>
         <p className="text-zinc-500 max-w-md mx-auto mb-8">
            Generate a personalized quiz to validate your understanding of core concepts.
         </p>
         <Button onClick={() => setState('creating')} size="lg">
            <Plus className="mr-2 w-4 h-4" /> Create New Quiz
         </Button>
      </div>

      {/* Basic History (if needed later, could map through sessions here) */}
    </div>
  );
};
