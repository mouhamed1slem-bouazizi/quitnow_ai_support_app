import { Platform } from 'react-native';

// AI service for generating text and images
export const aiService = {
  // Generate motivational text based on user's progress
  generateMotivationalText: async (days: number): Promise<string> => {
    try {
      const prompt = encodeURIComponent(
        `Generate a short, encouraging message for someone who has been smoke-free for ${days} days. Keep it positive, supportive, and under 150 characters.`
      );
      
      const response = await fetch(`https://text.pollinations.ai/${prompt}`);
      
      if (!response.ok) {
        throw new Error('Failed to generate motivational text');
      }
      
      const text = await response.text();
      return text.trim();
    } catch (error) {
      console.error('Error generating motivational text:', error);
      return "You're doing great! Every day without smoking is a victory for your health.";
    }
  },
  
  // Generate activity suggestion
  generateActivitySuggestion: async (): Promise<string> => {
    try {
      const prompt = encodeURIComponent(
        "Suggest a quick, simple activity to help someone resist a smoking craving. Keep it under 100 characters."
      );
      
      const response = await fetch(`https://text.pollinations.ai/${prompt}`);
      
      if (!response.ok) {
        throw new Error('Failed to generate activity suggestion');
      }
      
      const text = await response.text();
      return text.trim();
    } catch (error) {
      console.error('Error generating activity suggestion:', error);
      return "Take 10 deep breaths while counting slowly. Focus on the sensation of air filling your lungs.";
    }
  },
  
  // Generate health fact
  generateHealthFact: async (): Promise<string> => {
    try {
      const prompt = encodeURIComponent(
        "Share an interesting fact about the health benefits of quitting smoking or the negative effects of smoking. Keep it under 150 characters."
      );
      
      const response = await fetch(`https://text.pollinations.ai/${prompt}`);
      
      if (!response.ok) {
        throw new Error('Failed to generate health fact');
      }
      
      const text = await response.text();
      return text.trim();
    } catch (error) {
      console.error('Error generating health fact:', error);
      return "Within 20 minutes of quitting smoking, your heart rate drops to a normal level, and blood pressure begins to stabilize.";
    }
  },
  
  // Generate activity with image
  generateActivityWithImage: async (): Promise<{
    title: string;
    description: string;
    imageUrl: string;
  }> => {
    try {
      // Generate activity title and description using LLM
      const messages = [
        {
          role: "system",
          content: "You are a helpful assistant that generates activities to help people resist smoking cravings."
        },
        {
          role: "user",
          content: "Generate a short activity to help someone resist a smoking craving. Format as JSON with 'title' (5-7 words) and 'description' (2-3 sentences explaining how to do it and why it helps)."
        }
      ];
      
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate activity');
      }
      
      const data = await response.json();
      let activityData;
      
      try {
        // Try to parse the completion as JSON
        activityData = JSON.parse(data.completion);
      } catch (e) {
        // If parsing fails, use a regex to extract title and description
        const titleMatch = data.completion.match(/["']title["']\s*:\s*["'](.+?)["']/);
        const descriptionMatch = data.completion.match(/["']description["']\s*:\s*["'](.+?)["']/);
        
        activityData = {
          title: titleMatch ? titleMatch[1] : "Quick Distraction Activity",
          description: descriptionMatch ? descriptionMatch[1] : "Engage in a brief activity to redirect your focus away from cravings."
        };
      }
      
      // Generate image using Pollinations AI based on the activity title
      const imagePrompt = encodeURIComponent(`${activityData.title}, healthy lifestyle, wellness activity, high quality, detailed, 4k`);
      const imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}`;
      
      return {
        title: activityData.title,
        description: activityData.description,
        imageUrl: imageUrl
      };
    } catch (error) {
      console.error('Error generating activity with image:', error);
      
      // Fallback options if the API fails
      const fallbackActivities = [
        {
          title: "Deep Breathing Exercise",
          description: "Take 10 deep breaths, inhaling through your nose for 4 counts and exhaling through your mouth for 6 counts. This helps reduce stress and shift focus away from cravings.",
          imageUrl: "https://image.pollinations.ai/prompt/Deep%20breathing%20exercise%2C%20meditation%2C%20calm%2C%20peaceful%2C%20high%20quality"
        },
        {
          title: "Quick Walk Outside",
          description: "Step outside for a 5-minute walk. Focus on the sensations around you - the air on your skin, the sounds in your environment, and the rhythm of your steps.",
          imageUrl: "https://image.pollinations.ai/prompt/Person%20walking%20outside%2C%20nature%2C%20fresh%20air%2C%20healthy%20activity%2C%20high%20quality"
        },
        {
          title: "Drink Water Mindfully",
          description: "Slowly drink a full glass of water, focusing on the sensation of each sip. This provides a moment of mindfulness and helps flush toxins from your body.",
          imageUrl: "https://image.pollinations.ai/prompt/Glass%20of%20water%2C%20hydration%2C%20mindfulness%2C%20healthy%20habit%2C%20high%20quality"
        },
        {
          title: "Hand-Eye Coordination Game",
          description: "Play a quick game on your phone that requires focus and coordination. This redirects your attention and gives your hands something to do besides reaching for a cigarette.",
          imageUrl: "https://image.pollinations.ai/prompt/Mobile%20game%2C%20focus%2C%20concentration%2C%20distraction%20activity%2C%20high%20quality"
        }
      ];
      
      const randomIndex = Math.floor(Math.random() * fallbackActivities.length);
      return fallbackActivities[randomIndex];
    }
  },
  
  // Generate progress image URL
  getProgressImageUrl: (days: number): string => {
    let prompt: string;
    
    if (days < 7) {
      prompt = "A small green sprout emerging from soil, symbolizing new beginnings and quitting smoking";
    } else if (days < 30) {
      prompt = "A growing plant with small leaves, representing progress in quitting smoking";
    } else if (days < 90) {
      prompt = "A healthy plant with many leaves, showing significant progress in quitting smoking";
    } else if (days < 180) {
      prompt = "A small tree with strong branches, symbolizing months of being smoke-free";
    } else {
      prompt = "A large, healthy tree with abundant foliage, representing a long-term smoke-free life";
    }
    
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
  },
  
  // Generate achievement celebration image URL
  getAchievementImageUrl: (achievement: string): string => {
    const prompt = encodeURIComponent(
      `A celebratory image for ${achievement}, symbolizing success in quitting smoking, digital art style`
    );
    
    return `https://image.pollinations.ai/prompt/${prompt}`;
  }
};