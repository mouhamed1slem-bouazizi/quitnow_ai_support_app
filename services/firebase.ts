import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  Firestore,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { DiaryEntry, MoodType, Profile } from '@/types/user';

// Firebase configuration
// IMPORTANT: In production, these should come from environment variables
const firebaseConfig = {
  apiKey: "AIzaSyB_t9_0fUlS9AbIEuIyoJB-nhIEUTviu8Y",
  authDomain: "app-d7397.firebaseapp.com",
  databaseURL: "https://app-d7397-default-rtdb.firebaseio.com",
  projectId: "app-d7397",
  storageBucket: "app-d7397.firebasestorage.app",
  messagingSenderId: "538283025810",
  appId: "1:538283025810:web:7dc45efc541c332e2a8d4b",
  measurementId: "G-20JJF8G8CD"
};

// Initialize Firebase
let app;
let auth: Auth;
let db: Firestore;

try {
  console.log('Initializing Firebase with config:', Object.keys(firebaseConfig));
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Auth functions
export const signUp = async (email: string, password: string, displayName: string) => {
  console.log('Firebase service: signUp called with email:', email);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Update the user's profile with the display name
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      console.log('Firebase service: signUp successful, user:', userCredential.user.email);
      
      // Create an empty profile document for the user
      const emptyProfile: Partial<Profile> = {
        name: displayName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        goals: [],
        achievements: [],
        cravingsHandled: 0
      };
      
      // Save the empty profile to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), emptyProfile);
      console.log('Firebase service: Created empty profile document for new user');
    }
    return userCredential.user;
  } catch (error: any) {
    console.error('Firebase service: signUp error:', error.code, error.message);
    throw new Error(error.message);
  }
};

export const signIn = async (email: string, password: string) => {
  console.log('Firebase service: signIn called with email:', email);
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Firebase service: signIn successful, user:', userCredential.user.email);
    return userCredential.user;
  } catch (error: any) {
    console.error('Firebase service: signIn error:', error.code, error.message);
    throw new Error(error.message);
  }
};

export const signOut = async () => {
  console.log('Firebase service: signOut called');
  try {
    await firebaseSignOut(auth);
    console.log('Firebase service: signOut successful');
  } catch (error: any) {
    console.error('Firebase service: signOut error:', error.code, error.message);
    throw new Error(error.message);
  }
};

export const resetPassword = async (email: string) => {
  console.log('Firebase service: resetPassword called with email:', email);
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('Firebase service: resetPassword successful');
  } catch (error: any) {
    console.error('Firebase service: resetPassword error:', error.code, error.message);
    throw new Error(error.message);
  }
};

export const getCurrentUser = (): User | null => {
  const currentUser = auth.currentUser;
  console.log('Firebase service: getCurrentUser called, user:', currentUser?.email || 'null');
  return currentUser;
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  console.log('Firebase service: subscribeToAuthChanges called');
  return onAuthStateChanged(auth, (user) => {
    console.log('Firebase service: auth state changed, user:', user?.email || 'null');
    callback(user);
  });
};

// Firestore functions for user data
export const saveUserProfile = async (userId: string, profileData: Profile): Promise<void> => {
  try {
    console.log('Firebase service: saveUserProfile called for user:', userId, 'with data:', JSON.stringify(profileData));
    const userRef = doc(db, 'users', userId);
    
    // Ensure all required fields are present
    const firestoreData = {
      ...profileData,
      updatedAt: new Date().toISOString(),
      // Add default values for any missing fields
      goals: profileData.goals || [],
      achievements: profileData.achievements || [],
      cravingsHandled: profileData.cravingsHandled || 0
    };
    
    await setDoc(userRef, firestoreData);
    console.log('Firebase service: saveUserProfile successful');
  } catch (error: any) {
    console.error('Firebase service: saveUserProfile error:', error);
    throw new Error(`Failed to save user profile: ${error.message}`);
  }
};

export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log('Firebase service: getUserProfile called for user:', userId);
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as Profile;
      console.log('Firebase service: getUserProfile successful, data:', JSON.stringify(userData));
      return userData;
    } else {
      console.log('Firebase service: getUserProfile - no profile found');
      return null;
    }
  } catch (error: any) {
    console.error('Firebase service: getUserProfile error:', error);
    throw new Error(`Failed to get user profile: ${error.message}`);
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<Profile>): Promise<void> => {
  try {
    console.log('Firebase service: updateUserProfile called for user:', userId, 'with updates:', JSON.stringify(updates));
    const userRef = doc(db, 'users', userId);
    
    // Add updatedAt timestamp
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(userRef, updatedData);
    console.log('Firebase service: updateUserProfile successful');
  } catch (error: any) {
    console.error('Firebase service: updateUserProfile error:', error);
    throw new Error(`Failed to update user profile: ${error.message}`);
  }
};

