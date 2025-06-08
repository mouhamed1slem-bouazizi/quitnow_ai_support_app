export type MoodType = 'great' | 'good' | 'neutral' | 'bad' | 'awful';
export type ThemeType = 'light' | 'dark' | 'system';

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
  settings?: {
    theme: string;
    onboarded: boolean;
  };
}