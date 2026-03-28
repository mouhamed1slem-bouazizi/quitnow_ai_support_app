import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Dimensions, Animated } from 'react-native';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CELL_SIZE = Math.floor((width - 64) / 10); // 10x10 grid
const GRID_SIZE = 10;
const PLAYER_SIZE = CELL_SIZE * 0.8;

// Simple maze generator
const generateMaze = () => {
  // 0 = wall, 1 = path
  const maze = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
  
  // Start with all walls
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      maze[y][x] = 0;
    }
  }
  
  // Create a path from start to end
  const createPath = (x: number, y: number) => {
    maze[y][x] = 1; // Mark as path
    
    // Randomize directions
    const directions = [
      { dx: 0, dy: -1 }, // Up
      { dx: 1, dy: 0 },  // Right
      { dx: 0, dy: 1 },  // Down
      { dx: -1, dy: 0 }, // Left
    ].sort(() => Math.random() - 0.5);
    
    for (const dir of directions) {
      const nx = x + dir.dx * 2;
      const ny = y + dir.dy * 2;
      
      if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && maze[ny][nx] === 0) {
        // Mark the cell between as path
        maze[y + dir.dy][x + dir.dx] = 1;
        createPath(nx, ny);
      }
    }
  };
  
  // Start at top-left
  createPath(1, 1);
  
  // Ensure start and end are paths
  maze[1][1] = 1; // Start
  maze[GRID_SIZE - 2][GRID_SIZE - 2] = 1; // End
  
  // Add some random paths to make it easier
  for (let i = 0; i < 10; i++) {
    const x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
    const y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
    maze[y][x] = 1;
  }
  
  return maze;
};

