import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useUserStore } from '@/store/user-store';
import { useThemeColors } from '@/constants/colors';
import CravingIntensityTracker from '@/components/CravingIntensityTracker';
import CravingActivityCard from '@/components/CravingActivityCard';
import { aiService } from '@/services/ai-service';
import { Cigarette, RefreshCw } from 'lucide-react-native';

export default function CravingsScreen() {
  const colors = useThemeColors();
  const { incrementCravingsHandled } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<Array<{
    id: string;
    title: string;
    description: string;
    imageUrl: string;
  }>>([]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const [activity1, activity2] = await Promise.all([
        aiService.generateActivityWithImage(),
        aiService.generateActivityWithImage()
      ]);
      
      setActivities([
        {
          id: '1',
          title: activity1.title,
          description: activity1.description,
          imageUrl: activity1.imageUrl
        },
        {
          id: '2',
          title: activity2.title,
          description: activity2.description,
          imageUrl: activity2.imageUrl
        }
      ]);
    } catch (error) {
      console.error('Error fetching activities:', error);
      Alert.alert(
        "Couldn't Load Activities",
        "We're having trouble generating personalized activities. Please try again later.",
        [{ text: "OK" }]
      );
      
      // Fallback activities if AI fails
      setActivities([
        {
          id: '1',
          title: 'Deep Breathing Exercise',
          description: 'Take 10 deep breaths, inhaling through your nose for 4 counts and exhaling through your mouth for 6 counts. Focus on the sensation of air filling your lungs.',
          imageUrl: 'https://image.pollinations.ai/prompt/Deep%20breathing%20exercise%2C%20meditation%2C%20calm%2C%20peaceful%2C%20high%20quality'
        },
        {
          id: '2',
          title: 'Quick Walk Outside',
          description: 'Step outside for a 5-minute walk. Focus on the sensations around you - the air on your skin, the sounds in your environment, and the rhythm of your steps.',
          imageUrl: 'https://image.pollinations.ai/prompt/Person%20walking%20outside%2C%20nature%2C%20fresh%20air%2C%20healthy%20activity%2C%20high%20quality'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleActivityCompleted = (activityId: string) => {
    incrementCravingsHandled();
    // Mark this activity as completed in the UI
    setActivities(activities.map(activity => 
      activity.id === activityId 
        ? { ...activity, completed: true } 
        : activity
    ));
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Manage Cravings',
          headerTitleStyle: { fontWeight: '600', color: colors.text },
          headerStyle: { backgroundColor: colors.background }
        }} 
      />
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]} 
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Cigarette size={24} color={colors.danger} />
            <Text style={[styles.headerText, { color: colors.text }]}>Having a Craving?</Text>
          </View>
          <TouchableOpacity 
            style={[styles.refreshButton, { backgroundColor: colors.card }]} 
            onPress={fetchActivities}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <RefreshCw size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Track your craving intensity and try these activities to help it pass
        </Text>
        
        <CravingIntensityTracker />
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Try These Activities</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Generating personalized activities...</Text>
          </View>
        ) : (
          activities.map(activity => (
            <CravingActivityCard
              key={activity.id}
              activity={activity}
              onComplete={() => handleActivityCompleted(activity.id)}
            />
          ))
        )}
        
        <View style={styles.spacer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 16,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  spacer: {
    height: 40,
  },
});