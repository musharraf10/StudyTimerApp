import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

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

export const studyService = {
  getStudyData: async () => {
    try {
      const response = await api.get('/study/data')
      return response.data
    } catch (error) {
      console.log('Failed to fetch study data:', error)
      return null
    }
  },

  updateStudyData: async (data) => {
    try {
      const response = await api.put('/study/data', data)
      return response.data
    } catch (error) {
      console.log('Failed to update study data:', error)
      throw error
    }
  },

  addStudySession: async (session) => {
    try {
      const response = await api.post('/study/sessions', session)
      return response.data
    } catch (error) {
      console.log('Failed to add study session:', error)
      throw error
    }
  },

  getStudyStats: async () => {
    try {
      const response = await api.get('/study/stats')
      return response.data
    } catch (error) {
      console.log('Failed to fetch study stats:', error)
      return {
        todayHours: 0,
        currentStreak: 0,
        totalSessions: 0,
        weeklyHours: [0, 0, 0, 0, 0, 0, 0]
      }
    }
  },

  updateStreak: async () => {
    try {
      const response = await api.post('/study/streak')
      return response.data
    } catch (error) {
      console.log('Failed to update streak:', error)
      throw error
    }
  },

  getAchievements: async () => {
    try {
      const response = await api.get('/study/achievements')
      return response.data
    } catch (error) {
      console.log('Failed to fetch achievements:', error)
      return []
    }
  },

  unlockAchievement: async (achievementId) => {
    try {
      const response = await api.post(`/study/achievements/${achievementId}/unlock`)
      return response.data
    } catch (error) {
      console.log('Failed to unlock achievement:', error)
      throw error
    }
  }
}