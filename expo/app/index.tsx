import { Redirect } from 'expo-router';
import { useUserStore } from '@/store/user-store';

export default function Index() {
  const { onboarded } = useUserStore();
  
  // If not onboarded, redirect to onboarding
  if (!onboarded) {
    console.log('Root index redirecting to /onboarding');
    return <Redirect href="/onboarding" />;
  }
  
  // If onboarded, redirect to tabs
  console.log('Root index redirecting to /(tabs)');
  return <Redirect href="/(tabs)" />;
}