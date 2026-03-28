import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Stack } from 'expo-router';
import { useThemeColors } from '@/constants/colors';
import GoalSettingCard from '@/components/GoalSettingCard';
import { achievements } from '@/constants/achievements';
import { useUserStore } from '@/store/user-store';
import { Image } from 'expo-image';
import { aiService } from '@/services/ai-service';
import { Award, Info } from 'lucide-react-native';
import NextGoalCard from '@/components/NextGoalCard';
import GoalCategoryCard from '@/components/GoalCategoryCard';
import { goalCategories } from '@/constants/goal-categories';

export default function GoalsScreen() {
  const colors = useThemeColors();
  const { profile, calculateProgress } = useUserStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  if (!profile) return null;
  
  const { smokeFreeTime } = calculateProgress();
  
  // Filter achievements to show earned ones
  const earnedAchievements = achievements.filter(achievement => 
    profile.achievements.includes(achievement.id)
  );
  
  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setModalVisible(true);
  };
  
  const selectedCategoryData = goalCategories.find(cat => cat.id === selectedCategory);
  
  return (
    <>
      <Stack.Screen options={{ 
        title: 'Goals & Achievements',
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.text,
      }} />
      
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>My goals</Text>
        
        <NextGoalCard />
        
        <View style={styles.categoriesGrid}>
          {goalCategories.map(category => (
            <View key={category.id} style={styles.categoryWrapper}>
              <GoalCategoryCard
                category={category.name}
                progress={category.calculateProgress(profile, smokeFreeTime)}
                color={category.color}
                onPress={() => handleCategoryPress(category.id)}
              />
            </View>
          ))}
        </View>
        
        <GoalSettingCard />
        
        <View style={[styles.achievementsContainer, { backgroundColor: colors.card }]}>
          <View style={styles.achievementsHeader}>
            <Text style={[styles.achievementsTitle, { color: colors.text }]}>Your Achievements</Text>
          </View>
          
          {earnedAchievements.length === 0 ? (
            <View style={styles.emptyAchievements}>
              <Award size={48} color={colors.inactive} />
              <Text style={[styles.emptyAchievementsText, { color: colors.textSecondary }]}>
                Your achievements will appear here as you progress on your smoke-free journey.
              </Text>
            </View>
          ) : (
            earnedAchievements.map(achievement => (
              <View key={achievement.id} style={[styles.achievementCard, { backgroundColor: colors.background }]}>
                <Image
                  source={{ uri: aiService.getAchievementImageUrl(achievement.title) }}
                  style={styles.achievementImage}
                  contentFit="cover"
                />
                <View style={styles.achievementContent}>
                  <Text style={[styles.achievementTitle, { color: colors.text }]}>{achievement.title}</Text>
                  <Text style={[styles.achievementDescription, { color: colors.textSecondary }]}>
                    {achievement.description}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
        
        <View style={styles.spacer} />
      </ScrollView>
      
      {/* Category Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {selectedCategoryData && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedCategoryData.name}</Text>
                  <View style={[styles.modalIcon, { backgroundColor: selectedCategoryData.color + '20' }]}>
                    <GoalCategoryCard
                      category={selectedCategoryData.name}
                      progress={selectedCategoryData.calculateProgress(profile, smokeFreeTime)}
                      color={selectedCategoryData.color}
                      onPress={() => {}}
                    />
                  </View>
                </View>
                
                <View style={[styles.modalInfoContainer, { backgroundColor: `${colors.primary}10` }]}>
                  <Info size={20} color={selectedCategoryData.color} style={styles.infoIcon} />
                  <Text style={[styles.modalDescription, { color: colors.text }]}>
                    {selectedCategoryData.description}
                  </Text>
                </View>
                
                <Text style={[styles.progressText, { color: colors.text }]}>
                  Current progress: {Math.round(selectedCategoryData.calculateProgress(profile, smokeFreeTime))}%
                </Text>
                
                <TouchableOpacity 
                  style={[styles.closeButton, { backgroundColor: `${colors.primary}20` }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.closeButtonText, { color: colors.text }]}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    marginLeft: 4,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  categoryWrapper: {
    width: '30%',
    marginBottom: 16,
  },
  achievementsContainer: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementsHeader: {
    marginBottom: 16,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyAchievements: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyAchievementsText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  achievementCard: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  achievementImage: {
    width: 80,
    height: 80,
  },
  achievementContent: {
    flex: 1,
    padding: 12,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  spacer: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalInfoContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoIcon: {
    marginRight: 12,
  },
  modalDescription: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  progressText: {
    fontSize: 16,
    marginBottom: 24,
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});