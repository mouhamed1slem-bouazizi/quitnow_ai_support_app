import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const MIN_DELAY = 1000; // 1 second
const MAX_DELAY = 5000; // 5 seconds

export default function ReactionGame() {
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'tapping' | 'results'>('waiting');
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const [startTime, setStartTime] = useState<number | null>(null);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [targetsHit, setTargetsHit] = useState(0);
  const [gameTime, setGameTime] = useState(15); // 15 seconds game
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const targetOpacity = useRef(new Animated.Value(0)).current;
  const targetScale = useRef(new Animated.Value(0.5)).current;
  const { incrementGamesPlayed, incrementCravingsHandled } = useUserStore();
  
  const { width, height } = Dimensions.get('window');
  const TARGET_SIZE = 80;
  
  // Handle countdown
  useEffect(() => {
    if (gameState === 'waiting' && countdown > 0) {
      countdownTimerRef.current = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (gameState === 'waiting' && countdown === 0) {
      startGame();
    }
    
    return () => {
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
      }
    };
  }, [gameState, countdown]);
  
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (gameTimerRef.current) clearTimeout(gameTimerRef.current);
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  }, []);
  
  // Store game state in ref to avoid issues with state updates during render
  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);
  
  // Update achievements when game ends
  useEffect(() => {
    if (gameCompleted) {
      incrementGamesPlayed();
      incrementCravingsHandled();
    }
  }, [gameCompleted]);
  
  const startGame = () => {
    setGameState('ready');
    setTargetsHit(0);
    setGameTime(15);
    
    // Start game timer
    gameTimerRef.current = setInterval(() => {
      setGameTime(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    showTarget();
  };
  
  const showTarget = () => {
    // Calculate random position within visible area
    const maxX = width - TARGET_SIZE - 32; // Account for padding
    const maxY = height / 2 - TARGET_SIZE - 32; // Use half the screen height
    
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);
    
    setTargetPosition({ x: randomX, y: randomY });
    setGameState('tapping');
    setStartTime(Date.now());
    
    // Animate target appearance
    targetOpacity.setValue(0);
    targetScale.setValue(0.5);
    
    Animated.parallel([
      Animated.timing(targetOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(targetScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: Platform.OS !== 'web',
      })
    ]).start();
  };
  
  const handleTargetPress = () => {
    if (gameState !== 'tapping') return;
    
    const endTime = Date.now();
    const time = startTime ? endTime - startTime : 0;
    setReactionTime(time);
    
    // Update best time
    if (bestTime === null || time < bestTime) {
      setBestTime(time);
    }
    
    setTargetsHit(prev => prev + 1);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Animate target disappearance
    Animated.parallel([
      Animated.timing(targetOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(targetScale, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
      })
    ]).start();
    
    // Show next target after a short delay
    setGameState('ready');
    timerRef.current = setTimeout(showTarget, Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY);
  };
  
  const endGame = () => {
    setGameState('results');
    setGameCompleted(true);
    
    if (timerRef.current) clearTimeout(timerRef.current);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
  };
  
  const resetGame = () => {
    setGameState('waiting');
    setCountdown(3);
    setReactionTime(null);
    setTargetsHit(0);
    setGameCompleted(false);
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[`${colors.secondary}20`, `${colors.secondary}05`]}
        style={styles.gradientBackground}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Reaction Game</Text>
          {gameState !== 'results' && gameState !== 'waiting' && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Targets</Text>
                <Text style={styles.statValue}>{targetsHit}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Time</Text>
                <Text style={styles.statValue}>{gameTime}s</Text>
              </View>
              {reactionTime && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Last</Text>
                  <Text style={styles.statValue}>{reactionTime}ms</Text>
                </View>
              )}
            </View>
          )}
        </View>
        
        {gameState === 'waiting' && (
          <View style={styles.countdownContainer}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.countdownCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.countdownNumber}>{countdown}</Text>
            </LinearGradient>
            <Text style={styles.countdownText}>Starting in</Text>
            <Text style={styles.instructions}>
              Tap the circles as quickly as you can when they appear!
            </Text>
          </View>
        )}
        
        {(gameState === 'tapping' || gameState === 'ready') && (
          <View style={styles.gameArea}>
            {gameState === 'tapping' && (
              <Animated.View
                style={[
                  styles.targetContainer,
                  {
                    left: targetPosition.x,
                    top: targetPosition.y,
                    opacity: targetOpacity,
                    transform: [{ scale: targetScale }]
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.target}
                  onPress={handleTargetPress}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    style={styles.targetGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        )}
        
        {gameState === 'results' && (
          <View style={styles.resultsContainer}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.resultsBanner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.resultsTitle}>Game Over!</Text>
            </LinearGradient>
            
            <View style={styles.resultsStats}>
              <View style={styles.resultStatItem}>
                <Text style={styles.resultStatLabel}>Targets Hit</Text>
                <Text style={styles.resultStatValue}>{targetsHit}</Text>
              </View>
              
              {reactionTime && (
                <View style={styles.resultStatItem}>
                  <Text style={styles.resultStatLabel}>Last Reaction</Text>
                  <Text style={styles.resultStatValue}>{reactionTime}ms</Text>
                </View>
              )}
              
              {bestTime && (
                <View style={styles.resultStatItem}>
                  <Text style={styles.resultStatLabel}>Best Time</Text>
                  <Text style={styles.resultStatValue}>{bestTime}ms</Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetGame}
            >
              <Text style={styles.resetButtonText}>Play Again</Text>
            </TouchableOpacity>
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
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    minWidth: 70,
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
  gameArea: {
    position: 'relative',
    width: '100%',
    height: 250,
  },
  targetContainer: {
    position: 'absolute',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  target: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  targetGradient: {
    width: '100%',
    height: '100%',
  },
  countdownContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
  },
  countdownCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  countdownText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 8,
  },
  countdownNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  instructions: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    lineHeight: 20,
  },
  resultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  resultsBanner: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  resultsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  resultStatItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  resultStatLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  resultStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  resetButton: {
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
  resetButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});