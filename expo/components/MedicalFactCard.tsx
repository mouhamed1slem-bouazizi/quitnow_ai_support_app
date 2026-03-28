import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { smokingFacts } from '@/constants/facts';
import { aiService } from '@/services/ai-service';
import { useThemeColors } from '@/constants/colors';
import { RefreshCw } from 'lucide-react-native';

export default function MedicalFactCard() {
  const colors = useThemeColors();
  const [fact, setFact] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [useAiFact, setUseAiFact] = useState<boolean>(false);
  
  useEffect(() => {
    if (useAiFact) {
      fetchAiFact();
    } else {
      getRandomFact();
    }
  }, [useAiFact]);
  
  const getRandomFact = () => {
    const randomIndex = Math.floor(Math.random() * smokingFacts.length);
    setFact(smokingFacts[randomIndex]);
  };
  
  const fetchAiFact = async () => {
    setLoading(true);
    try {
      const healthFact = await aiService.generateHealthFact();
      setFact(healthFact);
    } catch (error) {
      console.error('Error fetching AI fact:', error);
      getRandomFact(); // Fallback to random fact
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = () => {
    if (useAiFact) {
      fetchAiFact();
    } else {
      getRandomFact();
    }
  };
  
  const toggleFactSource = () => {
    setUseAiFact(!useAiFact);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Health Facts</Text>
        <TouchableOpacity 
          onPress={handleRefresh} 
          disabled={loading}
          style={styles.refreshButton}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <RefreshCw size={18} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.factContainer}>
        <Text style={[styles.factText, { color: colors.text }]}>{fact}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.sourceToggle} 
        onPress={toggleFactSource}
      >
        <Text style={[styles.sourceToggleText, { color: colors.primary }]}>
          {useAiFact ? "Switch to Curated Facts" : "Get AI-Generated Facts"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 4,
  },
  factContainer: {
    minHeight: 80,
  },
  factText: {
    fontSize: 15,
    lineHeight: 22,
  },
  sourceToggle: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  sourceToggleText: {
    fontSize: 14,
  },
});