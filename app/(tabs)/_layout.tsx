import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useThemeColors } from '@/constants/colors';
import { Home, Activity, Award, Gamepad2, User, BookOpen, Wind } from 'lucide-react-native';
import { useUserStore } from '@/store/user-store';
import { useMemo } from 'react';

export default function TabLayout() {
  const colors = useThemeColors();
  const theme = useUserStore(state => state.theme);
  const systemColorScheme = useColorScheme();
  
  // Determine which theme to use - use useMemo to prevent infinite loops
  const effectiveTheme = useMemo(() => {
    return theme === 'system' ? systemColorScheme : theme;
  }, [theme, systemColorScheme]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: {
          backgroundColor: colors.background,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: colors.text,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: 'Health',
          tabBarIcon: ({ color }) => <Activity size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color }) => <Award size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: 'Diary',
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cravings"
        options={{
          title: 'Cravings',
          tabBarIcon: ({ color }) => <Wind size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: 'Games',
          tabBarIcon: ({ color }) => <Gamepad2 size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}