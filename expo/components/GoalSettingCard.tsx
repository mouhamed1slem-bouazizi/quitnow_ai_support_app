import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import { useThemeColors } from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { Target, Plus, X } from 'lucide-react-native';

export default function GoalSettingCard() {
  const colors = useThemeColors();
  const { addGoal, profile } = useUserStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDays, setGoalDays] = useState('');

  const handleAddGoal = () => {
    if (!goalTitle.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    const days = parseInt(goalDays, 10);
    if (isNaN(days) || days <= 0) {
      Alert.alert('Error', 'Please enter a valid number of days');
      return;
    }

    addGoal({
      title: goalTitle,
      targetDays: days,
    });

    setModalVisible(false);
    setGoalTitle('');
    setGoalDays('');
  };

  return (
    <>
      <TouchableOpacity 
        style={[styles.container, { backgroundColor: colors.card }]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
            <Target size={24} color={colors.primary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Set a Personal Goal</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Create custom goals to stay motivated on your journey
            </Text>
          </View>
          <View style={[styles.addButton, { backgroundColor: colors.primary }]}>
            <Plus size={20} color="white" />
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Set a New Goal</Text>
              <TouchableOpacity 
                style={[styles.closeButton, { backgroundColor: `${colors.textSecondary}20` }]}
                onPress={() => setModalVisible(false)}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: colors.text }]}>What's your goal?</Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.inactive
                }
              ]}
              placeholder="e.g., Run 5km without getting winded"
              placeholderTextColor={colors.inactive}
              value={goalTitle}
              onChangeText={setGoalTitle}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Target (days from now)</Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.inactive
                }
              ]}
              placeholder="e.g., 30"
              placeholderTextColor={colors.inactive}
              keyboardType="number-pad"
              value={goalDays}
              onChangeText={setGoalDays}
            />

            <TouchableOpacity 
              style={[styles.addGoalButton, { backgroundColor: colors.primary }]}
              onPress={handleAddGoal}
            >
              <Text style={styles.addGoalButtonText}>Add Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  addGoalButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addGoalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});