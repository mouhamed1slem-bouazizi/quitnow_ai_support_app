export type ThemeType = 'light' | 'dark' | 'system';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface Profile {
  name: string;
  quitDate: string;
  cigarettesPerDay: number;
  cigarettePrice: number;
  currency: string;
  goals: Goal[];
  achievements: string[]; // Changed from Achievement[] to string[] to store achievement IDs
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: string;
  note?: string;
}

export interface CravingEntry {
  id: string;
  date: string;
  intensity: number;
  trigger?: string;
  duration?: number;
  note?: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  content: string;
  mood?: string;
  tags?: string[];
}

export interface HealthMetric {
  id: string;
  name: string;
  description: string;
  timeToRecover: number; // in hours
  icon: string;
}

export interface GameScore {
  gameId: string;
  highScore: number;
  lastPlayed: string;
}

export interface UserStats {
  cigarettesNotSmoked: number;
  moneySaved: number;
  timeSmokeFree: number; // in seconds
  cravingsOvercome: number;
  healthMetricsRecovered: string[]; // ids of recovered health metrics
  gameScores: GameScore[];
}