import React, { createContext, useState, useEffect } from 'react'
import { studyService } from '../services/studyService'

export const StudyContext = createContext()

export const StudyProvider = ({ children }) => {
  const [activeSchedules, setActiveSchedules] = useState({})
  const [completedReadings, setCompletedReadings] = useState([])
  const [presets, setPresets] = useState([])
  const [studyStats, setStudyStats] = useState({
    todayHours: 0,
    currentStreak: 0,
    totalSessions: 0,
    weeklyHours: [0, 0, 0, 0, 0, 0, 0]
  })

  // Load state from localStorage and API
  const loadState = async () => {
    try {
      // Load from localStorage first for immediate UI
      const localSchedules = localStorage.getItem('activeSchedules')
      const localReadings = localStorage.getItem('completedReadings')
      const localPresets = localStorage.getItem('presets')
      const localStats = localStorage.getItem('studyStats')

      if (localSchedules) setActiveSchedules(JSON.parse(localSchedules))
      if (localReadings) setCompletedReadings(JSON.parse(localReadings))
      if (localPresets) setPresets(JSON.parse(localPresets))
      if (localStats) setStudyStats(JSON.parse(localStats))

      // Then sync with server
      const serverData = await studyService.getStudyData()
      if (serverData) {
        setActiveSchedules(serverData.schedules || {})
        setCompletedReadings(serverData.readings || [])
        setPresets(serverData.presets || [])
        setStudyStats(serverData.stats || {
          todayHours: 0,
          currentStreak: 0,
          totalSessions: 0,
          weeklyHours: [0, 0, 0, 0, 0, 0, 0]
        })
      }
    } catch (error) {
      console.log('Failed to load study state:', error)
    }
  }

  // Save state to localStorage and API
  const saveState = async (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      
      // Also save to server
      await studyService.updateStudyData({
        schedules: activeSchedules,
        readings: completedReadings,
        presets: presets,
        stats: studyStats,
        [key]: value
      })
    } catch (error) {
      console.log(`Failed to save ${key}:`, error)
    }
  }

  useEffect(() => {
    loadState()
  }, [])

  // Auto-save when data changes
  useEffect(() => {
    if (Object.keys(activeSchedules).length > 0) {
      saveState('activeSchedules', activeSchedules)
    }
  }, [activeSchedules])

  useEffect(() => {
    if (completedReadings.length > 0) {
      saveState('completedReadings', completedReadings)
    }
  }, [completedReadings])

  useEffect(() => {
    if (presets.length > 0) {
      saveState('presets', presets)
    }
  }, [presets])

  useEffect(() => {
    saveState('studyStats', studyStats)
  }, [studyStats])

  const addCompletedReading = (reading) => {
    const newReadings = [reading, ...completedReadings]
    setCompletedReadings(newReadings)
    
    // Update stats
    const newStats = { ...studyStats }
    newStats.todayHours += reading.duration / 60
    newStats.totalSessions += 1
    setStudyStats(newStats)
  }

  const updateSchedule = (date, schedule) => {
    setActiveSchedules(prev => ({
      ...prev,
      [date]: schedule
    }))
  }

  return (
    <StudyContext.Provider value={{
      activeSchedules,
      setActiveSchedules,
      completedReadings,
      setCompletedReadings,
      presets,
      setPresets,
      studyStats,
      setStudyStats,
      addCompletedReading,
      updateSchedule
    }}>
      {children}
    </StudyContext.Provider>
  )
}