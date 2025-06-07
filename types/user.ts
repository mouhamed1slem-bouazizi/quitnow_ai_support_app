export interface UserProfile {
  name: string;
  quitDate: string;
  cigarettesPerDay: number;
  cigarettePrice: number;
  currency: string;
  goals: Goal[];
  achievements: string[];
}

export interface Goal {
  id: string;
  title: string;
  targetDays: number;
  completed: boolean;
  createdAt: string;
}

export interface Progress {
  smokeFreeTime: {
    days: number;
    hours: number;
    minutes: number;
  };
  cigarettesAvoided: number;
  moneySaved: number;
}

export interface CravingRecord {
  id: string;
  timestamp: string;
  intensity: number;
  activityUsed: string;
}

export interface DiaryEntry {
  id: string;
  content: string;
  timestamp: string;
  mood: MoodType;
}

export type MoodType = 'happy' | 'sad' | 'angry' | 'anxious' | 'calm' | 'energetic' | 'tired' | 'neutral';

export interface MoodRecord {
  id: string;
  type: MoodType;
  timestamp: string;
}