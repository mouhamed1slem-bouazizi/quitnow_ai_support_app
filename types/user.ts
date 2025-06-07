// Define the theme type
export type ThemeType = 'light' | 'dark' | 'system';

// Define the mood types
export type MoodType = 'happy' | 'sad' | 'angry' | 'anxious' | 'calm' | 'energetic' | 'tired' | 'neutral';

// Define the profile type
export interface Profile {
  name: string;
  quitDate: string; // ISO string
  cigarettesPerDay: number;
  cigarettePrice: number;
  goals: string[];
  achievements: string[];
}

// Define the diary entry type
export interface DiaryEntry {
  id: string;
  timestamp: string; // ISO string
  content: string;
  mood: MoodType;
}

// Define the mood record type
export interface MoodRecord {
  id: string;
  timestamp: string; // ISO string
  type: MoodType;
}

// Define the goal type
export interface Goal {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: string;
  createdAt: string; // ISO string
  completedAt?: string; // ISO string
}

// Define the achievement type
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string; // ISO string
}

// Define the health milestone type
export interface HealthMilestone {
  id: string;
  title: string;
  description: string;
  timeframe: number; // in hours
  icon: string;
}

// Define the activity type
export interface Activity {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  intensity: 'low' | 'medium' | 'high';
  category: 'physical' | 'mental' | 'social' | 'creative' | 'relaxation';
}

// Define the craving type
export interface Craving {
  id: string;
  timestamp: string; // ISO string
  intensity: number; // 1-10
  trigger?: string;
  handledWith?: string;
  duration?: number; // in minutes
}

// Define the medical fact type
export interface MedicalFact {
  id: string;
  title: string;
  description: string;
  source: string;
  category: 'short-term' | 'long-term' | 'general';
}