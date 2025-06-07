import { Platform } from 'react-native';

// Activity categories to ensure variety
const ACTIVITY_CATEGORIES = [
  'physical',
  'mental',
  'breathing',
  'distraction',
  'social',
  'creative',
  'mindfulness',
  'relaxation'
];

// System prompts with variety
const SYSTEM_PROMPTS = [
  "You are a helpful assistant that generates activities to help people resist smoking cravings.",
  "You are a wellness coach specializing in helping people overcome nicotine addiction.",
  "You are a health expert who creates effective strategies for managing smoking urges.",
  "You are a mindfulness instructor who helps people redirect their focus away from cravings."
];

// User prompts with variety
const USER_PROMPTS = [
  "Generate a short activity to help someone resist a smoking craving. Format as JSON with 'title' (5-7 words) and 'description' (2-3 sentences explaining how to do it and why it helps).",
  "Create a quick exercise someone can do when they feel the urge to smoke. Format as JSON with 'title' (5-7 words) and 'description' (2-3 sentences explaining the activity).",
  "Suggest a brief activity to distract from nicotine cravings. Format as JSON with 'title' (5-7 words) and 'description' (2-3 sentences with clear instructions).",
  "Design a simple technique to overcome a smoking urge. Format as JSON with 'title' (5-7 words) and 'description' (2-3 sentences that are easy to follow)."
];

// Image prompt enhancers for variety
const IMAGE_ENHANCERS = [
  "healthy lifestyle, wellness activity, high quality, detailed, 4k",
  "mindfulness practice, stress relief, vibrant colors, detailed illustration",
  "healthy habit, modern lifestyle, clean design, high resolution",
  "wellness technique, calm atmosphere, soft lighting, professional photography",
  "health improvement, positive energy, bright colors, detailed rendering",
  "self-care routine, peaceful environment, natural lighting, artistic style",
  "wellness practice, serene setting, gentle colors, minimalist aesthetic",
  "healthy activity, outdoor scene, fresh air, photorealistic style",
  "mental health exercise, calming environment, soft focus, professional quality",
  "stress management technique, tranquil scene, balanced composition, high detail"
];

// Additional image styles for even more variety
const IMAGE_STYLES = [
  "digital art style",
  "watercolor painting style",
  "photorealistic",
  "minimalist illustration",
  "vibrant colors",
  "soft pastel tones",
  "modern graphic design",
  "clean line art",
  "3D rendering",
  "artistic photography"
];

// Helper function to get a random item from an array
const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Helper function to ensure we don't repeat the last item
const getRandomItemExcept = <T>(array: T[], except: T): T => {
  if (array.length <= 1) return array[0];
  let item;
  do {
    item = getRandomItem(array);
  } while (item === except);
  return item;
};

// Track last used values to avoid repetition
let lastCategory = '';
let lastSystemPrompt = '';
let lastUserPrompt = '';
let lastImageEnhancer = '';
let lastImageStyle = '';
let lastActivityTitles: string[] = [];

