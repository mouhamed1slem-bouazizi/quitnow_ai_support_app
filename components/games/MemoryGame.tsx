import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Platform } from 'react-native';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

// Expanded set of emojis for 18 pairs (36 cards total)
const ICONS = [
  '🍎', '🍋', '🍇', '🍓', '🍒', '🥝', '🍊', '🥭', '🍍', 
  '🍑', '🍐', '🍌', '🍈', '🍉', '🥑', '🥥', '🍆', '🥕'
];

export default function MemoryGame() {
  const [cards, setCards] = useState<Array<{ id: number; value: string; flipped: boolean; matched: boolean }>>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [gridSize, setGridSize] = useState<number>(6); // 6x6 grid for 36 cards
  
  const { incrementGamesPlayed, incrementCravingsHandled } = useUserStore();
  const flipAnimations = useRef<{ [key: number]: Animated.Value }>({});
  
  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);
  
  // Check for matches when two cards are flipped
  useEffect(() => {
    if (flippedCards.length === 2 && !isProcessing) {
      setIsProcessing(true);
      const [firstCardId, secondCardId] = flippedCards;
      const firstCard = cards.find(card => card.id === firstCardId);
      const secondCard = cards.find(card => card.id === secondCardId);
      
      if (firstCard && secondCard && firstCard.value === secondCard.value) {
        // Match found
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(card => 
              card.id === firstCardId || card.id === secondCardId
                ? { ...card, matched: true }
                : card
            )
          );
          setMatchedPairs(prev => prev + 1);
          setFlippedCards([]);
          setIsProcessing(false);
          
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }, 500);
      } else {
        // No match, flip cards back after delay
        setTimeout(() => {
          // Update card state to flip them back
          setCards(prevCards => 
            prevCards.map(card => 
              card.id === firstCardId || card.id === secondCardId
                ? { ...card, flipped: false }
                : card
            )
          );
          setFlippedCards([]);
          setIsProcessing(false);
          
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        }, 1000);
      }
      
      setMoves(prev => prev + 1);
    }
  }, [flippedCards, isProcessing]);
  
  // Check for game completion
  useEffect(() => {
    if (matchedPairs === ICONS.length && !gameComplete) {
      setGameComplete(true);
      
      // Use setTimeout to avoid the state update during render issue
      setTimeout(() => {
        incrementGamesPlayed();
        incrementCravingsHandled();
      }, 0);
    }
  }, [matchedPairs]);
  
  const initializeGame = () => {
    // Create pairs of cards with icons
    const cardPairs = [...ICONS, ...ICONS].map((value, index) => ({
      id: index,
      value,
      flipped: false, // Start with cards face down
      matched: false,
    }));
    
    // Shuffle cards
    const shuffledCards = cardPairs.sort(() => Math.random() - 0.5);
    
    // Initialize flip animations
    const newFlipAnimations: { [key: number]: Animated.Value } = {};
    shuffledCards.forEach(card => {
      newFlipAnimations[card.id] = new Animated.Value(0); // 0 means face down
    });
    flipAnimations.current = newFlipAnimations;
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameComplete(false);
    setIsProcessing(false);
  };
  
  const handleCardPress = (cardId: number) => {
    // Ignore if already processing, two cards flipped, or this card is already flipped/matched
    if (
      isProcessing ||
      flippedCards.length === 2 || 
      flippedCards.includes(cardId) || 
      cards.find(card => card.id === cardId)?.matched ||
      cards.find(card => card.id === cardId)?.flipped
    ) {
      return;
    }
    
    // Flip the card
    setCards(prevCards => 
      prevCards.map(card => 
        card.id === cardId ? { ...card, flipped: true } : card
      )
    );
    
    // Add to flipped cards
    setFlippedCards(prev => [...prev, cardId]);
    
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };
  
  const { width } = Dimensions.get('window');
  const cardSize = (width - 48) / gridSize; // Account for margins and padding
  
  const renderCard = (card: typeof cards[0]) => {
    const isFlipped = card.flipped || card.matched;
    
    return (
      <TouchableOpacity
        key={card.id}
        activeOpacity={0.9}
        onPress={() => handleCardPress(card.id)}
        disabled={card.flipped || card.matched || gameComplete}
        style={[styles.cardTouchable, { width: cardSize, height: cardSize }]}
      >
        {/* Card Back */}
        <View 
          style={[
            styles.cardFace,
            styles.cardBack,
            { opacity: isFlipped ? 0 : 1 }
          ]}
        >
          <LinearGradient
            colors={[colors.primary, `${colors.secondary}80`]}
            style={styles.cardBackGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.cardBackText}>?</Text>
          </LinearGradient>
        </View>
        
        {/* Card Front */}
        <View 
          style={[
            styles.cardFace,
            styles.cardFront,
            card.matched && styles.cardMatched,
            { opacity: isFlipped ? 1 : 0 }
          ]}
        >
          <LinearGradient
            colors={[card.matched ? colors.success : colors.primary, card.matched ? `${colors.success}80` : `${colors.primary}80`]}
            style={styles.cardFrontGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.cardText}>{card.value}</Text>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[`${colors.primary}20`, `${colors.primary}05`]}
        style={styles.gradientBackground}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Memory Match</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Pairs</Text>
              <Text style={styles.statValue}>{matchedPairs}/{ICONS.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Moves</Text>
              <Text style={styles.statValue}>{moves}</Text>
            </View>
          </View>
          
          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${(matchedPairs / ICONS.length) * 100}%` }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.grid}>
          {cards.map(card => (
            <View key={card.id} style={[styles.cardContainer, { width: cardSize, height: cardSize }]}>
              {renderCard(card)}
            </View>
          ))}
        </View>
        
        {gameComplete && (
          <View style={styles.completeContainer}>
            <LinearGradient
              colors={[colors.success, `${colors.success}80`]}
              style={styles.completeBanner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.completeText}>
                Great job! You completed the game in {moves} moves.
              </Text>
            </LinearGradient>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={initializeGame}
            >
              <Text style={styles.resetButtonText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {!gameComplete && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={initializeGame}
          >
            <Text style={styles.resetButtonText}>Reset Game</Text>
          </TouchableOpacity>
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
    marginBottom: 12,
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
  progressContainer: {
    height: 6,
    backgroundColor: colors.progressBackground,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardContainer: {
    margin: 2,
    perspective: 1000,
  },
  cardTouchable: {
    position: 'relative',
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    backgroundColor: `${colors.primary}80`,
    zIndex: 1,
  },
  cardBackGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFront: {
    backgroundColor: colors.primary,
    zIndex: 0,
  },
  cardFrontGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardMatched: {
    backgroundColor: colors.success,
  },
  cardBackText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  cardText: {
    fontSize: 24,
  },
  completeContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  completeBanner: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  completeText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
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