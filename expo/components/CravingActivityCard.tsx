import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useThemeColors } from '@/constants/colors';
import { CheckCircle2, ChevronRight } from 'lucide-react-native';

interface Activity {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  completed?: boolean;
}

interface CravingActivityCardProps {
  activity: Activity;
  onComplete: () => void;
}

const { width } = Dimensions.get('window');

export default function CravingActivityCard({ activity, onComplete }: CravingActivityCardProps) {
  const colors = useThemeColors();
  const [expanded, setExpanded] = useState(false);
  const [completed, setCompleted] = useState(activity.completed || false);

  const handleComplete = () => {
    if (!completed) {
      setCompleted(true);
      onComplete();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <Image
          source={{ uri: activity.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={500}
        />
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{activity.title}</Text>
          <ChevronRight 
            size={20} 
            color={colors.primary}
            style={[styles.chevron, expanded && styles.chevronExpanded]} 
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {activity.description}
          </Text>
          
          <TouchableOpacity
            style={[
              styles.completeButton,
              completed ? { backgroundColor: colors.success } : { backgroundColor: colors.primary }
            ]}
            onPress={handleComplete}
            disabled={completed}
          >
            {completed ? (
              <>
                <CheckCircle2 size={18} color="white" />
                <Text style={styles.completeButtonText}>Completed</Text>
              </>
            ) : (
              <Text style={styles.completeButtonText}>Mark as Completed</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
  },
  chevronExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  completeButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
});