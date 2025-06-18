import { 
  doc, 
  collection, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp
} from "firebase/firestore";
import { db, auth, messaging, getFCMToken } from "./firebase";
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const NotificationService = {
  // Initialize notifications
  initialize: async () => {
    try {
      if (Platform.OS !== 'web') {
        // Request permissions for mobile
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Notification permissions not granted');
          return false;
        }

        // Get Expo push token
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('Expo push token:', token);

        // Save token to user profile
        const user = auth.currentUser;
        if (user) {
          await updateDoc(doc(db, 'users', user.uid), {
            expoPushToken: token,
            notificationTokenUpdatedAt: serverTimestamp()
          });
        }

        return token;
      } else {
        // Web FCM token
        const token = await getFCMToken();
        if (token && auth.currentUser) {
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            fcmToken: token,
            notificationTokenUpdatedAt: serverTimestamp()
          });
        }
        return token;
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return null;
    }
  },

  // Send local notification
  sendLocalNotification: async (title, body, data = {}) => {
    try {
      if (Platform.OS !== 'web') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data,
          },
          trigger: null, // Send immediately
        });
      } else {
        // Web notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body, data });
        }
      }
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  },

  // Schedule study reminder
  scheduleStudyReminder: async (reminderData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      const reminder = {
        userId: user.uid,
        title: reminderData.title || "Time to Study!",
        body: reminderData.body || "Don't forget your study session",
        scheduledTime: reminderData.scheduledTime,
        type: 'study_reminder',
        recurring: reminderData.recurring || false,
        active: true,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'notifications'), reminder);

      // Schedule local notification if it's for today
      const scheduledDate = new Date(reminderData.scheduledTime);
      const now = new Date();
      
      if (scheduledDate > now && Platform.OS !== 'web') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: reminder.title,
            body: reminder.body,
            data: { type: 'study_reminder', reminderId: docRef.id }
          },
          trigger: { date: scheduledDate }
        });
      }

      return { id: docRef.id, ...reminder };
    } catch (error) {
      console.error('Error scheduling study reminder:', error);
      throw new Error('Failed to schedule study reminder');
    }
  },

  // Send achievement notification
  sendAchievementNotification: async (userId, achievement) => {
    try {
      const notification = {
        userId,
        title: "Achievement Unlocked! 🏆",
        body: `You've earned the "${achievement.title}" achievement!`,
        type: 'achievement',
        data: { achievementId: achievement.id },
        read: false,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'notifications'), notification);

      // Send local notification
      await this.sendLocalNotification(
        notification.title,
        notification.body,
        { type: 'achievement', achievement }
      );

    } catch (error) {
      console.error('Error sending achievement notification:', error);
    }
  },

  // Send streak notification
  sendStreakNotification: async (userId, streakCount) => {
    try {
      const notification = {
        userId,
        title: `${streakCount} Day Streak! 🔥`,
        body: `Amazing! You've studied for ${streakCount} days in a row!`,
        type: 'streak',
        data: { streakCount },
        read: false,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'notifications'), notification);

      // Send local notification
      await this.sendLocalNotification(
        notification.title,
        notification.body,
        { type: 'streak', streakCount }
      );

    } catch (error) {
      console.error('Error sending streak notification:', error);
    }
  },

  // Send goal completion notification
  sendGoalCompletionNotification: async (userId, goalData) => {
    try {
      const notification = {
        userId,
        title: "Goal Completed! 🎯",
        body: `Congratulations! You've completed your ${goalData.type} goal.`,
        type: 'goal_completion',
        data: goalData,
        read: false,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'notifications'), notification);

      // Send local notification
      await this.sendLocalNotification(
        notification.title,
        notification.body,
        { type: 'goal_completion', goal: goalData }
      );

    } catch (error) {
      console.error('Error sending goal completion notification:', error);
    }
  },

  // Get user notifications
  getUserNotifications: async (userId, unreadOnly = false) => {
    try {
      let q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      if (unreadOnly) {
        q = query(q, where('read', '==', false));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw new Error('Failed to get notifications');
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (userId) => {
    try {
      const unreadNotifications = await this.getUserNotifications(userId, true);
      
      const updatePromises = unreadNotifications.map(notification =>
        this.markAsRead(notification.id)
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  },

  // Cancel scheduled notification
  cancelScheduledNotification: async (notificationId) => {
    try {
      // Cancel local notification
      if (Platform.OS !== 'web') {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }

      // Update in Firestore
      await updateDoc(doc(db, 'notifications', notificationId), {
        active: false,
        cancelledAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error cancelling notification:', error);
      throw new Error('Failed to cancel notification');
    }
  },

  // Setup notification listeners
  setupNotificationListeners: () => {
    if (Platform.OS !== 'web') {
      // Listen for notifications received while app is foregrounded
      const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received in foreground:', notification);
      });

      // Listen for user interactions with notifications
      const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response:', response);
        const { type } = response.notification.request.content.data || {};
        
        // Handle different notification types
        switch (type) {
          case 'study_reminder':
            // Navigate to study screen
            break;
          case 'achievement':
            // Navigate to achievements screen
            break;
          case 'streak':
            // Navigate to profile/stats screen
            break;
          default:
            break;
        }
      });

      return () => {
        foregroundSubscription.remove();
        responseSubscription.remove();
      };
    }
  }
};