export default function MazeGame() {
  const [maze, setMaze] = useState<number[][]>([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 1 });
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [moves, setMoves] = useState(0);
  const [isWin, setIsWin] = useState(false);
  
  const playerRef = useRef(new Animated.ValueXY({ x: CELL_SIZE, y: CELL_SIZE })).current;
  const { incrementGamesPlayed, incrementCravingsHandled } = useUserStore();
  
  // Initialize game
  useEffect(() => {
    if (gameStarted && !gameOver) {
      const newMaze = generateMaze();
      setMaze(newMaze);
      setPlayerPosition({ x: 1, y: 1 });
      playerRef.setValue({ x: CELL_SIZE, y: CELL_SIZE });
      setMoves(0);
      setIsWin(false);
    }
  }, [gameStarted, gameOver, level]);
  
  // Check for win condition
  useEffect(() => {
    if (
      gameStarted && 
      !gameOver && 
      playerPosition.x === GRID_SIZE - 2 && 
      playerPosition.y === GRID_SIZE - 2
    ) {
      handleWin();
    }
  }, [playerPosition, gameStarted, gameOver]);
  
  // Handle game completion
  useEffect(() => {
    if (gameOver && isWin && level >= 3) {
      incrementGamesPlayed();
      incrementCravingsHandled();
    }
  }, [gameOver, isWin, level]);
  
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      // Detect swipe direction
      const { dx, dy } = gestureState;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
        // Horizontal swipe
        if (dx > 0) {
          movePlayer('right');
        } else {
          movePlayer('left');
        }
      } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
        // Vertical swipe
        if (dy > 0) {
          movePlayer('down');
        } else {
          movePlayer('up');
        }
      }
    },
    onPanResponderRelease: () => {},
  });
  
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setLevel(1);
  };
  
  const handleWin = () => {
    setIsWin(true);
    setGameOver(true);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  const nextLevel = () => {
    setLevel(prev => prev + 1);
    setGameOver(false);
  };
  
  const movePlayer = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;
    
    let newX = playerPosition.x;
    let newY = playerPosition.y;
    
    switch (direction) {
      case 'up':
        newY = playerPosition.y - 1;
        break;
      case 'down':
        newY = playerPosition.y + 1;
        break;
      case 'left':
        newX = playerPosition.x - 1;
        break;
      case 'right':
        newX = playerPosition.x + 1;
        break;
    }
    
    // Check if the new position is valid (within bounds and not a wall)
    if (
      newX >= 0 && 
      newX < GRID_SIZE && 
      newY >= 0 && 
      newY < GRID_SIZE && 
      maze[newY][newX] === 1
    ) {
      setPlayerPosition({ x: newX, y: newY });
      
      // Animate player movement
      Animated.spring(playerRef, {
        toValue: { x: newX * CELL_SIZE, y: newY * CELL_SIZE },
        useNativeDriver: Platform.OS !== 'web',
        friction: 7,
        tension: 40,
      }).start();
      
      setMoves(prev => prev + 1);
      
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync();
      }
    } else {
      // Hit a wall
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };
  
  const renderMaze = () => {
    if (!maze.length) return null;
    
    const cells = [];
    
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isWall = maze[y][x] === 0;
        const isEnd = x === GRID_SIZE - 2 && y === GRID_SIZE - 2;
        
        cells.push(
          <View
            key={`${x}-${y}`}
            style={[
              styles.cell,
              {
                left: x * CELL_SIZE,
                top: y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: isWall 
                  ? colors.primary 
                  : isEnd 
                    ? colors.success 
                    : colors.background,
              }
            ]}
          />
        );
      }
    }
    
    return cells;
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[`${colors.primary}20`, `${colors.primary}05`]}
        style={styles.gradientBackground}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Maze Runner</Text>
          {gameStarted && !gameOver && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Level</Text>
                <Text style={styles.statValue}>{level}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Moves</Text>
                <Text style={styles.statValue}>{moves}</Text>
              </View>
            </View>
          )}
        </View>
        
        {!gameStarted ? (
          <View style={styles.startContainer}>
            <Text style={styles.instructionText}>
              Navigate through the maze!
            </Text>
            <Text style={styles.instructionSubtext}>
              Find your way from the start (top-left) to the finish (bottom-right). Use swipe gestures or the control buttons.
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
                <View 
                  style={styles.mazeContainer}
                  {...panResponder.panHandlers}
                >
                  {renderMaze()}
                  <Animated.View
                    style={[
                      styles.player,
                      {
                        transform: [
                          { translateX: playerRef.x },
                          { translateY: playerRef.y },
                        ],
                        width: PLAYER_SIZE,
                        height: PLAYER_SIZE,
                        borderRadius: PLAYER_SIZE / 2,
                        marginLeft: (CELL_SIZE - PLAYER_SIZE) / 2,
                        marginTop: (CELL_SIZE - PLAYER_SIZE) / 2,
                      }
                    ]}
                  >
                    <LinearGradient
                      colors={[colors.secondary, `${colors.secondary}80`]}
                      style={styles.playerGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                  </Animated.View>
                </View>
                
                <View style={styles.controlsContainer}>
                  <View style={styles.controlRow}>
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => movePlayer('up')}
                      activeOpacity={0.7}
                    >
                      <ArrowUp size={24} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.controlRow}>
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => movePlayer('left')}
                      activeOpacity={0.7}
                    >
                      <ArrowLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.controlSpacer} />
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => movePlayer('right')}
                      activeOpacity={0.7}
                    >
                      <ArrowRight size={24} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.controlRow}>
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => movePlayer('down')}
                      activeOpacity={0.7}
                    >
                      <ArrowDown size={24} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.gameOverContainer}>
                <LinearGradient
                  colors={[colors.success, `${colors.success}80`]}
                  style={styles.gameOverBanner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.gameOverTitle}>Level Complete!</Text>
                </LinearGradient>
                
                <View style={styles.scoreContainer}>
                  <Text style={styles.finalScoreLabel}>Moves Used</Text>
                  <Text style={styles.finalScore}>{moves}</Text>
                  
                  {level >= 3 && (
                    <View style={styles.achievementContainer}>
                      <Text style={styles.achievementText}>
                        Great job! You've successfully distracted yourself from a craving.
                      </Text>
                    </View>
                  )}
                </View>
                
                {level < 3 ? (
                  <TouchableOpacity
                    style={styles.nextLevelButton}
                    onPress={nextLevel}
                  >
                    <Text style={styles.buttonText}>Next Level</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.playAgainButton}
                    onPress={startGame}
                  >
                    <Text style={styles.buttonText}>Play Again</Text>
                  </TouchableOpacity>
                )}
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
  mazeContainer: {
    width: CELL_SIZE * GRID_SIZE,
    height: CELL_SIZE * GRID_SIZE,
    position: 'relative',
    backgroundColor: colors.background,
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  cell: {
    position: 'absolute',
  },
  player: {
    position: 'absolute',
    overflow: 'hidden',
  },
  playerGradient: {
    width: '100%',
    height: '100%',
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
  nextLevelButton: {
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