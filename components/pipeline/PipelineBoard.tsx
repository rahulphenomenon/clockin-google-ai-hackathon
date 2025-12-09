import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  ExternalLink, 
  Trash2, 
  X, 
  Link as LinkIcon,
  GripHorizontal,
  Calendar,
  Edit2
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { Job, JobStatus } from '../../types';
import { Button } from '../ui/Button';

const STATUSES: JobStatus[] = [
  'Applied',
  'Screening',
  'Interviewing',
  'Negotiating',
  'Received Offer',
  'Accepted Offer'
];

export const PipelineBoard: React.FC = () => {
  const { user, updateUser } = useUser();
  const jobs = user?.jobs || [];
  
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [activeColumn, setActiveColumn] = useState<JobStatus | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    description: string;
    link: string;
    status: JobStatus;
  }>({
    description: '',
    link: '',
    status: 'Applied'
  });

  // Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMenuId]);

  // --- CRUD Operations ---

  const handleSaveJob = () => {
    if (!formData.description.trim()) return;

    const newJob: Job = {
      id: editingJobId || crypto.randomUUID(),
      description: formData.description,
      link: formData.link,
      status: formData.status,
      lastUpdated: new Date().toISOString()
    };

    let newJobs = [...jobs];
    if (editingJobId) {
      newJobs = newJobs.map(j => j.id === editingJobId ? newJob : j);
    } else {
      newJobs.push(newJob);
    }

    updateUser({ jobs: newJobs });
    closeModal();
  };

  const handleDeleteJob = (id: string) => {
    const newJobs = jobs.filter(j => j.id !== id);
    updateUser({ jobs: newJobs });
  };

  const openModal = (job?: Job) => {
    if (job) {
      setEditingJobId(job.id);
      setFormData({
        description: job.description,
        link: job.link || '',
        status: job.status
      });
    } else {
      setEditingJobId(null);
      setFormData({
        description: '',
        link: '',
        status: 'Applied'
      });
    }
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingJobId(null);
  };

  // --- Drag and Drop ---

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('jobId', id);
    setDraggedJobId(id);
    // Add a ghost image or styling class if needed
  };

  const handleDragOver = (e: React.DragEvent, status: JobStatus) => {
    e.preventDefault(); // Necessary to allow dropping
    if (activeColumn !== status) {
      setActiveColumn(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Optional: could clear activeColumn if leaving the valid drop zone completely
  };

  const handleDrop = (e: React.DragEvent, status: JobStatus) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('jobId');
    
    if (jobId) {
      const updatedJobs = jobs.map(job => 
        job.id === jobId ? { ...job, status, lastUpdated: new Date().toISOString() } : job
      );
      updateUser({ jobs: updatedJobs });
    }
    
    setDraggedJobId(null);
    setActiveColumn(null);
  };

  // --- Rendering ---

  return (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h2 className="text-3xl font-serif text-zinc-900">Job Pipeline</h2>
          <p className="text-zinc-500">Track and manage your applications.</p>
        </div>
        <Button onClick={() => openModal()} className="gap-2">
          <Plus size={18} /> Add Job
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full gap-6 pb-4 min-w-max">
          {STATUSES.map((status) => {
            const jobsInColumn = jobs.filter(j => j.status === status);
            const isOver = activeColumn === status;

            return (
              <div 
                key={status}
                className={`
                  w-80 flex flex-col rounded-xl transition-colors duration-200
                  ${isOver ? 'bg-zinc-100 ring-2 ring-zinc-200' : 'bg-zinc-50/50 border border-zinc-100'}
                `}
                onDragOver={(e) => handleDragOver(e, status)}
                onDrop={(e) => handleDrop(e, status)}
              >
                {/* Column Header */}
                <div className="p-4 flex items-center justify-between border-b border-zinc-100/50">
                  <h3 className="font-medium text-zinc-900 flex items-center gap-2">
                    {status}
                    <span className="text-xs font-normal text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                      {jobsInColumn.length}
                    </span>
                  </h3>
                </div>

                {/* Cards Container */}
                <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                  {jobsInColumn.map((job) => (
                    <div
                      key={job.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, job.id)}
                      className={`
                        bg-white p-4 rounded-lg border shadow-sm group relative select-none cursor-grab active:cursor-grabbing transition-all
                        ${draggedJobId === job.id ? 'opacity-50 rotate-3 scale-95' : 'opacity-100 border-zinc-200 hover:border-zinc-300 hover:shadow-md'}
                      `}
                    >
                      {/* Drag Handle & Menu */}
                      <div className="flex justify-between items-start mb-2">
                         <div className="p-1 rounded text-zinc-300">
                             <GripHorizontal size={14} />
                         </div>
                         <div className="relative">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(activeMenuId === job.id ? null : job.id);
                                }}
                                className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-900 transition-colors"
                            >
                                <MoreHorizontal size={16} />
                            </button>
                            
                            {/* Dropdown Menu */}
                            {activeMenuId === job.id && (
                                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-zinc-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); openModal(job); }}
                                        className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                                    >
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteJob(job.id); }}
                                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            )}
                         </div>
                      </div>

                      {/* Content */}
                      <div className="mb-3">
                         <h4 className="font-medium text-zinc-900 line-clamp-3 leading-snug">
                            {job.description}
                         </h4>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-50">
                          <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(job.lastUpdated).toLocaleDateString()}
                          </span>
                          {job.link && (
                              <a 
                                href={job.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-zinc-400 hover:text-blue-600 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                  <ExternalLink size={14} />
                              </a>
                          )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Empty State for Column */}
                  {jobsInColumn.length === 0 && (
                      <div className="h-24 border-2 border-dashed border-zinc-100 rounded-lg flex items-center justify-center text-zinc-300 text-sm">
                          Drop here
                      </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-serif text-zinc-900">
                      {editingJobId ? 'Edit Job' : 'Add New Job'}
                  </h3>
                  <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-900">
                      <X size={20} />
                  </button>
              </div>
              
              <div className="space-y-4">
                  <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Description</label>
                      <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="e.g. Senior Frontend Engineer at Google"
                          className="w-full min-h-[80px] px-3 py-2 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all resize-none"
                          autoFocus
                      />
                  </div>
                  
                  <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Link (Optional)</label>
                      <div className="relative">
                          <LinkIcon className="absolute left-3 top-2.5 text-zinc-400 w-4 h-4" />
                          <input
                              type="url"
                              value={formData.link}
                              onChange={(e) => setFormData({...formData, link: e.target.value})}
                              placeholder="https://..."
                              className="w-full h-9 pl-9 pr-3 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all text-sm"
                          />
                      </div>
                  </div>

                  <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Status</label>
                      <select
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value as JobStatus})}
                          className="w-full h-9 px-3 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all text-sm bg-white"
                      >
                          {STATUSES.map(s => (
                              <option key={s} value={s}>{s}</option>
                          ))}
                      </select>
                  </div>
                  
                  <div className="pt-4 flex gap-3">
                      <Button variant="outline" onClick={closeModal} className="flex-1">Cancel</Button>
                      <Button onClick={handleSaveJob} className="flex-1">Save Job</Button>
                  </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};
