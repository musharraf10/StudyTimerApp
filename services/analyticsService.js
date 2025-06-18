import { 
  doc, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { db, auth } from "./firebase";

export const AnalyticsService = {
  // Track user event
  trackEvent: async (eventName, eventData = {}) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const event = {
        userId: user.uid,
        eventName,
        eventData,
        timestamp: serverTimestamp(),
        sessionId: this.getSessionId(),
        platform: this.getPlatform()
      };

      await addDoc(collection(db, 'analytics'), event);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  },

  // Track study session start
  trackStudySessionStart: async (sessionData) => {
    await this.trackEvent('study_session_start', {
      subject: sessionData.subject,
      plannedDuration: sessionData.duration,
      timeOfDay: new Date().getHours()
    });
  },

  // Track study session end
  trackStudySessionEnd: async (sessionData) => {
    await this.trackEvent('study_session_end', {
      subject: sessionData.subject,
      actualDuration: sessionData.duration,
      completed: sessionData.completed,
      timeOfDay: new Date().getHours()
    });
  },

  // Track achievement earned
  trackAchievementEarned: async (achievement) => {
    await this.trackEvent('achievement_earned', {
      achievementId: achievement.id,
      achievementTitle: achievement.title
    });
  },

  // Track goal completion
  trackGoalCompletion: async (goalData) => {
    await this.trackEvent('goal_completed', {
      goalType: goalData.type,
      goalValue: goalData.value,
      completionTime: goalData.completionTime
    });
  },

  // Track app usage
  trackAppOpen: async () => {
    await this.trackEvent('app_open', {
      timestamp: new Date().toISOString()
    });
  },

  trackAppClose: async () => {
    await this.trackEvent('app_close', {
      timestamp: new Date().toISOString()
    });
  },

  // Track feature usage
  trackFeatureUsage: async (featureName, additionalData = {}) => {
    await this.trackEvent('feature_used', {
      feature: featureName,
      ...additionalData
    });
  },

  // Get user analytics dashboard data
  getUserAnalytics: async (userId, period = 'week') => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return null;

      const userData = userDoc.data();
      const stats = userData.studyStats || {};

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      // Get analytics events for the period
      const q = query(
        collection(db, 'analytics'),
        where('userId', '==', userId),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date()
      }));

      // Process analytics data
      const studySessionEvents = events.filter(e => e.eventName === 'study_session_end');
      const achievementEvents = events.filter(e => e.eventName === 'achievement_earned');
      const appOpenEvents = events.filter(e => e.eventName === 'app_open');

      // Calculate metrics
      const totalStudyTime = studySessionEvents.reduce((sum, event) => 
        sum + (event.eventData?.actualDuration || 0), 0
      );

      const averageSessionLength = studySessionEvents.length > 0 
        ? totalStudyTime / studySessionEvents.length 
        : 0;

      const subjectBreakdown = {};
      studySessionEvents.forEach(event => {
        const subject = event.eventData?.subject || 'Unknown';
        if (!subjectBreakdown[subject]) {
          subjectBreakdown[subject] = 0;
        }
        subjectBreakdown[subject] += event.eventData?.actualDuration || 0;
      });

      // Time of day analysis
      const timeOfDayBreakdown = {
        morning: 0,   // 6-12
        afternoon: 0, // 12-18
        evening: 0,   // 18-22
        night: 0      // 22-6
      };

      studySessionEvents.forEach(event => {
        const hour = event.eventData?.timeOfDay || 12;
        if (hour >= 6 && hour < 12) timeOfDayBreakdown.morning++;
        else if (hour >= 12 && hour < 18) timeOfDayBreakdown.afternoon++;
        else if (hour >= 18 && hour < 22) timeOfDayBreakdown.evening++;
        else timeOfDayBreakdown.night++;
      });

      // Daily activity
      const dailyActivity = {};
      events.forEach(event => {
        const date = event.timestamp.toISOString().split('T')[0];
        if (!dailyActivity[date]) {
          dailyActivity[date] = {
            studySessions: 0,
            totalTime: 0,
            achievements: 0,
            appOpens: 0
          };
        }

        switch (event.eventName) {
          case 'study_session_end':
            dailyActivity[date].studySessions++;
            dailyActivity[date].totalTime += event.eventData?.actualDuration || 0;
            break;
          case 'achievement_earned':
            dailyActivity[date].achievements++;
            break;
          case 'app_open':
            dailyActivity[date].appOpens++;
            break;
        }
      });

      return {
        period,
        summary: {
          totalStudyTime: totalStudyTime / 60, // Convert to hours
          totalSessions: studySessionEvents.length,
          averageSessionLength: averageSessionLength,
          achievementsEarned: achievementEvents.length,
          appOpens: appOpenEvents.length,
          currentStreak: stats.currentStreak || 0,
          longestStreak: stats.longestStreak || 0
        },
        breakdowns: {
          subjects: subjectBreakdown,
          timeOfDay: timeOfDayBreakdown,
          daily: dailyActivity
        },
        trends: {
          weeklyHours: stats.weeklyHours || [0, 0, 0, 0, 0, 0, 0],
          monthlyProgress: this.calculateMonthlyProgress(dailyActivity),
          productivityScore: this.calculateProductivityScore(stats, studySessionEvents)
        }
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      throw new Error('Failed to get user analytics');
    }
  },

  // Calculate monthly progress
  calculateMonthlyProgress: (dailyActivity) => {
    const days = Object.keys(dailyActivity).sort();
    return days.map(date => ({
      date,
      hours: (dailyActivity[date].totalTime || 0) / 60,
      sessions: dailyActivity[date].studySessions || 0
    }));
  },

  // Calculate productivity score (0-100)
  calculateProductivityScore: (stats, sessionEvents) => {
    let score = 0;
    
    // Consistency (40 points)
    const streak = stats.currentStreak || 0;
    score += Math.min(streak * 2, 40);
    
    // Session completion rate (30 points)
    const completedSessions = sessionEvents.filter(e => e.eventData?.completed).length;
    const completionRate = sessionEvents.length > 0 ? completedSessions / sessionEvents.length : 0;
    score += completionRate * 30;
    
    // Goal achievement (30 points)
    const weeklyGoal = stats.weeklyHoursTarget || 14;
    const weeklyActual = (stats.weeklyHours || []).reduce((a, b) => a + b, 0);
    const goalAchievement = Math.min(weeklyActual / weeklyGoal, 1);
    score += goalAchievement * 30;
    
    return Math.round(score);
  },

  // Get app-wide analytics (admin only)
  getAppAnalytics: async (period = 'week') => {
    try {
      // This would typically require admin permissions
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (period === 'week' ? 7 : 30));

      const q = query(
        collection(db, 'analytics'),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date()
      }));

      // Process app-wide metrics
      const uniqueUsers = new Set(events.map(e => e.userId)).size;
      const totalSessions = events.filter(e => e.eventName === 'study_session_end').length;
      const totalStudyTime = events
        .filter(e => e.eventName === 'study_session_end')
        .reduce((sum, e) => sum + (e.eventData?.actualDuration || 0), 0);

      return {
        period,
        uniqueUsers,
        totalSessions,
        totalStudyTime: totalStudyTime / 60, // Convert to hours
        averageSessionsPerUser: uniqueUsers > 0 ? totalSessions / uniqueUsers : 0,
        averageStudyTimePerUser: uniqueUsers > 0 ? (totalStudyTime / 60) / uniqueUsers : 0
      };
    } catch (error) {
      console.error('Error getting app analytics:', error);
      throw new Error('Failed to get app analytics');
    }
  },

  // Helper functions
  getSessionId: () => {
    // Generate or retrieve session ID
    return Date.now().toString();
  },

  getPlatform: () => {
    // Detect platform
    if (typeof window !== 'undefined') return 'web';
    return 'mobile';
  }
};