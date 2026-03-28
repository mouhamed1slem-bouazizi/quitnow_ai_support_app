import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { aiService } from '@/services/ai-service';
import { useUserStore } from '@/store/user-store';
import { useThemeColors } from '@/constants/colors';
import { RefreshCw } from 'lucide-react-native';

export default function MotivationCard() {
  const colors = useThemeColors();
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { profile, calculateProgress } = useUserStore();
  
  const fetchMotivation = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      const days = calculateProgress().smokeFreeTime.days;
      const motivationalText = await aiService.generateMotivationalText(days);
      setMessage(motivationalText);
    } catch (error) {
      console.error('Error fetching motivation:', error);
      setMessage("Every day without smoking is a victory. Keep going!");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMotivation();
  }, [profile]);
  
  if (!profile) return null;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Daily Motivation</Text>
        <TouchableOpacity 
          onPress={fetchMotivation} 
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
      
      <View style={styles.messageContainer}>
        <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      </View>
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
  messageContainer: {
    minHeight: 60,
    justifyContent: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});