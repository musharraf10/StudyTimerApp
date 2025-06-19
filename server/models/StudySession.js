import mongoose from 'mongoose'

const studySessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 1
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    maxlength: 500
  },
  completed: {
    type: Boolean,
    default: true
  },
  sessionType: {
    type: String,
    enum: ['reading', 'practice', 'review', 'exam'],
    default: 'reading'
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
})

// Indexes for better performance
studySessionSchema.index({ userId: 1, createdAt: -1 })
studySessionSchema.index({ userId: 1, subject: 1 })
studySessionSchema.index({ startTime: 1 })

// Virtual for session date
studySessionSchema.virtual('sessionDate').get(function() {
  return this.startTime.toDateString()
})

// Static method to get user's study stats
studySessionSchema.statics.getUserStats = async function(userId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        startTime: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalHours: { $sum: { $divide: ['$duration', 60] } },
        subjects: { $addToSet: '$subject' },
        avgSessionDuration: { $avg: '$duration' }
      }
    }
  ]
  
  const result = await this.aggregate(pipeline)
  return result[0] || {
    totalSessions: 0,
    totalHours: 0,
    subjects: [],
    avgSessionDuration: 0
  }
}

// Static method to get daily study data
studySessionSchema.statics.getDailyStats = async function(userId, days = 7) {
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000))
  
  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        startTime: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$startTime'
          }
        },
        totalHours: { $sum: { $divide: ['$duration', 60] } },
        sessionCount: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]
  
  return this.aggregate(pipeline)
}

export default mongoose.model('StudySession', studySessionSchema)