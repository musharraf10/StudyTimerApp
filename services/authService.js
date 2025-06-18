import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db, storage } from "./firebase";

export const AuthService = {
  // Initialize auth state listener
  initializeAuthListener: (callback) => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, get additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = {
            id: user.uid,
            email: user.email,
            displayName: user.displayName,
            avatar: user.photoURL,
            emailVerified: user.emailVerified,
            createdAt: user.metadata.creationTime,
            lastLoginAt: user.metadata.lastSignInTime,
            loginMethod: 'email',
            ...userDoc.data()
          };
          await AsyncStorage.setItem("userSession", JSON.stringify(userData));
          callback(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
          callback(null);
        }
      } else {
        // User is signed out
        await AsyncStorage.removeItem("userSession");
        callback(null);
      }
    });
  },

  // Sign up with email and password
  signup: async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      await updateProfile(user, {
        displayName: name
      });

      // Create user document in Firestore
      const userData = {
        displayName: name,
        email: email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        loginMethod: 'email',
        studyStats: {
          totalHours: 0,
          totalSessions: 0,
          currentStreak: 0,
          longestStreak: 0,
          weeklyHours: [0, 0, 0, 0, 0, 0, 0],
          monthlyHours: 0
        },
        settings: {
          notificationsEnabled: true,
          studyReminders: true,
          achievementNotifications: true,
          emailNotifications: false,
          dailyHoursTarget: 2,
          weeklyHoursTarget: 14,
          dailySessionsTarget: 3,
          weeklySessionsTarget: 21,
          preferredStudyStartTime: "09:00",
          preferredStudyEndTime: "17:00",
          bestFocusTime: "morning",
          studyDaysOfWeek: [1, 2, 3, 4, 5]
        },
        achievements: [],
        currentGoals: []
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      return {
        id: user.uid,
        email: user.email,
        displayName: name,
        loginMethod: 'email',
        createdAt: user.metadata.creationTime,
        ...userData
      };
    } catch (error) {
      console.error("Signup error:", error);
      throw new Error(this.getErrorMessage(error.code));
    }
  },

  // Sign in with email and password
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = {
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        avatar: user.photoURL,
        loginMethod: 'email',
        createdAt: user.metadata.creationTime,
        lastLoginAt: user.metadata.lastSignInTime,
        ...userDoc.data()
      };

      // Update last login time
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: serverTimestamp()
      });

      return userData;
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(this.getErrorMessage(error.code));
    }
  },

  // Google Sign In (placeholder - requires additional setup)
  googleSignIn: async () => {
    // This would require expo-auth-session or similar for mobile
    // For now, returning a mock response
    throw new Error("Google Sign-In requires additional configuration for mobile apps");
  },

  // Sign out
  logout: async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem("userSession");
    } catch (error) {
      console.error("Logout error:", error);
      throw new Error("Failed to sign out");
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const userData = await AsyncStorage.getItem("userSession");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  // Update user profile
  updateProfile: async (updates) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      // Update Firebase Auth profile
      if (updates.displayName) {
        await updateProfile(user, {
          displayName: updates.displayName
        });
      }

      // Update Firestore document
      await updateDoc(doc(db, 'users', user.uid), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Update local storage
      const currentUserData = await this.getCurrentUser();
      const updatedUserData = { ...currentUserData, ...updates };
      await AsyncStorage.setItem("userSession", JSON.stringify(updatedUserData));

      return updatedUserData;
    } catch (error) {
      console.error("Profile update error:", error);
      throw new Error("Failed to update profile");
    }
  },

  // Update avatar
  updateAvatar: async (imageUri) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      // Convert image URI to blob for upload
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Upload to Firebase Storage
      const avatarRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(avatarRef, blob);
      const downloadURL = await getDownloadURL(avatarRef);

      // Update user profile
      await updateProfile(user, {
        photoURL: downloadURL
      });

      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        avatar: downloadURL,
        updatedAt: serverTimestamp()
      });

      // Update local storage
      const currentUserData = await this.getCurrentUser();
      const updatedUserData = { ...currentUserData, avatar: downloadURL };
      await AsyncStorage.setItem("userSession", JSON.stringify(updatedUserData));

      return updatedUserData;
    } catch (error) {
      console.error("Avatar update error:", error);
      throw new Error("Failed to update avatar");
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      // Update timestamp in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        passwordUpdatedAt: serverTimestamp()
      });

    } catch (error) {
      console.error("Password change error:", error);
      throw new Error(this.getErrorMessage(error.code));
    }
  },

  // Deactivate account
  deactivateAccount: async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      // Delete user data from Firestore
      await deleteDoc(doc(db, 'users', user.uid));

      // Delete avatar from storage if exists
      try {
        const avatarRef = ref(storage, `avatars/${user.uid}`);
        await deleteObject(avatarRef);
      } catch (error) {
        // Avatar might not exist, continue
      }

      // Delete user account
      await deleteUser(user);

      // Clear local storage
      await AsyncStorage.removeItem("userSession");

    } catch (error) {
      console.error("Account deactivation error:", error);
      throw new Error("Failed to deactivate account");
    }
  },

  // Helper function to get user-friendly error messages
  getErrorMessage: (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please use a different email or sign in.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/requires-recent-login':
        return 'Please sign in again to complete this action.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
};