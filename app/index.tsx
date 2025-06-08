import { Redirect } from 'expo-router';
import { useUserStore } from '@/store/user-store';
import { useAuthStore } from '@/store/auth-store';

export default function Index() {
  const { onboarded } = useUserStore();
  const { isAuthenticated } = useAuthStore();
  
  // If not authenticated, redirect to auth
  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }
  
  // If authenticated but not onboarded, redirect to onboarding
  if (!onboarded) {
    return <Redirect href="/onboarding" />;
  }
  
  // If authenticated and onboarded, redirect to tabs
  return <Redirect href="/(tabs)" />;
}