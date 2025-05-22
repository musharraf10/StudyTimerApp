import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthService = {
  // Simulate login with email/password
  login: async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        // Simple validation
        if (email && password && password.length >= 6) {
          const userData = {
            id: Date.now().toString(),
            email: email,
            displayName: email.split('@')[0],
            loginMethod: 'email',
            createdAt: new Date().toISOString(),
          };
          
          await AsyncStorage.setItem('userSession', JSON.stringify(userData));
          resolve(userData);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 1000);
    });
  },

  // Simulate signup
  signup: async (name, email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        if (name && email && password && password.length >= 6) {
          const userData = {
            id: Date.now().toString(),
            email: email,
            displayName: name,
            loginMethod: 'email',
            createdAt: new Date().toISOString(),
          };
          
          await AsyncStorage.setItem('userSession', JSON.stringify(userData));
          resolve(userData);
        } else {
          reject(new Error('Please provide valid information'));
        }
      }, 1000);
    });
  },

  // Simulate Google Sign-In
  googleSignIn: async () => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const userData = {
          id: 'google_' + Date.now().toString(),
          email: 'user@gmail.com',
          displayName: 'Google User',
          loginMethod: 'google',
          createdAt: new Date().toISOString(),
        };
        
        await AsyncStorage.setItem('userSession', JSON.stringify(userData));
        resolve(userData);
      }, 1500);
    });
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const userData = await AsyncStorage.getItem('userSession');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  },

  // Logout
  logout: async () => {
    await AsyncStorage.removeItem('userSession');
  },
};