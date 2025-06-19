import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      return user
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  },

  signup: async (name, email, password) => {
    try {
      const response = await api.post('/auth/signup', { name, email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      return user
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Signup failed')
    }
  },

  googleSignIn: async () => {
    try {
      // For now, simulate Google sign-in
      const mockUser = {
        id: 'google_' + Date.now(),
        email: 'user@gmail.com',
        displayName: 'Google User',
        loginMethod: 'google',
        createdAt: new Date().toISOString(),
      }
      
      localStorage.setItem('user', JSON.stringify(mockUser))
      return mockUser
    } catch (error) {
      throw new Error('Google sign-in failed')
    }
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (!token || !user) {
        return null
      }
      
      // Verify token with server
      const response = await api.get('/auth/me')
      return response.data.user
    } catch (error) {
      // If token is invalid, return cached user for offline support
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.log('Logout API call failed:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData)
      const updatedUser = response.data.user
      
      localStorage.setItem('user', JSON.stringify(updatedUser))
      return updatedUser
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Profile update failed')
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword })
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password change failed')
    }
  },

  updateAvatar: async (avatarFile) => {
    try {
      const formData = new FormData()
      formData.append('avatar', avatarFile)
      
      const response = await api.post('/auth/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      const updatedUser = response.data.user
      localStorage.setItem('user', JSON.stringify(updatedUser))
      return updatedUser
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Avatar update failed')
    }
  }
}