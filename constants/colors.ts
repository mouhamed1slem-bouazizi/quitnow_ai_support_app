import { useColorScheme } from 'react-native';
import { useUserStore } from '@/store/user-store';

// Light theme colors
const lightColors = {
  primary: '#5271FF',
  secondary: '#FF7D54',
  background: '#FFFFFF',
  card: '#F8F9FA',
  text: '#1A1A1A',
  textSecondary: '#6C757D',
  textTertiary: '#8F959E',
  inactive: '#ADB5BD',
  success: '#28A745',
  danger: '#DC3545',
  warning: '#FFC107',
  info: '#17A2B8',
  progressBackground: '#E9ECEF',
  progressFill: '#5271FF',
  progressBar: '#5271FF',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

// Dark theme colors
const darkColors = {
  primary: '#6C8AFF',
  secondary: '#FF8F6B',
  background: '#121212',
  card: '#1E1E1E',
  text: '#F8F9FA',
  textSecondary: '#ADB5BD',
  textTertiary: '#6C757D',
  inactive: '#6C757D',
  success: '#28A745',
  danger: '#DC3545',
  warning: '#FFC107',
  info: '#17A2B8',
  progressBackground: '#2A2A2A',
  progressFill: '#6C8AFF',
  progressBar: '#6C8AFF',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

// Default export for backward compatibility
export default lightColors;

// Hook to get the current theme colors
export function useThemeColors() {
  const systemColorScheme = useColorScheme();
  const { theme } = useUserStore();
  
  // Determine which theme to use based on user preference
  let activeTheme: 'light' | 'dark';
  
  if (theme === 'system') {
    activeTheme = systemColorScheme === 'dark' ? 'dark' : 'light';
  } else {
    activeTheme = theme as 'light' | 'dark';
  }
  
  return activeTheme === 'dark' ? darkColors : lightColors;
}