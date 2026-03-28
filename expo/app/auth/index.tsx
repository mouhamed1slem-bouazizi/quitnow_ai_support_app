import React, { useState, useEffect } from 'react';
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
import { Mail, Lock, LogIn } from 'lucide-react-native';

export default function SignInScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { signIn, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Monitor authentication state and redirect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to home');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, router]);
  
  const handleSignIn = async () => {
    // Clear any previous errors
    clearError();
    setLocalError(null);
    
    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both email and password');
      return;
    }
    
    try {
      console.log('Attempting to sign in with:', email);
      await signIn(email, password);
      console.log('Sign in successful');
      // The useEffect above will handle redirection
    } catch (error: any) {
      console.error('Sign in error:', error.message);
      // Local error handling for UI feedback
      setLocalError(error.message || 'Failed to sign in. Please try again.');
    }
  };
  
  // Display either the store error or local error
  const displayError = error || localError;
  
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
            <Text style={[styles.title, { color: colors.primary }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign in to continue your smoke-free journey
            </Text>
          </View>
          
          {displayError && (
            <View style={[styles.errorContainer, { backgroundColor: `${colors.danger}20` }]}>
              <Text style={[styles.errorText, { color: colors.danger }]}>{displayError}</Text>
              <TouchableOpacity 
                onPress={() => {
                  clearError();
                  setLocalError(null);
                }} 
                style={styles.dismissButton}
              >
                <Text style={[styles.dismissText, { color: colors.danger }]}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.form}>
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
                testID="email-input"
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
                testID="password-input"
              />
            </View>
            
            <Link href="/auth/forgot-password" asChild>
              <TouchableOpacity style={styles.forgotPasswordContainer}>
                <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </Link>
            
            <TouchableOpacity
              style={[
                styles.signInButton,
                { backgroundColor: colors.primary },
                isLoading && styles.buttonDisabled
              ]}
              onPress={handleSignIn}
              disabled={isLoading}
              testID="sign-in-button"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <LogIn size={20} color="white" style={styles.buttonIcon} />
                  <Text style={styles.signInButtonText}>Sign In</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Don't have an account?
            </Text>
            <Link href="/auth/sign-up" asChild>
              <TouchableOpacity>
                <Text style={[styles.signUpText, { color: colors.primary }]}>
                  Sign Up
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  signInButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 8,
  },
  signInButtonText: {
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
  signUpText: {
    fontSize: 14,
    fontWeight: '600',
  },
});