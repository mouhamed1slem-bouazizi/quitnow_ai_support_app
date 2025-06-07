import { MoodType } from '@/types/user';

export interface MoodOption {
  id: MoodType;
  label: string;
  emoji: string;
  color: string;
}

// Export MOODS array for use in components
export const MOODS: MoodOption[] = [
  {
    id: 'happy',
    label: 'Happy',
    emoji: '😊',
    color: '#FFD700', // Gold
  },
  {
    id: 'sad',
    label: 'Sad',
    emoji: '😢',
    color: '#6495ED', // Cornflower Blue
  },
  {
    id: 'angry',
    label: 'Angry',
    emoji: '😠',
    color: '#FF6347', // Tomato
  },
  {
    id: 'anxious',
    label: 'Anxious',
    emoji: '😰',
    color: '#9370DB', // Medium Purple
  },
  {
    id: 'calm',
    label: 'Calm',
    emoji: '😌',
    color: '#98FB98', // Pale Green
  },
  {
    id: 'energetic',
    label: 'Energetic',
    emoji: '⚡',
    color: '#FFA500', // Orange
  },
  {
    id: 'tired',
    label: 'Tired',
    emoji: '😴',
    color: '#778899', // Light Slate Gray
  },
  {
    id: 'neutral',
    label: 'Neutral',
    emoji: '😐',
    color: '#A9A9A9', // Dark Gray
  },
];

// Default mood option to use as fallback
const DEFAULT_MOOD: MoodOption = {
  id: 'neutral',
  label: 'Neutral',
  emoji: '😐',
  color: '#A9A9A9',
};

export const getMoodOption = (type: MoodType): MoodOption => {
  // Handle undefined or invalid mood type
  if (!type) {
    return DEFAULT_MOOD;
  }
  
  const foundMood = MOODS.find(option => option.id === type);
  // Always return a valid mood option, defaulting to neutral if not found
  return foundMood || DEFAULT_MOOD;
};