import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { useThemeColors } from '@/constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, User, UserPlus } from 'lucide-react-native';

export default function SignUpScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { signUp, isLoading, error, clearError } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const handleSignUp = async () => {
    // Validate inputs
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    
    try {
      await signUp(email, password, name);
      console.log('Sign up successful, redirecting to onboarding');
      // After successful sign up, the auth store will update and the app will redirect to onboarding
      router.replace('/onboarding');
    } catch (error: any) {
      // Error is already handled in the auth store
      console.log('Sign up error:', error.message);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.primary }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign up to start your smoke-free journey
            </Text>
          </View>
          
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: `${colors.danger}20` }]}>
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
              <TouchableOpacity onPress={clearError} style={styles.dismissButton}>
                <Text style={[styles.dismissText, { color: colors.danger }]}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
                <User size={20} color={colors.primary} />
              </View>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: colors.background, 
                    borderColor: colors.inactive,
                    color: colors.text
                  }
                ]}
                placeholder="Full Name"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
                <Mail size={20} color={colors.primary} />
              </View>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: colors.background, 
                    borderColor: colors.inactive,
                    color: colors.text
                  }
                ]}
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
                <Lock size={20} color={colors.primary} />
              </View>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: colors.background, 
                    borderColor: colors.inactive,
                    color: colors.text
                  }
                ]}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputContainer}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
                <Lock size={20} color={colors.primary} />
              </View>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: colors.background, 
                    borderColor: colors.inactive,
                    color: colors.text
                  }
                ]}
                placeholder="Confirm Password"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
            
            <TouchableOpacity
              style={[
                styles.signUpButton,
                { backgroundColor: colors.primary },
                isLoading && styles.buttonDisabled
              ]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <UserPlus size={20} color="white" style={styles.buttonIcon} />
                  <Text style={styles.signUpButtonText}>Sign Up</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Already have an account?
            </Text>
            <Link href="/auth" asChild>
              <TouchableOpacity>
                <Text style={[styles.signInText, { color: colors.primary }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  dismissButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dismissText: {
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  signUpButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 8,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    marginRight: 4,
  },
  signInText: {
    fontSize: 14,
    fontWeight: '600',
  },
});