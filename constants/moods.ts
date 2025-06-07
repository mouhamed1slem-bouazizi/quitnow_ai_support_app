import { MoodType } from '@/types/user';

export interface MoodOption {
  type: MoodType;
  label: string;
  emoji: string;
  color: string;
}

// Export moodOptions array for use in components
export const moodOptions: MoodOption[] = [
  {
    type: 'happy',
    label: 'Happy',
    emoji: '😊',
    color: '#FFD700', // Gold
  },
  {
    type: 'sad',
    label: 'Sad',
    emoji: '😢',
    color: '#6495ED', // Cornflower Blue
  },
  {
    type: 'angry',
    label: 'Angry',
    emoji: '😠',
    color: '#FF6347', // Tomato
  },
  {
    type: 'anxious',
    label: 'Anxious',
    emoji: '😰',
    color: '#9370DB', // Medium Purple
  },
  {
    type: 'calm',
    label: 'Calm',
    emoji: '😌',
    color: '#98FB98', // Pale Green
  },
  {
    type: 'energetic',
    label: 'Energetic',
    emoji: '⚡',
    color: '#FFA500', // Orange
  },
  {
    type: 'tired',
    label: 'Tired',
    emoji: '😴',
    color: '#778899', // Light Slate Gray
  },
  {
    type: 'neutral',
    label: 'Neutral',
    emoji: '😐',
    color: '#A9A9A9', // Dark Gray
  },
];

// Default mood option to use as fallback
const DEFAULT_MOOD: MoodOption = {
  type: 'neutral',
  label: 'Neutral',
  emoji: '😐',
  color: '#A9A9A9',
};

export const getMoodOption = (type: MoodType): MoodOption => {
  // Handle undefined or invalid mood type
  if (!type) {
    return DEFAULT_MOOD;
  }
  
  const foundMood = moodOptions.find(option => option.type === type);
  // Always return a valid mood option, defaulting to neutral if not found
  return foundMood || DEFAULT_MOOD;
};