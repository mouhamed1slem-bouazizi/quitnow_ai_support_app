import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/user-store';
import { useThemeColors } from '@/constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DollarSign, User, Cigarette, Clock } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function OnboardingScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { setProfile, setOnboarded } = useUserStore();
  
  // Set default quit date to yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const [name, setName] = useState('');
  const [cigarettesPerDay, setCigarettesPerDay] = useState('20');
  const [cigarettePrice, setCigarettePrice] = useState('10');
  const [currency, setCurrency] = useState('USD');
  const [quitDate, setQuitDate] = useState(yesterday);
  const [step, setStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const handleComplete = () => {
    setProfile({
      name,
      quitDate: quitDate.toISOString(),
      cigarettesPerDay: parseInt(cigarettesPerDay, 10) || 20,
      cigarettePrice: parseFloat(cigarettePrice) || 10,
      currency,
      goals: [],
      achievements: [],
    });
    
    setOnboarded(true);
    router.replace('/(tabs)');
  };
  
  const nextStep = () => {
    setStep(step + 1);
  };
  
  const prevStep = () => {
    setStep(step - 1);
  };
  
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || quitDate;
    
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      // Create a new date object with the selected date but keep the current time
      const newDate = new Date(quitDate);
      newDate.setFullYear(currentDate.getFullYear());
      newDate.setMonth(currentDate.getMonth());
      newDate.setDate(currentDate.getDate());
      setQuitDate(newDate);
    }
  };
  
  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || quitDate;
    
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedTime) {
      // Create a new date object with the current date but selected time
      const newDate = new Date(quitDate);
      newDate.setHours(currentTime.getHours());
      newDate.setMinutes(currentTime.getMinutes());
      setQuitDate(newDate);
    }
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.primary }]}>Quit Smoking</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Let's set up your profile to help you on your journey</Text>
          </View>
          
          {step === 1 && (
            <View style={styles.stepContainer}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
                <User size={32} color={colors.primary} />
              </View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>What's your name?</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.inactive, color: colors.text }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors.inactive}
                autoFocus
              />
              <TouchableOpacity
                style={[
                  styles.button, 
                  { backgroundColor: colors.primary },
                  !name.trim() && styles.buttonDisabled
                ]}
                onPress={nextStep}
                disabled={!name.trim()}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {step === 2 && (
            <View style={styles.stepContainer}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
                <Cigarette size={32} color={colors.primary} />
              </View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>How many cigarettes do you smoke daily?</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.inactive, color: colors.text }]}
                value={cigarettesPerDay}
                onChangeText={setCigarettesPerDay}
                placeholder="20"
                placeholderTextColor={colors.inactive}
                keyboardType="number-pad"
                autoFocus
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={prevStep}
                >
                  <Text style={[styles.backButtonText, { color: colors.primary }]}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button, 
                    styles.buttonSmall,
                    { backgroundColor: colors.primary },
                    !cigarettesPerDay.trim() && styles.buttonDisabled
                  ]}
                  onPress={nextStep}
                  disabled={!cigarettesPerDay.trim()}
                >
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {step === 3 && (
            <View style={styles.stepContainer}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
                <DollarSign size={32} color={colors.primary} />
              </View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>How much does a pack of cigarettes cost?</Text>
              <View style={styles.priceInputContainer}>
                <TextInput
                  style={[
                    styles.priceInput, 
                    { 
                      backgroundColor: colors.background, 
                      borderColor: colors.inactive, 
                      color: colors.text 
                    }
                  ]}
                  value={cigarettePrice}
                  onChangeText={setCigarettePrice}
                  placeholder="10.00"
                  placeholderTextColor={colors.inactive}
                  keyboardType="decimal-pad"
                  autoFocus
                />
                <View style={[
                  styles.currencySelector, 
                  { 
                    backgroundColor: `${colors.primary}20`,
                    borderColor: colors.inactive
                  }
                ]}>
                  <Text style={[styles.currencyText, { color: colors.text }]}>{currency}</Text>
                </View>
              </View>
              <View style={styles.currencyOptions}>
                {['USD', 'EUR', 'GBP', 'JPY', 'AUD'].map((curr) => (
                  <TouchableOpacity
                    key={curr}
                    style={[
                      styles.currencyOption,
                      { backgroundColor: colors.background, borderColor: colors.inactive },
                      currency === curr && [styles.currencyOptionSelected, { backgroundColor: colors.primary, borderColor: colors.primary }],
                    ]}
                    onPress={() => setCurrency(curr)}
                  >
                    <Text
                      style={[
                        styles.currencyOptionText,
                        { color: colors.text },
                        currency === curr && styles.currencyOptionTextSelected,
                      ]}
                    >
                      {curr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={prevStep}
                >
                  <Text style={[styles.backButtonText, { color: colors.primary }]}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button, 
                    styles.buttonSmall,
                    { backgroundColor: colors.primary },
                    !cigarettePrice.trim() && styles.buttonDisabled
                  ]}
                  onPress={nextStep}
                  disabled={!cigarettePrice.trim()}
                >
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {step === 4 && (
            <View style={styles.stepContainer}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
                <Calendar size={32} color={colors.primary} />
              </View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>When did you quit smoking?</Text>
              
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity 
                  style={[
                    styles.dateTimeButton, 
                    { backgroundColor: colors.background, borderColor: colors.inactive }
                  ]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Calendar size={20} color={colors.primary} style={styles.dateTimeIcon} />
                  <Text style={[styles.dateTimeText, { color: colors.text }]}>{formatDate(quitDate)}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.dateTimeButton, 
                    { backgroundColor: colors.background, borderColor: colors.inactive }
                  ]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Clock size={20} color={colors.primary} style={styles.dateTimeIcon} />
                  <Text style={[styles.dateTimeText, { color: colors.text }]}>{formatTime(quitDate)}</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.dateTimeHint, { color: colors.textSecondary }]}>
                Set the exact date and time you quit smoking for accurate tracking
              </Text>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={prevStep}
                >
                  <Text style={[styles.backButtonText, { color: colors.primary }]}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSmall, { backgroundColor: colors.primary }]}
                  onPress={handleComplete}
                >
                  <Text style={styles.buttonText}>Let's Begin</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={quitDate}
          mode="date"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
      
      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          testID="timeTimePicker"
          value={quitDate}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  stepContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  priceInputContainer: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 16,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  currencySelector: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 0,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  currencyOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  currencyOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    margin: 4,
  },
  currencyOptionSelected: {
  },
  currencyOptionText: {
    fontSize: 14,
  },
  currencyOptionTextSelected: {
    color: 'white',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonSmall: {
    width: 'auto',
    paddingHorizontal: 32,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dateTimeContainer: {
    width: '100%',
    marginBottom: 16,
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
  dateTimeHint: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
});