
import React, { useState, useRef } from 'react';
import { GraduationCap, RefreshCw, Loader2, BookOpen, CheckSquare, BrainCircuit, CheckCircle2, AlertCircle, X, RotateCcw, FileText, Upload } from 'lucide-react';
import { Button } from '../ui/Button';
import { useUser } from '../../context/UserContext';
import { generateCoreConcepts, generateLearningResources } from '../../utils/gemini';
import { CoreConceptsView } from './CoreConceptsView';
import { SkillAssessmentView } from './SkillAssessmentView';
import { ResourceListView } from './ResourceListView';
import { UpskillData, CoreConcept, LearningResource, QuizSession } from '../../types';

type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

interface UpskillTabProps {
  onNavigateToResume: () => void;
}

export const UpskillTab: React.FC<UpskillTabProps> = ({ onNavigateToResume }) => {
  const { user, updateUser } = useUser();
  const [activeSubTab, setActiveSubTab] = useState<'concepts' | 'quiz' | 'resources'>('concepts');
  
  // Detailed Generation State
  const [conceptStatus, setConceptStatus] = useState<GenerationStatus>('idle');
  const [resourceStatus, setResourceStatus] = useState<GenerationStatus>('idle');
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  // Temporary storage for generated data before saving
  const tempConcepts = useRef<CoreConcept[]>([]);
  const tempResources = useRef<LearningResource[]>([]);
  
  // Local state initialized from context
  const [selectedRole, setSelectedRole] = useState(user?.targetRoles?.[0] || '');

  const data = user?.upskillData;
  const hasData = data && data.coreConcepts.length > 0;

  // Initialize data if missing
  const startGeneration = () => {
    if (!selectedRole || !user?.resumeData) return;
    setIsOverlayOpen(true);
    setConceptStatus('loading');
    setResourceStatus('loading');
    
    // Clear temp
    tempConcepts.current = [];
    tempResources.current = [];

    // Trigger both in parallel but handle independently
    generateConcepts();
    generateResources();
  };

  const generateConcepts = async () => {
    setConceptStatus('loading');
    try {
        const result = await generateCoreConcepts(selectedRole, user?.resumeAnalysis?.overview.summary);
        tempConcepts.current = result;
        setConceptStatus('success');
        checkAndSave();
    } catch (e) {
        console.error(e);
        setConceptStatus('error');
    }
  };

  const generateResources = async () => {
    setResourceStatus('loading');
    try {
        const result = await generateLearningResources(selectedRole, user?.resumeAnalysis?.overview.summary);
        tempResources.current = result;
        setResourceStatus('success');
        checkAndSave();
    } catch (e) {
        console.error(e);
        setResourceStatus('error');
    }
  };

  const checkAndSave = () => {
      // If both are done (success or error), we can save what we have or wait for user to retry failed ones
      // Here we only auto-save if both succeed, OR if we handle partials. 
      // Let's rely on the user closing the modal or all success to save.
      if (conceptStatus === 'success' && resourceStatus === 'success') {
          saveData();
      }
  };

  const saveData = () => {
      const currentData: UpskillData = user?.upskillData || {
        targetRole: selectedRole,
        coreConcepts: [],
        resources: [],
        quizSessions: []
      };

      const newData: UpskillData = {
        ...currentData,
        targetRole: selectedRole,
        // Only update if we have new data, otherwise keep old (unless it was a fresh generation intended to replace)
        coreConcepts: tempConcepts.current.length > 0 ? tempConcepts.current : currentData.coreConcepts,
        resources: tempResources.current.length > 0 ? tempResources.current : currentData.resources,
      };

      updateUser({ upskillData: newData });
  };

  // Close overlay and save whatever success we have
  const handleCloseOverlay = () => {
      // Save valid results
      if (tempConcepts.current.length > 0 || tempResources.current.length > 0) {
          saveData();
      }
      setIsOverlayOpen(false);
      setConceptStatus('idle');
      setResourceStatus('idle');
  };

  // Handlers for sub-components
  const handleToggleRead = (id: string) => {
    if (!data) return;
    const updatedConcepts = data.coreConcepts.map(c => 
      c.id === id ? { ...c, isRead: !c.isRead } : c
    );
    updateUser({ upskillData: { ...data, coreConcepts: updatedConcepts } });
  };

  const handleToggleResource = (id: string) => {
    if (!data) return;
    const updatedResources = data.resources.map(r => 
      r.id === id ? { ...r, isCompleted: !r.isCompleted } : r
    );
    updateUser({ upskillData: { ...data, resources: updatedResources } });
  };

  const handleQuizComplete = (session: QuizSession) => {
     const currentData: UpskillData = data || {
         targetRole: selectedRole,
         coreConcepts: [],
         resources: [],
         quizSessions: []
     };
     
     const updatedSessions = [session, ...currentData.quizSessions];
     updateUser({ upskillData: { ...currentData, quizSessions: updatedSessions } });
  };

  // Status Icon Helper
  const StatusIcon = ({ status }: { status: GenerationStatus }) => {
    if (status === 'loading') return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
    if (status === 'success') return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (status === 'error') return <AlertCircle className="w-5 h-5 text-red-600" />;
    return <div className="w-5 h-5 rounded-full border-2 border-zinc-200" />;
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="mb-10 space-y-6">
        <div>
           <h2 className="text-4xl font-serif text-zinc-900 mb-2">Upskill & Learn</h2>
           <p className="text-zinc-500 text-lg">Bridge your knowledge gaps before your interview.</p>
        </div>

        {/* Configuration Bar */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
           <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <div className="w-full md:w-64">
                 <label className="text-xs font-semibold text-zinc-500 uppercase mb-1 block">Target Role</label>
                 <select 
                   value={selectedRole}
                   onChange={(e) => setSelectedRole(e.target.value)}
                   className="w-full h-10 px-3 rounded-md border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                 >
                   {user?.targetRoles.map(r => <option key={r} value={r}>{r}</option>)}
                   {!user?.targetRoles.length && <option value="">No roles defined</option>}
                 </select>
              </div>
              
              <div className="w-full md:w-auto">
                 <label className="text-xs font-semibold text-zinc-500 uppercase mb-1 block">Resume</label>
                 {user?.resumeData ? (
                    <div className="h-10 px-3 flex items-center gap-2 text-sm text-zinc-600 bg-zinc-50 rounded-md border border-zinc-200">
                        <FileText size={16} />
                        Resume Linked
                    </div>
                 ) : (
                    <button 
                        onClick={onNavigateToResume}
                        className="h-10 px-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-md border border-red-200 hover:bg-red-100 transition-colors"
                    >
                        <Upload size={16} />
                        Upload Resume
                    </button>
                 )}
              </div>
           </div>

           <Button onClick={startGeneration} disabled={isOverlayOpen || !selectedRole || !user?.resumeData} className="w-full md:w-auto">
              <RefreshCw className="w-4 h-4 mr-2" />
              {hasData ? 'Refresh Plan' : 'Generate Plan'}
           </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-zinc-200 mb-8 overflow-x-auto">
         <button 
           onClick={() => setActiveSubTab('concepts')}
           className={`pb-3 flex items-center gap-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeSubTab === 'concepts' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
         >
           <BookOpen size={16} /> Core Concepts
         </button>
         <button 
           onClick={() => setActiveSubTab('quiz')}
           className={`pb-3 flex items-center gap-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeSubTab === 'quiz' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
         >
           <BrainCircuit size={16} /> Skill Assessment
         </button>
         <button 
           onClick={() => setActiveSubTab('resources')}
           className={`pb-3 flex items-center gap-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeSubTab === 'resources' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
         >
           <CheckSquare size={16} /> Resources
         </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeSubTab === 'concepts' && (
           hasData ? (
             <CoreConceptsView concepts={data.coreConcepts} onToggleRead={handleToggleRead} />
           ) : (
             <EmptyState title="No concepts generated" description="Click 'Generate Plan' above to create a personalized learning path." />
           )
        )}

        {activeSubTab === 'quiz' && (
           <SkillAssessmentView onSessionComplete={handleQuizComplete} />
        )}

        {activeSubTab === 'resources' && (
           hasData ? (
             <ResourceListView resources={data.resources} onToggleComplete={handleToggleResource} />
           ) : (
             <EmptyState title="No resources found" description="Click 'Generate Plan' to find books, courses, and more." />
           )
        )}
      </div>

      {/* Loading Overlay */}
      {isOverlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-300">
               <div className="text-center mb-8">
                   <h3 className="text-2xl font-serif text-zinc-900 mb-2">Building Your Plan</h3>
                   <p className="text-zinc-500">AI is analyzing the role requirements and generating content.</p>
               </div>
               
               <div className="space-y-4 mb-8">
                   {/* Concept Step */}
                   <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                       <div className="flex items-center gap-3">
                           <StatusIcon status={conceptStatus} />
                           <span className={`font-medium ${conceptStatus === 'loading' ? 'text-blue-600' : 'text-zinc-700'}`}>
                               Technical Concepts
                           </span>
                       </div>
                       {conceptStatus === 'error' && (
                           <button onClick={generateConcepts} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                               <RotateCcw size={12} /> Retry
                           </button>
                       )}
                   </div>

                   {/* Resource Step */}
                   <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                       <div className="flex items-center gap-3">
                           <StatusIcon status={resourceStatus} />
                           <span className={`font-medium ${resourceStatus === 'loading' ? 'text-blue-600' : 'text-zinc-700'}`}>
                               Learning Resources
                           </span>
                       </div>
                       {resourceStatus === 'error' && (
                           <button onClick={generateResources} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                               <RotateCcw size={12} /> Retry
                           </button>
                       )}
                   </div>
               </div>

               <div className="flex gap-3">
                   <Button 
                       variant="outline" 
                       className="flex-1" 
                       onClick={handleCloseOverlay}
                       disabled={conceptStatus === 'loading' || resourceStatus === 'loading'}
                   >
                       {(conceptStatus === 'error' || resourceStatus === 'error') ? 'Cancel' : 'Done'}
                   </Button>
                   
                   {(conceptStatus === 'success' && resourceStatus === 'success') && (
                       <Button className="flex-1" onClick={handleCloseOverlay}>
                           View Plan
                       </Button>
                   )}
               </div>
           </div>
        </div>
      )}

    </div>
  );
};

const EmptyState = ({ title, description }: { title: string, description: string }) => (
  <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 border border-dashed border-zinc-200 rounded-xl text-center">
    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
       <GraduationCap className="text-zinc-300" size={24} />
    </div>
    <h3 className="text-zinc-900 font-medium mb-1">{title}</h3>
    <p className="text-zinc-500 text-sm max-w-sm">{description}</p>
  </div>
);
