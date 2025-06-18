import { AuthService as FirebaseAuthService } from "../services/authService";
import { NotificationService } from "../services/notificationService";
import { AnalyticsService } from "../services/analyticsService";

// This file maintains compatibility with your existing frontend code
// while using the new Firebase backend services

export const AuthService = {
  // Initialize authentication
  initialize: async () => {
    try {
      // Initialize notifications
      await NotificationService.initialize();

      // Setup notification listeners
      NotificationService.setupNotificationListeners();

      return true;
    } catch (error) {
      console.error("Auth service initialization error:", error);
      return false;
    }
  },

  // Login with email and password
  login: async (email, password) => {
    try {
      const userData = await FirebaseAuthService.login(email, password);

      // Track login event
      await AnalyticsService.trackEvent("user_login", {
        method: "email",
        timestamp: new Date().toISOString(),
      });

      return userData;
    } catch (error) {
      await AnalyticsService.trackEvent("login_failed", {
        method: "email",
        error: error.message,
      });
      throw error;
    }
  },

  // Sign up with email and password
  signup: async (name, email, password) => {
    try {
      const userData = await FirebaseAuthService.signup(name, email, password);

      // Track signup event
      await AnalyticsService.trackEvent("user_signup", {
        method: "email",
        timestamp: new Date().toISOString(),
      });

      return userData;
    } catch (error) {
      await AnalyticsService.trackEvent("signup_failed", {
        method: "email",
        error: error.message,
      });
      throw error;
    }
  },

  // Google Sign In
  googleSignIn: async () => {
    try {
      // For now, this is a placeholder
      // In a real implementation, you'd use expo-auth-session or similar
      throw new Error(
        "Google Sign-In requires additional setup for mobile apps"
      );
    } catch (error) {
      await AnalyticsService.trackEvent("google_signin_failed", {
        error: error.message,
      });
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    return await FirebaseAuthService.getCurrentUser();
  },

  // Logout
  logout: async () => {
    try {
      await AnalyticsService.trackEvent("user_logout");
      await FirebaseAuthService.logout();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },

  // Update avatar
  updateAvatar: async (avatarUri) => {
    try {
      const userData = await FirebaseAuthService.updateAvatar(avatarUri);

      await AnalyticsService.trackEvent("avatar_updated");

      return userData;
    } catch (error) {
      console.error("Avatar update error:", error);
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      await FirebaseAuthService.changePassword(currentPassword, newPassword);

      await AnalyticsService.trackEvent("password_changed");
    } catch (error) {
      console.error("Password change error:", error);
      throw error;
    }
  },

  // Deactivate account
  deactivateAccount: async () => {
    try {
      await AnalyticsService.trackEvent("account_deactivated");
      await FirebaseAuthService.deactivateAccount();
    } catch (error) {
      console.error("Account deactivation error:", error);
      throw error;
    }
  },

  // Initialize auth state listener
  initializeAuthListener: (callback) => {
    return FirebaseAuthService.initializeAuthListener(callback);
  },
};
