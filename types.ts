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

export interface UserProfile {
  name: string;
  targetRoles: string[];
  startDate: string;
}

export interface UserContextType {
  user: UserProfile | null;
  updateUser: (data: Partial<UserProfile>) => void;
  clearUser: () => void;
  isAuthenticated: boolean;
}