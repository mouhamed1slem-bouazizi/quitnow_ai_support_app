import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Breathing pattern: inhale, hold, exhale, hold
const BREATHING_PATTERN = [
  { phase: 'inhale', duration: 4000, message: 'Breathe In' },
  { phase: 'hold', duration: 2000, message: 'Hold' },
  { phase: 'exhale', duration: 6000, message: 'Breathe Out' },
  { phase: 'hold', duration: 2000, message: 'Hold' },
];

export default function BreathingGame() {
  const [isActive, setIsActive] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  
  const circleScale = useRef(new Animated.Value(1)).current;
  const circleOpacity = useRef(new Animated.Value(0.3)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { incrementCravingsHandled } = useUserStore();
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    };
  }, []);
  
  // Handle breathing animations
  useEffect(() => {
    if (!isActive) return;
    
    const currentPhase = BREATHING_PATTERN[currentPhaseIndex];
    setTimeLeft(currentPhase.duration / 1000);
    
    // Provide haptic feedback at the start of each phase
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Animate the circle based on the current phase
    if (currentPhase.phase === 'inhale') {
      Animated.parallel([
        Animated.timing(circleScale, {
          toValue: 1.5,
          duration: currentPhase.duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(circleOpacity, {
          toValue: 0.8,
          duration: currentPhase.duration,
          useNativeDriver: Platform.OS !== 'web',
        })
      ]).start();
    } else if (currentPhase.phase === 'exhale') {
      Animated.parallel([
        Animated.timing(circleScale, {
          toValue: 1,
          duration: currentPhase.duration,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(circleOpacity, {
          toValue: 0.3,
          duration: currentPhase.duration,
          useNativeDriver: Platform.OS !== 'web',
        })
      ]).start();
    }
    
    // Set up countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
      
      setTotalTime(prev => prev + 1);
    }, 1000);
    
    // Set up phase transition
    phaseTimerRef.current = setTimeout(() => {
      // Move to next phase
      setCurrentPhaseIndex(prev => {
        const nextIndex = (prev + 1) % BREATHING_PATTERN.length;
        // If we've completed a full cycle
        if (nextIndex === 0) {
          setCompletedCycles(prev => prev + 1);
        }
        return nextIndex;
      });
    }, currentPhase.duration);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    };
  }, [currentPhaseIndex, isActive]);
  
  // Check if we've completed enough cycles to count as a craving handled
  useEffect(() => {
    if (completedCycles >= 3 && isActive && !exerciseCompleted) {
      setExerciseCompleted(true);
      setTimeout(() => {
        incrementCravingsHandled();
      }, 0);
    }
  }, [completedCycles, isActive]);
  
  const startBreathing = () => {
    setIsActive(true);
    setCurrentPhaseIndex(0);
    setCompletedCycles(0);
    setTotalTime(0);
    setExerciseCompleted(false);
    
    // Reset animations
    circleScale.setValue(1);
    circleOpacity.setValue(0.3);
  };
  
  const stopBreathing = () => {
    setIsActive(false);
    
    if (timerRef.current) clearInterval(timerRef.current);
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    
    // Reset animations
    Animated.parallel([
      Animated.timing(circleScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(circleOpacity, {
        toValue: 0.3,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      })
    ]).start();
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const currentPhase = BREATHING_PATTERN[currentPhaseIndex];
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4A90E280', '#4A90E210']}
        style={styles.gradientBackground}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Breathing Exercise</Text>
          {isActive && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Cycles</Text>
                <Text style={styles.statValue}>{completedCycles}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Time</Text>
                <Text style={styles.statValue}>{formatTime(totalTime)}</Text>
              </View>
            </View>
          )}
        </View>
        
        <View style={styles.breathingContainer}>
          <Animated.View
            style={[
              styles.breathingCircle,
              {
                transform: [{ scale: circleScale }],
                opacity: circleOpacity,
              }
            ]}
          >
            <LinearGradient
              colors={[colors.primary, '#4A90E280']}
              style={styles.circleGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>
          
          {isActive && (
            <View style={styles.instructionContainer}>
              <Text style={styles.phaseText}>{currentPhase.message}</Text>
              <Text style={styles.timerText}>{timeLeft}</Text>
            </View>
          )}
          
          {!isActive && (
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                Take a moment to breathe deeply and reduce your craving.
              </Text>
              <Text style={styles.instructionSubtext}>
                Follow the guided breathing pattern to help calm your mind and body.
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.buttonContainer}>
          {!isActive ? (
            <TouchableOpacity
              style={styles.startButton}
              onPress={startBreathing}
            >
              <Text style={styles.buttonText}>Start Breathing</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.stopButton}
              onPress={stopBreathing}
            >
              <Text style={styles.stopButtonText}>Stop</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {isActive && completedCycles >= 3 && (
          <View style={styles.achievementContainer}>
            <LinearGradient
              colors={[colors.success, `${colors.success}80`]}
              style={styles.achievementBanner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.achievementText}>
                Great job! You've completed 3 breathing cycles.
              </Text>
            </LinearGradient>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gradientBackground: {
    padding: 16,
    minHeight: 350,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    position: 'relative',
  },
  breathingCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
  },
  circleGradient: {
    width: '100%',
    height: '100%',
  },
  instructionContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  phaseText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  timerText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
    maxWidth: 250,
  },
  instructionSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 250,
    lineHeight: 20,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stopButton: {
    backgroundColor: colors.danger,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  stopButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  achievementContainer: {
    marginTop: 16,
  },
  achievementBanner: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%',
  },
  achievementText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});