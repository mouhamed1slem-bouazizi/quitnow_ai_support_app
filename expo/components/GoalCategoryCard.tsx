import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColors } from '@/constants/colors';
import { Heart, TrendingUp, Leaf, User, Flower2, Wind, Clock, Zap, Award } from 'lucide-react-native';

interface GoalCategoryCardProps {
  category: string;
  progress: number;
  color: string;
  onPress: () => void;
}

export default function GoalCategoryCard({ category, progress, color, onPress }: GoalCategoryCardProps) {
  const colors = useThemeColors();
  
  const getIcon = () => {
    switch (category.toLowerCase()) {
      case 'health':
        return <Heart size={24} color={color} />;
      case 'progress':
        return <TrendingUp size={24} color={color} />;
      case 'ecology':
        return <Leaf size={24} color={color} />;
      case 'body':
        return <User size={24} color={color} />;
      case 'wellbeing':
        return <Flower2 size={24} color={color} />;
      case 'lungs':
        return <Wind size={24} color={color} />;
      case 'time':
        return <Clock size={24} color={color} />;
      case 'nicotine':
        return <Zap size={24} color={color} />;
      case 'trophies':
        return <Award size={24} color={color} />;
      default:
        return <Award size={24} color={color} />;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      <View style={styles.content}>
        {getIcon()}
        <Text style={[styles.categoryName, { color: colors.text }]}>{category}</Text>
      </View>
      
      <View style={[styles.progressBar, { backgroundColor: `${color}30` }]}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${progress}%`,
              backgroundColor: color
            }
          ]} 
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    height: 100,
    justifyContent: 'space-between',
  },
  content: {
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    width: '100%',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});