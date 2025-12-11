import React, { useState } from 'react';
import { CheckCircle2, Circle, BookOpen, X, ChevronRight } from 'lucide-react';
import { CoreConcept } from '../../types';
import { Button } from '../ui/Button';

interface CoreConceptsViewProps {
  concepts: CoreConcept[];
  onToggleRead: (id: string) => void;
}

export const CoreConceptsView: React.FC<CoreConceptsViewProps> = ({ concepts, onToggleRead }) => {
  const [selectedConcept, setSelectedConcept] = useState<CoreConcept | null>(null);

  const readCount = concepts.filter(c => c.isRead).length;
  const progress = concepts.length > 0 ? Math.round((readCount / concepts.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Progress Header */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-lg font-serif text-zinc-900">Knowledge Progress</h3>
            <p className="text-zinc-500 text-sm">Track your understanding of core concepts.</p>
          </div>
          <span className="text-3xl font-serif text-zinc-900">{progress}%</span>
        </div>
        <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-zinc-900 transition-all duration-1000 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {concepts.map((concept) => (
          <div 
            key={concept.id}
            onClick={() => setSelectedConcept(concept)}
            className={`
              group relative p-6 rounded-xl border transition-all cursor-pointer hover:-translate-y-1 duration-300
              ${concept.isRead 
                ? 'bg-zinc-50 border-zinc-200' 
                : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-lg'
              }
            `}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${concept.isRead ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'}`}>
                <BookOpen size={20} />
              </div>
              {concept.isRead && <CheckCircle2 className="text-green-600 w-5 h-5" />}
            </div>
            
            <h4 className={`font-serif text-xl mb-2 ${concept.isRead ? 'text-zinc-500' : 'text-zinc-900'}`}>
              {concept.title}
            </h4>
            <p className="text-sm text-zinc-500 line-clamp-3 mb-4">
              {concept.shortDescription}
            </p>
            
            <div className="text-xs font-medium text-zinc-900 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               Read More <ChevronRight size={12} />
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedConcept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-100 flex justify-between items-start">
              <div>
                 <h3 className="text-2xl font-serif text-zinc-900 mb-1">{selectedConcept.title}</h3>
                 <p className="text-zinc-500 text-sm">{selectedConcept.shortDescription}</p>
              </div>
              <button 
                onClick={() => setSelectedConcept(null)}
                className="text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto leading-relaxed text-zinc-700">
               {selectedConcept.fullContent.split('\n').map((paragraph, idx) => (
                 <p key={idx} className="mb-4 last:mb-0">{paragraph}</p>
               ))}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 flex justify-end gap-3 rounded-b-xl">
               <Button variant="outline" onClick={() => setSelectedConcept(null)}>
                 Close
               </Button>
               <Button 
                 onClick={() => {
                   onToggleRead(selectedConcept.id);
                   setSelectedConcept(null);
                 }}
                 className={selectedConcept.isRead ? "bg-zinc-200 text-zinc-500 hover:bg-zinc-300" : ""}
               >
                 {selectedConcept.isRead ? 'Mark as Unread' : 'Mark as Read'}
               </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
