import { useColorScheme } from 'react-native';

// Define the theme colors
const lightColors = {
  primary: '#4361ee',
  secondary: '#3f37c9',
  psychological: '#9c5cff', // Purple color for psychological category
  background: '#f8f9fa',
  card: '#ffffff',
  text: '#212529',
  textSecondary: '#6c757d',
  textTertiary: '#adb5bd',
  border: '#e9ecef',
  notification: '#ff4d6d',
  success: '#4cc9f0',
  warning: '#ffaa00',
  error: '#ff4d6d',
  inactive: '#ced4da',
  progressBackground: '#e9ecef',
  progressFill: '#4361ee',
  shadow: '#000000',
};

const darkColors = {
  primary: '#4cc9f0',
  secondary: '#4895ef',
  psychological: '#b77cff', // Lighter purple for dark mode
  background: '#121212',
  card: '#1e1e1e',
  text: '#f8f9fa',
  textSecondary: '#adb5bd',
  textTertiary: '#6c757d',
  border: '#2a2a2a',
  notification: '#ff4d6d',
  success: '#4cc9f0',
  warning: '#ffaa00',
  error: '#ff4d6d',
  inactive: '#495057',
  progressBackground: '#2a2a2a',
  progressFill: '#4cc9f0',
  shadow: '#000000',
};

export function useThemeColors() {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkColors : lightColors;
}

export const colors = {
  light: lightColors,
  dark: darkColors,
};