import React, { useState } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, BookOpen, CheckCircle, User } from 'lucide-react'

// Screen Components
import HomeScreen from '../screens/Home'
import ReadSpaceScreen from '../screens/ReadSpace'
import ToDoScreen from '../screens/ToDo'
import ProfileScreen from '../screens/Profile'

import './TabNavigator.css'

const TabNavigator = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const tabs = [
    { id: 'home', path: '/', label: 'Home', icon: Home },
    { id: 'readspace', path: '/readspace', label: 'Reading Space', icon: BookOpen },
    { id: 'todo', path: '/todo', label: 'ToDo', icon: CheckCircle },
    { id: 'profile', path: '/profile', label: 'Profile', icon: User },
  ]

  const currentTab = tabs.find(tab => tab.path === location.pathname)?.id || 'home'

  const handleTabPress = (tab) => {
    navigate(tab.path)
  }

  return (
    <div className="tab-navigator">
      {/* Header */}
      <div className="tab-header safe-area-top">
        <h1 className="app-title">FOCUSVAULT</h1>
      </div>

      {/* Main Content */}
      <div className="tab-content">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/readspace" element={<ReadSpaceScreen />} />
          <Route path="/todo" element={<ToDoScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
        </Routes>
      </div>

      {/* Bottom Tab Bar */}
      <div className="tab-bar safe-area-bottom">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = currentTab === tab.id
          
          return (
            <button
              key={tab.id}
              className={`tab-item ${isActive ? 'active' : ''}`}
              onClick={() => handleTabPress(tab)}
            >
              <div className="tab-icon-container">
                <Icon 
                  size={24} 
                  color={isActive ? '#6366F1' : '#9CA3AF'} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive && (
                  <motion.div
                    className="tab-indicator"
                    layoutId="tab-indicator"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
              <span className={`tab-label ${isActive ? 'active' : ''}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default TabNavigator