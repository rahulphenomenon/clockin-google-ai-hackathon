

import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Eye, EyeOff, Sparkles, Download, 
  ChevronDown, ChevronUp, GripVertical, AlertCircle, Loader2 
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useUser } from '../../context/UserContext';
import { 
  ResumeBuilderData, ResumeSectionItem, ResumeEducation, 
  ResumeExperience, ResumeProject, ResumeSkill, ResumeFont 
} from '../../types';
import { optimizeResumeText } from '../../utils/gemini';

// Initial Data Structure
const INITIAL_DATA: ResumeBuilderData = {
  font: 'sans',
  contact: {
    firstName: '', lastName: '', email: '', phone: '', location: '', linkedin: '', website: ''
  },
  summary: { content: '', isVisible: true },
  sectionVisibility: {
    experience: true,
    education: true,
    skills: true,
    projects: true,
    awards: true,
    certifications: true,
    publications: true,
    volunteer: true,
    languages: true,
    interests: true,
    affiliations: true
  },
  education: [],
  experience: [],
  skills: [],
  projects: [],
  awards: [],
  certifications: [],
  publications: [],
  volunteer: [],
  languages: [],
  interests: [],
  affiliations: []
};

// Reusable Components
const SectionHeader = ({ 
  title, 
  isVisible, 
  onToggle, 
  isRecommended 
}: { 
  title: string; 
  isVisible: boolean; 
  onToggle: () => void;
  isRecommended?: boolean;
}) => (
  <div className="flex items-center justify-between py-3 border-b border-zinc-100">
    <div className="flex items-center gap-2">
      <h3 className="font-medium text-zinc-900">{title}</h3>
      {isRecommended && (
        <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-medium border border-green-100">
          Recommended
        </span>
      )}
    </div>
    <button 
      onClick={onToggle} 
      className={`p-1.5 rounded hover:bg-zinc-100 transition-colors ${isVisible ? 'text-zinc-500' : 'text-zinc-300'}`}
      title={isVisible ? "Hide Section" : "Show Section"}
    >
      {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
    </button>
  </div>
);

const OptimizableTextarea = ({
  value,
  onChange,
  label,
  placeholder,
  sectionType
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
  placeholder?: string;
  sectionType: string;
}) => {
  const { user } = useUser();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const targetRole = user?.targetRoles?.[0] || 'Professional';

  const handleOptimize = async () => {
    if (value.length < 10) return;
    setIsOptimizing(true);
    try {
      const optimized = await optimizeResumeText(value, sectionType, targetRole);
      onChange(optimized);
    } catch (e) {
      console.error(e);
      // Fail silently or toast
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-zinc-600">{label}</label>
        <button
          type="button"
          onClick={handleOptimize}
          disabled={value.length < 10 || isOptimizing}
          className={`
            text-xs flex items-center gap-1 transition-colors
            ${value.length < 10 
              ? 'text-zinc-300 cursor-not-allowed' 
              : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-1.5 py-0.5 rounded'
            }
          `}
          title={value.length < 10 ? "Enter at least 10 characters to optimize" : "Optimize with AI"}
        >
          {isOptimizing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          AI Optimize
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[100px] px-3 py-2 rounded-md border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-y bg-white"
      />
    </div>
  );
};

export const ResumeBuilder: React.FC = () => {
  const { user, updateUser } = useUser();
  
  // Initialize with saved data or default
  const [data, setData] = useState<ResumeBuilderData>(() => {
    if (user?.resumeBuilderData) {
      // Merge with initial data to ensure new fields (like sectionVisibility) exist if loading old data
      return {
        ...INITIAL_DATA,
        ...user.resumeBuilderData,
        sectionVisibility: {
          ...INITIAL_DATA.sectionVisibility,
          ...(user.resumeBuilderData.sectionVisibility || {})
        }
      };
    }
    // Pre-fill contact if available
    return {
      ...INITIAL_DATA,
      contact: {
        ...INITIAL_DATA.contact,
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ').slice(1).join(' ') || ''
      }
    };
  });

  // Persist to user context on change
  useEffect(() => {
    const timer = setTimeout(() => {
      updateUser({ resumeBuilderData: data });
    }, 1000);
    return () => clearTimeout(timer);
  }, [data]);

  const updateContact = (key: keyof typeof data.contact, val: string) => {
    setData(prev => ({ ...prev, contact: { ...prev.contact, [key]: val } }));
  };

  // Helper for visibility toggling
  const toggleSection = (section: keyof ResumeBuilderData['sectionVisibility']) => {
    setData(prev => ({
      ...prev,
      sectionVisibility: {
        ...prev.sectionVisibility,
        [section]: !prev.sectionVisibility[section]
      }
    }));
  };

  // Helper for array sections
  const addItem = (section: keyof ResumeBuilderData, item: any) => {
    setData(prev => ({
      ...prev,
      [section]: [...(prev[section] as any[]), { ...item, id: crypto.randomUUID(), isVisible: true }]
    }));
  };

  const removeItem = (section: keyof ResumeBuilderData, id: string) => {
    setData(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).filter(i => i.id !== id)
    }));
  };

  const updateItem = (section: keyof ResumeBuilderData, id: string, field: string, val: any) => {
    setData(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).map(i => i.id === id ? { ...i, [field]: val } : i)
    }));
  };

  // --- Print/PDF Handler ---
  const handleDownloadPDF = () => {
    // Set custom title for filename
    const originalTitle = document.title;
    const fileName = `${data.contact.firstName || 'Resume'}_${data.contact.lastName || 'User'}_Resume`.replace(/\s+/g, '_');
    document.title = fileName;
    
    window.print();
    
    // Restore title
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  // --- Render Functions ---

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      
      {/* LEFT COLUMN: EDITOR */}
      <div className="space-y-8 pb-20 print:hidden">
        
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif text-zinc-900">Resume Details</h2>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-zinc-500 font-medium">Font:</span>
              <select 
                value={data.font}
                onChange={(e) => setData({ ...data, font: e.target.value as ResumeFont })}
                className="h-8 px-2 text-xs border border-zinc-200 rounded bg-white text-zinc-700"
              >
                <option value="sans">Sans Serif</option>
                <option value="serif">Serif</option>
                <option value="mono">Mono</option>
              </select>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
             <h3 className="font-medium text-zinc-900 border-b border-zinc-100 pb-2">Contact Information</h3>
             <div className="grid grid-cols-2 gap-4">
                <input 
                   placeholder="First Name" 
                   className="input-base"
                   value={data.contact.firstName} 
                   onChange={e => updateContact('firstName', e.target.value)} 
                />
                <input 
                   placeholder="Last Name" 
                   className="input-base"
                   value={data.contact.lastName} 
                   onChange={e => updateContact('lastName', e.target.value)} 
                />
                <input 
                   placeholder="Email" 
                   className="input-base"
                   value={data.contact.email} 
                   onChange={e => updateContact('email', e.target.value)} 
                />
                <input 
                   placeholder="Phone" 
                   className="input-base"
                   value={data.contact.phone} 
                   onChange={e => updateContact('phone', e.target.value)} 
                />
                <input 
                   placeholder="Location (City, State)" 
                   className="input-base col-span-2"
                   value={data.contact.location} 
                   onChange={e => updateContact('location', e.target.value)} 
                />
                <input 
                   placeholder="LinkedIn URL" 
                   className="input-base"
                   value={data.contact.linkedin} 
                   onChange={e => updateContact('linkedin', e.target.value)} 
                />
                <input 
                   placeholder="Website / Portfolio" 
                   className="input-base"
                   value={data.contact.website} 
                   onChange={e => updateContact('website', e.target.value)} 
                />
             </div>
          </div>

          {/* Professional Summary */}
          <div>
            <SectionHeader 
               title="Professional Summary" 
               isVisible={data.summary.isVisible} 
               onToggle={() => setData(prev => ({ ...prev, summary: { ...prev.summary, isVisible: !prev.summary.isVisible } }))} 
            />
            {data.summary.isVisible && (
              <div className="pt-4">
                <OptimizableTextarea 
                  label="Summary" 
                  value={data.summary.content} 
                  onChange={val => setData(prev => ({ ...prev, summary: { ...prev.summary, content: val } }))}
                  sectionType="Professional Summary"
                  placeholder="Experienced professional with a background in..."
                />
              </div>
            )}
          </div>

          {/* Experience */}
          <div>
             <SectionHeader 
               title="Work Experience" 
               isVisible={data.sectionVisibility.experience} 
               isRecommended
               onToggle={() => toggleSection('experience')}
            />
            {data.sectionVisibility.experience && (
              <div className="space-y-6 pt-4">
                {data.experience.map((exp, idx) => (
                  <div key={exp.id} className="relative pl-4 border-l-2 border-zinc-100 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input 
                          placeholder="Company Name" 
                          className="input-base"
                          value={exp.company}
                          onChange={e => updateItem('experience', exp.id, 'company', e.target.value)}
                        />
                        <input 
                          placeholder="Job Title" 
                          className="input-base"
                          value={exp.position}
                          onChange={e => updateItem('experience', exp.id, 'position', e.target.value)}
                        />
                        <input 
                          placeholder="Start Date" 
                          className="input-base"
                          value={exp.startDate}
                          onChange={e => updateItem('experience', exp.id, 'startDate', e.target.value)}
                        />
                        <div className="flex items-center gap-2">
                          <input 
                              placeholder="End Date" 
                              className="input-base flex-1 disabled:bg-zinc-50"
                              value={exp.endDate}
                              onChange={e => updateItem('experience', exp.id, 'endDate', e.target.value)}
                              disabled={exp.current}
                          />
                          <label className="text-xs flex items-center gap-1 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={exp.current} 
                                onChange={e => updateItem('experience', exp.id, 'current', e.target.checked)}
                              /> Current
                          </label>
                        </div>
                    </div>
                    <OptimizableTextarea 
                        label="Description / Bullets"
                        value={exp.description}
                        onChange={val => updateItem('experience', exp.id, 'description', val)}
                        sectionType="Work Experience"
                    />
                    <div className="flex justify-end pt-1">
                        <button 
                          onClick={() => removeItem('experience', exp.id)}
                          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Remove Role
                        </button>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" size="sm" className="w-full border-dashed"
                  onClick={() => addItem('experience', { company: '', position: '', startDate: '', endDate: '', current: false, description: '' })}
                >
                  <Plus size={14} className="mr-2" /> Add Position
                </Button>
              </div>
            )}
          </div>

          {/* Education */}
          <div>
             <SectionHeader 
               title="Education" 
               isVisible={data.sectionVisibility.education} 
               isRecommended
               onToggle={() => toggleSection('education')}
            />
            {data.sectionVisibility.education && (
              <div className="space-y-6 pt-4">
                {data.education.map((edu, idx) => (
                  <div key={edu.id} className="relative pl-4 border-l-2 border-zinc-100 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input 
                          placeholder="School / University" 
                          className="input-base"
                          value={edu.school}
                          onChange={e => updateItem('education', edu.id, 'school', e.target.value)}
                        />
                        <input 
                          placeholder="Degree / Major" 
                          className="input-base"
                          value={edu.degree}
                          onChange={e => updateItem('education', edu.id, 'degree', e.target.value)}
                        />
                        <input 
                          placeholder="Start Date" 
                          className="input-base"
                          value={edu.startDate}
                          onChange={e => updateItem('education', edu.id, 'startDate', e.target.value)}
                        />
                        <input 
                          placeholder="End Date (or Expected)" 
                          className="input-base"
                          value={edu.endDate}
                          onChange={e => updateItem('education', edu.id, 'endDate', e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end pt-1">
                        <button 
                          onClick={() => removeItem('education', edu.id)}
                          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" size="sm" className="w-full border-dashed"
                  onClick={() => addItem('education', { school: '', degree: '', startDate: '', endDate: '', current: false, description: '' })}
                >
                  <Plus size={14} className="mr-2" /> Add Education
                </Button>
              </div>
            )}
          </div>

          {/* Skills */}
          <div>
            <SectionHeader 
               title="Skills" 
               isVisible={data.sectionVisibility.skills} 
               isRecommended
               onToggle={() => toggleSection('skills')} 
            />
            {data.sectionVisibility.skills && (
              <div className="space-y-4 pt-4">
                {data.skills.map(skill => (
                    <div key={skill.id} className="flex gap-2 items-center">
                        <input 
                          placeholder="Skill (e.g. React, Project Management)" 
                          className="input-base flex-1"
                          value={skill.name}
                          onChange={e => updateItem('skills', skill.id, 'name', e.target.value)}
                        />
                        <button 
                          onClick={() => removeItem('skills', skill.id)}
                          className="text-zinc-400 hover:text-red-500 px-1"
                        >
                          <Trash2 size={14} />
                        </button>
                    </div>
                ))}
                <Button 
                  variant="outline" size="sm" className="w-full border-dashed"
                  onClick={() => addItem('skills', { name: '' })}
                >
                  <Plus size={14} className="mr-2" /> Add Skill
                </Button>
              </div>
            )}
          </div>

          {/* Projects */}
           <div>
             <SectionHeader 
               title="Projects" 
               isVisible={data.sectionVisibility.projects} 
               onToggle={() => toggleSection('projects')}
            />
            {data.sectionVisibility.projects && (
              <div className="space-y-6 pt-4">
                {data.projects.map((proj, idx) => (
                  <div key={proj.id} className="relative pl-4 border-l-2 border-zinc-100 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input 
                          placeholder="Project Name" 
                          className="input-base"
                          value={proj.name}
                          onChange={e => updateItem('projects', proj.id, 'name', e.target.value)}
                        />
                        <input 
                          placeholder="Link (Optional)" 
                          className="input-base"
                          value={proj.link}
                          onChange={e => updateItem('projects', proj.id, 'link', e.target.value)}
                        />
                    </div>
                    <OptimizableTextarea 
                        label="Description"
                        value={proj.description}
                        onChange={val => updateItem('projects', proj.id, 'description', val)}
                        sectionType="Project Description"
                    />
                    <div className="flex justify-end pt-1">
                        <button 
                          onClick={() => removeItem('projects', proj.id)}
                          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Remove Project
                        </button>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" size="sm" className="w-full border-dashed"
                  onClick={() => addItem('projects', { name: '', link: '', description: '' })}
                >
                  <Plus size={14} className="mr-2" /> Add Project
                </Button>
              </div>
            )}
          </div>

          {/* Awards */}
          <div>
             <SectionHeader 
               title="Awards & Honors" 
               isVisible={data.sectionVisibility.awards} 
               onToggle={() => toggleSection('awards')}
            />
            {data.sectionVisibility.awards && (
              <div className="space-y-6 pt-4">
                {data.awards.map((award, idx) => (
                  <div key={award.id} className="relative pl-4 border-l-2 border-zinc-100 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input 
                          placeholder="Award Title" 
                          className="input-base"
                          value={award.title}
                          onChange={e => updateItem('awards', award.id, 'title', e.target.value)}
                        />
                        <input 
                          placeholder="Issuer" 
                          className="input-base"
                          value={award.issuer}
                          onChange={e => updateItem('awards', award.id, 'issuer', e.target.value)}
                        />
                        <input 
                          placeholder="Date" 
                          className="input-base"
                          value={award.date}
                          onChange={e => updateItem('awards', award.id, 'date', e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end pt-1">
                        <button 
                          onClick={() => removeItem('awards', award.id)}
                          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" size="sm" className="w-full border-dashed"
                  onClick={() => addItem('awards', { title: '', issuer: '', date: '' })}
                >
                  <Plus size={14} className="mr-2" /> Add Award
                </Button>
              </div>
            )}
          </div>

          {/* Certifications */}
          <div>
             <SectionHeader 
               title="Certifications & Licenses" 
               isVisible={data.sectionVisibility.certifications} 
               onToggle={() => toggleSection('certifications')}
            />
            {data.sectionVisibility.certifications && (
              <div className="space-y-6 pt-4">
                {data.certifications.map((cert, idx) => (
                  <div key={cert.id} className="relative pl-4 border-l-2 border-zinc-100 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input 
                          placeholder="Certification Name" 
                          className="input-base"
                          value={cert.name}
                          onChange={e => updateItem('certifications', cert.id, 'name', e.target.value)}
                        />
                        <input 
                          placeholder="Issuer" 
                          className="input-base"
                          value={cert.issuer}
                          onChange={e => updateItem('certifications', cert.id, 'issuer', e.target.value)}
                        />
                        <input 
                          placeholder="Date" 
                          className="input-base"
                          value={cert.date}
                          onChange={e => updateItem('certifications', cert.id, 'date', e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end pt-1">
                        <button 
                          onClick={() => removeItem('certifications', cert.id)}
                          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" size="sm" className="w-full border-dashed"
                  onClick={() => addItem('certifications', { name: '', issuer: '', date: '' })}
                >
                  <Plus size={14} className="mr-2" /> Add Certification
                </Button>
              </div>
            )}
          </div>
          
           {/* Publications */}
          <div>
             <SectionHeader 
               title="Publications & Presentations" 
               isVisible={data.sectionVisibility.publications} 
               onToggle={() => toggleSection('publications')}
            />
            {data.sectionVisibility.publications && (
              <div className="space-y-6 pt-4">
                {data.publications.map((pub, idx) => (
                  <div key={pub.id} className="relative pl-4 border-l-2 border-zinc-100 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input 
                          placeholder="Title" 
                          className="input-base"
                          value={pub.title}
                          onChange={e => updateItem('publications', pub.id, 'title', e.target.value)}
                        />
                        <input 
                          placeholder="Publisher / Conference" 
                          className="input-base"
                          value={pub.publisher}
                          onChange={e => updateItem('publications', pub.id, 'publisher', e.target.value)}
                        />
                        <input 
                          placeholder="Date" 
                          className="input-base"
                          value={pub.date}
                          onChange={e => updateItem('publications', pub.id, 'date', e.target.value)}
                        />
                        <input 
                          placeholder="Link" 
                          className="input-base"
                          value={pub.link}
                          onChange={e => updateItem('publications', pub.id, 'link', e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end pt-1">
                        <button 
                          onClick={() => removeItem('publications', pub.id)}
                          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" size="sm" className="w-full border-dashed"
                  onClick={() => addItem('publications', { title: '', publisher: '', date: '', link: '' })}
                >
                  <Plus size={14} className="mr-2" /> Add Publication
                </Button>
              </div>
            )}
          </div>

          {/* Volunteer */}
          <div>
             <SectionHeader 
               title="Volunteer Experience" 
               isVisible={data.sectionVisibility.volunteer} 
               onToggle={() => toggleSection('volunteer')}
            />
            {data.sectionVisibility.volunteer && (
              <div className="space-y-6 pt-4">
                {data.volunteer.map((vol, idx) => (
                  <div key={vol.id} className="relative pl-4 border-l-2 border-zinc-100 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input 
                          placeholder="Organization" 
                          className="input-base"
                          value={vol.company}
                          onChange={e => updateItem('volunteer', vol.id, 'company', e.target.value)}
                        />
                        <input 
                          placeholder="Role" 
                          className="input-base"
                          value={vol.position}
                          onChange={e => updateItem('volunteer', vol.id, 'position', e.target.value)}
                        />
                        <input 
                          placeholder="Start Date" 
                          className="input-base"
                          value={vol.startDate}
                          onChange={e => updateItem('volunteer', vol.id, 'startDate', e.target.value)}
                        />
                        <div className="flex items-center gap-2">
                          <input 
                              placeholder="End Date" 
                              className="input-base flex-1 disabled:bg-zinc-50"
                              value={vol.endDate}
                              onChange={e => updateItem('volunteer', vol.id, 'endDate', e.target.value)}
                              disabled={vol.current}
                          />
                          <label className="text-xs flex items-center gap-1 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={vol.current} 
                                onChange={e => updateItem('volunteer', vol.id, 'current', e.target.checked)}
                              /> Current
                          </label>
                        </div>
                    </div>
                    <OptimizableTextarea 
                        label="Description"
                        value={vol.description}
                        onChange={val => updateItem('volunteer', vol.id, 'description', val)}
                        sectionType="Volunteer Description"
                    />
                    <div className="flex justify-end pt-1">
                        <button 
                          onClick={() => removeItem('volunteer', vol.id)}
                          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" size="sm" className="w-full border-dashed"
                  onClick={() => addItem('volunteer', { company: '', position: '', startDate: '', endDate: '', current: false, description: '' })}
                >
                  <Plus size={14} className="mr-2" /> Add Volunteer
                </Button>
              </div>
            )}
          </div>

          {/* Languages */}
          <div>
            <SectionHeader 
               title="Languages" 
               isVisible={data.sectionVisibility.languages} 
               onToggle={() => toggleSection('languages')} 
            />
            {data.sectionVisibility.languages && (
              <div className="space-y-4 pt-4">
                {data.languages.map(lang => (
                    <div key={lang.id} className="flex gap-2">
                        <input 
                          placeholder="Language" 
                          className="input-base flex-1"
                          value={lang.language}
                          onChange={e => updateItem('languages', lang.id, 'language', e.target.value)}
                        />
                        <input 
                          placeholder="Proficiency" 
                          className="input-base w-1/3"
                          value={lang.proficiency}
                          onChange={e => updateItem('languages', lang.id, 'proficiency', e.target.value)}
                        />
                        <button 
                          onClick={() => removeItem('languages', lang.id)}
                          className="text-zinc-400 hover:text-red-500 px-1"
                        >
                          <Trash2 size={14} />
                        </button>
                    </div>
                ))}
                <Button 
                  variant="outline" size="sm" className="w-full border-dashed"
                  onClick={() => addItem('languages', { language: '', proficiency: '' })}
                >
                  <Plus size={14} className="mr-2" /> Add Language
                </Button>
              </div>
            )}
          </div>
          
           {/* Affiliations */}
          <div>
            <SectionHeader 
               title="Professional Affiliations" 
               isVisible={data.sectionVisibility.affiliations} 
               onToggle={() => toggleSection('affiliations')} 
            />
            {data.sectionVisibility.affiliations && (
              <div className="space-y-4 pt-4">
                {data.affiliations.map(aff => (
                    <div key={aff.id} className="flex gap-2">
                        <input 
                          placeholder="Organization" 
                          className="input-base flex-1"
                          value={aff.organization}
                          onChange={e => updateItem('affiliations', aff.id, 'organization', e.target.value)}
                        />
                        <input 
                          placeholder="Role (Member)" 
                          className="input-base w-1/3"
                          value={aff.role}
                          onChange={e => updateItem('affiliations', aff.id, 'role', e.target.value)}
                        />
                        <button 
                          onClick={() => removeItem('affiliations', aff.id)}
                          className="text-zinc-400 hover:text-red-500 px-1"
                        >
                          <Trash2 size={14} />
                        </button>
                    </div>
                ))}
                <Button 
                  variant="outline" size="sm" className="w-full border-dashed"
                  onClick={() => addItem('affiliations', { organization: '', role: '' })}
                >
                  <Plus size={14} className="mr-2" /> Add Affiliation
                </Button>
              </div>
            )}
          </div>
          
          {/* Interests */}
          <div>
            <SectionHeader 
               title="Interests" 
               isVisible={data.sectionVisibility.interests} 
               onToggle={() => toggleSection('interests')} 
            />
            {data.sectionVisibility.interests && (
              <div className="space-y-4 pt-4">
                {data.interests.map(int => (
                    <div key={int.id} className="flex gap-2">
                        <input 
                          placeholder="Interest" 
                          className="input-base flex-1"
                          value={int.name}
                          onChange={e => updateItem('interests', int.id, 'name', e.target.value)}
                        />
                        <button 
                          onClick={() => removeItem('interests', int.id)}
                          className="text-zinc-400 hover:text-red-500 px-1"
                        >
                          <Trash2 size={14} />
                        </button>
                    </div>
                ))}
                <Button 
                  variant="outline" size="sm" className="w-full border-dashed"
                  onClick={() => addItem('interests', { name: '' })}
                >
                  <Plus size={14} className="mr-2" /> Add Interest
                </Button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* RIGHT COLUMN: PREVIEW */}
      <div className="hidden lg:block print:block relative pb-20">
         <div className="sticky top-8 space-y-4 print:static">
             <div className="flex justify-between items-center px-2 print:hidden">
                 <span className="text-sm font-medium text-zinc-500">Live Preview</span>
                 <div className="text-xs text-zinc-400">A4 • {data.font === 'sans' ? 'Inter' : data.font === 'serif' ? 'Merriweather' : 'Roboto Mono'}</div>
             </div>
             
             {/* Resume Paper */}
             <div 
                id="resume-preview" 
                className={`
                  bg-white shadow-xl w-full aspect-[1/1.414] mx-auto p-[40px] text-zinc-900 overflow-hidden text-sm leading-relaxed
                  ${data.font === 'serif' ? 'font-merriweather' : data.font === 'mono' ? 'font-mono' : 'font-sans'}
                `}
                style={{
                  fontSize: '11px', // Base font size for A4 preview scaling
                }}
             >
                {/* Header */}
                <header className="border-b-2 border-zinc-900 pb-4 mb-4">
                    <h1 className="text-3xl font-bold uppercase tracking-wide mb-2">{data.contact.firstName} {data.contact.lastName}</h1>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600">
                        {data.contact.location && <span>{data.contact.location}</span>}
                        {data.contact.email && <span>{data.contact.email}</span>}
                        {data.contact.phone && <span>{data.contact.phone}</span>}
                        {data.contact.linkedin && <span>{data.contact.linkedin}</span>}
                        {data.contact.website && <span>{data.contact.website}</span>}
                    </div>
                </header>

                {/* Summary */}
                {data.summary.isVisible && data.summary.content && (
                   <section className="mb-4">
                       <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-300 mb-2 pb-0.5">Professional Summary</h2>
                       <p className="text-justify">{data.summary.content}</p>
                   </section>
                )}

                {/* Experience */}
                {data.sectionVisibility.experience && data.experience.length > 0 && (
                   <section className="mb-4">
                       <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-300 mb-2 pb-0.5">Work Experience</h2>
                       <div className="space-y-3">
                           {data.experience.map(exp => (
                               <div key={exp.id}>
                                   <div className="flex justify-between items-baseline mb-0.5">
                                       <h3 className="font-bold text-sm">{exp.position}</h3>
                                       <span className="text-xs font-medium whitespace-nowrap">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                                   </div>
                                   <div className="text-xs italic mb-1">{exp.company}</div>
                                   <div className="whitespace-pre-wrap pl-3 border-l-2 border-zinc-100">
                                       {exp.description}
                                   </div>
                               </div>
                           ))}
                       </div>
                   </section>
                )}

                {/* Projects */}
                {data.sectionVisibility.projects && data.projects.length > 0 && (
                   <section className="mb-4">
                       <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-300 mb-2 pb-0.5">Projects</h2>
                       <div className="space-y-3">
                           {data.projects.map(proj => (
                               <div key={proj.id}>
                                   <div className="flex justify-between items-baseline mb-0.5">
                                       <h3 className="font-bold text-sm">{proj.name}</h3>
                                       {proj.link && <span className="text-xs text-zinc-500">{proj.link}</span>}
                                   </div>
                                   <p className="text-xs">{proj.description}</p>
                               </div>
                           ))}
                       </div>
                   </section>
                )}

                {/* Education */}
                {data.sectionVisibility.education && data.education.length > 0 && (
                   <section className="mb-4">
                       <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-300 mb-2 pb-0.5">Education</h2>
                       <div className="space-y-2">
                           {data.education.map(edu => (
                               <div key={edu.id}>
                                   <div className="flex justify-between items-baseline">
                                       <h3 className="font-bold text-sm">{edu.school}</h3>
                                       <span className="text-xs whitespace-nowrap">{edu.startDate} – {edu.endDate}</span>
                                   </div>
                                   <div className="text-xs">{edu.degree}</div>
                               </div>
                           ))}
                       </div>
                   </section>
                )}

                {/* Skills */}
                {data.sectionVisibility.skills && data.skills.length > 0 && (
                   <section className="mb-4">
                       <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-300 mb-2 pb-0.5">Skills</h2>
                       <div className="text-xs">
                           {data.skills.map(skill => skill.name).join(', ')}
                       </div>
                   </section>
                )}

                {/* Awards */}
                {data.sectionVisibility.awards && data.awards.length > 0 && (
                   <section className="mb-4">
                       <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-300 mb-2 pb-0.5">Awards & Honors</h2>
                       <div className="space-y-1">
                           {data.awards.map(award => (
                               <div key={award.id} className="flex justify-between text-xs">
                                   <div>
                                       <span className="font-bold">{award.title}</span>, {award.issuer}
                                   </div>
                                   <span className="whitespace-nowrap">{award.date}</span>
                               </div>
                           ))}
                       </div>
                   </section>
                )}

                {/* Certifications */}
                {data.sectionVisibility.certifications && data.certifications.length > 0 && (
                   <section className="mb-4">
                       <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-300 mb-2 pb-0.5">Certifications</h2>
                       <div className="space-y-1">
                           {data.certifications.map(cert => (
                               <div key={cert.id} className="flex justify-between text-xs">
                                   <div>
                                       <span className="font-bold">{cert.name}</span>, {cert.issuer}
                                   </div>
                                   <span className="whitespace-nowrap">{cert.date}</span>
                               </div>
                           ))}
                       </div>
                   </section>
                )}

                {/* Publications */}
                 {data.sectionVisibility.publications && data.publications.length > 0 && (
                   <section className="mb-4">
                       <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-300 mb-2 pb-0.5">Publications</h2>
                       <div className="space-y-2">
                           {data.publications.map(pub => (
                               <div key={pub.id} className="text-xs">
                                   <div className="flex justify-between mb-0.5">
                                        <span className="font-bold italic">{pub.title}</span>
                                        <span className="whitespace-nowrap">{pub.date}</span>
                                   </div>
                                   <div>
                                       {pub.publisher} {pub.link && <span>• {pub.link}</span>}
                                   </div>
                               </div>
                           ))}
                       </div>
                   </section>
                )}

                {/* Volunteer */}
                 {data.sectionVisibility.volunteer && data.volunteer.length > 0 && (
                   <section className="mb-4">
                       <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-300 mb-2 pb-0.5">Volunteer Experience</h2>
                       <div className="space-y-3">
                           {data.volunteer.map(vol => (
                               <div key={vol.id}>
                                   <div className="flex justify-between items-baseline mb-0.5">
                                       <h3 className="font-bold text-sm">{vol.position}</h3>
                                       <span className="text-xs font-medium whitespace-nowrap">{vol.startDate} – {vol.current ? 'Present' : vol.endDate}</span>
                                   </div>
                                   <div className="text-xs italic mb-1">{vol.company}</div>
                                   <div className="text-xs">{vol.description}</div>
                               </div>
                           ))}
                       </div>
                   </section>
                )}

                {/* Languages */}
                {data.sectionVisibility.languages && data.languages.length > 0 && (
                   <section className="mb-4">
                       <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-300 mb-2 pb-0.5">Languages</h2>
                       <div className="text-xs">
                           {data.languages.map(lang => (
                               lang.proficiency ? `${lang.language} (${lang.proficiency})` : lang.language
                           )).join(', ')}
                       </div>
                   </section>
                )}

                {/* Affiliations */}
                {data.sectionVisibility.affiliations && data.affiliations.length > 0 && (
                   <section className="mb-4">
                       <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-300 mb-2 pb-0.5">Professional Affiliations</h2>
                       <div className="text-xs">
                           {data.affiliations.map(aff => (
                               aff.role ? `${aff.organization} (${aff.role})` : aff.organization
                           )).join(', ')}
                       </div>
                   </section>
                )}

                {/* Interests */}
                {data.sectionVisibility.interests && data.interests.length > 0 && (
                   <section className="mb-4">
                       <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-300 mb-2 pb-0.5">Interests</h2>
                       <div className="text-xs">
                           {data.interests.map(int => int.name).join(', ')}
                       </div>
                   </section>
                )}
             </div>

             <Button size="lg" onClick={handleDownloadPDF} className="w-full print:hidden">
                 <Download className="mr-2 w-5 h-5" /> Download PDF
             </Button>
         </div>
      </div>

      {/* Global Styles for Inputs */}
      <style>{`
         .input-base {
            width: 100%;
            height: 36px;
            padding: 0 12px;
            border-radius: 6px;
            border: 1px solid #e4e4e7;
            background-color: white;
            font-size: 14px;
            outline: none;
            transition: all 0.2s;
         }
         .input-base:focus {
            border-color: #18181b;
            box-shadow: 0 0 0 2px rgba(24, 24, 27, 0.1);
         }
         @media print {
            @page { margin: 0; size: auto; }
            body, html { 
                background: white; 
                margin: 0; 
                padding: 0;
                width: 100%;
                height: 100%;
                overflow: visible;
            }
            
            /* Hide everything by default */
            body * {
                visibility: hidden;
            }

            /* Show only preview and its children */
            #resume-preview, #resume-preview * {
                visibility: visible;
            }

            #resume-preview {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                min-height: 100%;
                margin: 0;
                padding: 40px !important; /* Ensure internal margins */
                box-shadow: none;
                z-index: 9999;
                background: white;
                transform: none !important;
            }
         }
      `}</style>
    </div>
  );
};

