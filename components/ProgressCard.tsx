import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useUserStore } from '@/store/user-store';
import { aiService } from '@/services/ai-service';
import { useThemeColors } from '@/constants/colors';
import { Clock, DollarSign, Cigarette } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ProgressCard() {
  const colors = useThemeColors();
  const { profile, calculateProgress } = useUserStore();
  const progress = calculateProgress();
  
  if (!profile) return null;
  
  const { smokeFreeTime, cigarettesAvoided, moneySaved } = progress;
  const totalDays = smokeFreeTime.days;
  
  const imageUrl = aiService.getProgressImageUrl(totalDays);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: profile.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Your Progress</Text>
      </View>
      
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={1000}
        />
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Clock size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {totalDays}d {smokeFreeTime.hours}h {smokeFreeTime.minutes}m
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Smoke-Free</Text>
        </View>
        
        <View style={[styles.divider, { backgroundColor: colors.inactive }]} />
        
        <View style={styles.statItem}>
          <Cigarette size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>{cigarettesAvoided}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Not Smoked</Text>
        </View>
        
        <View style={[styles.divider, { backgroundColor: colors.inactive }]} />
        
        <View style={styles.statItem}>
          <DollarSign size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>{formatCurrency(moneySaved)}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Saved</Text>
        </View>
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
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  imageContainer: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
    marginHorizontal: 8,
  },
});