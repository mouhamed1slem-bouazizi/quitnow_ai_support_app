import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUserStore } from '@/store/user-store';
import { useThemeColors } from '@/constants/colors';
import { MOODS } from '@/constants/moods';
import { MoodType } from '@/types/user';

export default function MoodChart() {
  const colors = useThemeColors();
  const getRecentMoods = useUserStore(state => state.getRecentMoods);
  
  // Get moods from the last 7 days
  const recentMoods = getRecentMoods();
  
  // Create an array of the last 7 days
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    days.push(date);
  }
  
  // Format day labels
  const getDayLabel = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
  };
  
  // Get mood for a specific day
  const getMoodForDay = (date: Date): MoodType | null => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    // Find the most recent mood entry for this day
    const moodForDay = recentMoods.find(
      record => record.date >= dayStart && record.date <= dayEnd
    );
    
    return moodForDay ? moodForDay.mood : null;
  };
  
  // Get color for a mood
  const getMoodColor = (mood: MoodType | null) => {
    if (!mood) return colors.cardDark;
    return MOODS.find(m => m.id === mood)?.color || colors.cardDark;
  };
  
  // Get emoji for a mood
  const getMoodEmoji = (mood: MoodType | null) => {
    if (!mood) return '?';
    return MOODS.find(m => m.id === mood)?.emoji || '?';
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>Your Mood - Last 7 Days</Text>
      
      <View style={styles.moodGrid}>
        {days.map((day, index) => {
          const mood = getMoodForDay(day);
          const dayLabel = getDayLabel(day);
          
          return (
            <View key={index} style={styles.dayColumn}>
              <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>
                {dayLabel}
              </Text>
              
              <View 
                style={[
                  styles.moodCircle, 
                  { backgroundColor: getMoodColor(mood) }
                ]}
              >
                <Text style={styles.moodEmoji}>{getMoodEmoji(mood)}</Text>
              </View>
              
              <Text style={[styles.noData, { color: colors.textSecondary }]}>
                {!mood ? 'No data' : ''}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    width: '14%',
  },
  dayLabel: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  moodCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodEmoji: {
    fontSize: 24,
  },
  noData: {
    fontSize: 12,
    textAlign: 'center',
  },
});