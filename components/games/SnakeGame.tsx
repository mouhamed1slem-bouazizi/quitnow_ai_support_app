import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react-native';

// Game constants
const GRID_SIZE = 15;
const CELL_SIZE = 20;
const GAME_SPEED = 150; // milliseconds per move
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

type Position = {
  x: number;
  y: number;
};

type Direction = typeof DIRECTIONS.UP | typeof DIRECTIONS.DOWN | typeof DIRECTIONS.LEFT | typeof DIRECTIONS.RIGHT;

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>(DIRECTIONS.RIGHT);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const nextDirectionRef = useRef<Direction>(DIRECTIONS.RIGHT);
  const { incrementGamesPlayed, incrementCravingsHandled } = useUserStore();
  
  // Initialize game
  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused) {
      startGameLoop();
    } else if (isPaused && gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, isPaused]);
  
  // Handle game completion
  useEffect(() => {
    if (gameOver && score > 5) {
      incrementGamesPlayed();
      incrementCravingsHandled();
    }
  }, [gameOver, score]);
  
  const startGame = () => {
    // Reset game state
    setSnake([{ x: 7, y: 7 }]);
    placeFood();
    setDirection(DIRECTIONS.RIGHT);
    nextDirectionRef.current = DIRECTIONS.RIGHT;
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    setGameStarted(true);
  };
  
  const startGameLoop = () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    
    gameLoopRef.current = setInterval(() => {
      moveSnake();
    }, GAME_SPEED);
  };
  
  const pauseGame = () => {
    setIsPaused(!isPaused);
  };
  
  const placeFood = () => {
    // Generate random position for food
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    
    // Make sure food doesn't appear on snake
    const isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    
    if (isOnSnake) {
      placeFood(); // Try again
    } else {
      setFood(newFood);
    }
  };
  
  const moveSnake = () => {
    // Update direction from the ref
    setDirection(nextDirectionRef.current);
    
    setSnake(prevSnake => {
      // Calculate new head position using the current direction
      const head = prevSnake[0];
      const newHead = {
        x: head.x + nextDirectionRef.current.x,
        y: head.y + nextDirectionRef.current.y,
      };
      
      // Check for collisions
      if (
        // Wall collision
        newHead.x < 0 || newHead.x >= GRID_SIZE ||
        newHead.y < 0 || newHead.y >= GRID_SIZE ||
        // Self collision
        prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
      ) {
        endGame();
        return prevSnake;
      }
      
      // Check if snake ate food
      const ateFood = newHead.x === food.x && newHead.y === food.y;
      
      if (ateFood) {
        // Grow snake
        const newSnake = [newHead, ...prevSnake];
        
        // Place new food
        placeFood();
        
        // Update score
        setScore(prev => {
          const newScore = prev + 1;
          if (newScore > highScore) {
            setHighScore(newScore);
          }
          return newScore;
        });
        
        // Haptic feedback
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        
        return newSnake;
      } else {
        // Move snake (remove tail)
        const newSnake = [newHead, ...prevSnake.slice(0, -1)];
        return newSnake;
      }
    });
  };
  
  const endGame = () => {
    setGameOver(true);
    
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };
  
  const changeDirection = (newDirection: Direction) => {
    // Prevent 180-degree turns
    const isOpposite = (
      (nextDirectionRef.current === DIRECTIONS.UP && newDirection === DIRECTIONS.DOWN) ||
      (nextDirectionRef.current === DIRECTIONS.DOWN && newDirection === DIRECTIONS.UP) ||
      (nextDirectionRef.current === DIRECTIONS.LEFT && newDirection === DIRECTIONS.RIGHT) ||
      (nextDirectionRef.current === DIRECTIONS.RIGHT && newDirection === DIRECTIONS.LEFT)
    );
    
    if (!isOpposite) {
      nextDirectionRef.current = newDirection;
      
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync();
      }
    }
  };
  
  const renderGrid = () => {
    const grid = [];
    
    // Create grid cells
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isSnake = snake.some(segment => segment.x === x && segment.y === y);
        const isHead = snake[0].x === x && snake[0].y === y;
        const isFood = food.x === x && food.y === y;
        
        let cellStyle = [styles.cell];
        
        if (isSnake) {
          cellStyle = isHead ? [styles.cell, styles.snakeHead] : [styles.cell, styles.snakeCell];
        } else if (isFood) {
          cellStyle = [styles.cell, styles.foodCell];
        }
        
        grid.push(
          <View 
            key={`${x}-${y}`} 
            style={[
              ...cellStyle,
              {
                left: x * CELL_SIZE,
                top: y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
              }
            ]} 
          />
        );
      }
    }
    
    return grid;
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[`${colors.primary}20`, `${colors.secondary}10`]}
        style={styles.gradientBackground}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Snake Game</Text>
          {gameStarted && !gameOver && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Score</Text>
                <Text style={styles.statValue}>{score}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>High Score</Text>
                <Text style={styles.statValue}>{highScore}</Text>
              </View>
            </View>
          )}
        </View>
        
        {!gameStarted ? (
          <View style={styles.startContainer}>
            <Text style={styles.instructionText}>
              Classic Snake Game
            </Text>
            <Text style={styles.instructionSubtext}>
              Control the snake to eat the food and grow longer. Avoid hitting the walls or yourself!
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
            <View style={[
              styles.gameBoard,
              { width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }
            ]}>
              {renderGrid()}
            </View>
            
            {!gameOver ? (
              <>
                <View style={styles.controlsContainer}>
                  <View style={styles.controlRow}>
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => changeDirection(DIRECTIONS.UP)}
                      activeOpacity={0.7}
                    >
                      <ArrowUp size={24} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.controlRow}>
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => changeDirection(DIRECTIONS.LEFT)}
                      activeOpacity={0.7}
                    >
                      <ArrowLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.controlSpacer} />
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => changeDirection(DIRECTIONS.RIGHT)}
                      activeOpacity={0.7}
                    >
                      <ArrowRight size={24} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.controlRow}>
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => changeDirection(DIRECTIONS.DOWN)}
                      activeOpacity={0.7}
                    >
                      <ArrowDown size={24} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.pauseButton}
                    onPress={pauseGame}
                  >
                    <Text style={styles.buttonText}>
                      {isPaused ? 'Resume' : 'Pause'}
                    </Text>
                  </TouchableOpacity>
                </View>
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
                  
                  {score > 5 && (
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
  gameBoard: {
    backgroundColor: colors.background,
    borderRadius: 8,
    position: 'relative',
    alignSelf: 'center',
    marginVertical: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  cell: {
    position: 'absolute',
    borderRadius: 2,
  },
  snakeCell: {
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  snakeHead: {
    backgroundColor: colors.secondary,
    borderRadius: 6,
  },
  foodCell: {
    backgroundColor: colors.danger,
    borderRadius: 10,
  },
  controlsContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 4,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${colors.primary}30`,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  controlSpacer: {
    width: 50,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  pauseButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
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