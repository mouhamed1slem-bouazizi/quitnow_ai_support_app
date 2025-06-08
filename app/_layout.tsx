import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Slot, Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AchievementChecker from '@/components/AchievementChecker';
import { useUserStore } from '@/store/user-store';
import { useColorScheme } from 'react-native';
import { subscribeToAuthChanges } from '@/services/firebase';
import { useAuthStore } from '@/store/auth-store';
import LoadingScreen from '@/components/LoadingScreen';

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
  const [isReady, setIsReady] = useState(false);
  
  // Handle font loading
  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
    }
    
    if (loaded) {
      // Only hide splash screen when fonts are loaded
      SplashScreen.hideAsync().catch(console.error);
      // Mark the app as ready after fonts are loaded
      setIsReady(true);
    }
  }, [loaded, error]);

  // Set up auth state listener
  useEffect(() => {
    if (!loaded) return;
    
    console.log('Setting up auth state listener');
    const unsubscribe = subscribeToAuthChanges((user) => {
      console.log('Auth state changed in _layout, user:', user?.email || 'null');
      setUser(user);
    });

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, [setUser, loaded]);

  // Don't render anything until the app is ready
  if (!isReady || !loaded) {
    return <Slot />;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, user } = useAuthStore();
  const { 
    onboarded, 
    theme, 
    loadFromFirestore, 
    isLoading, 
    error, 
    setError 
  } = useUserStore();
  const systemColorScheme = useColorScheme();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Determine which theme to use
  const effectiveTheme = theme === 'system' ? systemColorScheme : theme;
  const statusBarStyle = effectiveTheme === 'dark' ? 'light' : 'dark';
  
  // Load user data from Firestore when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Loading user data from Firestore');
      loadFromFirestore()
        .then(() => {
          console.log('User data loaded successfully');
          setDataLoaded(true);
        })
        .catch(err => {
          console.error('Error loading user data:', err);
          setError(`Failed to load user data: ${err.message}`);
          setDataLoaded(true); // Still mark as loaded so we can proceed
        });
    } else {
      // If not authenticated, we don't need to load data
      setDataLoaded(true);
    }
  }, [isAuthenticated, user, loadFromFirestore, setError]);
  
  // Handle routing based on authentication state
  useEffect(() => {
    // Wait for the next tick to ensure navigation is ready
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (!isNavigationReady || !dataLoaded) return;
    
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
  }, [isAuthenticated, onboarded, segments, router, isNavigationReady, dataLoaded]);
  
  // Show loading screen while data is being loaded
  if (isAuthenticated && isLoading && !dataLoaded) {
    return <LoadingScreen message="Loading your data..." />;
  }
  
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