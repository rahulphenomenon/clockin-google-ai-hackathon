

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