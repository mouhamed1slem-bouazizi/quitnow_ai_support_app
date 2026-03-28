import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUserStore } from '@/store/user-store';
import { useThemeColors } from '@/constants/colors';
import { getMoodOption } from '@/constants/moods';
import { MoodRecord } from '@/types/user';

export default function MoodChart() {
  const colors = useThemeColors();
  const getRecentMoods = useUserStore(state => state.getRecentMoods);
  
  const recentMoods = getRecentMoods();
  
  // Get the last 4 days (including today)
  const getDayLabels = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      let label = '';
      if (i === 0) {
        label = 'Today';
      } else if (i === 1) {
        label = 'Yesterday';
      } else {
        label = date.toLocaleDateString('en-US', { weekday: 'short' });
      }
      
      days.push({
        date,
        label
      });
    }
    
    return days;
  };
  
  const dayLabels = getDayLabels();
  
  // Group moods by day
  const getMoodForDay = (date: Date) => {
    if (!recentMoods || recentMoods.length === 0) return null;
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Find the most recent mood for this day
    const moodsForDay = recentMoods.filter(mood => {
      const moodDate = new Date(mood.timestamp);
      return moodDate >= startOfDay && moodDate <= endOfDay;
    });
    
    return moodsForDay.length > 0 ? moodsForDay[0] : null;
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>Your Mood - Last 7 Days</Text>
      
      <View style={styles.moodRow}>
        {dayLabels.map((day, index) => {
          const mood = getMoodForDay(day.date);
          const moodOption = mood ? getMoodOption(mood.type) : null;
          
          return (
            <View key={index} style={styles.dayColumn}>
              <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>
                {day.label}
              </Text>
              
              <View 
                style={[
                  styles.moodCircle, 
                  { backgroundColor: moodOption ? moodOption.color : colors.inactive }
                ]}
              >
                <Text style={styles.moodEmoji}>
                  {moodOption ? moodOption.emoji : '?'}
                </Text>
              </View>
              
              <Text style={[styles.moodStatus, { color: colors.textSecondary }]}>
                {mood ? moodOption?.label : 'No data'}
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
    padding: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  moodCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodStatus: {
    fontSize: 14,
    textAlign: 'center',
  },
});