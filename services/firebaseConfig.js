// Environment-based Firebase configuration
import { Platform } from 'react-native';

const getFirebaseConfig = () => {
  // Use environment variables if available, otherwise fallback to defaults
  return {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "focusvault-study.firebaseapp.com",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "focusvault-study",
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "focusvault-study.appspot.com",
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:123456789012:web:abcdefghijklmnopqrstuvwxyz",
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
  };
};

const getVapidKey = () => {
  return process.env.EXPO_PUBLIC_FCM_VAPID_KEY || "YOUR_VAPID_KEY_HERE";
};

const isDevelopment = () => {
  return process.env.EXPO_PUBLIC_DEV_MODE === 'true' || __DEV__;
};

const isAnalyticsEnabled = () => {
  return process.env.EXPO_PUBLIC_ENABLE_ANALYTICS !== 'false';
};

const isNotificationsEnabled = () => {
  return process.env.EXPO_PUBLIC_ENABLE_NOTIFICATIONS !== 'false';
};

export {
  getFirebaseConfig,
  getVapidKey,
  isDevelopment,
  isAnalyticsEnabled,
  isNotificationsEnabled
};