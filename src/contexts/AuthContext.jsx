import React, { createContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  const checkAuthState = async () => {
    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.log('Auth check failed:', error)
      setUser(null)
    } finally {
      setInitializing(false)
    }
  }

  useEffect(() => {
    checkAuthState()
  }, [])

  const login = async (email, password) => {
    try {
      const userData = await authService.login(email, password)
      setUser(userData)
      return userData
    } catch (error) {
      throw error
    }
  }

  const signup = async (name, email, password) => {
    try {
      const userData = await authService.signup(name, email, password)
      setUser(userData)
      return userData
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const updateUser = (userData) => {
    setUser(userData)
  }

  return (
    <AuthContext.Provider value={{
      user,
      setUser: updateUser,
      initializing,
      login,
      signup,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}