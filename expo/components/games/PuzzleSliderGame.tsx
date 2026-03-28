import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const BOARD_SIZE = 4; // 4x4 grid
const TILE_SIZE = Math.floor((width - 64) / BOARD_SIZE);
const TILE_MARGIN = 2;

type Tile = {
  id: number;
  value: number;
  position: number;
  x: Animated.Value;
  y: Animated.Value;
};

export default function PuzzleSliderGame() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [emptyPosition, setEmptyPosition] = useState(BOARD_SIZE * BOARD_SIZE - 1);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  
  const { incrementGamesPlayed, incrementCravingsHandled } = useUserStore();
  
  // Initialize game
  useEffect(() => {
    if (gameStarted && !gameOver) {
      initializeGame();
    }
  }, [gameStarted, gameOver, difficulty]);
  
  // Check for win condition
  useEffect(() => {
    if (gameStarted && !gameOver && tiles.length > 0) {
      const solved = tiles.every(tile => tile.value === tile.position || tile.value === BOARD_SIZE * BOARD_SIZE - 1);
      
      if (solved && !isSolved) {
        setIsSolved(true);
        setGameOver(true);
        
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        incrementGamesPlayed();
        incrementCravingsHandled();
      }
    }
  }, [tiles, gameStarted, gameOver]);
  
  const initializeGame = () => {
    setMoves(0);
    setIsSolved(false);
    
    // Create ordered tiles
    const initialTiles: Tile[] = [];
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
      if (i < BOARD_SIZE * BOARD_SIZE - 1) {
        const row = Math.floor(i / BOARD_SIZE);
        const col = i % BOARD_SIZE;
        
        initialTiles.push({
          id: i,
          value: i,
          position: i,
          x: new Animated.Value(col * (TILE_SIZE + TILE_MARGIN)),
          y: new Animated.Value(row * (TILE_SIZE + TILE_MARGIN)),
        });
      }
    }
    
    // Set empty position
    setEmptyPosition(BOARD_SIZE * BOARD_SIZE - 1);
    
    // Shuffle tiles based on difficulty
    const shuffledTiles = shuffleTiles(initialTiles, difficulty);
    setTiles(shuffledTiles);
  };
  
  const shuffleTiles = (tiles: Tile[], difficulty: 'easy' | 'medium' | 'hard') => {
    let moves: number;
    
    switch (difficulty) {
      case 'easy':
        moves = 20;
        break;
      case 'medium':
        moves = 50;
        break;
      case 'hard':
        moves = 100;
        break;
      default:
        moves = 20;
    }
    
    let currentEmptyPos = BOARD_SIZE * BOARD_SIZE - 1;
    let shuffledTiles = [...tiles];
    
    // Make random valid moves to shuffle
    for (let i = 0; i < moves; i++) {
      const row = Math.floor(currentEmptyPos / BOARD_SIZE);
      const col = currentEmptyPos % BOARD_SIZE;
      
      // Get possible moves (up, down, left, right)
      const possibleMoves = [];
      
      if (row > 0) possibleMoves.push(currentEmptyPos - BOARD_SIZE); // Up
      if (row < BOARD_SIZE - 1) possibleMoves.push(currentEmptyPos + BOARD_SIZE); // Down
      if (col > 0) possibleMoves.push(currentEmptyPos - 1); // Left
      if (col < BOARD_SIZE - 1) possibleMoves.push(currentEmptyPos + 1); // Right
      
      // Choose a random move
      const randomMoveIndex = Math.floor(Math.random() * possibleMoves.length);
      const tileToMovePos = possibleMoves[randomMoveIndex];
      
      // Find the tile to move
      const tileToMoveIndex = shuffledTiles.findIndex(t => t.position === tileToMovePos);
      
      if (tileToMoveIndex !== -1) {
        // Update tile position
        shuffledTiles[tileToMoveIndex] = {
          ...shuffledTiles[tileToMoveIndex],
          position: currentEmptyPos,
        };
        
        // Update empty position
        currentEmptyPos = tileToMovePos;
      }
    }
    
    // Update tile coordinates based on their new positions
    shuffledTiles = shuffledTiles.map(tile => {
      const row = Math.floor(tile.position / BOARD_SIZE);
      const col = tile.position % BOARD_SIZE;
      
      tile.x.setValue(col * (TILE_SIZE + TILE_MARGIN));
      tile.y.setValue(row * (TILE_SIZE + TILE_MARGIN));
      
      return tile;
    });
    
    setEmptyPosition(currentEmptyPos);
    return shuffledTiles;
  };
  
  const handleTilePress = (position: number) => {
    if (gameOver) return;
    
    const row = Math.floor(position / BOARD_SIZE);
    const col = position % BOARD_SIZE;
    const emptyRow = Math.floor(emptyPosition / BOARD_SIZE);
    const emptyCol = emptyPosition % BOARD_SIZE;
    
    // Check if the tile is adjacent to the empty space
    const isAdjacent = (
      (row === emptyRow && Math.abs(col - emptyCol) === 1) || // Same row, adjacent column
      (col === emptyCol && Math.abs(row - emptyRow) === 1)    // Same column, adjacent row
    );
    
    if (isAdjacent) {
      // Find the tile to move
      const tileIndex = tiles.findIndex(t => t.position === position);
      
      if (tileIndex !== -1) {
        // Create a new array with the updated tile
        const newTiles = [...tiles];
        
        // Update tile position
        newTiles[tileIndex] = {
          ...newTiles[tileIndex],
          position: emptyPosition,
        };
        
        // Animate the tile movement
        Animated.spring(newTiles[tileIndex].x, {
          toValue: emptyCol * (TILE_SIZE + TILE_MARGIN),
          useNativeDriver: Platform.OS !== 'web',
          friction: 7,
          tension: 40,
        }).start();
        
        Animated.spring(newTiles[tileIndex].y, {
          toValue: emptyRow * (TILE_SIZE + TILE_MARGIN),
          useNativeDriver: Platform.OS !== 'web',
          friction: 7,
          tension: 40,
        }).start();
        
        // Update state
        setTiles(newTiles);
        setEmptyPosition(position);
        setMoves(prev => prev + 1);
        
        if (Platform.OS !== 'web') {
          Haptics.selectionAsync();
        }
      }
    }
  };
  
  const startGame = (selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
    setGameOver(false);
  };
  
  const renderTiles = () => {
    return tiles.map(tile => {
      const tileNumber = tile.value + 1; // Display 1-15 instead of 0-14
      
      return (
        <Animated.View
          key={tile.id}
          style={[
            styles.tile,
            {
              width: TILE_SIZE,
              height: TILE_SIZE,
              transform: [
                { translateX: tile.x },
                { translateY: tile.y },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.tileButton}
            onPress={() => handleTilePress(tile.position)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, `${colors.primary}80`]}
              style={styles.tileGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.tileText}>{tileNumber}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      );
    });
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[`${colors.secondary}20`, `${colors.secondary}05`]}
        style={styles.gradientBackground}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Puzzle Slider</Text>
          {gameStarted && !gameOver && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Moves</Text>
                <Text style={styles.statValue}>{moves}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Difficulty</Text>
                <Text style={styles.statValue}>{difficulty}</Text>
              </View>
            </View>
          )}
        </View>
        
        {!gameStarted ? (
          <View style={styles.startContainer}>
            <Text style={styles.instructionText}>
              Slide the tiles to solve the puzzle!
            </Text>
            <Text style={styles.instructionSubtext}>
              Arrange the numbers in order from 1 to 15, with the empty space in the bottom right.
            </Text>
            
            <View style={styles.difficultyContainer}>
              <Text style={styles.difficultyLabel}>Select Difficulty:</Text>
              <View style={styles.difficultyButtons}>
                <TouchableOpacity
                  style={[styles.difficultyButton, styles.easyButton]}
                  onPress={() => startGame('easy')}
                >
                  <Text style={styles.difficultyButtonText}>Easy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.difficultyButton, styles.mediumButton]}
                  onPress={() => startGame('medium')}
                >
                  <Text style={styles.difficultyButtonText}>Medium</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.difficultyButton, styles.hardButton]}
                  onPress={() => startGame('hard')}
                >
                  <Text style={styles.difficultyButtonText}>Hard</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <>
            {!gameOver ? (
              <>
                <View style={[
                  styles.board,
                  {
                    width: BOARD_SIZE * (TILE_SIZE + TILE_MARGIN) - TILE_MARGIN,
                    height: BOARD_SIZE * (TILE_SIZE + TILE_MARGIN) - TILE_MARGIN,
                  }
                ]}>
                  {renderTiles()}
                </View>
                
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => initializeGame()}
                >
                  <Text style={styles.buttonText}>Reset Puzzle</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.gameOverContainer}>
                <LinearGradient
                  colors={[colors.success, `${colors.success}80`]}
                  style={styles.gameOverBanner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.gameOverTitle}>Puzzle Solved!</Text>
                </LinearGradient>
                
                <View style={styles.scoreContainer}>
                  <Text style={styles.finalScoreLabel}>Moves Used</Text>
                  <Text style={styles.finalScore}>{moves}</Text>
                  
                  <View style={styles.achievementContainer}>
                    <Text style={styles.achievementText}>
                      Great job! You've successfully distracted yourself from a craving.
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.playAgainButton}
                  onPress={() => setGameStarted(false)}
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
    textTransform: 'capitalize',
  },
  startContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
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
  difficultyContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  difficultyLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
  },
  difficultyButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  difficultyButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  easyButton: {
    backgroundColor: colors.success,
  },
  mediumButton: {
    backgroundColor: colors.primary,
  },
  hardButton: {
    backgroundColor: colors.danger,
  },
  difficultyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  board: {
    backgroundColor: colors.background,
    borderRadius: 8,
    position: 'relative',
    alignSelf: 'center',
    marginVertical: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  tile: {
    position: 'absolute',
    padding: TILE_MARGIN / 2,
  },
  tileButton: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tileGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  resetButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
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