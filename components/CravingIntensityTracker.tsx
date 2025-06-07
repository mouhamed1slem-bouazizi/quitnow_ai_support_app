import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColors } from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { Flame } from 'lucide-react-native';

export default function CravingIntensityTracker() {
  const colors = useThemeColors();
  const { recordCraving } = useUserStore();
  const [selectedIntensity, setSelectedIntensity] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const intensityLevels = [
    { level: 1, label: 'Mild', color: '#4CAF50' },
    { level: 2, label: 'Moderate', color: '#FFC107' },
    { level: 3, label: 'Strong', color: '#FF9800' },
    { level: 4, label: 'Very Strong', color: '#F44336' },
    { level: 5, label: 'Extreme', color: '#D32F2F' },
  ];

  const handleIntensitySelect = (level: number) => {
    if (!submitted) {
      setSelectedIntensity(level);
    }
  };

  const handleSubmit = () => {
    if (selectedIntensity !== null) {
      recordCraving(selectedIntensity, 'Manual tracking');
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setSelectedIntensity(null);
    setSubmitted(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>How strong is your craving?</Text>
      
      <View style={styles.intensityContainer}>
        {intensityLevels.map((item) => (
          <TouchableOpacity
            key={item.level}
            style={[
              styles.intensityButton,
              selectedIntensity === item.level && { backgroundColor: `${item.color}20` },
              { borderColor: item.color }
            ]}
            onPress={() => handleIntensitySelect(item.level)}
            disabled={submitted}
          >
            <Flame 
              size={24} 
              color={item.color} 
              style={styles.flameIcon}
            />
            <Text 
              style={[
                styles.intensityLabel, 
                { color: selectedIntensity === item.level ? item.color : colors.textSecondary }
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {!submitted ? (
        <TouchableOpacity
          style={[
            styles.submitButton,
            selectedIntensity === null 
              ? { backgroundColor: colors.inactive } 
              : { backgroundColor: colors.primary }
          ]}
          onPress={handleSubmit}
          disabled={selectedIntensity === null}
        >
          <Text style={styles.submitButtonText}>Record Craving</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.submittedContainer}>
          <Text style={[styles.submittedText, { color: colors.success }]}>
            Craving recorded! Remember, cravings typically pass within 3-5 minutes.
          </Text>
          <TouchableOpacity
            style={[styles.resetButton, { borderColor: colors.primary }]}
            onPress={handleReset}
          >
            <Text style={[styles.resetButtonText, { color: colors.primary }]}>Track Another</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  intensityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  intensityButton: {
    width: '18%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  flameIcon: {
    marginBottom: 4,
  },
  intensityLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  submittedContainer: {
    alignItems: 'center',
  },
  submittedText: {
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  resetButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  resetButtonText: {
    fontWeight: '500',
  },
});