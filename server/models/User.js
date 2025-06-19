import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return this.loginMethod === 'email'
    },
    minlength: 6
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    default: null
  },
  loginMethod: {
    type: String,
    enum: ['email', 'google'],
    default: 'email'
  },
  settings: {
    notificationsEnabled: { type: Boolean, default: true },
    studyReminders: { type: Boolean, default: true },
    achievementNotifications: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: false },
    dailyGoal: { type: Number, default: 2 },
    weeklyHoursTarget: { type: Number, default: 14 },
    dailySessionsTarget: { type: Number, default: 3 },
    weeklySessionsTarget: { type: Number, default: 21 },
    preferredStudyStartTime: { type: String, default: '09:00' },
    preferredStudyEndTime: { type: String, default: '17:00' },
    bestFocusTime: { 
      type: String, 
      enum: ['morning', 'afternoon', 'evening', 'night'],
      default: 'morning' 
    },
    studyDaysOfWeek: { type: [Number], default: [1, 2, 3, 4, 5] }
  },
  studyStats: {
    todayHours: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    weeklyHours: { type: [Number], default: [0, 0, 0, 0, 0, 0, 0] },
    lastStudyDate: { type: Date, default: null }
  },
  achievements: [{
    achievementId: { type: Number, required: true },
    earnedAt: { type: Date, default: Date.now }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Update study stats method
userSchema.methods.updateStudyStats = function(sessionDuration) {
  const today = new Date()
  const todayStr = today.toDateString()
  const lastStudyStr = this.studyStats.lastStudyDate?.toDateString()
  
  // Update today's hours
  if (lastStudyStr === todayStr) {
    this.studyStats.todayHours += sessionDuration / 60 // Convert minutes to hours
  } else {
    this.studyStats.todayHours = sessionDuration / 60
  }
  
  // Update streak
  if (lastStudyStr === todayStr) {
    // Same day, don't change streak
  } else if (lastStudyStr === new Date(today.getTime() - 24 * 60 * 60 * 1000).toDateString()) {
    // Yesterday, increment streak
    this.studyStats.currentStreak += 1
  } else if (!this.studyStats.lastStudyDate) {
    // First study session
    this.studyStats.currentStreak = 1
  } else {
    // Gap in studying, reset streak
    this.studyStats.currentStreak = 1
  }
  
  // Update total sessions
  this.studyStats.totalSessions += 1
  
  // Update weekly hours (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = today.getDay()
  this.studyStats.weeklyHours[dayOfWeek] += sessionDuration / 60
  
  // Update last study date
  this.studyStats.lastStudyDate = today
  
  return this.save()
}

// Get user profile method
userSchema.methods.getProfile = function() {
  const user = this.toObject()
  delete user.password
  return user
}

// Indexes for better performance
userSchema.index({ email: 1 })
userSchema.index({ createdAt: -1 })
userSchema.index({ 'studyStats.currentStreak': -1 })

export default mongoose.model('User', userSchema)