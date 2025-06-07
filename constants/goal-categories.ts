import { UserProfile } from '@/types/user';

export interface GoalCategory {
  id: string;
  name: string;
  color: string;
  calculateProgress: (profile: UserProfile, smokeFreeTime: { days: number; hours: number; minutes: number }) => number;
  description: string;
}

export const goalCategories: GoalCategory[] = [
  {
    id: 'health',
    name: 'Health',
    color: '#FF8AAE', // Pink
    calculateProgress: (profile, smokeFreeTime) => {
      // Health improves gradually over 1 year (365 days)
      return Math.min(100, (smokeFreeTime.days / 365) * 100);
    },
    description: 'Overall health improvements from quitting smoking'
  },
  {
    id: 'progress',
    name: 'Progress',
    color: '#FFD166', // Yellow
    calculateProgress: (profile, smokeFreeTime) => {
      // Progress based on cigarettes not smoked vs a target of 10,000
      const cigarettesPerDay = profile.cigarettesPerDay;
      const cigarettesAvoided = Math.floor(smokeFreeTime.days * cigarettesPerDay);
      return Math.min(100, (cigarettesAvoided / 10000) * 100);
    },
    description: 'Progress toward avoiding 10,000 cigarettes'
  },
  {
    id: 'ecology',
    name: 'Ecology',
    color: '#83E377', // Green
    calculateProgress: (profile, smokeFreeTime) => {
      // Environmental impact improves over 2 years
      return Math.min(100, (smokeFreeTime.days / 730) * 100);
    },
    description: 'Positive environmental impact from not smoking'
  },
  {
    id: 'body',
    name: 'Body',
    color: '#FF9E64', // Orange
    calculateProgress: (profile, smokeFreeTime) => {
      // Body recovery over 5 years
      return Math.min(100, (smokeFreeTime.days / 1825) * 100);
    },
    description: 'Physical body recovery from smoking damage'
  },
  {
    id: 'wellbeing',
    name: 'Wellbeing',
    color: '#6EEDF0', // Teal
    calculateProgress: (profile, smokeFreeTime) => {
      // Mental wellbeing improves over 6 months
      return Math.min(100, (smokeFreeTime.days / 180) * 100);
    },
    description: 'Mental and emotional wellbeing improvements'
  },
  {
    id: 'lungs',
    name: 'Lungs',
    color: '#A0C4FF', // Light blue
    calculateProgress: (profile, smokeFreeTime) => {
      // Lung function improves over 10 years
      return Math.min(100, (smokeFreeTime.days / 3650) * 100);
    },
    description: 'Lung capacity and function recovery'
  },
  {
    id: 'time',
    name: 'Time',
    color: '#9BF6FF', // Cyan
    calculateProgress: (profile, smokeFreeTime) => {
      // Time saved from not smoking (assuming 5 min per cigarette)
      const cigarettesPerDay = profile.cigarettesPerDay;
      const minutesSaved = smokeFreeTime.days * cigarettesPerDay * 5;
      // Target: 10,000 minutes saved
      return Math.min(100, (minutesSaved / 10000) * 100);
    },
    description: 'Time saved by not taking smoking breaks'
  },
  {
    id: 'nicotine',
    name: 'Nicotine',
    color: '#D0BFFF', // Purple
    calculateProgress: (profile, smokeFreeTime) => {
      // Nicotine dependence decreases over 3 months
      return Math.min(100, (smokeFreeTime.days / 90) * 100);
    },
    description: 'Freedom from nicotine dependence'
  },
  {
    id: 'trophies',
    name: 'Trophies',
    color: '#00E99E', // Bright green
    calculateProgress: (profile, smokeFreeTime) => {
      // Trophies based on achievements earned
      return Math.min(100, (profile.achievements.length / 10) * 100);
    },
    description: 'Achievements and milestones reached'
  }
];