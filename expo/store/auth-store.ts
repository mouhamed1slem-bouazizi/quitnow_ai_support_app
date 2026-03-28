import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simplified auth store that always returns authenticated=true
// This allows the app to work without Firebase authentication

interface AuthState {
  isAuthenticated: boolean;
}

// Initial state - always authenticated
const initialState = {
  isAuthenticated: true,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);