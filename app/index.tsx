import { Redirect } from 'expo-router';
import { useUserStore } from '@/store/user-store';
import { useAuthStore } from '@/store/auth-store';
import { useEffect } from 'react';

export default function Index() {
  const { onboarded } = useUserStore();
  const { isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    console.log('Root index page - Auth state:', { isAuthenticated, onboarded });
  }, [isAuthenticated, onboarded]);
  
  // If not authenticated, redirect to auth
  if (!isAuthenticated) {
    console.log('Root index redirecting to /auth');
    return <Redirect href="/auth" />;
  }
  
  // If authenticated but not onboarded, redirect to onboarding
  if (!onboarded) {
    console.log('Root index redirecting to /onboarding');
    return <Redirect href="/onboarding" />;
  }
  
  // If authenticated and onboarded, redirect to tabs
  console.log('Root index redirecting to /(tabs)');
  return <Redirect href="/(tabs)" />;
}