import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Stack } from 'expo-router';
import { useUserStore } from '@/store/user-store';
import { MoodType } from '@/types/user';
import { useThemeColors } from '@/constants/colors';
import MoodSelector from '@/components/MoodSelector';
import MoodChart from '@/components/MoodChart';
import { getMoodOption } from '@/constants/moods';
import { Trash2, RefreshCw } from 'lucide-react-native';

export default function DiaryScreen() {
  const colors = useThemeColors();
  const [diaryContent, setDiaryContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType>('neutral');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const inputRef = useRef<TextInput>(null);
  
  // Ensure we always have an array, even if diaryEntries is undefined
  const diaryEntries = useUserStore(state => state.diaryEntries || []);
  const addDiaryEntry = useUserStore(state => state.addDiaryEntry);
  const removeDiaryEntry = useUserStore(state => state.removeDiaryEntry);
  const loadFromFirestore = useUserStore(state => state.loadFromFirestore);
  const isLoading = useUserStore(state => state.isLoading);
  const error = useUserStore(state => state.error);
  const setError = useUserStore(state => state.setError);
  
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
  
  const handleRefreshEntries = async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      await loadFromFirestore();
    } catch (error: any) {
      Alert.alert('Error', `Failed to refresh diary entries: ${error.message}`);
    } finally {
      setIsRefreshing(false);
    }
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
      <Stack.Screen options={{ 
        title: 'My Diary',
        headerRight: () => (
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefreshEntries}
            disabled={isRefreshing || isLoading}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <RefreshCw size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        ),
      }} />
      
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
          <View style={styles.entriesHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Diary Entries</Text>
            
            {isLoading && !isRefreshing && (
              <ActivityIndicator size="small" color={colors.primary} />
            )}
          </View>
          
          {error && (
            <Text style={[styles.errorText, { color: colors.danger }]}>
              {error}
            </Text>
          )}
          
          {diaryEntries.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No diary entries yet. Start writing about your journey!
              </Text>
            </View>
          ) : (
            diaryEntries.map(entry => {
              // Safely get mood option with fallback to neutral if undefined
              const moodOption = getMoodOption(entry.mood || 'neutral');
              
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
                            { backgroundColor: moodOption?.color || '#A9A9A9' }
                          ]}
                        >
                          <Text style={styles.moodEmoji}>{moodOption?.emoji || '😐'}</Text>
                          <Text style={styles.moodLabel}>{moodOption?.label || 'Neutral'}</Text>
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
  entriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    padding: 8,
  },
  errorText: {
    marginBottom: 16,
    fontSize: 14,
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