import { LucideIcon } from 'lucide-react';

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  mockupType: 'resume' | 'interview' | 'mentorship' | 'upskill';
}

export type ViewState = 'landing' | 'onboarding' | 'dashboard';

export type DashboardTab = 'home' | 'resume' | 'interview' | 'mentor' | 'upskill' | 'pipeline';

export type JobStatus = 'Watchlist' | 'Applied' | 'Screening' | 'Interviewing' | 'Received Offer' | 'Accepted Offer';

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

export interface InterviewSession {
  id: string;
  role: string;
  company?: string;
  date: string;
  durationSeconds: number;
  questionCount: number;
  type: 'Behavioral' | 'Technical' | 'Mixed';
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
  jobs?: Job[];
  interviewSessions?: InterviewSession[];
}

export interface UserContextType {
  user: UserProfile | null;
  updateUser: (data: Partial<UserProfile>) => void;
  clearUser: () => void;
  isAuthenticated: boolean;
}