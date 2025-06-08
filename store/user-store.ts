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
          });
        }
      },
      
      setProfile: (profile) => {
        set({ profile });
        
        // Save to Firestore if user is authenticated
        const user = getCurrentUser();
        if (user && profile) {
          saveUserProfile(user.uid, profile).catch(error => {
            console.error('Failed to save profile to Firestore:', error);
          });
        }
      },
      
      updateProfile: (updates) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        }));
        
        // Save to Firestore if user is authenticated
        const user = getCurrentUser();
        if (user && updates) {
          updateUserProfile(user.uid, updates).catch(error => {
            console.error('Failed to update profile in Firestore:', error);
          });
        }
      },
      
      resetProgress: () => {
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
          updateUserProfile(user.uid, { 
            goals: [], 
            achievements: [] 
          }).catch(error => {
            console.error('Failed to reset progress in Firestore:', error);
          });
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
          });
        }
      },
      
      addAchievement: (achievementId) => {
        set((state) => {
          if (!state.profile) return state;
          
          // Check if achievement already exists
          if (state.profile.achievements.includes(achievementId)) {
            return state;
          }
          
          // Add the achievement
          const updatedAchievements = [...state.profile.achievements, achievementId];
          
          // Save to Firestore if user is authenticated
          const user = getCurrentUser();
          if (user) {
            updateUserProfile(user.uid, { 
              achievements: updatedAchievements 
            }).catch(error => {
              console.error('Failed to add achievement to Firestore:', error);
            });
          }
          
          return {
            profile: {
              ...state.profile,
              achievements: updatedAchievements
            }
          };
        });
      },
      
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
        
        // Save to Firestore if user is authenticated
        const user = getCurrentUser();
        if (user) {
          saveDiaryEntry(user.uid, newEntry)
            .then(id => {
              // Update the entry ID if Firestore generated a different one
              if (id !== newEntry.id) {
                set((state) => ({
                  diaryEntries: state.diaryEntries.map(entry => 
                    entry.id === newEntry.id ? { ...entry, id } : entry
                  )
                }));
              }
            })
            .catch(error => {
              console.error('Failed to save diary entry to Firestore:', error);
            });
        }
      },
      
      removeDiaryEntry: (id) => {
        // Update local state
        set((state) => ({
          // Ensure diaryEntries is always an array
          diaryEntries: (state.diaryEntries || []).filter(entry => entry.id !== id)
        }));
        
        // Delete from Firestore if user is authenticated
        const user = getCurrentUser();
        if (user) {
          deleteDiaryEntry(user.uid, id).catch(error => {
            console.error('Failed to delete diary entry from Firestore:', error);
          });
        }
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
        
        // Update in Firestore if user is authenticated
        const user = getCurrentUser();
        if (user) {
          updateCravingsHandled(user.uid, newCount).catch(error => {
            console.error('Failed to update cravings handled in Firestore:', error);
          });
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
        
        set({ isSyncing: true });
        
        try {
          const state = get();
          
          // Save profile if it exists
          if (state.profile) {
            await saveUserProfile(user.uid, state.profile);
          }
          
          // Save settings
          await saveUserSettings(user.uid, {
            theme: state.theme,
            onboarded: state.onboarded
          });
          
          // Save cravings handled
          await updateCravingsHandled(user.uid, state.cravingsHandled);
          
          // Save diary entries
          if (state.diaryEntries && state.diaryEntries.length > 0) {
            for (const entry of state.diaryEntries) {
              await saveDiaryEntry(user.uid, entry);
            }
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
        }
      },
      
      loadFromFirestore: async () => {
        const user = getCurrentUser();
        if (!user) {
          console.log('Cannot load from Firestore: No authenticated user');
          return;
        }
        
        set({ isLoading: true });
        
        try {
          // Load user profile
          const profile = await getUserProfile(user.uid);
          
          // Load diary entries
          const diaryEntries = await getDiaryEntries(user.uid);
          
          // Update state with loaded data
          set((state) => ({
            profile: profile || state.profile,
            diaryEntries: diaryEntries.length > 0 ? diaryEntries : state.diaryEntries,
            isLoading: false,
            lastSynced: new Date().toISOString(),
            error: null
          }));
          
          console.log('Successfully loaded data from Firestore');
        } catch (error: any) {
          console.error('Failed to load from Firestore:', error);
          set({ 
            isLoading: false, 
            error: `Failed to load from Firestore: ${error.message}` 
          });
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