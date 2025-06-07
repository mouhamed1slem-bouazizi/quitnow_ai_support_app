import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile, ThemeType } from '@/types/user';

interface UserState {
  onboarded: boolean;
  profile: Profile | null;
  theme: ThemeType;
  setOnboarded: (onboarded: boolean) => void;
  setProfile: (profile: Profile) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  resetProgress: () => void;
  setTheme: (theme: ThemeType) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);