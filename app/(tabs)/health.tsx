import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useUserStore } from '@/store/user-store';
import { healthMilestones } from '@/constants/achievements';
import { useThemeColors } from '@/constants/colors';
import { Heart, Wind, Brain, Activity, ArrowRight, Info, Clock, Droplet, Shield, Zap, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Define the type for system keys to avoid TypeScript errors
type SystemKey = 'respiratory' | 'cardiovascular' | 'psychological' | 'nervous' | 'general' | 'immune' | 'digestive' | 'endocrine';

export default function HealthProgressScreen() {
  const colors = useThemeColors();
  const { calculateProgress } = useUserStore();
  const { smokeFreeTime } = calculateProgress();
  const totalDays = smokeFreeTime.days;
  
  const [selectedSystem, setSelectedSystem] = useState<SystemKey>('respiratory');
  const scrollViewRef = useRef<ScrollView>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  
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
  
  // Health system information with detailed recovery timelines
  const healthSystems = {
    respiratory: {
      title: "Respiratory System",
      icon: <Wind size={24} color={colors.primary} />,
      improvements: [
        { 
          day: 1, 
          text: "Carbon monoxide levels in blood drop by half, oxygen levels begin to normalize",
          details: "Your blood oxygen levels start to improve as carbon monoxide from cigarette smoke begins to leave your system."
        },
        { 
          day: 2, 
          text: "Carbon monoxide is eliminated from the body",
          details: "Your blood oxygen levels return to normal as carbon monoxide is fully eliminated. Oxygen can now properly reach your cells and tissues."
        },
        { 
          day: 3, 
          text: "Bronchial tubes begin to relax, breathing becomes easier",
          details: "The bronchial tubes that carry air to your lungs start to relax and widen, reducing resistance to airflow. You may notice less wheezing and shortness of breath."
        },
        { 
          day: 5, 
          text: "Mucus production begins to normalize",
          details: "Excess mucus production starts to decrease. Your lungs begin the process of clearing accumulated tar and debris."
        },
        { 
          day: 14, 
          text: "Lung function increases by up to 30%",
          details: "Your FEV1 (Forced Expiratory Volume) improves significantly. Physical activities become noticeably easier as your lungs can process more air with each breath."
        },
        { 
          day: 30, 
          text: "Cilia regrow in lungs, improving ability to clean lungs",
          details: "Microscopic hair-like structures called cilia begin to regrow in your airways. These structures help trap and remove contaminants, reducing your risk of infection."
        },
        { 
          day: 60, 
          text: "Decreased sinus congestion, less coughing and wheezing",
          details: "Your respiratory symptoms continue to improve. Many people report significantly less coughing, wheezing, and sinus congestion at this stage."
        },
        { 
          day: 90, 
          text: "Lung capacity significantly improves, cilia function fully restored",
          details: "Your lungs can now take in more air with each breath. The cilia in your airways are now functioning normally, efficiently cleaning your lungs."
        },
        { 
          day: 180, 
          text: "Reduced phlegm production, improved overall respiratory function",
          details: "Your lungs continue to clear themselves of tar and other toxins. Phlegm production decreases substantially, and your respiratory system functions more efficiently."
        },
        { 
          day: 270, 
          text: "Lung function increases by up to 10% more",
          details: "Your lung function continues to improve beyond the initial recovery. Breathing becomes even easier during physical activities."
        },
        { 
          day: 365, 
          text: "Risk of respiratory infections reduced by 50%",
          details: "Your immune system and respiratory defenses are significantly stronger. You're now half as likely to get bronchitis, pneumonia, and other respiratory infections compared to when you smoked."
        },
        { 
          day: 1825, 
          text: "Risk of lung cancer drops by up to 50%",
          details: "After 5 years, your risk of developing lung cancer has decreased dramatically. The lungs have cleared much of the precancerous cells and repaired significant damage."
        },
      ],
      currentImprovement: "Your lungs are gradually clearing out tar and other toxins, improving your breathing capacity and reducing inflammation in your airways."
    },
    cardiovascular: {
      title: "Cardiovascular System",
      icon: <Heart size={24} color={colors.primary} />,
      improvements: [
        { 
          day: 0.08, // 2 hours
          text: "Heart rate begins to drop and blood pressure decreases",
          details: "Within just 2 hours of your last cigarette, your heart rate starts to decrease from the elevated levels caused by nicotine."
        },
        { 
          day: 0.33, // 8 hours
          text: "Nicotine levels in bloodstream reduced by 93.75%",
          details: "The half-life of nicotine is about 2 hours, meaning every 2 hours the amount in your blood decreases by half. After 8 hours, only a small fraction remains."
        },
        { 
          day: 1, 
          text: "Heart rate and blood pressure drop to near normal levels",
          details: "Your heart is no longer working as hard to pump blood through your body. Your resting heart rate may decrease by 7-13 beats per minute."
        },
        { 
          day: 2, 
          text: "Improved circulation to hands and feet",
          details: "Blood vessels begin to dilate, improving circulation to your extremities. You may notice warmer hands and feet."
        },
        { 
          day: 3, 
          text: "Carbon monoxide levels in blood drop to normal",
          details: "With normal carbon monoxide levels, your blood can now carry and deliver oxygen more efficiently to all parts of your body, including your heart."
        },
        { 
          day: 7, 
          text: "Endothelial function begins to improve",
          details: "The endothelium (inner lining of blood vessels) starts to heal, improving blood vessel function and reducing inflammation."
        },
        { 
          day: 14, 
          text: "Circulation improves throughout the body",
          details: "Blood flow continues to improve as blood vessels heal. Exercise becomes easier as your heart can more efficiently deliver oxygen to your muscles."
        },
        { 
          day: 30, 
          text: "Blood pressure continues to stabilize, heart workload decreases",
          details: "Your systolic blood pressure may decrease by 5-10 mmHg from when you were smoking. Your heart doesn't have to work as hard to pump blood."
        },
        { 
          day: 90, 
          text: "Risk of heart attack begins to decrease significantly",
          details: "The risk of having a heart attack starts to drop as blood vessel function improves and inflammation decreases throughout your cardiovascular system."
        },
        { 
          day: 180, 
          text: "Platelet activation and aggregation normalize",
          details: "Blood platelets become less sticky, reducing the risk of dangerous clot formation that can lead to heart attacks and strokes."
        },
        { 
          day: 365, 
          text: "Risk of coronary heart disease is half that of a smoker",
          details: "After one year, your risk of coronary heart disease, heart attack, and stroke has decreased to about half that of a smoker."
        },
        { 
          day: 1825, 
          text: "Risk of stroke reduced to that of a non-smoker",
          details: "After 5 years, your risk of stroke has decreased to the same level as someone who has never smoked."
        },
        { 
          day: 3650, 
          text: "Risk of coronary heart disease same as non-smoker",
          details: "After 10 years, your risk of coronary heart disease is now similar to that of someone who has never smoked."
        },
      ],
      currentImprovement: "Your cardiovascular system is recovering with improved blood flow, decreased inflammation, and reduced strain on your heart."
    },
    psychological: {
      title: "Psychological Effects",
      icon: <Zap size={24} color={colors.psychological || '#9c5cff'} />,
      improvements: [
        { 
          day: 0.04, // 1 hour
          text: "Nicotine withdrawal begins",
          details: "Your brain starts to notice the absence of nicotine, which may trigger initial cravings. This is the beginning of the psychological adjustment process."
        },
        { 
          day: 0.125, // 3 hours
          text: "Irritability and anxiety may increase",
          details: "As nicotine levels continue to drop, you may experience increased irritability, anxiety, and restlessness. These are normal withdrawal symptoms."
        },
        { 
          day: 0.5, // 12 hours
          text: "Mood swings and difficulty concentrating",
          details: "You might experience mood fluctuations and find it harder to focus. Your brain is adjusting to functioning without nicotine."
        },
        { 
          day: 1, 
          text: "Peak of physical withdrawal symptoms",
          details: "Cravings are typically strongest during the first 24 hours. You may feel irritable, anxious, or have difficulty sleeping. Remember these are temporary."
        },
        { 
          day: 2, 
          text: "Increased hunger and food cravings",
          details: "Nicotine suppresses appetite, so you may notice increased hunger. Some people experience cravings for sweets as the brain seeks alternative sources of pleasure."
        },
        { 
          day: 3, 
          text: "Irritability and anger peak",
          details: "Day 3 is often when irritability, frustration, and anger reach their highest levels. This is a critical point in the withdrawal process - pushing through leads to easier days ahead."
        },
        { 
          day: 5, 
          text: "Mental fog begins to clear",
          details: "The mental cloudiness that accompanies withdrawal starts to dissipate. Your ability to concentrate begins to improve."
        },
        { 
          day: 7, 
          text: "Significant reduction in frequency of cravings",
          details: "While cravings may still occur, they typically become less frequent and less intense by the end of the first week."
        },
        { 
          day: 10, 
          text: "Improved mood stability",
          details: "Mood swings begin to stabilize as your brain chemistry adjusts to functioning without nicotine."
        },
        { 
          day: 14, 
          text: "Decreased depression symptoms",
          details: "Many people experience a lifting of depressive symptoms that can accompany withdrawal. Your outlook may become more positive."
        },
        { 
          day: 21, 
          text: "New coping mechanisms developing",
          details: "By this point, you've likely developed new ways to handle stress and emotions without reaching for cigarettes."
        },
        { 
          day: 30, 
          text: "Breaking of psychological dependence begins",
          details: "The mental association between daily activities and smoking starts to weaken significantly. You're forming new, healthier habits."
        },
        { 
          day: 60, 
          text: "Significant reduction in psychological cravings",
          details: "The psychological urge to smoke in response to triggers (stress, after meals, social situations) decreases substantially."
        },
        { 
          day: 90, 
          text: "New identity as a non-smoker strengthens",
          details: "You begin to see yourself as a non-smoker rather than an ex-smoker. This shift in identity helps reinforce your smoke-free lifestyle."
        },
        { 
          day: 180, 
          text: "Stress response normalizes",
          details: "Your body and mind learn to handle stress without nicotine. You develop healthier coping mechanisms for life's challenges."
        },
        { 
          day: 365, 
          text: "Freedom from psychological dependence",
          details: "Most people report feeling completely free from the psychological addiction after one year. Thoughts about smoking become rare and fleeting."
        },
      ],
      currentImprovement: "Your brain is adapting to life without nicotine, developing healthier response patterns and breaking the psychological dependence on smoking."
    },
    nervous: {
      title: "Nervous System",
      icon: <Brain size={24} color={colors.primary} />,
      improvements: [
        { 
          day: 0.04, // 1 hour
          text: "Anxiety and stress levels begin to decrease",
          details: "Despite the common belief that smoking relieves stress, within an hour of quitting, your body begins to normalize stress hormone levels."
        },
        { 
          day: 1, 
          text: "Oxygen levels to the brain increase",
          details: "With carbon monoxide levels dropping, more oxygen reaches your brain, improving its function and reducing headaches."
        },
        { 
          day: 2, 
          text: "Nerve endings start to regrow",
          details: "Damaged nerve endings begin the regeneration process. This is the beginning of improved sensory experiences."
        },
        { 
          day: 3, 
          text: "Acetylcholine receptors begin to recover",
          details: "Nicotine receptors in your brain start to return to normal function, reducing cravings and dependency."
        },
        { 
          day: 5, 
          text: "Improved neurotransmitter balance",
          details: "Levels of dopamine, serotonin, and other neurotransmitters begin to normalize, improving mood stability."
        },
        { 
          day: 7, 
          text: "Improved sense of taste and smell begins",
          details: "Taste buds and olfactory nerves start to recover, allowing you to experience flavors and scents more vividly."
        },
        { 
          day: 14, 
          text: "Improved cognitive function and concentration",
          details: "Brain fog diminishes as cerebral blood flow improves and inflammation decreases. Many people report clearer thinking."
        },
        { 
          day: 21, 
          text: "Sense of taste and smell significantly improved",
          details: "Most people notice a dramatic improvement in their ability to taste food and smell scents by this point."
        },
        { 
          day: 30, 
          text: "Better cognitive function and concentration",
          details: "Memory, problem-solving abilities, and attention span continue to improve as brain circulation and oxygen levels normalize."
        },
        { 
          day: 60, 
          text: "Improved sleep quality and patterns",
          details: "Without nicotine's stimulant effects, your sleep architecture improves with more REM sleep and deeper sleep cycles."
        },
        { 
          day: 90, 
          text: "Reduced anxiety and depression symptoms",
          details: "Neurotransmitter balance continues to improve, often resulting in more stable mood and reduced symptoms of anxiety and depression."
        },
        { 
          day: 180, 
          text: "Improved memory and mental clarity",
          details: "Cognitive functions continue to improve, with better memory retention and mental processing speed."
        },
        { 
          day: 365, 
          text: "Brain plasticity improves, enhancing learning ability",
          details: "Your brain's ability to form new connections and adapt to new information improves, enhancing learning capacity and cognitive flexibility."
        },
      ],
      currentImprovement: "Your brain is receiving more oxygen and experiencing improved neurotransmitter balance, enhancing cognitive function and sensory perception."
    },
    general: {
      title: "Overall Health",
      icon: <Activity size={24} color={colors.primary} />,
      improvements: [
        { 
          day: 0.5, // 12 hours
          text: "Blood oxygen levels begin to normalize",
          details: "Your body starts to receive proper oxygenation, which affects every system and begins the healing process."
        },
        { 
          day: 2, 
          text: "Sense of smell and taste begin to improve",
          details: "As nerve endings start to heal, your senses become more acute. Food may begin to taste better."
        },
        { 
          day: 3, 
          text: "Energy levels start to increase",
          details: "With improved oxygen levels and circulation, many people notice they have more energy throughout the day."
        },
        { 
          day: 7, 
          text: "Increased energy levels and improved circulation",
          details: "Physical activities become easier as your body efficiently delivers oxygen to muscles and tissues. Many people report feeling more energetic."
        },
        { 
          day: 14, 
          text: "Improved immune system function begins",
          details: "Your body's defense mechanisms start to recover, making you less susceptible to colds and other infections."
        },
        { 
          day: 21, 
          text: "Exercise becomes noticeably easier",
          details: "With improved lung function and circulation, physical activities require less effort and recovery time decreases."
        },
        { 
          day: 30, 
          text: "Better skin appearance and hydration",
          details: "Skin receives better blood flow and collagen production improves. Many people notice reduced wrinkles and improved complexion."
        },
        { 
          day: 60, 
          text: "Teeth and gums show improvement",
          details: "Gum inflammation decreases and teeth begin to look less stained. Oral health improves as blood flow to gums increases."
        },
        { 
          day: 90, 
          text: "Hair and nails become stronger",
          details: "Improved circulation delivers more nutrients to hair follicles and nail beds, resulting in stronger, healthier growth."
        },
        { 
          day: 180, 
          text: "Reduced coughing and respiratory infections",
          details: "With improved immune function and respiratory health, you'll experience fewer illnesses and less frequent coughing."
        },
        { 
          day: 270, 
          text: "Improved fertility and reproductive health",
          details: "For both men and women, reproductive health improves. Men may experience improved sperm quality, while women may have more regular menstrual cycles."
        },
        { 
          day: 365, 
          text: "Life expectancy begins to approach that of a non-smoker",
          details: "Your risk of premature death begins to decrease significantly. For each year you remain smoke-free, your life expectancy increases."
        },
        { 
          day: 3650, 
          text: "Risk of most smoking-related diseases approaches non-smoker levels",
          details: "After 10 years, your risk for most smoking-related diseases has decreased dramatically, approaching the risk levels of someone who has never smoked."
        },
        { 
          day: 5475, 
          text: "Life expectancy nearly identical to never-smokers",
          details: "After 15 years, your risk of premature death is close to that of someone who has never smoked, effectively adding years to your life."
        },
      ],
      currentImprovement: "Your overall health is improving with each smoke-free day, with benefits to your energy levels, immune system, and appearance."
    },
    immune: {
      title: "Immune System",
      icon: <Shield size={24} color={colors.primary} />,
      improvements: [
        { 
          day: 1, 
          text: "White blood cell function begins to improve",
          details: "As carbon monoxide levels decrease, white blood cells can function more effectively to fight infections."
        },
        { 
          day: 7, 
          text: "Improved mucosal immunity in respiratory tract",
          details: "The mucous membranes in your respiratory system begin to heal, providing better protection against pathogens."
        },
        { 
          day: 14, 
          text: "Antioxidant levels in blood begin to normalize",
          details: "Your body's natural antioxidant defenses start to recover, helping to repair cellular damage."
        },
        { 
          day: 30, 
          text: "Improved antibody production and response",
          details: "Your immune system becomes more efficient at producing antibodies to fight infections."
        },
        { 
          day: 60, 
          text: "Reduced inflammatory markers in blood",
          details: "Systemic inflammation decreases, allowing your immune system to focus on actual threats rather than dealing with smoking-induced inflammation."
        },
        { 
          day: 90, 
          text: "Significantly improved resistance to respiratory infections",
          details: "Your respiratory tract's defense mechanisms are much stronger, reducing your susceptibility to bronchitis, pneumonia, and other infections."
        },
        { 
          day: 180, 
          text: "Normalized immune cell counts and function",
          details: "The number and function of various immune cells return to healthy levels, improving your body's ability to fight disease."
        },
        { 
          day: 365, 
          text: "Wound healing improves to normal levels",
          details: "Your body can now repair injuries and wounds at a normal rate, as immune function and circulation have significantly improved."
        },
        { 
          day: 730, 
          text: "Risk of autoimmune complications decreases",
          details: "The risk of developing or worsening autoimmune conditions decreases as your immune system functions more normally."
        },
      ],
      currentImprovement: "Your immune system is recovering from the suppressive effects of smoking, improving your body's ability to fight infections and heal."
    },
    digestive: {
      title: "Digestive System",
      icon: <Droplet size={24} color={colors.primary} />,
      improvements: [
        { 
          day: 2, 
          text: "Improved taste sensation begins",
          details: "As taste buds recover, food begins to taste better, which can improve appetite and nutrition."
        },
        { 
          day: 5, 
          text: "Improved saliva production and quality",
          details: "Saliva production normalizes, improving the first stage of digestion and protecting your teeth and gums."
        },
        { 
          day: 14, 
          text: "Reduced acid reflux symptoms",
          details: "Many people experience less heartburn and acid reflux as smoking no longer weakens the lower esophageal sphincter."
        },
        { 
          day: 30, 
          text: "Improved gut motility and function",
          details: "Digestive tract muscles function more efficiently, improving nutrient absorption and waste elimination."
        },
        { 
          day: 60, 
          text: "Reduced risk of peptic ulcers",
          details: "The stomach lining begins to heal, and the risk of developing peptic ulcers decreases significantly."
        },
        { 
          day: 90, 
          text: "Improved gut microbiome balance",
          details: "The beneficial bacteria in your digestive system begin to flourish, improving digestion and immune function."
        },
        { 
          day: 180, 
          text: "Reduced risk of Crohn's disease flare-ups",
          details: "For those with Crohn's disease, the risk of flare-ups decreases as intestinal inflammation is reduced."
        },
        { 
          day: 365, 
          text: "Significantly reduced risk of stomach and esophageal cancers",
          details: "Your risk of developing cancers of the digestive tract begins to decrease noticeably."
        },
        { 
          day: 3650, 
          text: "Risk of pancreatic cancer reduced by up to 50%",
          details: "After 10 years, your risk of developing pancreatic cancer is significantly lower than when you were smoking."
        },
      ],
      currentImprovement: "Your digestive system is healing from the damage caused by smoking, improving nutrient absorption and reducing inflammation."
    },
    endocrine: {
      title: "Hormonal System",
      icon: <Clock size={24} color={colors.primary} />,
      improvements: [
        { 
          day: 1, 
          text: "Adrenaline and cortisol levels begin to normalize",
          details: "Stress hormone production starts to return to normal levels, reducing feelings of anxiety and stress."
        },
        { 
          day: 7, 
          text: "Improved insulin sensitivity begins",
          details: "Your body's cells become more responsive to insulin, improving blood sugar regulation."
        },
        { 
          day: 14, 
          text: "Thyroid function begins to improve",
          details: "Thyroid hormone production and regulation start to normalize, improving metabolism."
        },
        { 
          day: 30, 
          text: "Sex hormone production improves",
          details: "Testosterone in men and estrogen in women begin to return to healthier levels, improving reproductive health."
        },
        { 
          day: 60, 
          text: "Reduced risk of type 2 diabetes development",
          details: "As insulin sensitivity improves, your risk of developing type 2 diabetes begins to decrease."
        },
        { 
          day: 90, 
          text: "Improved metabolic rate and efficiency",
          details: "Your metabolism becomes more efficient as hormone balance improves, helping with energy levels and weight management."
        },
        { 
          day: 180, 
          text: "Normalized growth hormone secretion",
          details: "Growth hormone levels normalize, improving tissue repair and maintenance throughout the body."
        },
        { 
          day: 365, 
          text: "Significantly improved fertility",
          details: "Reproductive hormones reach optimal levels, improving fertility in both men and women."
        },
      ],
      currentImprovement: "Your hormonal system is rebalancing, improving everything from stress response to metabolism and reproductive health."
    }
  };
  
  // Get relevant improvements for the selected system
  const getRelevantImprovements = () => {
    const system = healthSystems[selectedSystem];
    return system.improvements.sort((a, b) => a.day - b.day);
  };
  
  // Get current improvement based on days
  const getCurrentImprovement = () => {
    const system = healthSystems[selectedSystem];
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
    const system = healthSystems[selectedSystem];
    const maxDay = system.improvements[system.improvements.length - 1].day;
    
    return Math.min(100, Math.max(0, (totalDays / maxDay) * 100));
  };

  // Format day display (convert decimal days to hours if needed)
  const formatDayDisplay = (day: number) => {
    if (day < 1) {
      const hours = Math.round(day * 24);
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `Day ${day}`;
  };

  // Auto-scroll to show selected system button
  useEffect(() => {
    if (scrollViewRef.current) {
      // Find the index of the selected system
      const systems = Object.keys(healthSystems);
      const selectedIndex = systems.indexOf(selectedSystem);
      
      // Calculate approximate scroll position (each button is ~130px wide with margins)
      const buttonWidth = 130 + 12; // minWidth + marginRight
      const scrollPosition = selectedIndex * buttonWidth;
      
      // Scroll to position with animation
      scrollViewRef.current.scrollTo({ x: scrollPosition, animated: true });
    }
  }, [selectedSystem]);

  // Systems to display in the first row (most important)
  const primarySystems: SystemKey[] = ['respiratory', 'cardiovascular', 'psychological', 'nervous'];
  // Systems to display in the second row
  const secondarySystems: SystemKey[] = ['immune', 'digestive', 'endocrine', 'general'];
  
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
                  { width: `${nextMilestoneProgress}%`, backgroundColor: colors.progressFill }
                ]} 
              />
            </View>
          </View>
        )}
      </View>
      
      {/* Body systems selector */}
      <View style={[styles.systemSelectorCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Body Systems Recovery</Text>
        
        {/* Visual indicator that there are more options to scroll */}
        {showScrollIndicator && (
          <View style={styles.scrollIndicator}>
            <Text style={[styles.scrollText, { color: colors.textSecondary }]}>Scroll to see more</Text>
            <ChevronRight size={16} color={colors.textSecondary} />
          </View>
        )}
        
        {/* Primary systems row */}
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.systemButtonsContainer}
          onScroll={() => setShowScrollIndicator(false)}
          scrollEventThrottle={16}
        >
          {primarySystems.map((system) => (
            <TouchableOpacity 
              key={system}
              style={[
                styles.systemButton, 
                { 
                  backgroundColor: selectedSystem === system 
                    ? (system === 'psychological' ? colors.psychological || '#9c5cff' : colors.primary) 
                    : colors.background, 
                  borderColor: selectedSystem === system 
                    ? (system === 'psychological' ? colors.psychological || '#9c5cff' : colors.primary) 
                    : colors.progressBackground 
                }
              ]}
              onPress={() => setSelectedSystem(system)}
            >
              {system === 'respiratory' && (
                <Wind 
                  size={20} 
                  color={selectedSystem === system ? colors.background : colors.primary} 
                />
              )}
              {system === 'cardiovascular' && (
                <Heart 
                  size={20} 
                  color={selectedSystem === system ? colors.background : colors.primary} 
                />
              )}
              {system === 'psychological' && (
                <Zap 
                  size={20} 
                  color={selectedSystem === system ? colors.background : colors.psychological || '#9c5cff'} 
                />
              )}
              {system === 'nervous' && (
                <Brain 
                  size={20} 
                  color={selectedSystem === system ? colors.background : colors.primary} 
                />
              )}
              <Text 
                style={[
                  styles.systemButtonText,
                  { 
                    color: selectedSystem === system 
                      ? colors.background 
                      : (system === 'psychological' ? colors.psychological || '#9c5cff' : colors.text) 
                  }
                ]}
                numberOfLines={1}
              >
                {healthSystems[system].title.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
          
          {secondarySystems.map((system) => (
            <TouchableOpacity 
              key={system}
              style={[
                styles.systemButton, 
                { 
                  backgroundColor: selectedSystem === system ? colors.primary : colors.background, 
                  borderColor: selectedSystem === system ? colors.primary : colors.progressBackground 
                }
              ]}
              onPress={() => setSelectedSystem(system)}
            >
              {system === 'immune' && (
                <Shield 
                  size={20} 
                  color={selectedSystem === system ? colors.background : colors.primary} 
                />
              )}
              {system === 'digestive' && (
                <Droplet 
                  size={20} 
                  color={selectedSystem === system ? colors.background : colors.primary} 
                />
              )}
              {system === 'endocrine' && (
                <Clock 
                  size={20} 
                  color={selectedSystem === system ? colors.background : colors.primary} 
                />
              )}
              {system === 'general' && (
                <Activity 
                  size={20} 
                  color={selectedSystem === system ? colors.background : colors.primary} 
                />
              )}
              <Text 
                style={[
                  styles.systemButtonText,
                  { color: selectedSystem === system ? colors.background : colors.text }
                ]}
                numberOfLines={1}
              >
                {healthSystems[system].title.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Selected system details */}
      <View style={[styles.systemDetailsCard, { backgroundColor: colors.card }]}>
        <View style={styles.systemHeader}>
          {healthSystems[selectedSystem].icon}
          <Text style={[styles.systemTitle, { color: colors.text }]}>
            {healthSystems[selectedSystem].title}
          </Text>
        </View>
        
        <View style={styles.healingProgressContainer}>
          <Text style={[styles.healingText, { color: colors.text }]}>Healing Progress</Text>
          <View style={[styles.progressBarContainer, { backgroundColor: colors.progressBackground }]}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${getHealingPercentage()}%`, 
                  backgroundColor: selectedSystem === 'psychological' ? colors.psychological || '#9c5cff' : colors.progressFill 
                }
              ]} 
            />
          </View>
          <Text 
            style={[
              styles.percentageText, 
              { color: selectedSystem === 'psychological' ? colors.psychological || '#9c5cff' : colors.primary }
            ]}
          >
            {Math.round(getHealingPercentage())}%
          </Text>
        </View>
        
        <View 
          style={[
            styles.currentImprovementContainer, 
            { 
              backgroundColor: colors.background, 
              borderColor: selectedSystem === 'psychological' ? colors.psychological || '#9c5cff' : colors.progressBackground,
              borderLeftWidth: 4
            }
          ]}
        >
          <Info 
            size={18} 
            color={selectedSystem === 'psychological' ? colors.psychological || '#9c5cff' : colors.primary} 
          />
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
                      ? [
                          styles.achievedDot, 
                          { 
                            backgroundColor: selectedSystem === 'psychological' 
                              ? colors.psychological || '#9c5cff' 
                              : colors.primary 
                          }
                        ] 
                      : [
                          styles.upcomingDot, 
                          { 
                            backgroundColor: colors.progressBackground, 
                            borderColor: selectedSystem === 'psychological' 
                              ? (colors.psychological || '#9c5cff') + '50' 
                              : colors.inactive 
                          }
                        ]
                  ]} 
                />
                {index < getRelevantImprovements().length - 1 && (
                  <View 
                    style={[
                      styles.timelineLine,
                      totalDays >= improvement.day 
                        ? [
                            styles.achievedLine, 
                            { 
                              backgroundColor: selectedSystem === 'psychological' 
                                ? colors.psychological || '#9c5cff' 
                                : colors.primary 
                            }
                          ] 
                        : [styles.upcomingLine, { backgroundColor: colors.progressBackground }]
                    ]} 
                  />
                )}
              </View>
              
              <View style={styles.timelineContent}>
                <Text 
                  style={[
                    styles.timelineDay, 
                    { 
                      color: selectedSystem === 'psychological' 
                        ? colors.psychological || '#9c5cff' 
                        : colors.primary 
                    }
                  ]}
                >
                  {formatDayDisplay(improvement.day)}
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
                {improvement.details && (
                  <Text 
                    style={[
                      styles.timelineDetails,
                      totalDays >= improvement.day 
                        ? [styles.achievedDetails, { color: colors.textSecondary }] 
                        : [styles.upcomingDetails, { color: colors.textTertiary }]
                    ]}
                  >
                    {improvement.details}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
      
      {/* Health visualization */}
      <View style={[styles.visualizationCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Body Healing Visualization</Text>
        <Image
          source={{ uri: `https://image.pollinations.ai/prompt/${encodeURIComponent(`Medical illustration of human ${selectedSystem === 'general' ? 'body' : selectedSystem === 'psychological' ? 'brain with mood and mental health visualization' : selectedSystem} system healing after quitting smoking for ${totalDays} days, clean medical diagram style, educational, ${selectedSystem === 'psychological' ? 'purple' : 'blue'} color scheme`)}` }}
          style={styles.bodyImage}
          contentFit="cover"
          transition={1000}
        />
        <Text style={[styles.imageCaption, { color: colors.textSecondary }]}>
          Visualization of your {selectedSystem === 'general' ? 'body' : selectedSystem} system after {totalDays} days without smoking
        </Text>
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
    position: 'relative',
  },
  scrollIndicator: {
    position: 'absolute',
    right: 16,
    top: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scrollText: {
    fontSize: 12,
    marginRight: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  systemButtonsContainer: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  systemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 1,
    // Adjust width for better mobile display
    minWidth: Platform.OS === 'web' ? 130 : 110,
    maxWidth: Platform.OS === 'web' ? 150 : 120,
  },
  systemButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
    // Ensure text doesn't overflow
    flexShrink: 1,
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
    marginBottom: 20,
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
    marginBottom: -12,
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
    fontWeight: '500',
  },
  timelineDetails: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 4,
  },
  achievedText: {
  },
  upcomingText: {
  },
  achievedDetails: {
  },
  upcomingDetails: {
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
  imageCaption: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  spacer: {
    height: 40,
  },
});