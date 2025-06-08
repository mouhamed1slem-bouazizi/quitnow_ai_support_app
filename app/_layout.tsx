import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AchievementChecker from '@/components/AchievementChecker';
import { useUserStore } from '@/store/user-store';
import { useColorScheme } from 'react-native';
import { subscribeToAuthChanges } from '@/services/firebase';
import { useAuthStore } from '@/store/auth-store';

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  
  const setUser = useAuthStore(state => state.setUser);
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated } = useAuthStore();
  const { onboarded, setUserId, loadProfileFromFirestore, loadDiaryEntriesFromFirestore } = useUserStore();

  // Handle routing based on authentication state
  useEffect(() => {
    const inAuthGroup = segments[0] === 'auth';
    const inOnboardingGroup = segments[0] === 'onboarding';
    
    console.log('Navigation state:', { 
      isAuthenticated, 
      onboarded, 
      inAuthGroup, 
      inOnboardingGroup,
      segments: segments.join('/')
    });

    if (!isAuthenticated && !inAuthGroup) {
      // If not authenticated and not in auth group, redirect to auth
      console.log('Redirecting to auth');
      router.replace('/auth');
    } else if (isAuthenticated && !onboarded && !inOnboardingGroup) {
      // If authenticated but not onboarded and not in onboarding, redirect to onboarding
      console.log('Redirecting to onboarding');
      router.replace('/onboarding');
    } else if (isAuthenticated && onboarded && (inAuthGroup || inOnboardingGroup)) {
      // If authenticated and onboarded but in auth or onboarding, redirect to tabs
      console.log('Redirecting to tabs');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, onboarded, segments, router]);

  // Subscribe to auth state changes and load user data when authenticated
  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = subscribeToAuthChanges((user) => {
      console.log('Auth state changed in _layout, user:', user?.email || 'null');
      setUser(user);
      
      // If user is authenticated, set userId in user store and load data from Firestore
      if (user) {
        setUserId(user.uid);
        
        // Load user profile from Firestore
        loadProfileFromFirestore()
          .then(success => {
            console.log('Profile loaded from Firestore:', success ? 'success' : 'no data found');
            
            // If no profile was found, we'll keep the onboarded state as is
            // The app will redirect to onboarding if needed
          })
          .catch(error => {
            console.error('Error loading profile from Firestore:', error);
          });
        
        // Load diary entries from Firestore
        loadDiaryEntriesFromFirestore()
          .then(success => {
            console.log('Diary entries loaded from Firestore:', success ? 'success' : 'no data found');
          })
          .catch(error => {
            console.error('Error loading diary entries from Firestore:', error);
          });
      } else {
        // If user is not authenticated, clear userId in user store
        setUserId(null);
      }
    });

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, [setUser, setUserId, loadProfileFromFirestore, loadDiaryEntriesFromFirestore]);

  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { theme } = useUserStore();
  const systemColorScheme = useColorScheme();
  
  // Determine which theme to use
  const effectiveTheme = theme === 'system' ? systemColorScheme : theme;
  const statusBarStyle = effectiveTheme === 'dark' ? 'light' : 'dark';
  
  return (
    <SafeAreaProvider>
      <StatusBar style={statusBarStyle} />
      <AchievementChecker />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </SafeAreaProvider>
  );
}