export type ThemeType = 'light' | 'dark' | 'system';
export type MoodType = 'great' | 'good' | 'neutral' | 'bad' | 'awful';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface DiaryEntry {
  id: string;
  timestamp: string;
  content: string;
  mood: MoodType;
}

export interface Profile {
  name: string;
  quitDate: string;
  cigarettesPerDay: number;
  cigarettePrice: number;
  currency: string;
  goals: Goal[];
  achievements: string[]; // IDs of achievements
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