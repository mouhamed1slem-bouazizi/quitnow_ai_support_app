import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { activities } from '@/constants/activities';
import { aiService } from '@/services/ai-service';
import { useThemeColors } from '@/constants/colors';
import { RefreshCw, ExternalLink } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ActivitySuggestionCard() {
  const colors = useThemeColors();
  const router = useRouter();
  const [currentActivity, setCurrentActivity] = useState(() => {
    // Start with a random activity from our predefined list
    const randomIndex = Math.floor(Math.random() * activities.length);
    return activities[randomIndex];
  });
  
  const [customSuggestion, setCustomSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastActivityId, setLastActivityId] = useState<string | null>(null);
  
  const getNewActivity = () => {
    // Reset custom suggestion
    setCustomSuggestion(null);
    
    // Get a new random activity from our list, ensuring it's different from the current one
    let newActivity;
    do {
      const randomIndex = Math.floor(Math.random() * activities.length);
      newActivity = activities[randomIndex];
    } while (newActivity.id === currentActivity.id);
    
    setCurrentActivity(newActivity);
    setLastActivityId(newActivity.id);
  };
  
  const getAiSuggestion = async () => {
    setLoading(true);
    try {
      // Add timestamp to ensure we get a fresh suggestion
      const timestamp = new Date().getTime();
      const suggestion = await aiService.generateActivitySuggestion();
      setCustomSuggestion(`${suggestion} (${timestamp})`);
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      // Fallback suggestions with variety
      const fallbackSuggestions = [
        "Take 10 deep breaths, counting slowly to 5 on each inhale and exhale.",
        "Drink a full glass of water slowly, focusing on each sip.",
        "Do 20 jumping jacks to get your blood flowing.",
        "Write down 3 reasons why you want to quit smoking.",
        "Call or text a supportive friend for a quick chat."
      ];
      const randomSuggestion = fallbackSuggestions[Math.floor(Math.random() * fallbackSuggestions.length)];
      setCustomSuggestion(randomSuggestion);
    } finally {
      setLoading(false);
    }
  };
  
  const navigateToCravings = () => {
    router.push('/cravings');
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Try This Instead</Text>
        <TouchableOpacity 
          onPress={customSuggestion ? getNewActivity : getAiSuggestion}
          disabled={loading}
          style={styles.refreshButton}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <RefreshCw size={18} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>
      
      {customSuggestion ? (
        <View style={styles.aiSuggestionContainer}>
          <Text style={[styles.aiSuggestion, { color: colors.text }]}>
            {customSuggestion.split(' (')[0]} {/* Remove the timestamp from display */}
          </Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={getNewActivity}
          >
            <Text style={[styles.backButtonText, { color: colors.primary }]}>Back to Activities</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text style={[styles.activityTitle, { color: colors.text }]}>{currentActivity.title}</Text>
          <Text style={[styles.activityDescription, { color: colors.text }]}>{currentActivity.description}</Text>
          <Text style={[styles.activityDuration, { color: colors.textSecondary }]}>Duration: {currentActivity.duration}</Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.moreActivitiesButton}
        onPress={navigateToCravings}
      >
        <Text style={[styles.moreActivitiesText, { color: colors.primary }]}>More Activities</Text>
        <ExternalLink size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 4,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  activityDuration: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  aiSuggestionContainer: {
    minHeight: 80,
  },
  aiSuggestion: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 14,
  },
  moreActivitiesButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
  },
  moreActivitiesText: {
    fontSize: 14,
    fontWeight: '500',
  },
});