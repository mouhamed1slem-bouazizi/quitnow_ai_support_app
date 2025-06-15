# 🚭 QuitNow AI Support App

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![AI Powered](https://img.shields.io/badge/AI-Powered-green.svg)
![React](https://img.shields.io/badge/React-18+-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)
![Mobile Ready](https://img.shields.io/badge/Mobile-Ready-orange.svg)

> An AI-powered support application designed to help users quit smoking and overcome addiction through intelligent guidance, personalized support, and community features.

## 🎯 Project Overview

QuitNow AI Support App is a comprehensive digital companion that leverages artificial intelligence to provide personalized support for individuals on their journey to quit smoking. The app combines behavioral psychology, AI-driven insights, and community support to maximize success rates and provide 24/7 assistance during challenging moments.

## ✨ Key Features

### 🤖 AI-Powered Support
- **Intelligent Chatbot**: 24/7 AI companion for instant support and motivation
- **Personalized Advice**: Tailored recommendations based on user behavior and progress
- **Craving Prediction**: AI algorithms that predict and prevent relapse moments
- **Emotional Analysis**: Mood tracking and emotional support through AI insights

### 📊 Progress Tracking
- **Real-time Statistics**: Track days smoke-free, money saved, and health improvements
- **Milestone Celebrations**: Achievement badges and progress celebrations
- **Health Recovery Timeline**: Visual representation of body recovery process
- **Habit Pattern Analysis**: AI-powered insights into smoking triggers and patterns

### 💪 Motivation & Support
- **Daily Challenges**: Personalized tasks to keep users engaged and motivated
- **Emergency Support**: Instant AI assistance during strong cravings
- **Positive Reinforcement**: Motivational messages and success stories
- **Community Connection**: Connect with others on similar journeys

### 📱 Smart Notifications
- **Craving Alerts**: Proactive support when AI detects high-risk moments
- **Milestone Reminders**: Celebrate achievements and progress
- **Health Updates**: Regular updates on body recovery and improvements
- **Motivational Messages**: Daily inspiration and encouragement

## 🛠️ Technology Stack

### Frontend
- **Framework**: React Native / React.js for cross-platform compatibility
- **Language**: TypeScript for type safety and better development experience
- **State Management**: Redux Toolkit or Zustand for state management
- **UI Library**: React Native Elements / Material-UI for consistent design

### Backend & AI
- **Runtime**: Node.js with Express.js framework
- **Database**: MongoDB / PostgreSQL for user data storage
- **AI Services**: OpenAI GPT API for intelligent conversations
- **Machine Learning**: TensorFlow.js for pattern recognition and predictions
- **Authentication**: JWT-based secure authentication

### Additional Services
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Analytics**: Google Analytics for user behavior insights
- **Cloud Storage**: AWS S3 / Google Cloud Storage
- **Deployment**: Docker containers with cloud deployment

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn package manager
- React Native CLI (for mobile development)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mouhamed1slem-bouazizi/quitnow_ai_support_app.git
   cd quitnow_ai_support_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   # API Configuration
   OPENAI_API_KEY=your_openai_api_key
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_PROJECT_ID=your_firebase_project_id
   
   # Database Configuration
   DATABASE_URL=your_database_connection_string
   
   # Authentication
   JWT_SECRET=your_jwt_secret_key
   
   # Notification Services
   FCM_SERVER_KEY=your_fcm_server_key
   ```

4. **Database Setup**
   
   Initialize the database:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the development server**
   
   For web version:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   
   For mobile version:
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

## 📁 Project Structure

```
quitnow_ai_support_app/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Common components
│   │   ├── chat/            # AI chat components
│   │   ├── progress/        # Progress tracking components
│   │   └── notifications/   # Notification components
│   ├── screens/             # Application screens
│   │   ├── auth/           # Authentication screens
│   │   ├── dashboard/      # Main dashboard
│   │   ├── chat/           # AI chat interface
│   │   ├── progress/       # Progress tracking
│   │   └── settings/       # User settings
│   ├── services/           # API and external services
│   │   ├── ai/             # AI service integration
│   │   ├── auth/           # Authentication services
│   │   ├── database/       # Database operations
│   │   └── notifications/  # Push notification services
│   ├── utils/              # Utility functions
│   ├── hooks/              # Custom React hooks
│   ├── store/              # State management
│   └── types/              # TypeScript type definitions
├── server/                 # Backend server code
│   ├── routes/             # API routes
│   ├── controllers/        # Route controllers
│   ├── models/             # Database models
│   ├── middleware/         # Express middleware
│   └── utils/              # Server utilities
├── assets/                 # Images, fonts, and static files
├── docs/                   # Documentation
└── tests/                  # Test files
```

## 🎮 Usage Guide

### Getting Started
1. **Sign Up**: Create an account with email or social login
2. **Initial Setup**: Complete the quit smoking assessment
3. **Set Your Quit Date**: Choose your target quit date
4. **Personalize Settings**: Configure notification preferences and goals

### Daily Usage
- **Check Progress**: View your smoke-free days and health improvements
- **Chat with AI**: Get instant support and advice from the AI companion
- **Complete Challenges**: Engage with daily motivational tasks
- **Track Cravings**: Log cravings and receive immediate AI support

### AI Chat Features
- **Emergency Support**: Type "HELP" for immediate craving assistance
- **Daily Check-ins**: Regular mood and progress assessments
- **Personalized Tips**: Receive advice tailored to your specific situation
- **Motivational Quotes**: Daily inspiration and success stories

## 🧠 AI Features Explained

### Craving Prediction Algorithm
The app uses machine learning to analyze:
- User behavior patterns
- Time-based craving trends
- Emotional state indicators
- Environmental trigger factors

### Personalized Support System
- **Adaptive Responses**: AI learns from user interactions
- **Contextual Awareness**: Understands user's current situation
- **Emotional Intelligence**: Recognizes and responds to emotional states
- **Progress-Based Guidance**: Adjusts advice based on quit journey stage

## 📊 Health Benefits Tracking

The app tracks and displays:
- **Immediate Benefits** (20 minutes - 24 hours)
  - Heart rate normalization
  - Carbon monoxide level reduction
  - Improved circulation

- **Short-term Benefits** (2 weeks - 3 months)
  - Lung function improvement
  - Reduced infection risk
  - Better physical fitness

- **Long-term Benefits** (1-15 years)
  - Cancer risk reduction
  - Heart disease risk decrease
  - Life expectancy improvement

## 🧪 Testing

Run the test suite:
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 🚀 Deployment

### Web Deployment
```bash
# Build for production
npm run build

# Deploy to cloud platform
npm run deploy
```

### Mobile App Deployment
```bash
# Build Android APK
npm run build:android

# Build iOS IPA
npm run build:ios

# Deploy to app stores
npm run deploy:stores
```

## 🤝 Contributing

We welcome contributions to help people quit smoking! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** for new features
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Contributing Guidelines
- Follow the existing code style and conventions
- Write tests for new features
- Update documentation for any API changes
- Ensure accessibility compliance
- Test on multiple devices and screen sizes

## 🔒 Privacy & Security

- **Data Encryption**: All user data is encrypted at rest and in transit
- **Privacy First**: No personal data is shared with third parties
- **Local Storage**: Sensitive data stored locally when possible
- **Compliance**: GDPR and CCPA compliant data handling
- **Anonymous Analytics**: User behavior tracked anonymously for app improvement

## 📱 Platform Support

- **iOS**: Supports iOS 12.0 and above
- **Android**: Supports Android 7.0 (API level 24) and above
- **Web**: Modern browsers with ES6+ support
- **PWA**: Progressive Web App capabilities for offline use

## 🆘 Support & Resources

### Emergency Resources
- **Crisis Hotline**: 1-800-QUIT-NOW (US)
- **Text Support**: Text "QUIT" to 47848
- **Online Support**: [smokefree.gov](https://smokefree.gov)

### In-App Support
- **AI Chat**: 24/7 intelligent support companion
- **Help Center**: Comprehensive FAQ and guides
- **Community Forum**: Connect with other users
- **Professional Resources**: Links to counseling services

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **World Health Organization** for smoking cessation guidelines
- **American Cancer Society** for health benefit timelines
- **OpenAI** for providing AI capabilities
- **Quit smoking community** for insights and feedback
- **Healthcare professionals** who provided medical guidance

## 📞 Contact

**Mohamed Islem Bouazizi**
- GitHub: [@mouhamed1slem-bouazizi](https://github.com/mouhamed1slem-bouazizi)
- LinkedIn: [Your LinkedIn Profile](https://www.linkedin.com/in/mouhamed-islem-bouazizi-692051a1/)
- Email: mib@programmer.net

## 🌟 Show Your Support

If this app has helped you or someone you know quit smoking:
- ⭐ Star this repository
- 📱 Share the app with others trying to quit
- 💬 Leave feedback and suggestions
- 🤝 Contribute to the project
- 💝 Consider supporting addiction recovery organizations

---

**🚭 Every journey begins with a single step. Your smoke-free life starts today!**

*Disclaimer: This app is designed to support your quit journey but is not a substitute for professional medical advice. Please consult healthcare providers for personalized medical guidance.*
