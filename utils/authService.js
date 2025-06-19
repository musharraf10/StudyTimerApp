import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import * as Google from "expo-auth-session/providers/google";
import { auth, db } from "../services/firebase";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

// 📌 Save profile to Firestore
const saveUserProfile = async (uid, userData) => {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      ...userData,
      createdAt: new Date().toISOString(),
    });
  }
};

export const AuthService = {
  // ✅ Email Registration
  signup: async (name, email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    await saveUserProfile(user.uid, {
      fullName: name,
      email: user.email,
      loginMethod: "email",
    });
    return user;
  },

  // ✅ Email Login
  login: async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  // ✅ Google Sign In
  googleSignIn: async (idToken, accessToken) => {
    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    const result = await signInWithCredential(auth, credential);
    const user = result.user;
    await saveUserProfile(user.uid, {
      fullName: user.displayName,
      email: user.email,
      loginMethod: "google",
    });
    return user;
  },

  // ✅ Logout
  logout: async () => {
    await signOut(auth);
  },

  // ✅ Get current logged in user
  getCurrentUser: () => auth.currentUser,

  // ✅ Auth state change listener
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  },
};
