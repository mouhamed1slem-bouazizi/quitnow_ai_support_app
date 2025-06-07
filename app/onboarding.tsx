import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DollarSign, User, Cigarette, Clock } from 'lucide-react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function OnboardingScreen() {
  const router = useRouter();
  const { setProfile, setOnboarded } = useUserStore();
  
  const [name, setName] = useState('');
  const [cigarettesPerDay, setCigarettesPerDay] = useState('20');
  const [cigarettePrice, setCigarettePrice] = useState('10');
  const [currency, setCurrency] = useState('USD');
  const [quitDate, setQuitDate] = useState(new Date());
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
  
  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      // Update date while preserving time
      const newDate = new Date(quitDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setQuitDate(newDate);
    }
  };
  
  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedTime) {
      // Update time while preserving date
      const newDate = new Date(quitDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setQuitDate(newDate);
    }
  };
  
  const formatDate = (date: Date) => {
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
  };
  
  const openTimePicker = () => {
    setShowTimePicker(true);
  };
  
  const closePicker = () => {
    setShowDatePicker(false);
    setShowTimePicker(false);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Quit Smoking</Text>
            <Text style={styles.subtitle}>Let's set up your profile to help you on your journey</Text>
          </View>
          
          {step === 1 && (
            <View style={styles.stepContainer}>
              <View style={styles.iconContainer}>
                <User size={32} color={colors.primary} />
              </View>
              <Text style={styles.stepTitle}>What's your name?</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors.inactive}
                autoFocus
              />
              <TouchableOpacity
                style={[styles.button, !name.trim() && styles.buttonDisabled]}
                onPress={nextStep}
                disabled={!name.trim()}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {step === 2 && (
            <View style={styles.stepContainer}>
              <View style={styles.iconContainer}>
                <Cigarette size={32} color={colors.primary} />
              </View>
              <Text style={styles.stepTitle}>How many cigarettes do you smoke daily?</Text>
              <TextInput
                style={styles.input}
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
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button, 
                    styles.buttonSmall,
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
              <View style={styles.iconContainer}>
                <DollarSign size={32} color={colors.primary} />
              </View>
              <Text style={styles.stepTitle}>How much does a pack of cigarettes cost?</Text>
              <View style={styles.priceInputContainer}>
                <TextInput
                  style={styles.priceInput}
                  value={cigarettePrice}
                  onChangeText={setCigarettePrice}
                  placeholder="10.00"
                  placeholderTextColor={colors.inactive}
                  keyboardType="decimal-pad"
                  autoFocus
                />
                <View style={styles.currencySelector}>
                  <Text style={styles.currencyText}>{currency}</Text>
                </View>
              </View>
              <View style={styles.currencyOptions}>
                {['USD', 'EUR', 'GBP', 'JPY', 'AUD'].map((curr) => (
                  <TouchableOpacity
                    key={curr}
                    style={[
                      styles.currencyOption,
                      currency === curr && styles.currencyOptionSelected,
                    ]}
                    onPress={() => setCurrency(curr)}
                  >
                    <Text
                      style={[
                        styles.currencyOptionText,
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
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button, 
                    styles.buttonSmall,
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
              <View style={styles.iconContainer}>
                <Calendar size={32} color={colors.primary} />
              </View>
              <Text style={styles.stepTitle}>When did you quit smoking?</Text>
              
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={openDatePicker}
                >
                  <Calendar size={20} color={colors.primary} style={styles.dateTimeIcon} />
                  <Text style={styles.dateTimeText}>{formatDate(quitDate)}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={openTimePicker}
                >
                  <Clock size={20} color={colors.primary} style={styles.dateTimeIcon} />
                  <Text style={styles.dateTimeText}>{formatTime(quitDate)}</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.dateTimeHint}>
                Set the exact date and time you quit smoking for accurate tracking
              </Text>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={prevStep}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSmall]}
                  onPress={handleComplete}
                >
                  <Text style={styles.buttonText}>Let's Begin</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Date Picker for iOS */}
      {Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={closePicker}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Date</Text>
                <TouchableOpacity onPress={closePicker}>
                  <Text style={styles.pickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                testID="dateTimePicker"
                value={quitDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
                style={styles.iosPicker}
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
          visible={showTimePicker}
          onRequestClose={closePicker}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Time</Text>
                <TouchableOpacity onPress={closePicker}>
                  <Text style={styles.pickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                testID="timeTimePicker"
                value={quitDate}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                style={styles.iosPicker}
              />
            </View>
          </View>
        </Modal>
      )}
      
      {/* Date Picker for Android */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={quitDate}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
      
      {/* Time Picker for Android */}
      {Platform.OS === 'android' && showTimePicker && (
        <DateTimePicker
          testID="timeTimePicker"
          value={quitDate}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  stepContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.inactive,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 24,
  },
  priceInputContainer: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 16,
  },
  priceInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.inactive,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  currencySelector: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: colors.inactive,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
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
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.inactive,
    margin: 4,
  },
  currencyOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  currencyOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  currencyOptionTextSelected: {
    color: 'white',
  },
  button: {
    backgroundColor: colors.primary,
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
    color: colors.primary,
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
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.inactive,
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
    color: colors.text,
  },
  dateTimeHint: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.inactive,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  pickerDone: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  iosPicker: {
    height: 200,
    width: '100%',
  },
});