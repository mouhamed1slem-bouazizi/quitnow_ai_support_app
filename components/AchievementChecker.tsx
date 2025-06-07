import { useEffect } from 'react';
import { useUserStore } from '@/store/user-store';
import { achievements } from '@/constants/achievements';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// This component doesn't render anything, it just checks for achievements
export default function AchievementChecker() {
  const { profile, calculateProgress, addAchievement } = useUserStore();
  
  useEffect(() => {
    if (!profile) return;
    
    const checkAchievements = () => {
      const { smokeFreeTime } = calculateProgress();
      const totalDays = smokeFreeTime.days;
      
      // Check for day-based achievements
      achievements.forEach(achievement => {
        if (
          totalDays >= achievement.days && 
          !profile.achievements.includes(achievement.id)
        ) {
          // Award the achievement
          addAchievement(achievement.id);
          
          // Provide haptic feedback on native platforms
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      });
    };
    
    // Check achievements when component mounts
    checkAchievements();
    
    // Set up interval to check periodically (every hour)
    const intervalId = setInterval(checkAchievements, 3600000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [profile, calculateProgress, addAchievement]);
  
  return null;
}