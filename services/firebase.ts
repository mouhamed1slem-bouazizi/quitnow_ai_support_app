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
  Firestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

// Firebase configuration - hardcoded for now to fix the issue
// IMPORTANT: In production, these should come from environment variables
const firebaseConfig = {
  apiKey: "AIzaSyB_t9_0fUlS9AbIEuIyoJB-nhIeUTviu8Y",
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
export const saveUserProfile = async (userId: string, profileData: any) => {
  console.log('Firebase service: saveUserProfile called for user:', userId);
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, profileData, { merge: true });
    console.log('Firebase service: saveUserProfile successful');
    return true;
  } catch (error: any) {
    console.error('Firebase service: saveUserProfile error:', error.code, error.message);
    throw new Error(error.message);
  }
};

export const getUserProfile = async (userId: string) => {
  console.log('Firebase service: getUserProfile called for user:', userId);
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      console.log('Firebase service: getUserProfile successful, data found');
      return userDoc.data();
    } else {
      console.log('Firebase service: getUserProfile successful, no data found');
      return null;
    }
  } catch (error: any) {
    console.error('Firebase service: getUserProfile error:', error.code, error.message);
    throw new Error(error.message);
  }
};

export const updateUserProfile = async (userId: string, updates: any) => {
  console.log('Firebase service: updateUserProfile called for user:', userId);
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, updates);
    console.log('Firebase service: updateUserProfile successful');
    return true;
  } catch (error: any) {
    console.error('Firebase service: updateUserProfile error:', error.code, error.message);
    throw new Error(error.message);
  }
};

export const saveDiaryEntry = async (userId: string, entry: any) => {
  console.log('Firebase service: saveDiaryEntry called for user:', userId);
  try {
    const entryDocRef = doc(db, `users/${userId}/diary`, entry.id);
    await setDoc(entryDocRef, entry);
    console.log('Firebase service: saveDiaryEntry successful');
    return true;
  } catch (error: any) {
    console.error('Firebase service: saveDiaryEntry error:', error.code, error.message);
    throw new Error(error.message);
  }
};

export const getDiaryEntries = async (userId: string) => {
  console.log('Firebase service: getDiaryEntries called for user:', userId);
  try {
    const diaryCollectionRef = collection(db, `users/${userId}/diary`);
    const querySnapshot = await getDocs(diaryCollectionRef);
    
    const entries: any[] = [];
    querySnapshot.forEach((doc) => {
      entries.push(doc.data());
    });
    
    // Sort entries by timestamp (newest first)
    entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    console.log(`Firebase service: getDiaryEntries successful, found ${entries.length} entries`);
    return entries;
  } catch (error: any) {
    console.error('Firebase service: getDiaryEntries error:', error.code, error.message);
    throw new Error(error.message);
  }
};

export const deleteDiaryEntry = async (userId: string, entryId: string) => {
  console.log('Firebase service: deleteDiaryEntry called for user:', userId, 'entry:', entryId);
  try {
    const entryDocRef = doc(db, `users/${userId}/diary`, entryId);
    await setDoc(entryDocRef, { deleted: true }, { merge: true });
    console.log('Firebase service: deleteDiaryEntry successful (soft delete)');
    return true;
  } catch (error: any) {
    console.error('Firebase service: deleteDiaryEntry error:', error.code, error.message);
    throw new Error(error.message);
  }
};

export { auth, db };