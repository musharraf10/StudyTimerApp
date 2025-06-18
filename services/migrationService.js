import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "./firebase";

export const MigrationService = {
  // Check if user data needs migration from AsyncStorage to Firebase
  checkAndMigrateUserData: async () => {
    try {
      const user = auth.currentUser;
      if (!user) return false;

      // Check if user document exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // User document doesn't exist, create it with default data
        await this.createDefaultUserDocument(user);
        return true;
      }

      // Check if migration is needed (version check)
      const userData = userDoc.data();
      const currentVersion = userData.dataVersion || 1;
      const latestVersion = 2; // Update this when you add new migrations

      if (currentVersion < latestVersion) {
        await this.runMigrations(user.uid, currentVersion, latestVersion);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Migration check failed:", error);
      return false;
    }
  },

  // Create default user document
  createDefaultUserDocument: async (user) => {
    try {
      const defaultUserData = {
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        loginMethod: 'email',
        dataVersion: 2, // Current version
        studyStats: {
          totalHours: 0,
          totalSessions: 0,
          currentStreak: 0,
          longestStreak: 0,
          weeklyHours: [0, 0, 0, 0, 0, 0, 0],
          monthlyHours: 0,
          lastStudyDate: null
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

      await setDoc(doc(db, 'users', user.uid), defaultUserData);
      console.log("Default user document created");
    } catch (error) {
      console.error("Failed to create default user document:", error);
      throw error;
    }
  },

  // Run migrations based on version
  runMigrations: async (userId, fromVersion, toVersion) => {
    try {
      console.log(`Running migrations from version ${fromVersion} to ${toVersion}`);

      for (let version = fromVersion; version < toVersion; version++) {
        await this.runMigration(userId, version + 1);
      }

      // Update data version
      await updateDoc(doc(db, 'users', userId), {
        dataVersion: toVersion,
        migratedAt: serverTimestamp()
      });

      console.log(`Migration completed to version ${toVersion}`);
    } catch (error) {
      console.error("Migration failed:", error);
      throw error;
    }
  },

  // Run specific migration
  runMigration: async (userId, version) => {
    try {
      switch (version) {
        case 2:
          await this.migrateToVersion2(userId);
          break;
        // Add more migrations here as needed
        default:
          console.log(`No migration needed for version ${version}`);
      }
    } catch (error) {
      console.error(`Migration to version ${version} failed:`, error);
      throw error;
    }
  },

  // Migration to version 2 - Add new fields
  migrateToVersion2: async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      
      // Add new fields that might be missing
      const updates = {};

      // Add studyStats if missing
      if (!userData.studyStats) {
        updates.studyStats = {
          totalHours: 0,
          totalSessions: 0,
          currentStreak: 0,
          longestStreak: 0,
          weeklyHours: [0, 0, 0, 0, 0, 0, 0],
          monthlyHours: 0,
          lastStudyDate: null
        };
      }

      // Add settings if missing
      if (!userData.settings) {
        updates.settings = {
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
        };
      }

      // Add achievements array if missing
      if (!userData.achievements) {
        updates.achievements = [];
      }

      // Add currentGoals array if missing
      if (!userData.currentGoals) {
        updates.currentGoals = [];
      }

      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        await updateDoc(userRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
        console.log("Migration to version 2 completed");
      }
    } catch (error) {
      console.error("Version 2 migration failed:", error);
      throw error;
    }
  },

  // Migrate local AsyncStorage data to Firebase (if needed)
  migrateLocalDataToFirebase: async () => {
    try {
      const user = auth.currentUser;
      if (!user) return false;

      // This would be used if you have existing local data to migrate
      // For now, it's a placeholder for future use
      console.log("Local data migration not implemented yet");
      return true;
    } catch (error) {
      console.error("Local data migration failed:", error);
      return false;
    }
  }
};