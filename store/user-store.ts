import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile, ThemeType, DiaryEntry, MoodType, MoodRecord } from '@/types/user';
import { 
  saveUserProfile, 
  getUserProfile, 
  updateUserProfile, 
  saveDiaryEntry, 
  getDiaryEntries, 
  deleteDiaryEntry,
  saveUserSettings,
  updateCravingsHandled
} from '@/services/firebase';
import { getCurrentUser } from '@/services/firebase';

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
  isSyncing: boolean;
  lastSynced: string | null;
  
  setOnboarded: (onboarded: boolean) => void;
  setProfile: (profile: Profile) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  resetProgress: () => Promise<void>;
  setTheme: (theme: ThemeType) => void;
  calculateProgress: () => ProgressMetrics;
  addAchievement: (achievementId: string) => Promise<void>;
  addDiaryEntry: (content: string, mood: MoodType) => Promise<void>;
  removeDiaryEntry: (id: string) => Promise<void>;
  recordMood: (mood: MoodType, note?: string) => Promise<void>;
  incrementCravingsHandled: () => Promise<void>;
  getRecentMoods: () => MoodRecord[];
  
  // Firestore sync functions
  syncWithFirestore: () => Promise<void>;
  loadFromFirestore: () => Promise<void>;
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
  isSyncing: false,
  lastSynced: null,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setOnboarded: (onboarded) => {
        set({ onboarded });
        
        // Save to Firestore if user is authenticated
        const user = getCurrentUser();
        if (user) {
          saveUserSettings(user.uid, { 
            onboarded, 
            theme: get().theme 
          }).catch(error => {
            console.error('Failed to save onboarded status to Firestore:', error);
            set(state => ({ error: `Failed to save onboarded status: ${error.message}` }));
          });
        }
      },
      
      setProfile: async (profile) => {
        set({ profile });
        
        // Save to Firestore if user is authenticated
        const user = getCurrentUser();
        if (user && profile) {
          try {
            console.log('Saving profile to Firestore:', JSON.stringify(profile));
            await saveUserProfile(user.uid, profile);
            console.log('Profile saved to Firestore successfully');
          } catch (error: any) {
            console.error('Failed to save profile to Firestore:', error);
            set(state => ({ error: `Failed to save profile: ${error.message}` }));
            throw error; // Re-throw to allow handling in the calling function
          }
        } else {
          console.warn('Cannot save profile: No authenticated user or profile is null');
        }
      },
      
      updateProfile: async (updates) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        }));
        
        // Save to Firestore if user is authenticated
        const user = getCurrentUser();
        if (user && updates) {
          try {
            console.log('Updating profile in Firestore:', JSON.stringify(updates));
            await updateUserProfile(user.uid, updates);
            console.log('Profile updated in Firestore successfully');
          } catch (error: any) {
            console.error('Failed to update profile in Firestore:', error);
            set(state => ({ error: `Failed to update profile: ${error.message}` }));
            throw error; // Re-throw to allow handling in the calling function
          }
        } else {
          console.warn('Cannot update profile: No authenticated user or updates is empty');
        }
      },
      
      resetProgress: async () => {
        set((state) => ({
          profile: state.profile ? {
            ...state.profile,
            goals: [],
            achievements: [],
          } : null,
        }));
        
        // Update in Firestore if user is authenticated
        const user = getCurrentUser();
        if (user) {
          try {
            await updateUserProfile(user.uid, { 
              goals: [], 
              achievements: [] 
            });
            console.log('Progress reset in Firestore successfully');
          } catch (error: any) {
            console.error('Failed to reset progress in Firestore:', error);
            set(state => ({ error: `Failed to reset progress: ${error.message}` }));
            throw error;
          }
        } else {
          console.warn('Cannot reset progress: No authenticated user');
        }
      },
      
      setTheme: (theme) => {
        set({ theme });
        
        // Save to Firestore if user is authenticated
        const user = getCurrentUser();
        if (user) {
          saveUserSettings(user.uid, { 
            theme, 
            onboarded: get().onboarded 
          }).catch(error => {
            console.error('Failed to save theme to Firestore:', error);
            set(state => ({ error: `Failed to save theme: ${error.message}` }));
          });
        }
      },
      
      addAchievement: async (achievementId) => {
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
        
        // Save to Firestore if user is authenticated
        const user = getCurrentUser();
        if (user) {
          try {
            await updateUserProfile(user.uid, { 
              achievements: updatedAchievements 
            });
            console.log('Achievement added to Firestore successfully:', achievementId);
          } catch (error: any) {
            console.error('Failed to add achievement to Firestore:', error);
            set(state => ({ error: `Failed to add achievement: ${error.message}` }));
            throw error;
          }
        } else {
          console.warn('Cannot add achievement: No authenticated user');
        }
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
      
      addDiaryEntry: async (content, mood) => {
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
        
        // Save to Firestore if user is authenticated
        const user = getCurrentUser();
        if (user) {
          try {
            const id = await saveDiaryEntry(user.uid, newEntry);
            console.log('Diary entry saved to Firestore successfully with ID:', id);
            
            // Update the entry ID if Firestore generated a different one
            if (id !== newEntry.id) {
              set((state) => ({
                diaryEntries: state.diaryEntries.map(entry => 
                  entry.id === newEntry.id ? { ...entry, id } : entry
                )
              }));
            }
          } catch (error: any) {
            console.error('Failed to save diary entry to Firestore:', error);
            set(state => ({ error: `Failed to save diary entry: ${error.message}` }));
            throw error;
          }
        } else {
          console.warn('Cannot save diary entry: No authenticated user');
        }
      },
      
      removeDiaryEntry: async (id) => {
        // Update local state
        set((state) => ({
          // Ensure diaryEntries is always an array
          diaryEntries: (state.diaryEntries || []).filter(entry => entry.id !== id)
        }));
        
        // Delete from Firestore if user is authenticated
        const user = getCurrentUser();
        if (user) {
          try {
            await deleteDiaryEntry(user.uid, id);
            console.log('Diary entry deleted from Firestore successfully:', id);
          } catch (error: any) {
            console.error('Failed to delete diary entry from Firestore:', error);
            set(state => ({ error: `Failed to delete diary entry: ${error.message}` }));
            throw error;
          }
        } else {
          console.warn('Cannot delete diary entry: No authenticated user');
        }
      },
      
      recordMood: async (mood, note) => {
        // Implementation depends on how you want to store mood data
        // For now, we'll just add it as a diary entry if a note is provided
        if (note) {
          await get().addDiaryEntry(note, mood);
        }
      },

      incrementCravingsHandled: async () => {
        const newCount = get().cravingsHandled + 1;
        
        // Update local state
        set({ cravingsHandled: newCount });
        
        // Update in Firestore if user is authenticated
        const user = getCurrentUser();
        if (user) {
          try {
            await updateCravingsHandled(user.uid, newCount);
            console.log('Cravings handled count updated in Firestore successfully:', newCount);
          } catch (error: any) {
            console.error('Failed to update cravings handled in Firestore:', error);
            set(state => ({ error: `Failed to update cravings handled: ${error.message}` }));
            throw error;
          }
        } else {
          console.warn('Cannot update cravings handled: No authenticated user');
        }
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
      
      // Firestore sync functions
      syncWithFirestore: async () => {
        const user = getCurrentUser();
        if (!user) {
          console.log('Cannot sync with Firestore: No authenticated user');
          return;
        }
        
        set({ isSyncing: true, error: null });
        
        try {
          const state = get();
          
          // Save profile if it exists
          if (state.profile) {
            console.log('Syncing profile to Firestore:', JSON.stringify(state.profile));
            await saveUserProfile(user.uid, state.profile);
          } else {
            console.warn('No profile to sync to Firestore');
          }
          
          // Save settings
          console.log('Syncing settings to Firestore:', { theme: state.theme, onboarded: state.onboarded });
          await saveUserSettings(user.uid, {
            theme: state.theme,
            onboarded: state.onboarded
          });
          
          // Save cravings handled
          console.log('Syncing cravings handled to Firestore:', state.cravingsHandled);
          await updateCravingsHandled(user.uid, state.cravingsHandled);
          
          // Save diary entries
          if (state.diaryEntries && state.diaryEntries.length > 0) {
            console.log(`Syncing ${state.diaryEntries.length} diary entries to Firestore`);
            for (const entry of state.diaryEntries) {
              await saveDiaryEntry(user.uid, entry);
            }
          } else {
            console.log('No diary entries to sync to Firestore');
          }
          
          set({ 
            isSyncing: false, 
            lastSynced: new Date().toISOString(),
            error: null
          });
          
          console.log('Successfully synced with Firestore');
        } catch (error: any) {
          console.error('Failed to sync with Firestore:', error);
          set({ 
            isSyncing: false, 
            error: `Failed to sync with Firestore: ${error.message}` 
          });
          throw error;
        }
      },
      
      loadFromFirestore: async () => {
        const user = getCurrentUser();
        if (!user) {
          console.log('Cannot load from Firestore: No authenticated user');
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          // Load user profile
          console.log('Loading user profile from Firestore');
          const profile = await getUserProfile(user.uid);
          
          // Load diary entries
          console.log('Loading diary entries from Firestore');
          const diaryEntries = await getDiaryEntries(user.uid);
          
          // Update state with loaded data
          set((state) => {
            console.log('Updating state with loaded data:', { 
              profileLoaded: !!profile, 
              entriesLoaded: diaryEntries.length 
            });
            
            return {
              profile: profile || state.profile,
              diaryEntries: diaryEntries.length > 0 ? diaryEntries : state.diaryEntries,
              cravingsHandled: profile?.cravingsHandled || state.cravingsHandled,
              isLoading: false,
              lastSynced: new Date().toISOString(),
              error: null
            };
          });
          
          console.log('Successfully loaded data from Firestore');
        } catch (error: any) {
          console.error('Failed to load from Firestore:', error);
          set({ 
            isLoading: false, 
            error: `Failed to load from Firestore: ${error.message}` 
          });
          throw error;
        }
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