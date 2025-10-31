# 🌙 AI Mood Journal

> **Track your emotions with AI-powered insights**

An intelligent mobile application built with React Native (Expo) that helps users understand their emotional well-being through AI-powered mood analysis and trend visualization.

[![Made with Expo](https://img.shields.io/badge/Made%20with-Expo-000020.svg?style=flat&logo=expo)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Backend-Firebase-FFCA28?style=flat&logo=firebase)](https://firebase.google.com/)
[![OpenAI](https://img.shields.io/badge/AI-OpenAI%20GPT--3.5-412991?style=flat&logo=openai)](https://openai.com/)
[![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?style=flat&logo=react)](https://reactnative.dev/)

---

## 📱 About The Project

**AI Mood Journal** is a personal wellness companion that combines journaling with artificial intelligence to help users:

- ✍️ Record daily thoughts and feelings
- 🤖 Get instant AI-powered mood analysis
- 📊 Visualize emotional patterns over time
- 💡 Receive personalized wellness suggestions

Built as part of **Vibe Coding Sprint** to demonstrate rapid app development using AI-assisted coding tools.

---

## ✨ Features

### 🔐 Secure Authentication
- Email/password registration and login
- Firebase Authentication with persistent sessions
- Secure user data isolation

### ✍️ Mood Journaling
- Quick mood entries for daily check-ins
- Detailed journal writing with AI analysis
- Cloud-synced entries accessible across devices

### 🤖 AI-Powered Analysis
- **Emotion Detection**: Identifies primary emotions (happy, sad, anxious, stressed, etc.)
- **Intensity Scoring**: Rates emotional intensity on a 1-10 scale
- **Personalized Insights**: AI-generated empathetic understanding
- **Wellness Suggestions**: Actionable recommendations for emotional well-being

### 📊 Mood Trends & Analytics
- Visual charts showing mood patterns over time
- Statistical summaries (dominant mood, average intensity)
- Emotion breakdown with frequency analysis
- Historical entry timeline

### 🎨 Modern UI/UX
- Clean, intuitive interface with calming blue theme
- Emoji-based emotion representation
- Responsive design for all screen sizes
- Smooth animations and transitions

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React Native (Expo SDK 51) |
| **Navigation** | React Navigation 6 |
| **Backend** | Firebase (Firestore + Authentication) |
| **AI/ML** | OpenAI GPT-3.5 Turbo API |
| **Data Visualization** | React Native Chart Kit |
| **State Management** | React Hooks (useState, useEffect) |
| **Authentication Persistence** | AsyncStorage |
| **Development Tools** | VS Code, Git, GitHub |
| **Testing Platform** | Expo Go (Android/iOS) |

---

## 📸 Screenshots

### Welcome & Authentication
![Screenshot_2025-10-30-21-01-38-51](https://github.com/user-attachments/assets/9128398c-0c09-4f86-9122-be4b171fbf0f)

*Secure authentication with Firebase*

### Home Dashboard
![Screenshot_2025-10-30-21-01-52-48](https://github.com/user-attachments/assets/18210db4-7ab3-41bc-9b66-0cc135aeb181)


*Quick mood entry and recent entries*

### AI Mood Analysis
![Screenshot_2025-10-30-21-59-34-20](https://github.com/user-attachments/assets/f6d17e3d-9918-4c2d-8272-8e6f2bf3bb7a)

*Write entries and get instant AI insights*

### Mood Trends
![Screenshot_2025-10-30-22-00-47-86](https://github.com/user-attachments/assets/e0aeeaf5-fb9a-4b9a-9708-2fa681cbbd10)

*Visualize emotional patterns over time*

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo Go app on your mobile device
- Firebase account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shivannadm/ai-mood-journal.git
   cd ai-mood-journal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore Database
   - Copy your Firebase configuration

4. **Configure Firebase**
   - Rename `src/config/firebaseConfig.template.js` to `firebaseConfig.js`
   - Add your Firebase credentials:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

5. **Set up OpenAI**
   - Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Rename `src/services/openaiService.template.js` to `openaiService.js`
   - Add your API key:
   ```javascript
   const OPENAI_API_KEY = 'sk-proj-YOUR_KEY_HERE';
   ```

6. **Configure Firestore Security Rules**
   
   In Firebase Console → Firestore Database → Rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /journal_entries/{entryId} {
         allow read: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
         allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
         allow update, delete: if request.auth != null && 
                                request.auth.uid == resource.data.userId;
       }
     }
   }
   ```

7. **Create Firestore Indexes**
   
   You'll need to create a composite index for queries. When you first run queries, Firebase will provide a direct link to create the required index.

8. **Start the development server**
   ```bash
   npx expo start
   ```

9. **Run on your device**
   - Install Expo Go from Play Store (Android) or App Store (iOS)
   - Scan the QR code displayed in the terminal
   - The app will load on your device

---

## 📂 Project Structure

```
ai-mood-journal/
├── App.js                          # Main app entry point with navigation
├── src/
│   ├── config/
│   │   ├── firebaseConfig.js       # Firebase initialization
│   │   └── firebaseConfig.template.js
│   ├── services/
│   │   ├── openaiService.js        # OpenAI API integration
│   │   └── openaiService.template.js
│   └── screens/
│       ├── WelcomeScreen.js        # Login/Signup screen
│       ├── HomeScreen.js           # Dashboard with quick entry
│       ├── JournalScreen.js        # Detailed entry with AI analysis
│       └── TrendsScreen.js         # Mood analytics and charts
├── assets/                         # App icons and images
├── package.json                    # Dependencies
└── README.md                       # This file
```

---

## 🤖 AI Integration Details

### OpenAI GPT-3.5 Turbo
The app uses OpenAI's API for intelligent mood analysis:

**Input**: User's journal entry text  
**Processing**: Sentiment analysis with contextual understanding  
**Output**: Structured JSON response containing:
- Primary emotion (e.g., "anxious", "happy", "stressed")
- Intensity rating (1-10 scale)
- Empathetic insight (2-3 sentences)
- Personalized wellness suggestion

**Sample API Request:**
```javascript
{
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "system",
      content: "You are a compassionate mood analyzer..."
    },
    {
      role: "user",
      content: "User's journal entry here"
    }
  ]
}
```

---

## 🧠 AI-Assisted Development

This project was built with significant assistance from **Claude AI (Anthropic)**, demonstrating the power of AI-assisted development:

### How AI Helped:

**Code Generation (60% faster)**
- Generated React Native component templates
- Created Firebase integration boilerplate
- Wrote navigation setup code
- Built UI components with proper styling

**Debugging & Problem Solving**
- Diagnosed Firebase authentication issues
- Fixed Firestore permission errors
- Resolved Expo networking problems
- Optimized API calls and error handling

**Best Practices & Optimization**
- Suggested proper React hooks usage
- Recommended security rules for Firebase
- Guided on async/await error handling
- Advised on component structure

**Documentation**
- Generated comprehensive README
- Created inline code comments
- Wrote setup instructions
- Drafted project documentation

### Development Timeline:
- **Without AI**: Estimated 5-7 days
- **With AI Assistance**: 2-3 days
- **Time Saved**: ~60%

---

## 🎯 Key Accomplishments

✅ Successfully integrated OpenAI GPT-3.5 for mood analysis  
✅ Implemented secure Firebase authentication and database  
✅ Created intuitive, visually appealing UI  
✅ Built real-time data visualization with charts  
✅ Achieved cross-platform compatibility (Android/iOS)  
✅ Deployed functional prototype in 2-3 day sprint  
✅ Documented development process comprehensively  

---

## 🔒 Security & Privacy

- User authentication required for all operations
- Data encrypted in transit (HTTPS/TLS)
- Firestore security rules enforce user data isolation
- API keys stored securely (not in repository)
- No data sharing with third parties

---

## 🐛 Known Issues & Limitations

- OpenAI API requires active internet connection
- Free tier has rate limits (consider caching responses)
- Charts require minimum 2 entries to display properly
- Firestore indexes must be created manually on first query

---

## 🚀 Future Enhancements

### Planned Features
- 📅 Calendar view of mood entries
- 🏆 Mood tracking streaks and achievements
- 🎨 Customizable themes and color schemes
- 🔔 Daily reminder notifications
- 📤 Export mood data (PDF/CSV)
- 🧘 Integration with meditation/wellness resources
- 🌙 Dark mode support
- 🎙️ Voice-to-text journal entry
- 📷 Photo attachments for entries
- 🌍 Multi-language support

### Technical Improvements
- Offline mode with local storage sync
- Advanced analytics dashboard
- ML-based mood prediction
- Social features (anonymous sharing)
- Widget support for quick entry

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| Development Time | 2-3 days |
| Lines of Code | ~1,800 |
| Screens | 4 |
| API Integrations | 2 (Firebase + OpenAI) |
| npm Packages | 12 |
| AI Prompts Used | 50+ |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developer

**Shivanna DM**  
📧 Email: [Email] (shivannadm16@gmail.com) 
🌍 GitHub: [@shivannadm](https://github.com/shivannadm)  
📍 Location: Bengaluru, Karnataka, India

---

## 🙏 Acknowledgments

- **Anthropic Claude AI** – For comprehensive development assistance and guidance
- **OpenAI** – For GPT-3.5 API powering mood analysis
- **Expo Team** – For excellent React Native development platform
- **Firebase** – For robust backend infrastructure
- **React Native Community** – For amazing libraries and support

---

## 📚 Resources & Documentation

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [React Navigation Docs](https://reactnavigation.org/)

---

## 🎓 Learning Outcomes

This project demonstrates:
- Modern mobile app development with React Native
- Cloud backend integration with Firebase
- AI/ML API integration for practical applications
- Responsive UI design principles
- State management in React
- Authentication flows
- Data visualization techniques
- Version control with Git/GitHub

---

## ⭐ Show Your Support

If you found this project helpful or interesting, please give it a ⭐️ on GitHub!

---

## 📧 Contact & Support

For questions, feedback, or support:
- Open an issue on GitHub
- Email: [Email](shivannadm16@gmail.com)
- LinkedIn: [LinkedIn](https://www.linkedin.com/in/shivannadm/)

---

## 🎉 Task Completion

This project was completed as part of:
**Vibe Coding Sprint — Create a Mobile App Using AI Vibe Coding**

**Status**: ✅ Complete  
**Deliverables**: 
- ✅ Functional mobile app prototype
- ✅ GitHub repository with source code
- ✅ Comprehensive documentation
- ✅ AI integration demonstration

---

<div align="center">

**Built with ❤️ using AI-assisted development**

*October 2025*

</div>
