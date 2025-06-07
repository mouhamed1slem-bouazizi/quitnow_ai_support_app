import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, Alert } from 'react-native';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// List of words related to health and quitting smoking
const WORD_LIST = [
  'HEALTHY', 'BREATHE', 'FREEDOM', 'WELLNESS', 'EXERCISE',
  'STRENGTH', 'VITALITY', 'RECOVERY', 'PROGRESS', 'VICTORY',
  'JOURNEY', 'HEALING', 'CLEANSE', 'RENEWAL', 'OXYGEN',
  'ENERGY', 'LUNGS', 'FRESH', 'CLEAN', 'LIFE'
];

export default function WordScrambleGame() {
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds per game
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [hint, setHint] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<TextInput>(null);
  const scoreAnimation = useRef(new Animated.Value(1)).current;
  
  const { incrementGamesPlayed, incrementCravingsHandled } = useUserStore();
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  
  // Start game timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);
  
  // Handle game over
  useEffect(() => {
    if (gameCompleted) {
      incrementGamesPlayed();
      if (score >= 3) {
        incrementCravingsHandled();
      }
    }
  }, [gameCompleted]);
  
  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setHintsUsed(0);
    setIsPlaying(true);
    setGameOver(false);
    setGameCompleted(false);
    getNewWord();
    
    // Focus the input field
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };
  
  const endGame = () => {
    setIsPlaying(false);
    setGameOver(true);
    setGameCompleted(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
  
  const getNewWord = () => {
    // Get a random word from the list
    const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
    const word = WORD_LIST[randomIndex];
    setCurrentWord(word);
    
    // Scramble the word
    const scrambled = scrambleWord(word);
    setScrambledWord(scrambled);
    
    // Reset user input and hint
    setUserInput('');
    setHint('');
  };
  
  const scrambleWord = (word: string) => {
    const wordArray = word.split('');
    let scrambled = word;
    
    // Make sure the scrambled word is different from the original
    while (scrambled === word) {
      for (let i = wordArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
      }
      scrambled = wordArray.join('');
    }
    
    return scrambled;
  };
  
  const checkAnswer = () => {
    const normalizedInput = userInput.trim().toUpperCase();
    const normalizedWord = currentWord.trim().toUpperCase();
    
    if (normalizedInput === normalizedWord) {
      // Correct answer
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      // Animate score
      Animated.sequence([
        Animated.timing(scoreAnimation, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(scoreAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        })
      ]).start();
      
      // Update score based on hints used
      const pointsEarned = Math.max(1, 3 - hintsUsed);
      setScore(prev => prev + pointsEarned);
      
      // Get a new word
      getNewWord();
    } else {
      // Wrong answer
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      // Shake the input or provide visual feedback
      Alert.alert('Try Again', 'That\'s not the correct word.');
    }
  };
  
  const showHint = () => {
    if (hintsUsed >= 2) {
      // Already showed maximum hints
      return;
    }
    
    const nextHintIndex = hintsUsed;
    let newHint = '';
    
    if (nextHintIndex === 0) {
      // First hint: show first letter
      newHint = `First letter: ${currentWord[0]}`;
    } else if (nextHintIndex === 1) {
      // Second hint: show first and last letters
      newHint = `First letter: ${currentWord[0]}, Last letter: ${currentWord[currentWord.length - 1]}`;
    }
    
    setHint(newHint);
    setHintsUsed(prev => prev + 1);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const skipWord = () => {
    // Penalty for skipping
    setTimeLeft(prev => Math.max(0, prev - 5));
    getNewWord();
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[`${colors.primary}20`, `${colors.secondary}10`]}
        style={styles.gradientBackground}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Word Scramble</Text>
          {isPlaying && (
            <View style={styles.statsRow}>
              <Animated.View 
                style={[
                  styles.statItem, 
                  { transform: [{ scale: scoreAnimation }] }
                ]}
              >
                <Text style={styles.statLabel}>Score</Text>
                <Text style={styles.statValue}>{score}</Text>
              </Animated.View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Time</Text>
                <Text style={[
                  styles.statValue, 
                  timeLeft <= 10 && styles.warningText
                ]}>
                  {timeLeft}s
                </Text>
              </View>
            </View>
          )}
        </View>
        
        {!isPlaying && !gameOver && (
          <View style={styles.startContainer}>
            <Text style={styles.instructionText}>
              Unscramble the words as quickly as you can!
            </Text>
            <Text style={styles.instructionSubtext}>
              You have 60 seconds to solve as many words as possible.
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={startGame}
            >
              <Text style={styles.buttonText}>Start Game</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {isPlaying && (
          <View style={styles.gameContainer}>
            <View style={styles.wordContainer}>
              <Text style={styles.scrambledWord}>{scrambledWord}</Text>
              {hint !== '' && (
                <Text style={styles.hintText}>{hint}</Text>
              )}
            </View>
            
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={userInput}
              onChangeText={setUserInput}
              placeholder="Type your answer"
              placeholderTextColor={colors.inactive}
              autoCapitalize="characters"
              maxLength={currentWord.length}
              onSubmitEditing={checkAnswer}
              returnKeyType="done"
            />
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.hintButton]}
                onPress={showHint}
                disabled={hintsUsed >= 2}
              >
                <Text style={styles.actionButtonText}>
                  Hint ({2 - hintsUsed} left)
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.skipButton]}
                onPress={skipWord}
              >
                <Text style={styles.actionButtonText}>Skip (-5s)</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.submitButton]}
                onPress={checkAnswer}
              >
                <Text style={styles.actionButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {gameOver && (
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
              
              {score >= 3 && (
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
    minWidth: 80,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
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
  gameContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  wordContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scrambledWord: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 4,
    marginBottom: 8,
  },
  hintText: {
    fontSize: 14,
    color: colors.primary,
    fontStyle: 'italic',
  },
  input: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.inactive,
    letterSpacing: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  hintButton: {
    backgroundColor: `${colors.secondary}80`,
  },
  skipButton: {
    backgroundColor: `${colors.danger}80`,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
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