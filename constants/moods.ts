import { MoodType } from '@/types/user';

export interface MoodOption {
  type: MoodType;
  label: string;
  emoji: string;
  color: string;
}

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

export const getMoodOption = (type: MoodType): MoodOption => {
  return moodOptions.find(option => option.type === type) || moodOptions[7]; // Default to neutral
};