import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { Platform } from 'react-native';

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "focusvault-study.firebaseapp.com",
  projectId: "focusvault-study",
  storageBucket: "focusvault-study.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnopqrstuvwxyz",
  measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firebase Storage
const storage = getStorage(app);

// Initialize Firebase Cloud Messaging (only for web/supported platforms)
let messaging = null;
if (Platform.OS === 'web') {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

// Development emulator setup (uncomment for local development)
// if (__DEV__) {
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   connectStorageEmulator(storage, 'localhost', 9199);
// }

// Get FCM token (web only)
async function getFCMToken() {
  if (!messaging) return null;
  
  try {
    const token = await getToken(messaging, {
      vapidKey: "YOUR_VAPID_KEY_HERE"
    });
    console.log("FCM token:", token);
    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
}

// Handle incoming messages (web only)
if (messaging) {
  onMessage(messaging, (payload) => {
    console.log("Received foreground message:", payload);
    // Handle the message here
  });
}

export { db, auth, storage, messaging, getFCMToken, app };