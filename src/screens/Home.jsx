import React, { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, 
  TrendingUp, 
  Target, 
  Award, 
  Calendar, 
  BookOpen, 
  Flame,
  ChevronRight
} from 'lucide-react'
import { AuthContext } from '../contexts/AuthContext'
import { StudyContext } from '../contexts/StudyContext'
import './Home.css'

const HomeScreen = () => {
  const { user } = useContext(AuthContext)
  const { studyStats } = useContext(StudyContext)
  const [quote, setQuote] = useState({ text: '', author: '' })
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    // Load daily quote
    loadQuote()

    return () => clearInterval(timer)
  }, [])

  const loadQuote = () => {
    const quotes = [
      {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs"
      },
      {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill"
      },
      {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt"
      },
      {
        text: "It is during our darkest moments that we must focus to see the light.",
        author: "Aristotle"
      },
      {
        text: "Education is the most powerful weapon which you can use to change the world.",
        author: "Nelson Mandela"
      }
    ]
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    setQuote(randomQuote)
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const formatHours = (hours) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}m`
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const quickActions = [
    {
      id: 'reading',
      title: 'Start Reading',
      subtitle: 'Begin a study session',
      icon: BookOpen,
      color: '#6366F1',
      path: '/readspace'
    },
    {
      id: 'schedule',
      title: 'Schedule',
      subtitle: 'Plan your day',
      icon: Calendar,
      color: '#10B981',
      path: '/readspace'
    },
    {
      id: 'achievements',
      title: 'Achievements',
      subtitle: 'View your badges',
      icon: Award,
      color: '#F59E0B',
      path: '/profile'
    },
    {
      id: 'tasks',
      title: 'Tasks',
      subtitle: 'Manage your todos',
      icon: Target,
      color: '#EF4444',
      path: '/todo'
    }
  ]

  return (
    <div className="home-screen">
      {/* Header */}
      <motion.div 
        className="home-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <div className="greeting-section">
            <h2 className="greeting">{getGreeting()}</h2>
            <h1 className="user-name">{user?.displayName || 'Student'}</h1>
            <p className="header-subtitle">Ready to focus and achieve your goals?</p>
          </div>
          
          <div className="time-section">
            <div className="current-time">
              <Clock size={16} />
              <span>{formatTime(currentTime)}</span>
            </div>
            <div className="current-date">{formatDate(currentTime)}</div>
          </div>
        </div>
      </motion.div>

      <div className="home-content">
        {/* Stats Cards */}
        <motion.div 
          className="stats-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="stats-grid">
            <div className="stat-card primary">
              <Clock size={24} color="#6366F1" />
              <div className="stat-content">
                <span className="stat-value">{formatHours(studyStats.todayHours)}</span>
                <span className="stat-label">Today</span>
              </div>
            </div>

            <div className="stat-card secondary">
              <Flame size={24} color="#F59E0B" />
              <div className="stat-content">
                <span className="stat-value">{studyStats.currentStreak}</span>
                <span className="stat-label">Day Streak</span>
              </div>
            </div>

            <div className="stat-card accent">
              <Target size={24} color="#10B981" />
              <div className="stat-content">
                <span className="stat-value">{studyStats.totalSessions}</span>
                <span className="stat-label">Sessions</span>
              </div>
            </div>

            <div className="stat-card warning">
              <TrendingUp size={24} color="#EF4444" />
              <div className="stat-content">
                <span className="stat-value">
                  {formatHours(studyStats.weeklyHours.reduce((a, b) => a + b, 0))}
                </span>
                <span className="stat-label">This Week</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Weekly Progress Chart */}
        <motion.div 
          className="chart-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="section-title">Weekly Progress</h3>
          <div className="chart">
            {studyStats.weeklyHours.map((hours, index) => {
              const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
              const maxHours = Math.max(...studyStats.weeklyHours, 1)
              const height = (hours / maxHours) * 100

              return (
                <div key={index} className="chart-bar">
                  <div className="bar-container">
                    <motion.div 
                      className="bar"
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                    />
                  </div>
                  <span className="bar-label">{days[index]}</span>
                  <span className="bar-value">{hours.toFixed(1)}h</span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Quote of the Day */}
        {quote.text && (
          <motion.div 
            className="quote-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="section-title">Daily Inspiration</h3>
            <div className="quote-card">
              <p className="quote-text">"{quote.text}"</p>
              <p className="quote-author">— {quote.author}</p>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div 
          className="actions-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="section-title">Quick Actions</h3>
          <div className="action-grid">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.id}
                  className="action-card"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                >
                  <div className="action-icon" style={{ backgroundColor: `${action.color}20` }}>
                    <Icon size={24} color={action.color} />
                  </div>
                  <div className="action-content">
                    <h4 className="action-title">{action.title}</h4>
                    <p className="action-subtitle">{action.subtitle}</p>
                  </div>
                  <ChevronRight size={16} color="#9CA3AF" />
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default HomeScreen