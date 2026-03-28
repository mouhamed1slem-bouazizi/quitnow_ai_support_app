import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useUserStore } from '@/store/user-store';
import ProgressCard from '@/components/ProgressCard';
import MotivationCard from '@/components/MotivationCard';
import ActivitySuggestionCard from '@/components/ActivitySuggestionCard';
import MedicalFactCard from '@/components/MedicalFactCard';
import { useThemeColors } from '@/constants/colors';

export default function HomeScreen() {
  const { profile } = useUserStore();
  const colors = useThemeColors();
  
  if (!profile) return null;
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ProgressCard />
      <MotivationCard />
      <ActivitySuggestionCard />
      <MedicalFactCard />
      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 16,
  },
  spacer: {
    height: 40,
  },
});