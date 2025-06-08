export type MoodType = 'great' | 'good' | 'neutral' | 'bad' | 'awful';
export type ThemeType = 'light' | 'dark' | 'system';

export interface Profile {
  name: string;
  quitDate: string;
  cigarettesPerDay: number;
  cigarettePrice: number;
  currency: string;
  goals: string[];
  achievements: string[];
}

export interface DiaryEntry {
  id: string;
  timestamp: string;
  content: string;
  mood: MoodType;
}

export interface MoodRecord {
  id: string;
  timestamp: string;
  type: MoodType;
}