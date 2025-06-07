import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useUserStore } from '@/store/user-store';
import { healthMilestones } from '@/constants/achievements';
import colors from '@/constants/colors';
import { CheckCircle2, Circle } from 'lucide-react-native';

export default function HealthMilestoneCard() {
  const { calculateProgress } = useUserStore();
  const { smokeFreeTime } = calculateProgress();
  const totalDays = smokeFreeTime.days;
  
  // Filter milestones to show upcoming and recently achieved
  const relevantMilestones = healthMilestones
    .sort((a, b) => a.days - b.days)
    .filter(milestone => 
      // Show achieved milestones and next 3 upcoming
      milestone.days <= totalDays || 
      milestone.days <= (totalDays + 30) && 
      milestone.days > totalDays
    )
    .slice(0, 5);
  
  const renderMilestone = ({ item }: { item: typeof healthMilestones[0] }) => {
    const isAchieved = totalDays >= item.days;
    
    return (
      <View style={styles.milestoneItem}>
        <View style={styles.iconContainer}>
          {isAchieved ? (
            <CheckCircle2 size={24} color={colors.success} />
          ) : (
            <Circle size={24} color={colors.inactive} />
          )}
        </View>
        
        <View style={styles.milestoneContent}>
          <Text style={[
            styles.milestoneTitle,
            isAchieved && styles.achievedText
          ]}>
            {item.title}
          </Text>
          <Text style={styles.milestoneDescription}>{item.description}</Text>
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Milestones</Text>
      </View>
      
      <FlatList
        data={relevantMilestones}
        renderItem={renderMilestone}
        keyExtractor={(item) => item.title}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
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
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  achievedText: {
    color: colors.success,
  },
  milestoneDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  separator: {
    height: 1,
    backgroundColor: colors.progressBackground,
    marginVertical: 4,
  },
});