export const saveUserSettings = async (userId: string, settings: { theme: string, onboarded: boolean }): Promise<void> => {
  try {
    console.log('Firebase service: saveUserSettings called for user:', userId, 'with settings:', JSON.stringify(settings));
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      settings,
      updatedAt: new Date().toISOString()
    });
    console.log('Firebase service: saveUserSettings successful');
  } catch (error: any) {
    console.error('Firebase service: saveUserSettings error:', error);
    throw new Error(`Failed to save user settings: ${error.message}`);
  }
};

// Diary entries functions - UPDATED to use 'journalEntries' collection to match Firestore rules
export const saveDiaryEntry = async (userId: string, entry: DiaryEntry): Promise<string> => {
  try {
    console.log('Firebase service: saveDiaryEntry called for user:', userId, 'with entry:', JSON.stringify(entry));
    // Changed from 'diaryEntries' to 'journalEntries' to match Firestore rules
    const entriesRef = collection(db, 'users', userId, 'journalEntries');
    
    // Convert entry to Firestore format
    const firestoreEntry = {
      content: entry.content,
      mood: entry.mood,
      timestamp: entry.timestamp, // Keep as ISO string for compatibility
      createdAt: new Date().toISOString()
    };
    
    // If entry has an ID, use it as the document ID
    if (entry.id) {
      const entryRef = doc(entriesRef, entry.id);
      await setDoc(entryRef, firestoreEntry);
      console.log('Firebase service: saveDiaryEntry successful with ID:', entry.id);
      return entry.id;
    } else {
      // Otherwise, let Firestore generate an ID
      const docRef = await addDoc(entriesRef, firestoreEntry);
      console.log('Firebase service: saveDiaryEntry successful with new ID:', docRef.id);
      return docRef.id;
    }
  } catch (error: any) {
    console.error('Firebase service: saveDiaryEntry error:', error);
    throw new Error(`Failed to save diary entry: ${error.message}`);
  }
};

export const getDiaryEntries = async (userId: string): Promise<DiaryEntry[]> => {
  try {
    console.log('Firebase service: getDiaryEntries called for user:', userId);
    // Changed from 'diaryEntries' to 'journalEntries' to match Firestore rules
    const entriesRef = collection(db, 'users', userId, 'journalEntries');
    const q = query(entriesRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const entries: DiaryEntry[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({
        id: doc.id,
        content: data.content,
        mood: data.mood as MoodType,
        timestamp: data.timestamp
      });
    });
    
    console.log(`Firebase service: getDiaryEntries successful, found ${entries.length} entries`);
    return entries;
  } catch (error: any) {
    console.error('Firebase service: getDiaryEntries error:', error);
    throw new Error(`Failed to get diary entries: ${error.message}`);
  }
};

export const deleteDiaryEntry = async (userId: string, entryId: string): Promise<void> => {
  try {
    console.log('Firebase service: deleteDiaryEntry called for user:', userId, 'entry:', entryId);
    // Changed from 'diaryEntries' to 'journalEntries' to match Firestore rules
    const entryRef = doc(db, 'users', userId, 'journalEntries', entryId);
    await deleteDoc(entryRef);
    console.log('Firebase service: deleteDiaryEntry successful');
  } catch (error: any) {
    console.error('Firebase service: deleteDiaryEntry error:', error);
    throw new Error(`Failed to delete diary entry: ${error.message}`);
  }
};

// Cravings counter
export const updateCravingsHandled = async (userId: string, count: number): Promise<void> => {
  try {
    console.log('Firebase service: updateCravingsHandled called for user:', userId, 'count:', count);
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      cravingsHandled: count,
      updatedAt: new Date().toISOString()
    });
    console.log('Firebase service: updateCravingsHandled successful');
  } catch (error: any) {
    console.error('Firebase service: updateCravingsHandled error:', error);
    throw new Error(`Failed to update cravings handled: ${error.message}`);
  }
};

export { auth, db };