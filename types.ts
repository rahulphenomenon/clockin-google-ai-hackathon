import { LucideIcon } from 'lucide-react';

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  mockupType: 'resume' | 'interview' | 'mentorship' | 'upskill';
}

export type ViewState = 'landing' | 'onboarding' | 'dashboard';

export type DashboardTab = 'resume' | 'interview' | 'mentor' | 'upskill' | 'profile';

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
}

export interface UserContextType {
  user: UserProfile | null;
  updateUser: (data: Partial<UserProfile>) => void;
  clearUser: () => void;
  isAuthenticated: boolean;
}