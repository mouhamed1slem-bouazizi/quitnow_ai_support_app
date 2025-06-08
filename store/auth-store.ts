import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';
import { signIn as firebaseSignIn, signUp, signOut, resetPassword, getCurrentUser } from '@/services/firebase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  setUser: (user: User | null) => void;
  signIn: (email: string, password: string) => Promise<User | null>;
  signUp: (email: string, password: string, displayName: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

// Initial state
const initialState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setUser: (user) => {
        console.log('Setting user in auth store:', user ? user.email : 'null');
        set({ 
          user, 
          isAuthenticated: !!user,
          error: null
        });
      },
      
      signIn: async (email, password) => {
        console.log('Auth store: signIn called with email:', email);
        set({ isLoading: true, error: null });
        try {
          const user = await firebaseSignIn(email, password);
          console.log('Auth store: signIn successful, user:', user?.email);
          set({ user, isAuthenticated: true, isLoading: false });
          return user;
        } catch (error: any) {
          console.error('Auth store: signIn error:', error.message);
          set({ error: error.message, isLoading: false });
          return null;
        }
      },
      
      signUp: async (email, password, displayName) => {
        console.log('Auth store: signUp called with email:', email);
        set({ isLoading: true, error: null });
        try {
          const user = await signUp(email, password, displayName);
          console.log('Auth store: signUp successful, user:', user?.email);
          set({ user, isAuthenticated: true, isLoading: false });
          return user;
        } catch (error: any) {
          console.error('Auth store: signUp error:', error.message);
          set({ error: error.message, isLoading: false });
          return null;
        }
      },
      
      signOut: async () => {
        console.log('Auth store: signOut called');
        set({ isLoading: true, error: null });
        try {
          await signOut();
          console.log('Auth store: signOut successful');
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error: any) {
          console.error('Auth store: signOut error:', error.message);
          set({ error: error.message, isLoading: false });
        }
      },
      
      resetPassword: async (email) => {
        console.log('Auth store: resetPassword called with email:', email);
        set({ isLoading: true, error: null });
        try {
          await resetPassword(email);
          console.log('Auth store: resetPassword successful');
          set({ isLoading: false });
        } catch (error: any) {
          console.error('Auth store: resetPassword error:', error.message);
          set({ error: error.message, isLoading: false });
        }
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        // Only persist the user, not the loading state or errors
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      version: 1,
      onRehydrateStorage: () => (state) => {
        console.log('Auth store rehydrated:', state?.isAuthenticated ? 'authenticated' : 'not authenticated');
      },
      migrate: (persistedState: any, version) => {
        // If we're at the current version, just return the state
        if (version === 1) {
          return {
            ...initialState,
            ...persistedState,
            // Make sure isAuthenticated is consistent with user
            isAuthenticated: !!persistedState?.user
          } as AuthState;
        }
        
        // Handle migration from older versions
        return {
          ...initialState,
          ...persistedState,
          isAuthenticated: !!persistedState?.user
        } as AuthState;
      }
    }
  )
);