// AI service for generating text and images
export const aiService = {
  // Generate motivational text based on user's progress
  generateMotivationalText: async (days: number): Promise<string> => {
    try {
      // Add randomization to the prompt
      const adjectives = ["encouraging", "motivational", "uplifting", "inspiring", "positive", "supportive", "empowering"];
      const randomAdjective = getRandomItem(adjectives);
      
      const prompt = encodeURIComponent(
        `Generate a short, ${randomAdjective} message for someone who has been smoke-free for ${days} days. Keep it supportive and under 150 characters. Make it unique and personalized.`
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
      // Add randomization to the prompt
      const activityTypes = ["physical", "mental", "breathing", "distraction", "social", "creative", "mindfulness"];
      const randomType = getRandomItem(activityTypes);
      
      const prompt = encodeURIComponent(
        `Suggest a quick, simple ${randomType} activity to help someone resist a smoking craving. Make it specific, actionable, and under 100 characters. Be creative and unique.`
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
      // Add randomization to the prompt
      const factTypes = ["short-term benefits", "long-term benefits", "financial benefits", "social benefits", "negative effects of smoking", "psychological benefits", "physical improvements"];
      const randomFactType = getRandomItem(factTypes);
      
      const prompt = encodeURIComponent(
        `Share an interesting fact about the ${randomFactType} of quitting smoking. Keep it under 150 characters and make it scientifically accurate but easy to understand.`
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
  generateActivityWithImage: async (categoryOverride?: string): Promise<{
    title: string;
    description: string;
    imageUrl: string;
  }> => {
    try {
      // Select a category, ensuring it's different from the last one
      const category = categoryOverride || getRandomItemExcept(ACTIVITY_CATEGORIES, lastCategory);
      lastCategory = category;
      
      // Select prompts, ensuring they're different from the last ones
      const systemPrompt = getRandomItemExcept(SYSTEM_PROMPTS, lastSystemPrompt);
      lastSystemPrompt = systemPrompt;
      
      const userPrompt = getRandomItemExcept(USER_PROMPTS, lastUserPrompt);
      lastUserPrompt = userPrompt;
      
      // Add the category to make the request more specific
      const enhancedUserPrompt = userPrompt.replace(
        "Generate a short activity", 
        `Generate a short ${category} activity`
      ).replace(
        "Create a quick exercise", 
        `Create a quick ${category} exercise`
      ).replace(
        "Suggest a brief activity", 
        `Suggest a brief ${category} activity`
      ).replace(
        "Design a simple technique", 
        `Design a simple ${category} technique`
      );
      
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      
      // Generate activity title and description using LLM
      const messages = [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `${enhancedUserPrompt} Make sure it's unique and different from these previous activities: ${lastActivityTitles.join(", ")}. (request_id: ${timestamp})`
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
          title: titleMatch ? titleMatch[1] : `Quick ${category.charAt(0).toUpperCase() + category.slice(1)} Activity`,
          description: descriptionMatch ? descriptionMatch[1] : `Engage in a brief ${category} activity to redirect your focus away from cravings.`
        };
      }
      
      // Update last activity titles to avoid repetition
      lastActivityTitles = [...lastActivityTitles, activityData.title].slice(-5);
      
      // Select an image enhancer and style, ensuring they're different from the last ones
      const imageEnhancer = getRandomItemExcept(IMAGE_ENHANCERS, lastImageEnhancer);
      lastImageEnhancer = imageEnhancer;
      
      const imageStyle = getRandomItemExcept(IMAGE_STYLES, lastImageStyle);
      lastImageStyle = imageStyle;
      
      // Generate image using Pollinations AI based on the activity title and category
      // Add timestamp, random seed, and style to ensure uniqueness
      const randomSeed = Math.floor(Math.random() * 100000);
      const imagePrompt = encodeURIComponent(`${activityData.title}, ${category} activity, ${imageEnhancer}, ${imageStyle}`);
      const imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?seed=${randomSeed}&random=${timestamp}`;
      
      return {
        title: activityData.title,
        description: activityData.description,
        imageUrl: imageUrl
      };
    } catch (error) {
      console.error('Error generating activity with image:', error);
      
      // Fallback options if the API fails - make these more diverse too
      const fallbackActivities = [
        {
          title: "Deep Breathing Exercise",
          description: "Take 10 deep breaths, inhaling through your nose for 4 counts and exhaling through your mouth for 6 counts. This helps reduce stress and shift focus away from cravings.",
          imageUrl: `https://image.pollinations.ai/prompt/Deep%20breathing%20exercise%2C%20meditation%2C%20calm%2C%20peaceful%2C%20high%20quality?random=${new Date().getTime()}&seed=${Math.random() * 10000}`
        },
        {
          title: "Quick Walk Outside",
          description: "Step outside for a 5-minute walk. Focus on the sensations around you - the air on your skin, the sounds in your environment, and the rhythm of your steps.",
          imageUrl: `https://image.pollinations.ai/prompt/Person%20walking%20outside%2C%20nature%2C%20fresh%20air%2C%20healthy%20activity%2C%20high%20quality?random=${new Date().getTime()}&seed=${Math.random() * 10000}`
        },
        {
          title: "Drink Water Mindfully",
          description: "Slowly drink a full glass of water, focusing on the sensation of each sip. This provides a moment of mindfulness and helps flush toxins from your body.",
          imageUrl: `https://image.pollinations.ai/prompt/Glass%20of%20water%2C%20hydration%2C%20mindfulness%2C%20healthy%20habit%2C%20high%20quality?random=${new Date().getTime()}&seed=${Math.random() * 10000}`
        },
        {
          title: "Hand-Eye Coordination Game",
          description: "Play a quick game on your phone that requires focus and coordination. This redirects your attention and gives your hands something to do besides reaching for a cigarette.",
          imageUrl: `https://image.pollinations.ai/prompt/Mobile%20game%2C%20focus%2C%20concentration%2C%20distraction%20activity%2C%20high%20quality?random=${new Date().getTime()}&seed=${Math.random() * 10000}`
        },
        {
          title: "Progressive Muscle Relaxation",
          description: "Tense and then release each muscle group in your body, starting from your toes and working up to your head. This reduces physical tension associated with cravings.",
          imageUrl: `https://image.pollinations.ai/prompt/Relaxation%20technique%2C%20calm%20body%2C%20stress%20relief%2C%20peaceful%2C%20high%20quality?random=${new Date().getTime()}&seed=${Math.random() * 10000}`
        },
        {
          title: "Write a Quick Gratitude List",
          description: "Take 2 minutes to write down 3 things you're grateful for today. This shifts your focus to positive aspects of life and away from cravings.",
          imageUrl: `https://image.pollinations.ai/prompt/Gratitude%20journal%2C%20writing%2C%20positive%20thinking%2C%20mindfulness%2C%20high%20quality?random=${new Date().getTime()}&seed=${Math.random() * 10000}`
        },
        {
          title: "Stretch Your Body",
          description: "Do a quick full-body stretch routine. Reach for the sky, touch your toes, and twist gently from side to side. Physical movement helps reduce craving intensity.",
          imageUrl: `https://image.pollinations.ai/prompt/Person%20stretching%2C%20yoga%2C%20flexibility%2C%20wellness%2C%20high%20quality?random=${new Date().getTime()}&seed=${Math.random() * 10000}`
        },
        {
          title: "Play with a Fidget Toy",
          description: "Use a stress ball, fidget spinner, or other tactile object to keep your hands busy. The sensory stimulation can help distract your mind from cravings.",
          imageUrl: `https://image.pollinations.ai/prompt/Fidget%20toy%2C%20stress%20relief%2C%20hand%20activity%2C%20distraction%20technique%2C%20high%20quality?random=${new Date().getTime()}&seed=${Math.random() * 10000}`
        },
        {
          title: "Listen to Upbeat Music",
          description: "Play your favorite energetic song and focus on the rhythm and lyrics. Music can shift your mood and provide a positive distraction from cravings.",
          imageUrl: `https://image.pollinations.ai/prompt/Person%20listening%20to%20music%2C%20headphones%2C%20enjoyment%2C%20distraction%20activity%2C%20high%20quality?random=${new Date().getTime()}&seed=${Math.random() * 10000}`
        },
        {
          title: "Quick Cleaning Task",
          description: "Choose one small area to clean or organize for 5 minutes. This productive activity keeps your hands busy and gives you a sense of accomplishment.",
          imageUrl: `https://image.pollinations.ai/prompt/Person%20organizing%20desk%2C%20cleaning%2C%20productive%20activity%2C%20focus%2C%20high%20quality?random=${new Date().getTime()}&seed=${Math.random() * 10000}`
        }
      ];
      
      // Ensure we don't repeat fallback activities
      let availableActivities = fallbackActivities.filter(activity => 
        !lastActivityTitles.includes(activity.title)
      );
      
      // If all have been used, reset and use any
      if (availableActivities.length === 0) {
        availableActivities = fallbackActivities;
      }
      
      const randomIndex = Math.floor(Math.random() * availableActivities.length);
      const selectedActivity = availableActivities[randomIndex];
      
      // Update last activity titles
      lastActivityTitles = [...lastActivityTitles, selectedActivity.title].slice(-5);
      
      return selectedActivity;
    }
  },
  
  // Generate progress image URL
  getProgressImageUrl: (days: number): string => {
    let prompt: string;
    
    // Add randomization to the prompts
    const randomSeed = Math.floor(Math.random() * 100000);
    const timestamp = new Date().getTime();
    const randomStyle = getRandomItem(IMAGE_STYLES);
    
    if (days < 7) {
      const earlyPrompts = [
        "A small green sprout emerging from soil, symbolizing new beginnings and quitting smoking",
        "A tiny seedling breaking through earth, representing the start of a smoke-free journey",
        "A fresh green shoot growing from the ground, symbolizing the early days of quitting smoking",
        "A delicate sprout with first leaves, representing the beginning of a healthy lifestyle"
      ];
      prompt = getRandomItem(earlyPrompts);
    } else if (days < 30) {
      const weekPrompts = [
        "A growing plant with small leaves, representing progress in quitting smoking",
        "A young plant with developing foliage, showing the journey of becoming smoke-free",
        "A budding plant with fresh green leaves, symbolizing weeks without smoking",
        "A small plant reaching toward sunlight, representing growth in a smoke-free life"
      ];
      prompt = getRandomItem(weekPrompts);
    } else if (days < 90) {
      const monthPrompts = [
        "A healthy plant with many leaves, showing significant progress in quitting smoking",
        "A thriving plant with abundant foliage, representing months of being smoke-free",
        "A flourishing plant with lush greenery, symbolizing the benefits of quitting smoking",
        "A vibrant plant with strong stems, showing resilience in the quit smoking journey"
      ];
      prompt = getRandomItem(monthPrompts);
    } else if (days < 180) {
      const quarterPrompts = [
        "A small tree with strong branches, symbolizing months of being smoke-free",
        "A young tree with developing branches and leaves, representing a significant smoke-free journey",
        "A growing tree with sturdy trunk, showing the strength gained from quitting smoking",
        "A sapling becoming a tree, representing transformation after quitting smoking"
      ];
      prompt = getRandomItem(quarterPrompts);
    } else {
      const longTermPrompts = [
        "A large, healthy tree with abundant foliage, representing a long-term smoke-free life",
        "A majestic tree with deep roots and full canopy, symbolizing the lasting benefits of quitting smoking",
        "A magnificent tree in full bloom, showing the transformation achieved by staying smoke-free",
        "A mature tree providing shade and oxygen, symbolizing the positive impact of quitting smoking"
      ];
      prompt = getRandomItem(longTermPrompts);
    }
    
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ", " + randomStyle)}?seed=${randomSeed}&random=${timestamp}`;
  },
  
  // Generate achievement celebration image URL
  getAchievementImageUrl: (achievement: string): string => {
    // Add variety to the prompts
    const celebrationStyles = [
      "digital art style",
      "watercolor painting",
      "modern illustration",
      "vibrant graphic design",
      "minimalist art",
      "3D rendering",
      "photorealistic style",
      "comic book style",
      "abstract art",
      "pop art style"
    ];
    
    const randomStyle = getRandomItem(celebrationStyles);
    const randomSeed = Math.floor(Math.random() * 100000);
    const timestamp = new Date().getTime();
    
    const prompt = encodeURIComponent(
      `A celebratory image for ${achievement}, symbolizing success in quitting smoking, ${randomStyle}`
    );
    
    return `https://image.pollinations.ai/prompt/${prompt}?seed=${randomSeed}&random=${timestamp}`;
  }
};