

import { LucideIcon } from 'lucide-react';

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  mockupType: 'resume' | 'interview' | 'mentorship' | 'upskill' | 'photo-booth' | 'job-match';
}

export type ViewState = 'landing' | 'onboarding' | 'dashboard';

export type DashboardTab = 'home' | 'resume' | 'interview' | 'mentor' | 'upskill' | 'pipeline' | 'photo-booth' | 'job-match';

export type JobStatus = 'Watchlist' | 'Applied' | 'Screening' | 'Interviewing' | 'Received Offer' | 'Rejected' | 'Accepted' ;

export interface Job {
  id: string;
  description: string;
  link?: string;
  status: JobStatus;
  lastUpdated: string;
}

export interface ResumeAnalysis {
  overallScore: number;
  overview: {
    summary: string;
    strengths: string[];
    improvements: string[];
  };
  categories: {
    name: string;
    score: number;
    feedback: string;
  }[];
}

// --- Resume Builder Types ---

export type ResumeFont = 'sans' | 'serif' | 'mono';

export interface ResumeSectionItem {
  id: string;
  isVisible: boolean;
  [key: string]: any;
}

export interface ResumeEducation extends ResumeSectionItem {
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface ResumeExperience extends ResumeSectionItem {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface ResumeProject extends ResumeSectionItem {
  name: string;
  link: string;
  description: string;
}

export interface ResumeSkill extends ResumeSectionItem {
  name: string; // Simplified to single field
}

export interface ResumeAward extends ResumeSectionItem {
  title: string;
  issuer: string;
  date: string;
}

export interface ResumeCertification extends ResumeSectionItem {
  name: string;
  issuer: string;
  date: string;
}

export interface ResumePublication extends ResumeSectionItem {
  title: string;
  publisher: string;
  date: string;
  link: string;
}

export interface ResumeLanguage extends ResumeSectionItem {
  language: string;
  proficiency: string;
}

export interface ResumeInterest extends ResumeSectionItem {
  name: string;
}

export interface ResumeAffiliation extends ResumeSectionItem {
  organization: string;
  role: string;
}

export interface ResumeBuilderData {
  font: ResumeFont;
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  };
  summary: {
    content: string;
    isVisible: boolean;
  };
  sectionVisibility: {
    experience: boolean;
    education: boolean;
    skills: boolean;
    projects: boolean;
    awards: boolean;
    certifications: boolean;
    publications: boolean;
    volunteer: boolean;
    languages: boolean;
    interests: boolean;
    affiliations: boolean;
  };
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkill[];
  projects: ResumeProject[];
  awards: ResumeAward[];
  certifications: ResumeCertification[];
  publications: ResumePublication[];
  volunteer: ResumeExperience[]; // Reuse experience structure
  languages: ResumeLanguage[];
  interests: ResumeInterest[];
  affiliations: ResumeAffiliation[];
}

export interface TranscriptItem {
  role: 'AI' | 'User';
  text: string;
  timestamp?: string;
}

export interface AudioAnalysis {
  confidenceScore: number;
  clarityScore: number;
  pace: string;
  tone: string;
  feedback: string;
}

export interface QuestionFeedback {
  question: string;
  userAnswer: string;
  score: number;
  feedback: string;
  improvedAnswer: string;
}

export interface ContentAnalysis {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  questionFeedback: QuestionFeedback[];
}

export interface InterviewSession {
  id: string;
  role: string;
  company?: string;
  date: string;
  durationSeconds: number;
  questionCount: number;
  type: 'Behavioral' | 'Technical' | 'Mixed';
  questionsList?: string[];
  transcript?: TranscriptItem[];
  audioAnalysis?: AudioAnalysis;
  contentAnalysis?: ContentAnalysis;
}

// --- Upskill Types ---

export interface CoreConcept {
  id: string;
  title: string;
  shortDescription: string;
  fullContent: string;
  isRead: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number; // 0-based index
  explanation: string;
}

export interface QuizSession {
  id: string;
  date: string;
  role: string;
  company?: string;
  score: number;
  totalQuestions: number;
  questions: QuizQuestion[];
  userAnswers: number[]; // Store indices of user answers
}

export interface LearningResource {
  id: string;
  title: string;
  type: 'Book' | 'Course' | 'Video' | 'Article' | 'Podcast' | 'Other';
  description: string;
  isCompleted: boolean;
}

export interface UpskillData {
  targetRole: string; // The role these resources were generated for
  coreConcepts: CoreConcept[];
  resources: LearningResource[];
  quizSessions: QuizSession[];
}

export interface UserProfile {
  name: string;
  targetRoles: string[];
  startDate: string;
  resumeData?: {
    fileName: string;
    base64: string; // Data URI
    lastUpdated: string;
  };
  resumeAnalysis?: ResumeAnalysis;
  resumeBuilderData?: ResumeBuilderData; // New field for builder state
  jobs?: Job[];
  interviewSessions?: InterviewSession[];
  upskillData?: UpskillData;
}

export interface UserContextType {
  user: UserProfile | null;
  updateUser: (data: Partial<UserProfile>) => void;
  clearUser: () => void;
  isAuthenticated: boolean;
}