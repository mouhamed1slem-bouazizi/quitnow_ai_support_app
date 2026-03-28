import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { TrendingUp } from 'lucide-react-native';

export default function NextGoalCard() {
  const colors = useThemeColors();
  const { profile, calculateProgress } = useUserStore();
  
  if (!profile) return null;
  
  const { cigarettesAvoided } = calculateProgress();
  
  // Find the next milestone based on cigarettes avoided
  const getNextCigaretteMilestone = () => {
    const milestones = [100, 500, 1000, 5000, 10000, 15000, 20000];
    return milestones.find(milestone => milestone > cigarettesAvoided) || milestones[milestones.length - 1];
  };
  
  const nextMilestone = getNextCigaretteMilestone();
  const progress = (cigarettesAvoided / nextMilestone) * 100;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.secondary}20` }]}>
          <TrendingUp size={24} color={colors.secondary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Next goal</Text>
      </View>
      
      <Text style={[styles.goalText, { color: colors.text }]}>
        You have not smoked {cigarettesAvoided.toLocaleString()} cigarettes. Progress to {nextMilestone.toLocaleString()}:
      </Text>
      
      <View style={[styles.progressBar, { backgroundColor: colors.progressBackground }]}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${Math.min(100, progress)}%`, backgroundColor: colors.secondary }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  goalText: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 22,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});