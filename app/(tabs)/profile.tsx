import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Platform, Switch, useColorScheme, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useUserStore } from '@/store/user-store';
import { useAuthStore } from '@/store/auth-store';
import { useThemeColors } from '@/constants/colors';
import { User, Calendar, DollarSign, Cigarette, LogOut, Save, Clock, Moon, Sun, Smartphone, RefreshCw } from 'lucide-react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { 
    profile, 
    updateProfile, 
    resetProgress, 
    theme, 
    setTheme, 
    syncProfileToFirestore, 
    isSyncing,
    lastSyncTime
  } = useUserStore();
  const { user, signOut, isLoading } = useAuthStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile?.name || "");
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
  
  // Sign out confirmation
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  
  // Update local state when profile changes
  useEffect(() => {
    if (profile) {
      setEditedName(profile.name || "");
      setEditedCigarettesPerDay(profile.cigarettesPerDay?.toString() || '20');
      setEditedCigarettePrice(profile.cigarettePrice?.toString() || '10');
    }
  }, [profile]);
  
  if (!profile) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading profile...</Text>
      </View>
    );
  }
  
  const handleSaveChanges = async () => {
    const updates = {
      name: editedName,
      cigarettesPerDay: parseInt(editedCigarettesPerDay, 10) || 20,
      cigarettePrice: parseFloat(editedCigarettePrice) || 10,
    };
    
    updateProfile(updates);
    
    try {
      // Sync changes to Firestore
      await syncProfileToFirestore();
    } catch (error) {
      console.error('Error syncing profile to Firestore:', error);
      Alert.alert(
        'Sync Error',
        'Your changes were saved locally but could not be synced to the cloud. Please try again later.',
        [{ text: 'OK' }]
      );
    }
    
    setIsEditing(false);
  };
  
  const handleReset = () => {
    setShowResetModal(true);
    // Initialize with yesterday's date
    setResetQuitDate(yesterday);
  };
  
  const confirmReset = async () => {
    resetProgress();
    
    // Set new profile with selected quit date
    const updatedProfile = {
      ...profile,
      quitDate: resetQuitDate.toISOString(),
      goals: [],
      achievements: [],
    };
    
    useUserStore.getState().setProfile(updatedProfile);
    
    try {
      // Sync changes to Firestore
      await syncProfileToFirestore();
    } catch (error) {
      console.error('Error syncing reset profile to Firestore:', error);
      Alert.alert(
        'Sync Error',
        'Your progress was reset locally but could not be synced to the cloud. Please try again later.',
        [{ text: 'OK' }]
      );
    }
    
    setShowResetModal(false);
    router.replace('/(tabs)');
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      // After sign out, the auth store will update and the app will redirect
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };
  
  const handleSyncNow = async () => {
    try {
      const success = await syncProfileToFirestore();
      if (success) {
        Alert.alert('Success', 'Your profile has been synced to the cloud.');
      } else {
        Alert.alert('Sync Error', 'Failed to sync your profile. Please try again later.');
      }
    } catch (error) {
      console.error('Error manually syncing profile:', error);
      Alert.alert('Sync Error', 'Failed to sync your profile. Please try again later.');
    }
  };
  
  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      // Create a new date object with the selected date but keep the current time
      const newDate = new Date(resetQuitDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setResetQuitDate(newDate);
    }
  };
  
  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedTime) {
      // Create a new date object with the current date but selected time
      const newDate = new Date(resetQuitDate);
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
  
  const formatSyncTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const openDatePicker = () => {
    setShowDatePicker(true);
  };
  
  const openTimePicker = () => {
    setShowTimePicker(true);
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
          
          {/* User email from Firebase */}
          {user && (
            <Text style={[styles.emailText, { color: colors.textSecondary }]}>
              {user.email}
            </Text>
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
        
        {/* Cloud Sync Status */}
        <View style={[styles.syncCard, { backgroundColor: colors.card }]}>
          <View style={styles.syncHeader}>
            <Text style={[styles.syncTitle, { color: colors.text }]}>Cloud Sync</Text>
            <TouchableOpacity 
              style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
              onPress={handleSyncNow}
              disabled={isSyncing}
            >
              <RefreshCw size={16} color={colors.primary} style={isSyncing ? styles.syncingIcon : undefined} />
              <Text style={[styles.syncButtonText, { color: colors.primary }]}>
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.syncInfo, { color: colors.textSecondary }]}>
            Last synced: {formatSyncTime(lastSyncTime)}
          </Text>
          <Text style={[styles.syncDescription, { color: colors.textSecondary }]}>
            Your data is automatically synced to the cloud when you make changes.
          </Text>
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
        
        <TouchableOpacity
          style={[styles.signOutButton, { borderColor: colors.textSecondary }]}
          onPress={() => setShowSignOutModal(true)}
          disabled={isLoading}
        >
          <LogOut size={20} color={colors.textSecondary} />
          <Text style={[styles.signOutButtonText, { color: colors.textSecondary }]}>
            {isLoading ? 'Signing Out...' : 'Sign Out'}
          </Text>
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
                <TouchableOpacity 
                  style={[styles.dateTimeButton, { backgroundColor: colors.background, borderColor: colors.inactive }]}
                  onPress={openDatePicker}
                >
                  <Calendar size={20} color={colors.primary} style={styles.dateTimeIcon} />
                  <Text style={[styles.dateTimeText, { color: colors.text }]}>
                    {resetQuitDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.dateTimeButton, { backgroundColor: colors.background, borderColor: colors.inactive }]}
                  onPress={openTimePicker}
                >
                  <Clock size={20} color={colors.primary} style={styles.dateTimeIcon} />
                  <Text style={[styles.dateTimeText, { color: colors.text }]}>
                    {resetQuitDate.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </TouchableOpacity>
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
        
        {/* Sign Out Confirmation Modal */}
        <Modal
          visible={showSignOutModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSignOutModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Sign Out</Text>
              <Text style={[styles.modalText, { color: colors.textSecondary }]}>
                Are you sure you want to sign out of your account?
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowSignOutModal(false)}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.confirmButton, { backgroundColor: colors.textSecondary }]}
                  onPress={() => {
                    setShowSignOutModal(false);
                    handleSignOut();
                  }}
                  disabled={isLoading}
                >
                  <Text style={styles.confirmButtonText}>
                    {isLoading ? 'Signing Out...' : 'Sign Out'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        
        {/* Date Picker for iOS and Android */}
        {showDatePicker && (
          <>
            {Platform.OS === 'ios' ? (
              <Modal
                visible={showDatePicker}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.pickerModalOverlay}>
                  <View style={[styles.pickerModalContent, { backgroundColor: colors.background }]}>
                    <View style={[styles.pickerHeader, { borderBottomColor: colors.inactive }]}>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text style={[styles.pickerCancel, { color: colors.textSecondary }]}>Cancel</Text>
                      </TouchableOpacity>
                      <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Date</Text>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text style={[styles.pickerDone, { color: colors.primary }]}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      testID="dateTimePicker"
                      value={resetQuitDate}
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                      style={styles.picker}
                    />
                  </View>
                </View>
              </Modal>
            ) : (
              <DateTimePicker
                testID="dateTimePicker"
                value={resetQuitDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </>
        )}
        
        {/* Time Picker for iOS and Android */}
        {showTimePicker && (
          <>
            {Platform.OS === 'ios' ? (
              <Modal
                visible={showTimePicker}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.pickerModalOverlay}>
                  <View style={[styles.pickerModalContent, { backgroundColor: colors.background }]}>
                    <View style={[styles.pickerHeader, { borderBottomColor: colors.inactive }]}>
                      <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                        <Text style={[styles.pickerCancel, { color: colors.textSecondary }]}>Cancel</Text>
                      </TouchableOpacity>
                      <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Time</Text>
                      <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                        <Text style={[styles.pickerDone, { color: colors.primary }]}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      testID="timeTimePicker"
                      value={resetQuitDate}
                      mode="time"
                      display="spinner"
                      onChange={handleTimeChange}
                      style={styles.picker}
                    />
                  </View>
                </View>
              </Modal>
            ) : (
              <DateTimePicker
                testID="timeTimePicker"
                value={resetQuitDate}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
          </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
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
  emailText: {
    fontSize: 14,
    marginTop: 4,
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
  syncCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  syncHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  syncTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  syncButtonDisabled: {
    opacity: 0.5,
  },
  syncButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  syncingIcon: {
    transform: [{ rotate: '45deg' }],
  },
  syncInfo: {
    fontSize: 14,
    marginBottom: 8,
  },
  syncDescription: {
    fontSize: 14,
    lineHeight: 20,
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
    marginBottom: 16,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  signOutButtonText: {
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
    paddingBottom: 30,
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
    fontSize: 16,
    fontWeight: '600',
  },
  pickerCancel: {
    fontSize: 16,
  },
  pickerDone: {
    fontSize: 16,
    fontWeight: '600',
  },
  picker: {
    height: 200,
    width: '100%',
  },
});