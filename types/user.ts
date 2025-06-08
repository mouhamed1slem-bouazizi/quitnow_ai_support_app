export type ThemeType = 'light' | 'dark' | 'system';

export type MoodType = 'great' | 'good' | 'okay' | 'bad' | 'awful';

export interface Profile {
  name: string;
  quitDate: string; // ISO string
  cigarettesPerDay: number;
  cigarettePrice: number;
  currency: string;
  goals: string[]; // Array of goal IDs
  achievements: string[]; // Array of achievement IDs
}

export interface DiaryEntry {
  id: string;
  timestamp: string; // ISO string
  content: string;
  mood: MoodType;
}

export interface MoodRecord {
  id: string;
  timestamp: string; // ISO string
  type: MoodType;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: string;
  createdAt: string; // ISO string
  completedAt?: string; // ISO string, optional
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string; // ISO string, optional
}

export interface CravingRecord {
  id: string;
  timestamp: string; // ISO string
  intensity: number; // 1-5
  trigger?: string;
  handledWith?: string;
  duration?: number; // in seconds
}

export interface HealthMilestone {
  id: string;
  title: string;
  description: string;
  timeRequired: number; // in seconds
  reached: boolean;
  reachedAt?: string; // ISO string, optional
}