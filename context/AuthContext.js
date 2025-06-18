import React, { createContext, useState, useEffect } from 'react';
import { AuthService } from '../utils/authService';
import { AnalyticsService } from '../services/analyticsService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Initialize auth service
    AuthService.initialize();

    // Set up auth state listener
    const unsubscribe = AuthService.initializeAuthListener((userData) => {
      setUser(userData);
      setInitializing(false);
      
      if (userData) {
        // Track app open when user is authenticated
        AnalyticsService.trackAppOpen();
      }
    });

    // Track app close when component unmounts
    return () => {
      if (user) {
        AnalyticsService.trackAppClose();
      }
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const value = {
    user,
    setUser,
    initializing
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};