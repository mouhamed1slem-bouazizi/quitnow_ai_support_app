import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProfile, Goal, Progress, CravingRecord, DiaryEntry, MoodType, MoodRecord } from '@/types/user';

type ThemeType = 'light' | 'dark' | 'system';

interface UserState {
  profile: UserProfile | null;
  isOnboarded: boolean;
  lastMotivationDate: string | null;
  cravingsHandled: number;
  cravingRecords: CravingRecord[];
  gamesPlayed: number;
  theme: ThemeType;
  diaryEntries: DiaryEntry[];
  moodRecords: MoodRecord[];
  
  // Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'completed'>) => void;
  completeGoal: (goalId: string) => void;
  addAchievement: (achievementId: string) => void;
  setOnboarded: (value: boolean) => void;
  incrementCravingsHandled: () => void;
  recordCraving: (intensity: number, activityUsed: string) => void;
  incrementGamesPlayed: () => void;
  resetProgress: () => void;
  calculateProgress: () => Progress;
  setTheme: (theme: ThemeType) => void;
  
  // Diary and Mood Actions
  addDiaryEntry: (content: string, mood: MoodType) => void;
  removeDiaryEntry: (entryId: string) => void;
  recordMood: (type: MoodType) => void;
  getRecentMoods: (days: number) => MoodRecord[];
}

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  quitDate: new Date().toISOString(),
  cigarettesPerDay: 20,
  cigarettePrice: 10,
  currency: 'USD',
  goals: [],
  achievements: [],
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      isOnboarded: false,
      lastMotivationDate: null,
      cravingsHandled: 0,
      cravingRecords: [],
      gamesPlayed: 0,
      theme: 'light', // Default to light theme
      diaryEntries: [],
      moodRecords: [],
      
      setProfile: (profile) => set({ profile }),
      
      updateProfile: (updates) => set((state) => ({
        profile: state.profile ? { ...state.profile, ...updates } : DEFAULT_PROFILE
      })),
      
      addGoal: (goal) => set((state) => {
        if (!state.profile) return { profile: null };
        
        const newGoal: Goal = {
          id: Date.now().toString(),
          title: goal.title,
          targetDays: goal.targetDays,
          completed: false,
          createdAt: new Date().toISOString(),
        };
        
        return {
          profile: {
            ...state.profile,
            goals: [...state.profile.goals, newGoal]
          }
        };
      }),
      
      completeGoal: (goalId) => set((state) => {
        if (!state.profile) return { profile: null };
        
        const updatedGoals = state.profile.goals.map(goal => 
          goal.id === goalId ? { ...goal, completed: true } : goal
        );
        
        return {
          profile: {
            ...state.profile,
            goals: updatedGoals
          }
        };
      }),
      
      addAchievement: (achievementId) => set((state) => {
        if (!state.profile) return { profile: null };
        if (state.profile.achievements.includes(achievementId)) return { profile: state.profile };
        
        return {
          profile: {
            ...state.profile,
            achievements: [...state.profile.achievements, achievementId]
          }
        };
      }),
      
      setOnboarded: (value) => set({ isOnboarded: value }),
      
      incrementCravingsHandled: () => set((state) => ({
        cravingsHandled: state.cravingsHandled + 1
      })),
      
      recordCraving: (intensity, activityUsed) => set((state) => {
        const newCravingRecord: CravingRecord = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          intensity,
          activityUsed,
        };
        
        return {
          cravingRecords: [...state.cravingRecords, newCravingRecord]
        };
      }),
      
      incrementGamesPlayed: () => set((state) => ({
        gamesPlayed: state.gamesPlayed + 1
      })),
      
      resetProgress: () => set({
        profile: DEFAULT_PROFILE,
        isOnboarded: false,
        lastMotivationDate: null,
        cravingsHandled: 0,
        cravingRecords: [],
        gamesPlayed: 0,
        diaryEntries: [],
        moodRecords: [],
      }),
      
      setTheme: (theme) => set({ theme }),
      
      calculateProgress: () => {
        const { profile } = get();
        if (!profile) {
          return { smokeFreeTime: { days: 0, hours: 0, minutes: 0 }, cigarettesAvoided: 0, moneySaved: 0 };
        }
        
        const quitDate = new Date(profile.quitDate);
        const now = new Date();
        const diffMs = now.getTime() - quitDate.getTime();
        
        // Calculate smoke-free time
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const remainingMs = diffMs % (1000 * 60 * 60 * 24);
        const diffHours = Math.floor(remainingMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        
        // Calculate cigarettes avoided
        const totalHours = diffMs / (1000 * 60 * 60);
        const cigarettesPerHour = profile.cigarettesPerDay / 24;
        const cigarettesAvoided = Math.floor(totalHours * cigarettesPerHour);
        
        // Calculate money saved
        const cigarettePackSize = 20; // Standard pack size
        const pricePerCigarette = profile.cigarettePrice / cigarettePackSize;
        const moneySaved = cigarettesAvoided * pricePerCigarette;
        
        return {
          smokeFreeTime: {
            days: diffDays,
            hours: diffHours,
            minutes: diffMinutes,
          },
          cigarettesAvoided,
          moneySaved,
        };
      },
      
      // Diary and Mood Actions
      addDiaryEntry: (content, mood) => set((state) => {
        const newEntry: DiaryEntry = {
          id: Date.now().toString(),
          content,
          timestamp: new Date().toISOString(),
          mood,
        };
        
        // Also record this mood
        get().recordMood(mood);
        
        return {
          diaryEntries: [newEntry, ...state.diaryEntries]
        };
      }),
      
      removeDiaryEntry: (entryId) => set((state) => ({
        diaryEntries: state.diaryEntries.filter(entry => entry.id !== entryId)
      })),
      
      recordMood: (type) => set((state) => {
        const newMoodRecord: MoodRecord = {
          id: Date.now().toString(),
          type,
          timestamp: new Date().toISOString(),
        };
        
        return {
          moodRecords: [newMoodRecord, ...state.moodRecords]
        };
      }),
      
      getRecentMoods: (days) => {
        const { moodRecords } = get();
        const now = new Date();
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - days);
        
        // Filter mood records from the last 'days' days
        return moodRecords.filter(record => {
          const recordDate = new Date(record.timestamp);
          return recordDate >= startDate && recordDate <= now;
        });
      },
    }),
    {
      name: 'quit-smoking-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);