import React, { useContext, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext } from './contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

// Auth Components
import LoginScreen from './screens/Login'
import SignupScreen from './screens/Signup'

// Main App Components
import TabNavigator from './navigation/TabNavigator'
// import ReadingModeScreen from './screens/ReadingScreen'
import LoadingSpinner from './components/LoadingSpinner'

// Styles
import './App.css'

function App() {
  const { user, initializing } = useContext(AuthContext)

  useEffect(() => {
    // Set viewport height for mobile browsers
    const setVH = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    setVH()
    window.addEventListener('resize', setVH)

    return () => window.removeEventListener('resize', setVH)
  }, [])

  if (initializing) {
    return <LoadingSpinner />
  }

  return (
    <Router>
      <div className="app">
        <AnimatePresence mode="wait">
          <Routes>
            {!user ? (
              <>
                <Route path="/*" element={<TabNavigator />} />
                {/* <Route path="/reading-mode" element={<ReadingModeScreen />} /> */}
              </>
            ) : (
              <>
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/signup" element={<SignupScreen />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            )}
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  )
}

export default App