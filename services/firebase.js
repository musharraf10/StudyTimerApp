import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firebase Cloud Messaging
const messaging = getMessaging(app);

// Get FCM token
async function getFCMToken() {
  try {
    const token = await getToken(messaging, {
      vapidKey: "YOUR_VAPID_KEY",
    });
    console.log("FCM token:", token);
    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
  }
}

// Handle incoming messages
onMessage(messaging, (payload) => {
  console.log("Received message:", payload);
});

export { db, auth, messaging, getFCMToken };
