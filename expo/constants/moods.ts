import { MoodType } from '@/types/user';

export interface MoodOption {
  type: MoodType;
  emoji: string;
  label: string;
  color: string;
}

export const moodOptions: MoodOption[] = [
  {
    type: 'great',
    emoji: '😁',
    label: 'Great',
    color: '#4CC9F0',
  },
  {
    type: 'good',
    emoji: '🙂',
    label: 'Good',
    color: '#4361EE',
  },
  {
    type: 'neutral',
    emoji: '😐',
    label: 'Neutral',
    color: '#7209B7',
  },
  {
    type: 'bad',
    emoji: '😕',
    label: 'Bad',
    color: '#F72585',
  },
  {
    type: 'awful',
    emoji: '😫',
    label: 'Awful',
    color: '#FF4D6D',
  },
];

export const getMoodOption = (moodType: MoodType): MoodOption | undefined => {
  return moodOptions.find(option => option.type === moodType);
};