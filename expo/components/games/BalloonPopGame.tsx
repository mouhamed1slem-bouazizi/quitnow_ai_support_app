import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const GAME_HEIGHT = 350;
const BALLOON_SIZE = 60;
const BALLOON_COLORS: Array<[string, string]> = [
  ['#FF5252', '#FF1744'], // Red
  ['#536DFE', '#3D5AFE'], // Blue
  ['#4CAF50', '#2E7D32'], // Green
  ['#FFC107', '#FFA000'], // Amber
  ['#9C27B0', '#7B1FA2'], // Purple
];

type Balloon = {
  id: number;
  x: number;
  y: number;
  speed: number;
  color: [string, string]; // Explicitly type as tuple with two strings
  scale: Animated.Value;
  opacity: Animated.Value;
};

export default function BalloonPopGame() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);
  
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const balloonTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const { incrementGamesPlayed, incrementCravingsHandled } = useUserStore();
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (balloonTimerRef.current) clearInterval(balloonTimerRef.current);
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, []);
  
  // Game timer
  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused) {
      gameTimerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Start balloon generation
      startBalloonGeneration();
      
      // Start animation loop
      startAnimationLoop();
    } else if (isPaused) {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (balloonTimerRef.current) clearInterval(balloonTimerRef.current);
      if (animationRef.current) clearInterval(animationRef.current);
    }
    
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (balloonTimerRef.current) clearInterval(balloonTimerRef.current);
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, [gameStarted, gameOver, isPaused]);
  
  // Handle game completion
  useEffect(() => {
    if (gameOver && score > 0) {
      incrementGamesPlayed();
      if (score >= 15) {
        incrementCravingsHandled();
      }
    }
  }, [gameOver, score]);
  
  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setBalloons([]);
    setGameStarted(true);
    setGameOver(false);
    setIsPaused(false);
  };
  
  const pauseGame = () => {
    setIsPaused(!isPaused);
  };
  
  const endGame = () => {
    setGameOver(true);
    
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (balloonTimerRef.current) clearInterval(balloonTimerRef.current);
    if (animationRef.current) clearInterval(animationRef.current);
    
    // Update high score
    if (score > highScore) {
      setHighScore(score);
    }
  };
  
  const startBalloonGeneration = () => {
    if (balloonTimerRef.current) clearInterval(balloonTimerRef.current);
    
    // Generate balloons at random intervals
    balloonTimerRef.current = setInterval(() => {
      if (balloons.length < 10) { // Limit max balloons on screen
        createBalloon();
      }
    }, 800);
  };
  
  const startAnimationLoop = () => {
    if (animationRef.current) clearInterval(animationRef.current);
    
    // Animation loop to move balloons
    animationRef.current = setInterval(() => {
      setBalloons(prevBalloons => {
        return prevBalloons
          .map(balloon => ({
            ...balloon,
            y: balloon.y - balloon.speed,
          }))
          .filter(balloon => balloon.y > -BALLOON_SIZE); // Remove balloons that have gone off screen
      });
    }, 16); // ~60fps
  };
  
  const createBalloon = () => {
    const id = Date.now();
    const x = Math.random() * (width - BALLOON_SIZE - 32); // Account for padding
    const speed = Math.random() * 1 + 1; // Random speed between 1-2
    const colorIndex = Math.floor(Math.random() * BALLOON_COLORS.length);
    
    const newBalloon: Balloon = {
      id,
      x,
      y: GAME_HEIGHT,
      speed,
      color: BALLOON_COLORS[colorIndex],
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1),
    };
    
    setBalloons(prev => [...prev, newBalloon]);
  };
  
  const popBalloon = (id: number) => {
    // Find the balloon
    const balloon = balloons.find(b => b.id === id);
    if (!balloon) return;
    
    // Animate pop
    Animated.parallel([
      Animated.timing(balloon.scale, {
        toValue: 1.5,
        duration: 150,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(balloon.opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
    
    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Update score
    setScore(prev => prev + 1);
    
    // Remove balloon after animation
    setTimeout(() => {
      setBalloons(prev => prev.filter(b => b.id !== id));
    }, 150);
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[`${colors.primary}20`, `${colors.secondary}10`]}
        style={styles.gradientBackground}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Balloon Pop</Text>
          {gameStarted && !gameOver && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Score</Text>
                <Text style={styles.statValue}>{score}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Time</Text>
                <Text style={[
                  styles.statValue,
                  timeLeft <= 10 && styles.warningText
                ]}>
                  {timeLeft}s
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Best</Text>
                <Text style={styles.statValue}>{highScore}</Text>
              </View>
            </View>
          )}
        </View>
        
        {!gameStarted && !gameOver ? (
          <View style={styles.startContainer}>
            <Text style={styles.instructionText}>
              Pop as many balloons as you can!
            </Text>
            <Text style={styles.instructionSubtext}>
              Tap the balloons before they float away. Try to beat your high score!
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={startGame}
            >
              <Text style={styles.buttonText}>Start Game</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {!gameOver ? (
              <>
                <View style={styles.gameArea}>
                  {balloons.map(balloon => (
                    <Animated.View
                      key={balloon.id}
                      style={[
                        styles.balloonContainer,
                        {
                          left: balloon.x,
                          top: balloon.y,
                          transform: [{ scale: balloon.scale }],
                          opacity: balloon.opacity,
                        }
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.balloon}
                        onPress={() => popBalloon(balloon.id)}
                        activeOpacity={0.9}
                      >
                        <LinearGradient
                          colors={balloon.color}
                          style={styles.balloonGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        />
                        <View style={styles.balloonString} />
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>
                
                <TouchableOpacity
                  style={styles.pauseButton}
                  onPress={pauseGame}
                >
                  <Text style={styles.buttonText}>
                    {isPaused ? 'Resume' : 'Pause'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.gameOverContainer}>
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  style={styles.gameOverBanner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.gameOverTitle}>Game Over!</Text>
                </LinearGradient>
                
                <View style={styles.scoreContainer}>
                  <Text style={styles.finalScoreLabel}>Your Score</Text>
                  <Text style={styles.finalScore}>{score}</Text>
                  
                  {score >= 15 && (
                    <View style={styles.achievementContainer}>
                      <Text style={styles.achievementText}>
                        Great job! You've successfully distracted yourself from a craving.
                      </Text>
                    </View>
                  )}
                </View>
                
                <TouchableOpacity
                  style={styles.playAgainButton}
                  onPress={startGame}
                >
                  <Text style={styles.buttonText}>Play Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
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
  warningText: {
    color: colors.danger,
  },
  startContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 280,
    lineHeight: 20,
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
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  gameArea: {
    position: 'relative',
    width: '100%',
    height: GAME_HEIGHT,
    backgroundColor: `${colors.background}80`,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  balloonContainer: {
    position: 'absolute',
    width: BALLOON_SIZE,
    height: BALLOON_SIZE + 20, // Extra for string
  },
  balloon: {
    width: BALLOON_SIZE,
    height: BALLOON_SIZE,
    borderRadius: BALLOON_SIZE / 2,
    overflow: 'hidden',
  },
  balloonGradient: {
    width: '100%',
    height: '100%',
  },
  balloonString: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: '#FFFFFF',
    bottom: -18,
    left: BALLOON_SIZE / 2 - 1,
  },
  pauseButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  gameOverContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  gameOverBanner: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  gameOverTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  finalScoreLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  finalScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
  },
  achievementContainer: {
    backgroundColor: `${colors.success}20`,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    maxWidth: 280,
  },
  achievementText: {
    fontSize: 14,
    color: colors.success,
    textAlign: 'center',
    fontWeight: '500',
  },
  playAgainButton: {
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
});