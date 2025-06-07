import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { Stack } from 'expo-router';
import { useUserStore } from '@/store/user-store';
import { MoodType } from '@/types/user';
import { useThemeColors } from '@/constants/colors';
import MoodSelector from '@/components/MoodSelector';
import MoodChart from '@/components/MoodChart';
import { getMoodOption } from '@/constants/moods';
import { Trash2 } from 'lucide-react-native';

export default function DiaryScreen() {
  const colors = useThemeColors();
  const [diaryContent, setDiaryContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType>('neutral');
  const inputRef = useRef<TextInput>(null);
  
  const { 
    diaryEntries = [], 
    addDiaryEntry, 
    removeDiaryEntry, 
    recordMood 
  } = useUserStore();
  
  const handleAddEntry = () => {
    if (diaryContent.trim() === '') {
      Alert.alert('Empty Entry', 'Please write something in your diary entry.');
      return;
    }
    
    addDiaryEntry(diaryContent, selectedMood);
    setDiaryContent('');
    setSelectedMood('neutral');
    
    // Dismiss keyboard
    inputRef.current?.blur();
  };
  
  const handleDeleteEntry = (entryId: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this diary entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => removeDiaryEntry(entryId),
          style: 'destructive'
        }
      ]
    );
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen options={{ title: 'My Diary' }} />
      
      <ScrollView style={styles.scrollView}>
        <MoodChart />
        
        <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>New Entry</Text>
          
          <TextInput
            ref={inputRef}
            style={[
              styles.input, 
              { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.inactive
              }
            ]}
            placeholder="How are you feeling today? Write your thoughts..."
            placeholderTextColor={colors.textSecondary}
            multiline
            value={diaryContent}
            onChangeText={setDiaryContent}
          />
          
          <MoodSelector 
            selectedMood={selectedMood}
            onSelectMood={setSelectedMood}
          />
          
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleAddEntry}
          >
            <Text style={styles.addButtonText}>Save Entry</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.entriesContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Diary Entries</Text>
          
          {diaryEntries.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No diary entries yet. Start writing about your journey!
              </Text>
            </View>
          ) : (
            diaryEntries.map(entry => {
              const moodOption = getMoodOption(entry.mood);
              
              return (
                <View 
                  key={entry.id} 
                  style={[styles.entryCard, { backgroundColor: colors.card }]}
                >
                  <View style={styles.entryHeader}>
                    <View style={styles.dateContainer}>
                      <Text style={[styles.entryDate, { color: colors.textSecondary }]}>
                        {formatDate(entry.timestamp)}
                      </Text>
                      <View style={styles.moodContainer}>
                        <View 
                          style={[
                            styles.moodBadge, 
                            { backgroundColor: moodOption.color }
                          ]}
                        >
                          <Text style={styles.moodEmoji}>{moodOption.emoji}</Text>
                          <Text style={styles.moodLabel}>{moodOption.label}</Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteEntry(entry.id)}
                    >
                      <Trash2 size={18} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={[styles.entryContent, { color: colors.text }]}>
                    {entry.content}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 16,
  },
  addButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  entriesContainer: {
    marginBottom: 20,
  },
  emptyState: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    fontSize: 16,
  },
  entryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateContainer: {
    flex: 1,
  },
  entryDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  moodContainer: {
    flexDirection: 'row',
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  moodEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  moodLabel: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
  },
  entryContent: {
    fontSize: 16,
    lineHeight: 24,
  },
});