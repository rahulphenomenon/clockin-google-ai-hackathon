
import React from 'react';
import { ExternalLink, Book, Video, Mic, FileText, CheckSquare, Square } from 'lucide-react';
import { LearningResource } from '../../types';

interface ResourceListViewProps {
  resources: LearningResource[];
  onToggleComplete: (id: string) => void;
}

export const ResourceListView: React.FC<ResourceListViewProps> = ({ resources, onToggleComplete }) => {
  
  const getIcon = (type: string) => {
    switch(type) {
      case 'Book': return Book;
      case 'Video': return Video;
      case 'Podcast': return Mic;
      case 'Course': return FileText;
      default: return ExternalLink;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
       {resources.map((resource) => {
         const Icon = getIcon(resource.type);
         return (
           <div 
             key={resource.id}
             className={`
               flex items-start gap-4 p-4 rounded-xl border transition-all
               ${resource.isCompleted 
                 ? 'bg-zinc-50 border-zinc-200 opacity-75' 
                 : 'bg-white border-zinc-200 hover:border-zinc-300'
               }
             `}
           >
             <button 
               onClick={() => onToggleComplete(resource.id)}
               className="mt-1 text-zinc-400 hover:text-zinc-900 transition-colors"
             >
               {resource.isCompleted ? <CheckSquare size={20} /> : <Square size={20} />}
             </button>

             <div className="p-2 bg-zinc-100 rounded-lg text-zinc-500 shrink-0">
               <Icon size={18} />
             </div>

             <div className="flex-1 min-w-0">
               <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <h4 className={`font-medium truncate ${resource.isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-900'}`}>
                    {resource.title}
                  </h4>
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded w-fit">
                    {resource.type}
                  </span>
               </div>
               
               <p className="text-sm text-zinc-500 line-clamp-2">
                 {resource.description}
               </p>
             </div>
           </div>
         );
       })}
    </div>
  );
};
