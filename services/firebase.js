import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyADWzzuSqY8swo27mSJcJ4qjCyoX1-kiz8",
  authDomain: "study-app-94e14.firebaseapp.com",
  projectId: "study-app-94e14",
  storageBucket: "study-app-94e14.firebasestorage.app",
  messagingSenderId: "831732683981",
  appId: "1:831732683981:web:d9d69bb1b073ebcbebc584",
  measurementId: "G-SCKL049L4Y",
};

// Init app
const app = initializeApp(firebaseConfig);

// ✅ MUST initialize auth using this way for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
