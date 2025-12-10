import React, { useState } from 'react';
import { Video, Plus, Calendar, Clock, MessageSquare, ChevronRight, PlayCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useUser } from '../../context/UserContext';
import { ActiveInterviewModal } from './ActiveInterviewModal';
import { InterviewSession } from '../../types';

export const InterviewPrep: React.FC = () => {
  const { user, updateUser } = useUser();
  const [showNewInterviewModal, setShowNewInterviewModal] = useState(false);

  const sessions = user?.interviewSessions || [];

  const handleCompleteInterview = (newSession: InterviewSession) => {
      const updatedSessions = [newSession, ...sessions];
      updateUser({ interviewSessions: updatedSessions });
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-serif text-zinc-900 mb-2">Interview Prep</h2>
          <p className="text-zinc-500 text-lg">Practice behavioral and technical questions with real-time AI feedback.</p>
        </div>
        <Button size="lg" onClick={() => setShowNewInterviewModal(true)} className="shrink-0">
            <Plus className="w-5 h-5 mr-2" /> New Interview
        </Button>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
            className="h-48 bg-white border border-zinc-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between group"
            onClick={() => setShowNewInterviewModal(true)}
        >
            <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Video size={24} />
                </div>
                <div className="bg-zinc-100 px-2 py-1 rounded text-xs font-medium text-zinc-600">AI Powered</div>
            </div>
            <div>
                <h3 className="font-semibold text-xl mb-1 text-zinc-900">Start Mock Interview</h3>
                <p className="text-zinc-500 text-sm">Simulate a real video call environment tailored to your target role.</p>
            </div>
        </div>

        <div className="h-48 bg-zinc-900 text-white rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
             <div className="relative z-10">
                 <h3 className="font-serif text-2xl mb-1">Your Stats</h3>
                 <div className="flex gap-6 mt-4">
                     <div>
                         <span className="block text-3xl font-bold">{sessions.length}</span>
                         <span className="text-xs text-zinc-400 uppercase tracking-wide">Sessions</span>
                     </div>
                     <div>
                         <span className="block text-3xl font-bold">
                             {sessions.reduce((acc, curr) => acc + Math.round(curr.durationSeconds / 60), 0)}m
                         </span>
                         <span className="text-xs text-zinc-400 uppercase tracking-wide">Practice Time</span>
                     </div>
                 </div>
             </div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        </div>
      </div>

      {/* Logs Section */}
      <div className="pt-4">
          <h3 className="text-2xl font-serif text-zinc-900 mb-6">Past Sessions</h3>
          
          {sessions.length === 0 ? (
              <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-xl p-12 text-center">
                  <Video className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-zinc-900 mb-1">No interviews yet</h4>
                  <p className="text-zinc-500 mb-6">Complete your first mock interview to see your history and improvements.</p>
                  <Button variant="outline" onClick={() => setShowNewInterviewModal(true)}>Start Now</Button>
              </div>
          ) : (
              <div className="space-y-4">
                  {sessions.map((session) => (
                      <div key={session.id} className="bg-white border border-zinc-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4 hover:border-zinc-300 transition-colors group">
                          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center shrink-0">
                              <PlayCircle className="text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                          </div>
                          
                          <div className="flex-1">
                              <h4 className="font-medium text-zinc-900 text-lg">{session.role}</h4>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500 mt-1">
                                  <span className="flex items-center gap-1">
                                      {session.company && <span className="font-medium text-zinc-700">{session.company} •</span>}
                                  </span>
                                  <span className="flex items-center gap-1">
                                      <Calendar size={12} /> {new Date(session.date).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                      <Clock size={12} /> {Math.floor(session.durationSeconds / 60)}m {session.durationSeconds % 60}s
                                  </span>
                                  <span className="flex items-center gap-1">
                                      <MessageSquare size={12} /> {session.questionCount} Questions
                                  </span>
                              </div>
                          </div>

                          <div className="flex items-center gap-2">
                             <span className="px-3 py-1 bg-zinc-100 text-xs font-medium rounded-full text-zinc-600">
                                 {session.type}
                             </span>
                             <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-900">
                                 Details <ChevronRight size={16} className="ml-1" />
                             </Button>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>

      {/* Modal */}
      {showNewInterviewModal && (
          <ActiveInterviewModal 
            onClose={() => setShowNewInterviewModal(false)} 
            onComplete={handleCompleteInterview}
          />
      )}

    </div>
  );
};