import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile, ThemeType } from '@/types/user';

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
  setOnboarded: (onboarded: boolean) => void;
  setProfile: (profile: Profile) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  resetProgress: () => void;
  setTheme: (theme: ThemeType) => void;
  calculateProgress: () => ProgressMetrics;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      profile: null,
      theme: 'system' as ThemeType,
      
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
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);