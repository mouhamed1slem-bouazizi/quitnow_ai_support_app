// This is a simplified version of the firebase service
// that doesn't require authentication

import { DiaryEntry, MoodType, Profile } from '@/types/user';

// Mock functions to replace Firebase functionality
// These functions just log actions and return success

export const saveUserProfile = async (userId: string, profileData: Profile): Promise<void> => {
  console.log('Mock saveUserProfile called with data:', JSON.stringify(profileData));
  // No actual Firebase operations
  return Promise.resolve();
};

export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  console.log('Mock getUserProfile called');
  // No actual Firebase operations
  return Promise.resolve(null);
};

export const updateUserProfile = async (userId: string, updates: Partial<Profile>): Promise<void> => {
  console.log('Mock updateUserProfile called with updates:', JSON.stringify(updates));
  // No actual Firebase operations
  return Promise.resolve();
};

export const saveUserSettings = async (userId: string, settings: { theme: string, onboarded: boolean }): Promise<void> => {
  console.log('Mock saveUserSettings called with settings:', JSON.stringify(settings));
  // No actual Firebase operations
  return Promise.resolve();
};

export const saveDiaryEntry = async (userId: string, entry: DiaryEntry): Promise<string> => {
  console.log('Mock saveDiaryEntry called with entry:', JSON.stringify(entry));
  // No actual Firebase operations
  return Promise.resolve(entry.id);
};

export const getDiaryEntries = async (userId: string): Promise<DiaryEntry[]> => {
  console.log('Mock getDiaryEntries called');
  // No actual Firebase operations
  return Promise.resolve([]);
};

export const deleteDiaryEntry = async (userId: string, entryId: string): Promise<void> => {
  console.log('Mock deleteDiaryEntry called for entry:', entryId);
  // No actual Firebase operations
  return Promise.resolve();
};

export const updateCravingsHandled = async (userId: string, count: number): Promise<void> => {
  console.log('Mock updateCravingsHandled called with count:', count);
  // No actual Firebase operations
  return Promise.resolve();
};

// Mock function to get current user - always returns a dummy user ID
export const getCurrentUser = () => {
  return { uid: 'local-user' };
};

// Mock auth object
export const auth = {
  currentUser: { uid: 'local-user' }
};

// Mock db object
export const db = {};