import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useUserStore } from '@/store/user-store';
import { healthMilestones } from '@/constants/achievements';
import { useThemeColors } from '@/constants/colors';
import { Heart, Wind, Brain, Activity, ArrowRight, Info } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function HealthProgressScreen() {
  const colors = useThemeColors();
  const { calculateProgress } = useUserStore();
  const { smokeFreeTime } = calculateProgress();
  const totalDays = smokeFreeTime.days;
  
  const [selectedSystem, setSelectedSystem] = useState<string>('respiratory');
  
  // Filter milestones to show all achieved and upcoming
  const sortedMilestones = [...healthMilestones].sort((a, b) => a.days - b.days);
  
  // Get the next milestone
  const nextMilestone = sortedMilestones.find(milestone => milestone.days > totalDays);
  
  // Calculate progress percentage to next milestone
  const calculateNextMilestoneProgress = () => {
    if (!nextMilestone) return 100;
    
    const prevMilestone = sortedMilestones
      .filter(m => m.days <= totalDays)
      .pop();
    
    const prevDays = prevMilestone ? prevMilestone.days : 0;
    const daysToNextMilestone = nextMilestone.days - prevDays;
    const progressDays = totalDays - prevDays;
    
    return Math.min(100, Math.max(0, (progressDays / daysToNextMilestone) * 100));
  };
  
  const nextMilestoneProgress = calculateNextMilestoneProgress();
  
  // Health system information
  const healthSystems = {
    respiratory: {
      title: "Respiratory System",
      icon: <Wind size={24} color={colors.primary} />,
      improvements: [
        { day: 3, text: "Breathing becomes easier as bronchial tubes relax" },
        { day: 14, text: "Lung function increases by up to 30%" },
        { day: 30, text: "Cilia regrow in lungs, improving ability to clean lungs" },
        { day: 90, text: "Lung capacity significantly improves" },
        { day: 270, text: "Lung function increases by up to 10%" },
      ],
      currentImprovement: "Your lungs are gradually clearing out tar and other toxins."
    },
    cardiovascular: {
      title: "Cardiovascular System",
      icon: <Heart size={24} color={colors.primary} />,
      improvements: [
        { day: 1, text: "Heart rate and blood pressure drop to normal levels" },
        { day: 3, text: "Carbon monoxide levels in blood drop to normal" },
        { day: 14, text: "Circulation improves throughout the body" },
        { day: 90, text: "Risk of heart attack begins to decrease" },
        { day: 365, text: "Risk of coronary heart disease is half that of a smoker" },
      ],
      currentImprovement: "Your heart is working more efficiently with improved circulation."
    },
    nervous: {
      title: "Nervous System",
      icon: <Brain size={24} color={colors.primary} />,
      improvements: [
        { day: 2, text: "Nerve endings start to regrow" },
        { day: 7, text: "Improved sense of taste and smell" },
        { day: 30, text: "Better cognitive function and concentration" },
        { day: 90, text: "Reduced anxiety and depression symptoms" },
        { day: 180, text: "Improved memory and mental clarity" },
      ],
      currentImprovement: "Your brain is receiving more oxygen, improving cognitive function."
    },
    general: {
      title: "Overall Health",
      icon: <Activity size={24} color={colors.primary} />,
      improvements: [
        { day: 7, text: "Increased energy levels" },
        { day: 14, text: "Improved immune system function" },
        { day: 30, text: "Better skin appearance and hydration" },
        { day: 180, text: "Reduced coughing and respiratory infections" },
        { day: 365, text: "Life expectancy begins to approach that of a non-smoker" },
      ],
      currentImprovement: "Your overall health is improving with each smoke-free day."
    }
  };
  
  // Get relevant improvements for the selected system
  const getRelevantImprovements = () => {
    const system = healthSystems[selectedSystem as keyof typeof healthSystems];
    return system.improvements.sort((a, b) => a.day - b.day);
  };
  
  // Get current improvement based on days
  const getCurrentImprovement = () => {
    const system = healthSystems[selectedSystem as keyof typeof healthSystems];
    const improvements = system.improvements;
    
    // Find the most recent improvement that has been achieved
    const achievedImprovements = improvements.filter(imp => imp.day <= totalDays);
    if (achievedImprovements.length === 0) {
      return system.currentImprovement;
    }
    
    return achievedImprovements[achievedImprovements.length - 1].text;
  };
  
  // Get healing percentage for the selected system
  const getHealingPercentage = () => {
    const system = healthSystems[selectedSystem as keyof typeof healthSystems];
    const maxDay = system.improvements[system.improvements.length - 1].day;
    
    return Math.min(100, Math.max(0, (totalDays / maxDay) * 100));
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with days smoke-free */}
      <View style={[styles.headerCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Your Health Recovery</Text>
        <Text style={[styles.daysCounter, { color: colors.textSecondary }]}>
          <Text style={[styles.daysNumber, { color: colors.primary }]}>{totalDays}</Text> days smoke-free
        </Text>
        
        {nextMilestone && (
          <View style={styles.nextMilestoneContainer}>
            <Text style={[styles.nextMilestoneText, { color: colors.textSecondary }]}>
              Next milestone: <Text style={[styles.highlightText, { color: colors.primary }]}>{nextMilestone.title}</Text> in {nextMilestone.days - totalDays} days
            </Text>
            <View style={[styles.progressBarContainer, { backgroundColor: colors.progressBackground }]}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${nextMilestoneProgress}%`, backgroundColor: colors.progressBar }
                ]} 
              />
            </View>
          </View>
        )}
      </View>
      
      {/* Body systems selector */}
      <View style={[styles.systemSelectorCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Body Systems Recovery</Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.systemButtonsContainer}
        >
          <TouchableOpacity 
            style={[
              styles.systemButton, 
              { backgroundColor: selectedSystem === 'respiratory' ? colors.primary : colors.background, 
                borderColor: selectedSystem === 'respiratory' ? colors.primary : colors.progressBackground }
            ]}
            onPress={() => setSelectedSystem('respiratory')}
          >
            <Wind 
              size={24} 
              color={selectedSystem === 'respiratory' ? colors.background : colors.primary} 
            />
            <Text 
              style={[
                styles.systemButtonText,
                { color: selectedSystem === 'respiratory' ? colors.background : colors.text }
              ]}
            >
              Respiratory
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.systemButton, 
              { backgroundColor: selectedSystem === 'cardiovascular' ? colors.primary : colors.background, 
                borderColor: selectedSystem === 'cardiovascular' ? colors.primary : colors.progressBackground }
            ]}
            onPress={() => setSelectedSystem('cardiovascular')}
          >
            <Heart 
              size={24} 
              color={selectedSystem === 'cardiovascular' ? colors.background : colors.primary} 
            />
            <Text 
              style={[
                styles.systemButtonText,
                { color: selectedSystem === 'cardiovascular' ? colors.background : colors.text }
              ]}
            >
              Cardiovascular
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.systemButton, 
              { backgroundColor: selectedSystem === 'nervous' ? colors.primary : colors.background, 
                borderColor: selectedSystem === 'nervous' ? colors.primary : colors.progressBackground }
            ]}
            onPress={() => setSelectedSystem('nervous')}
          >
            <Brain 
              size={24} 
              color={selectedSystem === 'nervous' ? colors.background : colors.primary} 
            />
            <Text 
              style={[
                styles.systemButtonText,
                { color: selectedSystem === 'nervous' ? colors.background : colors.text }
              ]}
            >
              Nervous
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.systemButton, 
              { backgroundColor: selectedSystem === 'general' ? colors.primary : colors.background, 
                borderColor: selectedSystem === 'general' ? colors.primary : colors.progressBackground }
            ]}
            onPress={() => setSelectedSystem('general')}
          >
            <Activity 
              size={24} 
              color={selectedSystem === 'general' ? colors.background : colors.primary} 
            />
            <Text 
              style={[
                styles.systemButtonText,
                { color: selectedSystem === 'general' ? colors.background : colors.text }
              ]}
            >
              Overall
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Selected system details */}
      <View style={[styles.systemDetailsCard, { backgroundColor: colors.card }]}>
        <View style={styles.systemHeader}>
          {healthSystems[selectedSystem as keyof typeof healthSystems].icon}
          <Text style={[styles.systemTitle, { color: colors.text }]}>
            {healthSystems[selectedSystem as keyof typeof healthSystems].title}
          </Text>
        </View>
        
        <View style={styles.healingProgressContainer}>
          <Text style={[styles.healingText, { color: colors.text }]}>Healing Progress</Text>
          <View style={[styles.progressBarContainer, { backgroundColor: colors.progressBackground }]}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${getHealingPercentage()}%`, backgroundColor: colors.progressBar }
              ]} 
            />
          </View>
          <Text style={[styles.percentageText, { color: colors.primary }]}>{Math.round(getHealingPercentage())}%</Text>
        </View>
        
        <View style={[styles.currentImprovementContainer, { backgroundColor: colors.background, borderColor: colors.progressBackground }]}>
          <Info size={18} color={colors.primary} />
          <Text style={[styles.currentImprovementText, { color: colors.text }]}>
            {getCurrentImprovement()}
          </Text>
        </View>
        
        <View style={styles.timelineContainer}>
          <Text style={[styles.timelineTitle, { color: colors.text }]}>Recovery Timeline</Text>
          
          {getRelevantImprovements().map((improvement, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineDot}>
                <View 
                  style={[
                    styles.dot, 
                    totalDays >= improvement.day 
                      ? [styles.achievedDot, { backgroundColor: colors.primary }] 
                      : [styles.upcomingDot, { backgroundColor: colors.progressBackground, borderColor: colors.inactive }]
                  ]} 
                />
                {index < getRelevantImprovements().length - 1 && (
                  <View 
                    style={[
                      styles.timelineLine,
                      totalDays >= improvement.day 
                        ? [styles.achievedLine, { backgroundColor: colors.primary }] 
                        : [styles.upcomingLine, { backgroundColor: colors.progressBackground }]
                    ]} 
                  />
                )}
              </View>
              
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineDay, { color: colors.primary }]}>
                  Day {improvement.day}
                </Text>
                <Text 
                  style={[
                    styles.timelineText,
                    totalDays >= improvement.day 
                      ? [styles.achievedText, { color: colors.text }] 
                      : [styles.upcomingText, { color: colors.textSecondary }]
                  ]}
                >
                  {improvement.text}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      
      {/* Health visualization */}
      <View style={[styles.visualizationCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Body Healing Visualization</Text>
        <Image
          source={{ uri: `https://image.pollinations.ai/prompt/${encodeURIComponent(`Medical illustration of human ${selectedSystem === 'general' ? 'body' : selectedSystem} system healing after quitting smoking for ${totalDays} days, clean medical diagram style, educational, blue color scheme`)}` }}
          style={styles.bodyImage}
          contentFit="cover"
          transition={1000}
        />
      </View>
      
      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 16,
  },
  headerCard: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  daysCounter: {
    fontSize: 16,
    marginBottom: 16,
  },
  daysNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  nextMilestoneContainer: {
    marginTop: 8,
  },
  nextMilestoneText: {
    fontSize: 14,
    marginBottom: 8,
  },
  highlightText: {
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  systemSelectorCard: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  systemButtonsContainer: {
    paddingVertical: 8,
  },
  systemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderWidth: 1,
  },
  systemButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  systemDetailsCard: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  systemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  systemTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  healingProgressContainer: {
    marginBottom: 16,
  },
  healingText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'right',
  },
  currentImprovementContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  currentImprovementText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  timelineContainer: {
    marginTop: 8,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    alignItems: 'center',
    width: 24,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  achievedDot: {
  },
  upcomingDot: {
    borderWidth: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    marginBottom: -8,
  },
  achievedLine: {
  },
  upcomingLine: {
  },
  timelineContent: {
    flex: 1,
    marginLeft: 8,
  },
  timelineDay: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineText: {
    fontSize: 14,
    lineHeight: 20,
  },
  achievedText: {
  },
  upcomingText: {
  },
  visualizationCard: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bodyImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  spacer: {
    height: 40,
  },
});