import { useColorScheme } from 'react-native';
import { useUserStore } from '@/store/user-store';
import { useMemo } from 'react';

// Define the theme colors
const lightColors = {
  primary: '#4361ee',
  secondary: '#3f37c9',
  psychological: '#9c5cff', // Purple color for psychological category
  background: '#f8f9fa',
  card: '#ffffff',
  cardDark: '#e9ecef', // Added for empty mood circles
  text: '#212529',
  textSecondary: '#6c757d',
  textTertiary: '#adb5bd',
  border: '#e9ecef',
  notification: '#ff4d6d',
  success: '#4cc9f0',
  warning: '#ffaa00',
  error: '#ff4d6d',
  danger: '#ff4d6d', // Added for consistency
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
  cardDark: '#2a2a2a', // Added for empty mood circles
  text: '#f8f9fa',
  textSecondary: '#adb5bd',
  textTertiary: '#6c757d',
  border: '#2a2a2a',
  notification: '#ff4d6d',
  success: '#4cc9f0',
  warning: '#ffaa00',
  error: '#ff4d6d',
  danger: '#ff4d6d', // Added for consistency
  inactive: '#495057',
  progressBackground: '#2a2a2a',
  progressFill: '#4cc9f0',
  shadow: '#000000',
};

// Define the type for the colors object
export type ColorType = typeof lightColors;

// Define the type for the theme
export type ThemeType = 'light' | 'dark' | 'system';

// Define the type for the colors object including the theme property
export type ThemeColors = ColorType & {
  theme: ThemeType;
};

// Create a cached version of the colors to prevent infinite loops
const cachedLightColors: ThemeColors = { ...lightColors, theme: 'light' };
const cachedDarkColors: ThemeColors = { ...darkColors, theme: 'dark' };
const cachedSystemLightColors: ThemeColors = { ...lightColors, theme: 'system' };
const cachedSystemDarkColors: ThemeColors = { ...darkColors, theme: 'system' };

export function useThemeColors(): ThemeColors {
  const systemColorScheme = useColorScheme();
  const theme = useUserStore(state => state.theme);
  
  // Use useMemo to cache the result and prevent infinite loops
  return useMemo(() => {
    // Determine which theme to use
    if (theme === 'system') {
      return systemColorScheme === 'dark' ? cachedSystemDarkColors : cachedSystemLightColors;
    }
    return theme === 'dark' ? cachedDarkColors : cachedLightColors;
  }, [systemColorScheme, theme]);
}

// Export default colors object for backward compatibility
export default {
  ...lightColors,
  light: lightColors,
  dark: darkColors,
};