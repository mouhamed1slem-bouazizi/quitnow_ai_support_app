import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile, ThemeType, DiaryEntry, MoodType, MoodRecord } from '@/types/user';

interface ProgressMetrics {
  smokeFreeTime: {
    days: number;
    hours: number;
    minutes: number;
    totalSeconds: number;
  };
  cigarettesAvoided: number;
  moneySaved: number;
}

interface UserState {
  onboarded: boolean;
  profile: Profile | null;
  theme: ThemeType;
  diaryEntries: DiaryEntry[];
  setOnboarded: (onboarded: boolean) => void;
  setProfile: (profile: Profile) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  resetProgress: () => void;
  setTheme: (theme: ThemeType) => void;
  calculateProgress: () => ProgressMetrics;
  addAchievement: (achievementId: string) => void;
  addDiaryEntry: (content: string, mood: MoodType) => void;
  removeDiaryEntry: (id: string) => void;
  recordMood: (mood: MoodType, note?: string) => void;
  getRecentMoods: (days: number) => MoodRecord[];
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      profile: null,
      theme: 'system' as ThemeType,
      diaryEntries: [],
      
      setOnboarded: (onboarded) => set({ onboarded }),
      
      setProfile: (profile) => set({ profile }),
      
      updateProfile: (updates) => set((state) => ({
        profile: state.profile ? { ...state.profile, ...updates } : null,
      })),
      
      resetProgress: () => set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          goals: [],
          achievements: [],
        } : null,
      })),
      
      setTheme: (theme) => set({ theme }),
      
      addAchievement: (achievementId) => set((state) => {
        if (!state.profile) return { ...state };
        
        // Check if achievement already exists
        if (state.profile.achievements.includes(achievementId)) {
          return { ...state };
        }
        
        // Add the achievement
        return {
          profile: {
            ...state.profile,
            achievements: [...state.profile.achievements, achievementId]
          }
        };
      }),
      
      calculateProgress: () => {
        const { profile } = get();
        
        if (!profile) {
          return {
            smokeFreeTime: { days: 0, hours: 0, minutes: 0, totalSeconds: 0 },
            cigarettesAvoided: 0,
            moneySaved: 0
          };
        }
        
        // Calculate time since quit date
        const quitDate = new Date(profile.quitDate);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - quitDate.getTime()) / 1000);
        
        // Ensure we don't show negative time if quit date is in the future
        const totalSeconds = Math.max(0, diffInSeconds);
        
        // Calculate days, hours, minutes
        const days = Math.floor(totalSeconds / (24 * 60 * 60));
        const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
        
        // Calculate cigarettes avoided
        // Assuming cigarettes per day are evenly distributed throughout the day
        const cigarettesPerSecond = profile.cigarettesPerDay / (24 * 60 * 60);
        const cigarettesAvoided = Math.floor(totalSeconds * cigarettesPerSecond);
        
        // Calculate money saved
        // Price per cigarette = pack price / 20 (assuming 20 cigarettes per pack)
        const pricePerCigarette = profile.cigarettePrice / 20;
        const moneySaved = cigarettesAvoided * pricePerCigarette;
        
        return {
          smokeFreeTime: {
            days,
            hours,
            minutes,
            totalSeconds
          },
          cigarettesAvoided,
          moneySaved
        };
      },
      
      addDiaryEntry: (content, mood) => set((state) => {
        const newEntry: DiaryEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          content,
          mood
        };
        
        return {
          diaryEntries: [newEntry, ...state.diaryEntries]
        };
      }),
      
      removeDiaryEntry: (id) => set((state) => ({
        diaryEntries: state.diaryEntries.filter(entry => entry.id !== id)
      })),
      
      recordMood: (mood, note) => set((state) => {
        // Implementation depends on how you want to store mood data
        // For now, we'll just add it as a diary entry if a note is provided
        if (note) {
          const newEntry: DiaryEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            content: note,
            mood
          };
          
          return {
            diaryEntries: [newEntry, ...state.diaryEntries]
          };
        }
        
        return state;
      }),
      
      getRecentMoods: (days) => {
        const { diaryEntries } = get();
        const now = new Date();
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - days);
        
        // Convert diary entries to mood records
        const moodRecords: MoodRecord[] = diaryEntries
          .filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= startDate && entryDate <= now;
          })
          .map(entry => ({
            id: entry.id,
            timestamp: entry.timestamp,
            type: entry.mood,
            note: entry.content
          }));
        
        // Sort by timestamp, newest first
        return moodRecords.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);