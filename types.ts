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
  questionsList?: string[]; // Added to store original questions
  transcript?: TranscriptItem[];
  audioAnalysis?: AudioAnalysis;
  contentAnalysis?: ContentAnalysis;
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