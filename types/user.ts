export type ThemeType = 'light' | 'dark' | 'system';

export type MoodType = 'great' | 'good' | 'neutral' | 'bad' | 'awful';

export interface MoodOption {
  value: MoodType;
  label: string;
  emoji: string;
  color: string;
}

export interface MoodRecord {
  id: string;
  timestamp: string;
  type: MoodType;
  note?: string;
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
  category: string;
  createdAt: string;
  completedAt?: string;
  targetDate?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface Profile {
  name: string;
  quitDate: string;
  cigarettesPerDay: number;
  cigarettePrice: number;
  currency: string;
  goals: Goal[];
  achievements: string[];
}