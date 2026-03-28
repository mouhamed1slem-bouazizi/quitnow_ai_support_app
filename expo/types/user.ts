export type ThemeType = 'light' | 'dark' | 'system';

export type MoodType = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

export interface MoodRecord {
  id: string;
  timestamp: string;
  type: MoodType;
}

export interface DiaryEntry {
  id: string;
  timestamp: string;
  content: string;
  mood: MoodType;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  category?: string;
}

export interface Profile {
  name: string;
  quitDate?: string;
  cigarettesPerDay?: number;
  cigarettePrice?: number;
  currency?: string;
  goals: string[];
  achievements: string[];
  createdAt: string;
  updatedAt: string;
  cravingsHandled: number;
}