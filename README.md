# 📚 FocusVault - Complete Study Management App

A comprehensive React Native Expo app with Firebase backend for students to manage their study sessions, track progress, take notes, manage tasks, and achieve their academic goals.

## 🚀 Features

### Authentication & User Management
- 🔐 Email/Password authentication with Firebase Auth
- 👤 User profiles with avatar upload
- 🔒 Secure password management
- 📱 Cross-platform authentication state management

### Study Management
- ⏱️ Study session tracking with timer
- 📅 Study schedule creation and management
- 📊 Comprehensive study analytics and progress tracking
- 🎯 Goal setting and achievement tracking
- 🔥 Study streaks and consistency monitoring
- 📈 Weekly/monthly progress visualization

### Notes & Documentation
- 📝 Rich note-taking with categories and tags
- 🔍 Note search and organization
- 📎 File attachments for notes
- 🗂️ Subject-based note organization

### Task Management
- ✅ Todo list with priorities and categories
- 📅 Due date tracking and reminders
- 📊 Task completion analytics
- 🏷️ Category-based task organization

### Achievements & Gamification
- 🏆 Achievement system with badges
- 📊 Progress tracking and statistics
- 🎯 Goal completion rewards
- 📈 Performance analytics

### Notifications
- 🔔 Study reminders and notifications
- 🏆 Achievement notifications
- 📱 Cross-platform notification support
- ⏰ Scheduled study session reminders

### Analytics & Insights
- 📊 Comprehensive study analytics
- 📈 Progress visualization
- 🎯 Goal tracking and insights
- 📱 Usage analytics and patterns

## 🛠️ Tech Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **React Navigation** - Navigation library
- **Lucide React Native** - Icon library
- **Expo Linear Gradient** - Gradient components
- **AsyncStorage** - Local data persistence

### Backend
- **Firebase Authentication** - User authentication
- **Cloud Firestore** - NoSQL database
- **Firebase Storage** - File storage
- **Firebase Cloud Messaging** - Push notifications
- **Expo Notifications** - Local notifications

### Key Services
- **AuthService** - Authentication management
- **StudyService** - Study session and schedule management
- **NotesService** - Note creation and management
- **TodoService** - Task management
- **NotificationService** - Notification handling
- **AnalyticsService** - Usage analytics and insights
- **StorageService** - File upload and management

## 📁 Project Structure

```
├── App.js                          # Main app component
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
├── assets/                         # Static assets
├── components/                     # Reusable components
│   ├── AccountSettingsModal.js
│   ├── AchievementsModal.js
│   └── StudySettingsModel.js
├── context/                        # React Context providers
│   ├── AuthContext.js             # Authentication state
│   └── StudyContext.js            # Study data management
├── navigation/                     # Navigation configuration
│   ├── AuthNavigator.js
│   └── TabNavigator.js
├── screens/                        # App screens
│   ├── Home.js                    # Dashboard and analytics
│   ├── Login.js                   # Authentication
│   ├── Signup.js
│   ├── Profile.js                 # User profile and settings
│   ├── ReadSpace.js               # Study management
│   ├── ReadingScreen.js           # Study session timer
│   ├── ToDo.js                    # Task management
│   └── [other screens]
├── services/                       # Backend services
│   ├── firebase.js                # Firebase configuration
│   ├── authService.js             # Authentication service
│   ├── studyService.js            # Study management
│   ├── notesService.js            # Notes management
│   ├── todoService.js             # Task management
│   ├── notificationService.js     # Notifications
│   ├── analyticsService.js        # Analytics and insights
│   ├── storage.js                 # File storage
│   └── db.js                      # Database utilities
└── utils/                          # Utility functions
    ├── authService.js             # Auth utility wrapper
    └── helpers.js
```

## 🔧 Setup Instructions

### 1. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)

2. Enable the following services:
   - **Authentication** (Email/Password provider)
   - **Cloud Firestore** (Database)
   - **Storage** (File uploads)
   - **Cloud Messaging** (Notifications)

3. Update `services/firebase.js` with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "your-app-id",
  measurementId: "G-XXXXXXXXXX"
};
```

### 2. Firestore Security Rules

Set up the following security rules in Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Study sessions - users can only access their own
    match /studySessions/{sessionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Study schedules - users can only access their own
    match /studySchedules/{scheduleId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Notes - users can only access their own
    match /notes/{noteId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Tasks - users can only access their own
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Notifications - users can only access their own
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Analytics - users can only write their own events
    match /analytics/{eventId} {
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Study presets - users can only access their own
    match /studyPresets/{presetId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### 3. Storage Security Rules

Set up the following security rules in Firebase Storage:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload/access their own files
    match /avatars/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /study-materials/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /note-attachments/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the App

```bash
# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

## 📱 Key Features Implementation

### Study Session Tracking
- Real-time timer with pause/resume functionality
- Automatic session completion and statistics update
- Achievement checking after each session
- Analytics tracking for study patterns

### Smart Notifications
- Study reminders based on user schedule
- Achievement notifications
- Streak maintenance reminders
- Goal completion celebrations

### Comprehensive Analytics
- Daily, weekly, and monthly study statistics
- Subject-wise time breakdown
- Productivity scoring algorithm
- Progress visualization charts

### Achievement System
- Multiple achievement categories
- Progress tracking for each achievement
- Real-time achievement checking
- Notification system for new achievements

## 🔐 Security Features

- **Authentication**: Secure Firebase Authentication
- **Data Privacy**: User data isolation with Firestore security rules
- **File Security**: Secure file uploads with user-specific access
- **Input Validation**: Client and server-side validation
- **Error Handling**: Comprehensive error handling and user feedback

## 📊 Analytics & Insights

The app tracks comprehensive analytics including:
- Study session duration and frequency
- Subject preferences and time allocation
- Achievement progress and completion rates
- App usage patterns and engagement metrics
- Goal completion and productivity trends

## 🚀 Deployment

### Development Build
```bash
expo build:android
expo build:ios
```

### Production Deployment
1. Configure EAS Build for production builds
2. Set up Firebase hosting for web version
3. Configure app store deployment pipelines
4. Set up monitoring and analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Expo for development platform
- React Native community for excellent libraries
- Lucide for beautiful icons

---

**FocusVault** - Unlock Your Study Potential 🚀