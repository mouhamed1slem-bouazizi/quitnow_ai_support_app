import { useColorScheme } from 'react-native';
import { useUserStore } from '@/store/user-store';

// Define color palettes
export const lightColors = {
  primary: "#4A90E2", // Calming blue
  secondary: "#F5A623", // Warm orange for achievements
  background: "#FFFFFF",
  card: "#F8F9FA",
  text: "#333333",
  textSecondary: "#6B7280",
  success: "#34C759",
  danger: "#FF3B30",
  warning: "#FFCC00",
  inactive: "#C7C7CC",
  progressBar: "#4A90E2",
  progressBackground: "#E5E5EA",
};

export const darkColors = {
  primary: "#5E9CEA", // Slightly lighter blue for dark mode
  secondary: "#F7B955", // Slightly lighter orange for dark mode
  background: "#121212",
  card: "#1E1E1E",
  text: "#F2F2F7",
  textSecondary: "#AEAEB2",
  success: "#30D158",
  danger: "#FF453A",
  warning: "#FFD60A",
  inactive: "#48484A",
  progressBar: "#5E9CEA",
  progressBackground: "#2C2C2E",
};

// Export a function to get colors based on theme
export const useThemeColors = () => {
  const systemColorScheme = useColorScheme();
  const { theme } = useUserStore();
  
  // Determine which theme to use based on user preference
  const effectiveTheme = theme === 'system' ? systemColorScheme : theme;
  
  return effectiveTheme === 'dark' ? darkColors : lightColors;
};

// Default to light colors for direct imports
export default lightColors;