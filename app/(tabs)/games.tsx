import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack } from 'expo-router';
import { useThemeColors } from '@/constants/colors';
import MemoryGame from '@/components/games/MemoryGame';
import ReactionGame from '@/components/games/ReactionGame';
import BreathingGame from '@/components/games/BreathingGame';
import WordScrambleGame from '@/components/games/WordScrambleGame';
import SnakeGame from '@/components/games/SnakeGame';
import BalloonPopGame from '@/components/games/BalloonPopGame';
import MazeGame from '@/components/games/MazeGame';
import PuzzleSliderGame from '@/components/games/PuzzleSliderGame';
import { Brain, Zap, Wind, BookOpen, Gamepad2, Target, Map, Grid3X3 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function GamesScreen() {
  const colors = useThemeColors();
  const [selectedGame, setSelectedGame] = useState<
    'memory' | 'reaction' | 'breathing' | 'wordscramble' | 'snake' | 'balloon' | 'maze' | 'puzzle' | null
  >(null);
  
  // Define dynamic styles that depend on colors
  const dynamicStyles = {
    gameIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: `${colors.primary}20`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    iconSecondary: {
      backgroundColor: `${colors.secondary}20`,
    },
    iconMixed: {
      backgroundColor: `${colors.primary}10`,
    },
  };
  
  return (
    <>
      <Stack.Screen options={{ 
        title: 'Distraction Games',
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text }
      }} />
      
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Distract Yourself</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Playing games can help you manage cravings by redirecting your focus.
          </Text>
        </View>
        
        {!selectedGame ? (
          <View style={styles.gameSelectionContainer}>
            <TouchableOpacity 
              style={styles.gameOption}
              onPress={() => setSelectedGame('memory')}
            >
              <LinearGradient
                colors={[`${colors.primary}20`, `${colors.primary}05`]}
                style={styles.gameCardGradient}
              >
                <View style={dynamicStyles.gameIconContainer}>
                  <Brain size={32} color={colors.primary} />
                </View>
                <Text style={[styles.gameOptionTitle, { color: colors.text }]}>Memory Match</Text>
                <Text style={[styles.gameOptionDescription, { color: colors.textSecondary }]}>
                  Test your memory by matching pairs of cards. Great for focusing your mind.
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.gameOption}
              onPress={() => setSelectedGame('reaction')}
            >
              <LinearGradient
                colors={[`${colors.secondary}20`, `${colors.secondary}05`]}
                style={styles.gameCardGradient}
              >
                <View style={[dynamicStyles.gameIconContainer, dynamicStyles.iconSecondary]}>
                  <Zap size={32} color={colors.secondary} />
                </View>
                <Text style={[styles.gameOptionTitle, { color: colors.text }]}>Reaction Time</Text>
                <Text style={[styles.gameOptionDescription, { color: colors.textSecondary }]}>
                  Tap targets as quickly as you can. Perfect for quick distraction.
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.gameOption}
              onPress={() => setSelectedGame('snake')}
            >
              <LinearGradient
                colors={['#34C75920', '#34C75905']}
                style={styles.gameCardGradient}
              >
                <View style={[dynamicStyles.gameIconContainer, styles.iconGreen]}>
                  <Gamepad2 size={32} color="#34C759" />
                </View>
                <Text style={[styles.gameOptionTitle, { color: colors.text }]}>Snake Game</Text>
                <Text style={[styles.gameOptionDescription, { color: colors.textSecondary }]}>
                  Control the snake to eat food and grow longer. A classic game to keep you engaged.
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.gameOption}
              onPress={() => setSelectedGame('balloon')}
            >
              <LinearGradient
                colors={[`${colors.primary}20`, `${colors.secondary}10`]}
                style={styles.gameCardGradient}
              >
                <View style={[dynamicStyles.gameIconContainer, dynamicStyles.iconMixed]}>
                  <Target size={32} color={colors.primary} />
                </View>
                <Text style={[styles.gameOptionTitle, { color: colors.text }]}>Balloon Pop</Text>
                <Text style={[styles.gameOptionDescription, { color: colors.textSecondary }]}>
                  Pop balloons before they float away. A satisfying way to release tension.
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.gameOption}
              onPress={() => setSelectedGame('maze')}
            >
              <LinearGradient
                colors={['#4A90E220', '#4A90E205']}
                style={styles.gameCardGradient}
              >
                <View style={[dynamicStyles.gameIconContainer, styles.iconBlue]}>
                  <Map size={32} color="#4A90E2" />
                </View>
                <Text style={[styles.gameOptionTitle, { color: colors.text }]}>Maze Runner</Text>
                <Text style={[styles.gameOptionDescription, { color: colors.textSecondary }]}>
                  Navigate through mazes to reach the goal. Requires focus and concentration.
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.gameOption}
              onPress={() => setSelectedGame('puzzle')}
            >
              <LinearGradient
                colors={[`${colors.secondary}20`, `${colors.secondary}05`]}
                style={styles.gameCardGradient}
              >
                <View style={[dynamicStyles.gameIconContainer, dynamicStyles.iconSecondary]}>
                  <Grid3X3 size={32} color={colors.secondary} />
                </View>
                <Text style={[styles.gameOptionTitle, { color: colors.text }]}>Puzzle Slider</Text>
                <Text style={[styles.gameOptionDescription, { color: colors.textSecondary }]}>
                  Rearrange the tiles to complete the puzzle. A classic brain teaser.
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.gameOption}
              onPress={() => setSelectedGame('breathing')}
            >
              <LinearGradient
                colors={['#4A90E220', '#4A90E205']}
                style={styles.gameCardGradient}
              >
                <View style={[dynamicStyles.gameIconContainer, styles.iconBlue]}>
                  <Wind size={32} color="#4A90E2" />
                </View>
                <Text style={[styles.gameOptionTitle, { color: colors.text }]}>Breathing Exercise</Text>
                <Text style={[styles.gameOptionDescription, { color: colors.textSecondary }]}>
                  Follow guided breathing patterns to calm your mind and reduce cravings.
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.gameOption}
              onPress={() => setSelectedGame('wordscramble')}
            >
              <LinearGradient
                colors={[`${colors.primary}20`, `${colors.secondary}10`]}
                style={styles.gameCardGradient}
              >
                <View style={[dynamicStyles.gameIconContainer, dynamicStyles.iconMixed]}>
                  <BookOpen size={32} color={colors.primary} />
                </View>
                <Text style={[styles.gameOptionTitle, { color: colors.text }]}>Word Scramble</Text>
                <Text style={[styles.gameOptionDescription, { color: colors.textSecondary }]}>
                  Unscramble words to challenge your brain and keep your mind occupied.
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {selectedGame === 'memory' && <MemoryGame />}
            {selectedGame === 'reaction' && <ReactionGame />}
            {selectedGame === 'breathing' && <BreathingGame />}
            {selectedGame === 'wordscramble' && <WordScrambleGame />}
            {selectedGame === 'snake' && <SnakeGame />}
            {selectedGame === 'balloon' && <BalloonPopGame />}
            {selectedGame === 'maze' && <MazeGame />}
            {selectedGame === 'puzzle' && <PuzzleSliderGame />}
            
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: colors.primary }]}
              onPress={() => setSelectedGame(null)}
            >
              <Text style={styles.backButtonText}>Back to Game Selection</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.spacer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  gameSelectionContainer: {
    marginBottom: 24,
  },
  gameOption: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  gameCardGradient: {
    padding: 20,
  },
  iconBlue: {
    backgroundColor: '#4A90E220',
  },
  iconGreen: {
    backgroundColor: '#34C75920',
  },
  gameOptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  gameOptionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  spacer: {
    height: 40,
  },
});