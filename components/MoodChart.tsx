import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useUserStore } from '@/store/user-store';
import { MoodRecord } from '@/types/user';
import { getMoodOption } from '@/constants/moods';
import { useThemeColors } from '@/constants/colors';

export default function MoodChart() {
  const colors = useThemeColors();
  const diaryEntries = useUserStore(state => state.diaryEntries);
  
  // Get moods from the last 7 days
  const recentMoods = useMemo(() => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 7);
    
    // Convert diary entries to mood records
    const moodRecords: MoodRecord[] = diaryEntries
      .filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= startDate && entryDate <= now;
      })
      .map(entry => ({
        id: entry.id,
        timestamp: entry.timestamp,
        type: entry.mood,
        note: entry.content
      }));
    
    // Sort by timestamp, newest first
    return moodRecords.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [diaryEntries]);
  
  // Group moods by day
  const moodsByDay = useMemo(() => {
    const days: { [key: string]: MoodRecord | null } = {};
    const now = new Date();
    
    // Initialize the last 7 days with null values
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      days[dateString] = null;
    }
    
    // Fill in the days that have mood records
    recentMoods.forEach(mood => {
      const dateString = new Date(mood.timestamp).toISOString().split('T')[0];
      // Only keep the most recent mood for each day
      if (!days[dateString] || (days[dateString] && new Date(mood.timestamp) > new Date(days[dateString]!.timestamp))) {
        days[dateString] = mood;
      }
    });
    
    return days;
  }, [recentMoods]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  // Get day name (e.g., "Today", "Yesterday", or day of week)
  const getDayName = (dateString: string) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const date = new Date(dateString);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>Your Mood - Last 7 Days</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartContainer}>
        {Object.entries(moodsByDay).map(([dateString, moodRecord]) => {
          const dayName = getDayName(dateString);
          const moodOption = moodRecord ? getMoodOption(moodRecord.type) : null;
          
          return (
            <View key={dateString} style={styles.dayColumn}>
              <Text style={[styles.dayName, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
                {dayName}
              </Text>
              <View 
                style={[
                  styles.moodCircle, 
                  { 
                    backgroundColor: moodOption ? moodOption.color : colors.inactive,
                    borderColor: colors.background
                  }
                ]}
              >
                {moodOption ? (
                  <Text style={styles.moodEmoji}>{moodOption.emoji}</Text>
                ) : (
                  <Text style={styles.noMoodText}>?</Text>
                )}
              </View>
              <Text style={[styles.moodLabel, { color: colors.textSecondary }]}>
                {moodOption ? moodOption.label : 'No data'}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
  },
  dayColumn: {
    alignItems: 'center',
    marginRight: 16,
    width: 70, // Increased width to accommodate "Yesterday"
  },
  dayName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
    width: '100%', // Ensure text takes full width of column
  },
  moodCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
  },
  moodEmoji: {
    fontSize: 24,
  },
  noMoodText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  moodLabel: {
    fontSize: 12,
  },
});