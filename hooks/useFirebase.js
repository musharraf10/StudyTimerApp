import { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { MigrationService } from '../services/migrationService';
import { NotificationService } from '../services/notificationService';

export const useFirebase = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Wait for auth state to be determined
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          try {
            if (user) {
              // User is signed in, run migrations and setup
              await MigrationService.checkAndMigrateUserData();
              await NotificationService.initialize();
            }
            
            setIsInitialized(true);
            setError(null);
          } catch (initError) {
            console.error('Firebase initialization error:', initError);
            setError(initError.message);
            setIsInitialized(true); // Still set to true to allow app to continue
          }
        });

        // Cleanup subscription
        return () => unsubscribe();
      } catch (error) {
        console.error('Firebase setup error:', error);
        setError(error.message);
        setIsInitialized(true);
      }
    };

    initializeFirebase();
  }, []);

  return { isInitialized, error };
};