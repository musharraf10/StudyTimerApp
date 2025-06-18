import { 
  doc, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { NotificationService } from "./notificationService";

export const StudyService = {
  // Create a new study session
  createStudySession: async (sessionData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      const session = {
        userId: user.uid,
        subject: sessionData.subject,
        duration: sessionData.duration, // in minutes
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        completed: true,
        date: sessionData.date || new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
        notes: sessionData.notes || ""
      };

      // Add session to Firestore
      const docRef = await addDoc(collection(db, 'studySessions'), session);

      // Update user stats
      await this.updateUserStats(user.uid, sessionData.duration);

      // Check for achievements
      await this.checkAchievements(user.uid);

      return { id: docRef.id, ...session };
    } catch (error) {
      console.error("Error creating study session:", error);
      throw new Error("Failed to create study session");
    }
  },

  // Get user's study sessions
  getStudySessions: async (userId, dateFilter = null) => {
    try {
      let q = query(
        collection(db, 'studySessions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      if (dateFilter) {
        q = query(q, where('date', '==', dateFilter));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting study sessions:", error);
      throw new Error("Failed to get study sessions");
    }
  },

  // Update user study statistics
  updateUserStats: async (userId, sessionDuration) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Update weekly hours array
      const weeklyHours = userData.studyStats?.weeklyHours || [0, 0, 0, 0, 0, 0, 0];
      weeklyHours[dayOfWeek] += sessionDuration / 60; // Convert minutes to hours

      // Calculate streak
      const lastStudyDate = userData.studyStats?.lastStudyDate;
      const todayString = today.toISOString().split('T')[0];
      let currentStreak = userData.studyStats?.currentStreak || 0;

      if (lastStudyDate !== todayString) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];

        if (lastStudyDate === yesterdayString) {
          currentStreak += 1;
        } else if (lastStudyDate !== todayString) {
          currentStreak = 1;
        }
      }

      const longestStreak = Math.max(userData.studyStats?.longestStreak || 0, currentStreak);

      await updateDoc(userRef, {
        'studyStats.totalHours': increment(sessionDuration / 60),
        'studyStats.totalSessions': increment(1),
        'studyStats.currentStreak': currentStreak,
        'studyStats.longestStreak': longestStreak,
        'studyStats.weeklyHours': weeklyHours,
        'studyStats.lastStudyDate': todayString,
        'studyStats.monthlyHours': increment(sessionDuration / 60),
        updatedAt: serverTimestamp()
      });

    } catch (error) {
      console.error("Error updating user stats:", error);
      throw new Error("Failed to update user stats");
    }
  },

  // Create/Update study schedule
  saveStudySchedule: async (scheduleData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      const schedule = {
        userId: user.uid,
        date: scheduleData.date,
        subjects: scheduleData.subjects,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Check if schedule exists for this date
      const q = query(
        collection(db, 'studySchedules'),
        where('userId', '==', user.uid),
        where('date', '==', scheduleData.date)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Create new schedule
        const docRef = await addDoc(collection(db, 'studySchedules'), schedule);
        return { id: docRef.id, ...schedule };
      } else {
        // Update existing schedule
        const docId = querySnapshot.docs[0].id;
        await updateDoc(doc(db, 'studySchedules', docId), {
          subjects: scheduleData.subjects,
          updatedAt: serverTimestamp()
        });
        return { id: docId, ...schedule };
      }
    } catch (error) {
      console.error("Error saving study schedule:", error);
      throw new Error("Failed to save study schedule");
    }
  },

  // Get study schedule for a specific date
  getStudySchedule: async (userId, date) => {
    try {
      const q = query(
        collection(db, 'studySchedules'),
        where('userId', '==', userId),
        where('date', '==', date)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error("Error getting study schedule:", error);
      throw new Error("Failed to get study schedule");
    }
  },

  // Save study preset
  saveStudyPreset: async (presetData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      const preset = {
        userId: user.uid,
        name: presetData.name,
        subjects: presetData.subjects,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'studyPresets'), preset);
      return { id: docRef.id, ...preset };
    } catch (error) {
      console.error("Error saving study preset:", error);
      throw new Error("Failed to save study preset");
    }
  },

  // Get user's study presets
  getStudyPresets: async (userId) => {
    try {
      const q = query(
        collection(db, 'studyPresets'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting study presets:", error);
      throw new Error("Failed to get study presets");
    }
  },

  // Delete study preset
  deleteStudyPreset: async (presetId) => {
    try {
      await deleteDoc(doc(db, 'studyPresets', presetId));
    } catch (error) {
      console.error("Error deleting study preset:", error);
      throw new Error("Failed to delete study preset");
    }
  },

  // Check and award achievements
  checkAchievements: async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const stats = userData.studyStats || {};
      const currentAchievements = userData.achievements || [];

      const newAchievements = [];

      // Define achievements
      const achievements = [
        {
          id: 'first_session',
          title: 'First Session',
          description: 'Complete your first study session',
          icon: '✨',
          condition: () => stats.totalSessions >= 1
        },
        {
          id: 'streak_7',
          title: '7 Day Streak',
          description: 'Study for 7 consecutive days',
          icon: '🔥',
          condition: () => stats.currentStreak >= 7
        },
        {
          id: 'early_bird',
          title: 'Early Bird',
          description: 'Start studying before 8 AM',
          icon: '🌅',
          condition: () => {
            // This would need to be checked during session creation
            return false; // Placeholder
          }
        },
        {
          id: 'night_owl',
          title: 'Night Owl',
          description: 'Study after 10 PM for 5 days',
          icon: '🦉',
          condition: () => {
            // This would need to be tracked separately
            return false; // Placeholder
          }
        },
        {
          id: 'consistent_reader',
          title: 'Consistent Reader',
          description: 'Complete 20 reading sessions',
          icon: '📚',
          condition: () => stats.totalSessions >= 20
        },
        {
          id: 'deep_focus',
          title: 'Deep Focus',
          description: 'Study for 3+ hours in a single session',
          icon: '🧠',
          condition: () => {
            // This would need to be checked during session creation
            return false; // Placeholder
          }
        },
        {
          id: 'goal_crusher',
          title: 'Goal Crusher',
          description: 'Exceed weekly goal by 50%',
          icon: '🎯',
          condition: () => {
            const weeklyGoal = userData.settings?.weeklyHoursTarget || 14;
            const weeklyTotal = (stats.weeklyHours || []).reduce((a, b) => a + b, 0);
            return weeklyTotal >= weeklyGoal * 1.5;
          }
        },
        {
          id: 'dedication',
          title: 'Dedication',
          description: 'Study for 30 consecutive days',
          icon: '💪',
          condition: () => stats.currentStreak >= 30
        }
      ];

      // Check each achievement
      for (const achievement of achievements) {
        const alreadyEarned = currentAchievements.some(a => a.id === achievement.id);
        
        if (!alreadyEarned && achievement.condition()) {
          newAchievements.push({
            ...achievement,
            earnedAt: serverTimestamp()
          });
        }
      }

      // Award new achievements
      if (newAchievements.length > 0) {
        await updateDoc(userRef, {
          achievements: arrayUnion(...newAchievements)
        });

        // Send achievement notifications
        for (const achievement of newAchievements) {
          await NotificationService.sendAchievementNotification(userId, achievement);
        }
      }

      return newAchievements;
    } catch (error) {
      console.error("Error checking achievements:", error);
      throw new Error("Failed to check achievements");
    }
  },

  // Get user study analytics
  getStudyAnalytics: async (userId, period = 'week') => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return null;

      const userData = userDoc.data();
      const stats = userData.studyStats || {};

      // Get recent sessions for detailed analytics
      const endDate = new Date();
      const startDate = new Date();
      
      if (period === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
      }

      const sessions = await this.getStudySessions(userId);
      const periodSessions = sessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= startDate && sessionDate <= endDate;
      });

      // Calculate analytics
      const totalHours = periodSessions.reduce((sum, session) => sum + (session.duration / 60), 0);
      const totalSessions = periodSessions.length;
      const averageSessionLength = totalSessions > 0 ? totalHours / totalSessions : 0;
      
      // Subject breakdown
      const subjectBreakdown = {};
      periodSessions.forEach(session => {
        if (!subjectBreakdown[session.subject]) {
          subjectBreakdown[session.subject] = 0;
        }
        subjectBreakdown[session.subject] += session.duration / 60;
      });

      // Daily breakdown
      const dailyBreakdown = {};
      periodSessions.forEach(session => {
        if (!dailyBreakdown[session.date]) {
          dailyBreakdown[session.date] = 0;
        }
        dailyBreakdown[session.date] += session.duration / 60;
      });

      return {
        period,
        totalHours,
        totalSessions,
        averageSessionLength,
        currentStreak: stats.currentStreak || 0,
        longestStreak: stats.longestStreak || 0,
        subjectBreakdown,
        dailyBreakdown,
        weeklyHours: stats.weeklyHours || [0, 0, 0, 0, 0, 0, 0],
        goals: {
          dailyTarget: userData.settings?.dailyHoursTarget || 2,
          weeklyTarget: userData.settings?.weeklyHoursTarget || 14,
          dailyProgress: dailyBreakdown[new Date().toISOString().split('T')[0]] || 0,
          weeklyProgress: (stats.weeklyHours || []).reduce((a, b) => a + b, 0)
        }
      };
    } catch (error) {
      console.error("Error getting study analytics:", error);
      throw new Error("Failed to get study analytics");
    }
  }
};