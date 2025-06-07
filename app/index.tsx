import { Redirect } from 'expo-router';
import { useUserStore } from '@/store/user-store';

export default function Index() {
  const { isOnboarded } = useUserStore();
  
  // Redirect to the appropriate screen based on onboarding status
  return isOnboarded ? <Redirect href="/(tabs)" /> : <Redirect href="/onboarding" />;
}