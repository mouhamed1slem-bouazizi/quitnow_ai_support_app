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
  cravingsHandled: number;
  isLoading: boolean;
  error: string | null;
  
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
  incrementCravingsHandled: () => void;
  getRecentMoods: () => MoodRecord[];
  setError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

// Initial state to ensure diaryEntries is always an array
const initialState = {
  onboarded: false,
  profile: null,
  theme: 'system' as ThemeType,
  diaryEntries: [] as DiaryEntry[],
  cravingsHandled: 0,
  isLoading: false,
  error: null,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setOnboarded: (onboarded) => {
        set({ onboarded });
      },
      
      setProfile: (profile) => {
        set({ profile });
      },
      
      updateProfile: (updates) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        }));
      },
      
      resetProgress: () => {
        set((state) => ({
          profile: state.profile ? {
            ...state.profile,
            goals: [],
            achievements: [],
          } : null,
        }));
      },
      
      setTheme: (theme) => {
        set({ theme });
      },
      
      addAchievement: (achievementId) => {
        const state = get();
        if (!state.profile) {
          console.warn('Cannot add achievement: No profile');
          return;
        }
        
        // Check if achievement already exists
        if (state.profile.achievements.includes(achievementId)) {
          console.log('Achievement already exists:', achievementId);
          return;
        }
        
        // Add the achievement
        const updatedAchievements = [...state.profile.achievements, achievementId];
        
        // Update local state
        set(state => ({
          profile: state.profile ? {
            ...state.profile,
            achievements: updatedAchievements
          } : null
        }));
      },
      
      calculateProgress: () => {
        const { profile } = get();
        
        if (!profile || !profile.quitDate) {
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
        const cigarettesPerDay = profile.cigarettesPerDay || 20;
        const cigarettesPerSecond = cigarettesPerDay / (24 * 60 * 60);
        const cigarettesAvoided = Math.floor(totalSeconds * cigarettesPerSecond);
        
        // Calculate money saved
        // Price per cigarette = pack price / 20 (assuming 20 cigarettes per pack)
        const cigarettePrice = profile.cigarettePrice || 10;
        const pricePerCigarette = cigarettePrice / 20;
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
      
      addDiaryEntry: (content, mood) => {
        const newEntry: DiaryEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          content,
          mood
        };
        
        // Update local state
        set((state) => {
          // Ensure diaryEntries is always an array
          const currentEntries = state.diaryEntries || [];
          
          return {
            diaryEntries: [newEntry, ...currentEntries]
          };
        });
      },
      
      removeDiaryEntry: (id) => {
        // Update local state
        set((state) => ({
          // Ensure diaryEntries is always an array
          diaryEntries: (state.diaryEntries || []).filter(entry => entry.id !== id)
        }));
      },
      
      recordMood: (mood, note) => {
        // Implementation depends on how you want to store mood data
        // For now, we'll just add it as a diary entry if a note is provided
        if (note) {
          get().addDiaryEntry(note, mood);
        }
      },

      incrementCravingsHandled: () => {
        const newCount = get().cravingsHandled + 1;
        
        // Update local state
        set({ cravingsHandled: newCount });
      },

      getRecentMoods: () => {
        const { diaryEntries } = get();
        
        // Ensure diaryEntries is always an array
        if (!diaryEntries || diaryEntries.length === 0) {
          return [];
        }
        
        // Get entries from the last 7 days
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        
        // Filter entries by date and map to mood records
        const recentMoods: MoodRecord[] = diaryEntries
          .filter(entry => new Date(entry.timestamp) >= sevenDaysAgo)
          .map(entry => ({
            id: entry.id,
            timestamp: entry.timestamp,
            type: entry.mood
          }));
        
        return recentMoods;
      },
      
      setError: (error) => set({ error }),
      
      setIsLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Add version to handle migrations if needed
      version: 1,
      // Add migrate function to handle state migration
      migrate: (persistedState: any, version) => {
        // If we're at the current version, just return the state
        if (version === 1) {
          // Ensure diaryEntries is always an array
          return {
            ...persistedState,
            diaryEntries: Array.isArray(persistedState.diaryEntries) 
              ? persistedState.diaryEntries 
              : []
          } as UserState;
        }
        
        // Handle migration from older versions
        return {
          ...initialState,
          ...persistedState,
          diaryEntries: Array.isArray(persistedState?.diaryEntries) 
            ? persistedState.diaryEntries 
            : []
        } as UserState;
      }
    }
  )
);