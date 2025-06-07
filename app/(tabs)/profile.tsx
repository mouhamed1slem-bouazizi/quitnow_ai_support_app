import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Platform, Switch, useColorScheme, Pressable, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useUserStore } from '@/store/user-store';
import { useThemeColors } from '@/constants/colors';
import { User, Calendar, DollarSign, Cigarette, LogOut, Save, Clock, Moon, Sun, Smartphone } from 'lucide-react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { profile, updateProfile, resetProgress, theme, setTheme } = useUserStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile?.name || '');
  const [editedCigarettesPerDay, setEditedCigarettesPerDay] = useState(
    profile?.cigarettesPerDay?.toString() || '20'
  );
  const [editedCigarettePrice, setEditedCigarettePrice] = useState(
    profile?.cigarettePrice?.toString() || '10'
  );
  
  // Reset date selection
  const [showResetModal, setShowResetModal] = useState(false);
  // Set default reset date to yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const [resetQuitDate, setResetQuitDate] = useState(yesterday);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  if (!profile) return null;
  
  const handleSaveChanges = () => {
    updateProfile({
      name: editedName,
      cigarettesPerDay: parseInt(editedCigarettesPerDay, 10) || 20,
      cigarettePrice: parseFloat(editedCigarettePrice) || 10,
    });
    
    setIsEditing(false);
  };
  
  const handleReset = () => {
    setShowResetModal(true);
    // Initialize with yesterday's date
    setResetQuitDate(yesterday);
  };
  
  const confirmReset = () => {
    resetProgress();
    
    // Set new profile with selected quit date
    useUserStore.getState().setProfile({
      name: profile.name,
      quitDate: resetQuitDate.toISOString(),
      cigarettesPerDay: profile.cigarettesPerDay,
      cigarettePrice: profile.cigarettePrice,
      currency: profile.currency,
      goals: [],
      achievements: [],
    });
    
    setShowResetModal(false);
    router.replace('/(tabs)');
  };
  
  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // Close the picker for Android
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    // Only update if a date was actually selected
    if (selectedDate && event.type === 'set') {
      // Create a new date object to avoid reference issues
      const newDate = new Date(resetQuitDate.getTime());
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setResetQuitDate(newDate);
    }
  };
  
  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    // Close the picker for Android
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    // Only update if a time was actually selected
    if (selectedTime && event.type === 'set') {
      // Create a new date object to avoid reference issues
      const newDate = new Date(resetQuitDate.getTime());
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setResetQuitDate(newDate);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const openDatePicker = () => {
    setShowDatePicker(true);
    setShowTimePicker(false);
  };
  
  const openTimePicker = () => {
    setShowTimePicker(true);
    setShowDatePicker(false);
  };
  
  const closePicker = () => {
    setShowDatePicker(false);
    setShowTimePicker(false);
  };
  
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Your Profile',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => setIsEditing(!isEditing)}
              style={styles.editButton}
            >
              <Text style={[styles.editButtonText, { color: colors.primary }]}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {profile.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          {!isEditing ? (
            <Text style={[styles.nameText, { color: colors.text }]}>{profile.name}</Text>
          ) : (
            <TextInput
              style={[styles.nameInput, { color: colors.text, borderBottomColor: colors.primary }]}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Your name"
              placeholderTextColor={colors.inactive}
            />
          )}
        </View>
        
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <View style={styles.infoItem}>
            <View style={[styles.infoIconContainer, { backgroundColor: `${colors.primary}20` }]}>
              <Calendar size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Quit Date</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{formatDate(profile.quitDate)}</Text>
            </View>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.progressBackground }]} />
          
          <View style={styles.infoItem}>
            <View style={[styles.infoIconContainer, { backgroundColor: `${colors.primary}20` }]}>
              <Cigarette size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Cigarettes Per Day</Text>
              {!isEditing ? (
                <Text style={[styles.infoValue, { color: colors.text }]}>{profile.cigarettesPerDay}</Text>
              ) : (
                <TextInput
                  style={[styles.infoInput, { color: colors.text, borderBottomColor: colors.primary }]}
                  value={editedCigarettesPerDay}
                  onChangeText={setEditedCigarettesPerDay}
                  keyboardType="number-pad"
                  placeholder="20"
                  placeholderTextColor={colors.inactive}
                />
              )}
            </View>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.progressBackground }]} />
          
          <View style={styles.infoItem}>
            <View style={[styles.infoIconContainer, { backgroundColor: `${colors.primary}20` }]}>
              <DollarSign size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Pack Price</Text>
              {!isEditing ? (
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {profile.cigarettePrice} {profile.currency}
                </Text>
              ) : (
                <View style={styles.priceInputContainer}>
                  <TextInput
                    style={[styles.priceInput, { color: colors.text, borderBottomColor: colors.primary }]}
                    value={editedCigarettePrice}
                    onChangeText={setEditedCigarettePrice}
                    keyboardType="decimal-pad"
                    placeholder="10.00"
                    placeholderTextColor={colors.inactive}
                  />
                  <Text style={[styles.currencyText, { color: colors.text }]}>{profile.currency}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        {/* Theme Selection */}
        <View style={[styles.themeCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.themeTitle, { color: colors.text }]}>Appearance</Text>
          
          <TouchableOpacity 
            style={[
              styles.themeOption, 
              theme === 'light' && [styles.selectedThemeOption, { backgroundColor: `${colors.primary}20` }]
            ]}
            onPress={() => setTheme('light')}
          >
            <Sun size={20} color={theme === 'light' ? colors.primary : colors.textSecondary} />
            <Text style={[
              styles.themeText,
              { color: colors.text },
              theme === 'light' && [styles.selectedThemeText, { color: colors.primary }]
            ]}>
              Light
            </Text>
            {theme === 'light' && (
              <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.themeOption, 
              theme === 'dark' && [styles.selectedThemeOption, { backgroundColor: `${colors.primary}20` }]
            ]}
            onPress={() => setTheme('dark')}
          >
            <Moon size={20} color={theme === 'dark' ? colors.primary : colors.textSecondary} />
            <Text style={[
              styles.themeText,
              { color: colors.text },
              theme === 'dark' && [styles.selectedThemeText, { color: colors.primary }]
            ]}>
              Dark
            </Text>
            {theme === 'dark' && (
              <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.themeOption, 
              theme === 'system' && [styles.selectedThemeOption, { backgroundColor: `${colors.primary}20` }]
            ]}
            onPress={() => setTheme('system')}
          >
            <Smartphone size={20} color={theme === 'system' ? colors.primary : colors.textSecondary} />
            <Text style={[
              styles.themeText,
              { color: colors.text },
              theme === 'system' && [styles.selectedThemeText, { color: colors.primary }]
            ]}>
              System
            </Text>
            {theme === 'system' && (
              <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
            )}
          </TouchableOpacity>
        </View>
        
        {isEditing && (
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSaveChanges}
          >
            <Save size={20} color="white" />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.resetButton, { borderColor: colors.danger }]}
          onPress={handleReset}
        >
          <LogOut size={20} color={colors.danger} />
          <Text style={[styles.resetButtonText, { color: colors.danger }]}>Reset Progress</Text>
        </TouchableOpacity>
        
        <View style={styles.spacer} />
        
        {/* Reset Confirmation Modal */}
        <Modal
          visible={showResetModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowResetModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Reset Progress</Text>
              <Text style={[styles.modalText, { color: colors.textSecondary }]}>
                This will reset all your progress. Please select your new quit date and time:
              </Text>
              
              <View style={styles.dateTimeContainer}>
                <Pressable 
                  style={[styles.dateTimeButton, { backgroundColor: colors.background, borderColor: colors.inactive }]}
                  onPress={openDatePicker}
                >
                  <Calendar size={20} color={colors.primary} style={styles.dateTimeIcon} />
                  <Text style={[styles.dateTimeText, { color: colors.text }]}>{formatDate(resetQuitDate.toISOString())}</Text>
                </Pressable>
                
                <Pressable 
                  style={[styles.dateTimeButton, { backgroundColor: colors.background, borderColor: colors.inactive }]}
                  onPress={openTimePicker}
                >
                  <Clock size={20} color={colors.primary} style={styles.dateTimeIcon} />
                  <Text style={[styles.dateTimeText, { color: colors.text }]}>{formatTime(resetQuitDate)}</Text>
                </Pressable>
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowResetModal(false);
                    setShowDatePicker(false);
                    setShowTimePicker(false);
                  }}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.confirmButton, { backgroundColor: colors.danger }]}
                  onPress={confirmReset}
                >
                  <Text style={styles.confirmButtonText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        
        {/* Date Picker for iOS */}
        {Platform.OS === 'ios' && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showDatePicker && showResetModal}
            onRequestClose={closePicker}
          >
            <View style={styles.pickerModalOverlay}>
              <View style={[styles.pickerModalContent, { backgroundColor: colors.background }]}>
                <View style={[styles.pickerHeader, { borderBottomColor: colors.inactive }]}>
                  <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Date</Text>
                  <TouchableOpacity onPress={closePicker}>
                    <Text style={[styles.pickerDone, { color: colors.primary }]}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  testID="dateTimePicker"
                  value={resetQuitDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  style={styles.iosPicker}
                  maximumDate={new Date()}
                  themeVariant={colors.theme === 'dark' ? 'dark' : 'light'}
                />
              </View>
            </View>
          </Modal>
        )}
        
        {/* Time Picker for iOS */}
        {Platform.OS === 'ios' && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showTimePicker && showResetModal}
            onRequestClose={closePicker}
          >
            <View style={styles.pickerModalOverlay}>
              <View style={[styles.pickerModalContent, { backgroundColor: colors.background }]}>
                <View style={[styles.pickerHeader, { borderBottomColor: colors.inactive }]}>
                  <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Time</Text>
                  <TouchableOpacity onPress={closePicker}>
                    <Text style={[styles.pickerDone, { color: colors.primary }]}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  testID="timeTimePicker"
                  value={resetQuitDate}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                  style={styles.iosPicker}
                  themeVariant={colors.theme === 'dark' ? 'dark' : 'light'}
                />
              </View>
            </View>
          </Modal>
        )}
        
        {/* Date Picker for Android */}
        {Platform.OS === 'android' && showDatePicker && showResetModal && (
          <DateTimePicker
            testID="dateTimePicker"
            value={resetQuitDate}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
        
        {/* Time Picker for Android */}
        {Platform.OS === 'android' && showTimePicker && showResetModal && (
          <DateTimePicker
            testID="timeTimePicker"
            value={resetQuitDate}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '600',
  },
  nameInput: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    borderBottomWidth: 1,
    paddingBottom: 4,
    minWidth: 150,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoInput: {
    fontSize: 16,
    borderBottomWidth: 1,
    paddingVertical: 4,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    fontSize: 16,
    borderBottomWidth: 1,
    paddingVertical: 4,
    marginRight: 8,
    minWidth: 60,
  },
  currencyText: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  themeCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  themeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  selectedThemeOption: {
  },
  themeText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  selectedThemeText: {
    fontWeight: '500',
  },
  selectedIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  spacer: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  dateTimeContainer: {
    width: '100%',
    marginBottom: 20,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  dateTimeIcon: {
    marginRight: 12,
  },
  dateTimeText: {
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerModalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 40,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  pickerDone: {
    fontSize: 16,
    fontWeight: '500',
  },
  iosPicker: {
    height: 200,
    width: '100%',
  },
});