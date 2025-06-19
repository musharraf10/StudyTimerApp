import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
} from "firebase/auth";

// Sign up a new user
async function signUp(email, password, displayName) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await updateProfile(userCredential.user, { displayName });
    return userCredential.user;
  } catch (error) {
    console.error("Error signing up:", error);
  }
}

// Sign in an existing user
async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in:", error);
  }
}

// Sign out the current user
async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
  }
}

// Send a password reset email
async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
}

// Update the user's profile
async function updateUserProfile(displayName) {
  try {
    await updateProfile(auth.currentUser, { displayName });
  } catch (error) {
    console.error("Error updating profile:", error);
  }
}

// Update the user's email
async function updateUserEmail(newEmail) {
  try {
    await updateEmail(auth.currentUser, newEmail);
  } catch (error) {
    console.error("Error updating email:", error);
  }
}

// Update the user's password
async function updateUserPassword(newPassword) {
  try {
    await updatePassword(auth.currentUser, newPassword);
  } catch (error) {
    console.error("Error updating password:", error);
  }
}

export {
  signUp,
  signIn,
  logout,
  resetPassword,
  updateUserProfile,
  updateUserEmail,
  updateUserPassword,
};
