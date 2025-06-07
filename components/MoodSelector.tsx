import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MoodType } from '@/types/user';
import { moodOptions } from '@/constants/moods';
import { useThemeColors } from '@/constants/colors';

interface MoodSelectorProps {
  selectedMood: MoodType;
  onSelectMood: (mood: MoodType) => void;
  compact?: boolean;
}

export default function MoodSelector({ selectedMood, onSelectMood, compact = false }: MoodSelectorProps) {
  const colors = useThemeColors();
  
  return (
    <View style={styles.container}>
      {!compact && (
        <Text style={[styles.title, { color: colors.text }]}>How are you feeling?</Text>
      )}
      <View style={styles.moodGrid}>
        {moodOptions.map((mood) => (
          <TouchableOpacity
            key={mood.type}
            style={[
              styles.moodButton,
              { 
                backgroundColor: selectedMood === mood.type ? mood.color : colors.card,
                borderColor: selectedMood === mood.type ? mood.color : colors.inactive,
              },
              compact && styles.compactButton
            ]}
            onPress={() => onSelectMood(mood.type)}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            {!compact && (
              <Text style={[
                styles.moodLabel, 
                { color: selectedMood === mood.type ? '#FFFFFF' : colors.text }
              ]}>
                {mood.label}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodButton: {
    width: '23%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  compactButton: {
    width: '18%',
    paddingVertical: 8,
    marginBottom: 5,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});