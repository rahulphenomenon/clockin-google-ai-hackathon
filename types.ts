import { LucideIcon } from 'lucide-react';

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  mockupType: 'resume' | 'interview' | 'mentorship' | 'upskill';
}

export type ViewState = 'landing' | 'dashboard';

export type DashboardTab = 'resume' | 'interview' | 'mentor' | 'upskill' | 'profile';