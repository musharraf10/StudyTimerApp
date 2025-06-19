// Mock data for the application
export const mockUser = {
  id: '1',
  displayName: 'Alex Johnson',
  email: 'alex@example.com',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
  phone: '+1 (555) 123-4567',
  loginMethod: 'email',
  createdAt: '2024-01-15T10:30:00Z',
  settings: {
    notificationsEnabled: true,
    studyReminders: true,
    achievementNotifications: true,
    emailNotifications: false,
    dailyGoal: 2,
    weeklyHoursTarget: 14,
    dailySessionsTarget: 3,
    weeklySessionsTarget: 21,
    preferredStudyStartTime: '09:00',
    preferredStudyEndTime: '17:00',
    bestFocusTime: 'morning',
    studyDaysOfWeek: [1, 2, 3, 4, 5]
  }
}

export const mockStudyStats = {
  todayHours: 3.75,
  currentStreak: 12,
  totalSessions: 55,
  weeklyHours: [2.5, 3.2, 1.8, 4.1, 3.5, 0.5, 1.2]
}

export const mockAchievements = [
  {
    id: 1,
    title: '7 Day Streak',
    icon: '🔥',
    earned: true,
    description: 'Study for 7 consecutive days',
    earnedAt: '2024-01-20T15:30:00Z'
  },
  {
    id: 2,
    title: 'Early Bird',
    icon: '🌅',
    earned: true,
    description: 'Start studying before 8 AM',
    earnedAt: '2024-01-18T07:45:00Z'
  },
  {
    id: 3,
    title: 'Night Owl',
    icon: '🦉',
    earned: false,
    description: 'Study after 10 PM for 5 days'
  },
  {
    id: 4,
    title: 'Consistent Reader',
    icon: '📚',
    earned: false,
    description: 'Complete 20 reading sessions'
  },
  {
    id: 5,
    title: 'First Session',
    icon: '✨',
    earned: true,
    description: 'Complete your first study session',
    earnedAt: '2024-01-15T11:00:00Z'
  },
  {
    id: 6,
    title: 'Deep Focus',
    icon: '🧠',
    earned: true,
    description: 'Study for 3+ hours in a single session',
    earnedAt: '2024-01-19T16:20:00Z'
  },
  {
    id: 7,
    title: 'Goal Crusher',
    icon: '🎯',
    earned: true,
    description: 'Exceed weekly goal by 50%',
    earnedAt: '2024-01-21T20:15:00Z'
  },
  {
    id: 8,
    title: 'Dedication',
    icon: '💪',
    earned: false,
    description: 'Study for 30 consecutive days'
  }
]

export const mockSchedules = {
  '2024-01-22': [
    {
      id: 1,
      subject: 'Mathematics',
      duration: 60,
      color: '#EBF5FB',
      completed: false,
      startTime: '09:00'
    },
    {
      id: 2,
      subject: 'Physics',
      duration: 45,
      color: '#FEF9E7',
      completed: true,
      startTime: '11:00'
    },
    {
      id: 3,
      subject: 'Chemistry',
      duration: 50,
      color: '#E9F7EF',
      completed: false,
      startTime: '14:00'
    }
  ]
}

export const mockCompletedReadings = [
  {
    id: 1,
    subject: 'Physics',
    duration: 45,
    date: '2024-01-22',
    completedAt: '11:45',
    notes: 'Completed chapter on thermodynamics'
  },
  {
    id: 2,
    subject: 'Mathematics',
    duration: 30,
    date: '2024-01-21',
    completedAt: '16:30',
    notes: 'Solved calculus problems'
  }
]

export const mockNotes = [
  {
    id: 1,
    title: 'Biology Chapter 5',
    date: '2024-01-20',
    time: '14:30',
    description: 'Key points about cellular respiration and energy production in cells. Important formulas and processes to remember for the exam.',
    subject: 'Biology'
  },
  {
    id: 2,
    title: 'Physics Formulas',
    date: '2024-01-19',
    time: '16:45',
    description: 'Important formulas for mechanics including velocity, acceleration, and force calculations. Need to practice more problems.',
    subject: 'Physics'
  },
  {
    id: 3,
    title: 'Chemistry Lab Notes',
    date: '2024-01-18',
    time: '10:15',
    description: 'Observations from today\'s lab experiment on chemical reactions. pH levels and color changes noted.',
    subject: 'Chemistry'
  }
]

export const mockTasks = [
  {
    id: '1',
    title: 'Complete Math Assignment',
    description: 'Solve problems 1-20 from chapter 5',
    completed: false,
    priority: 'high',
    category: 'Assignment',
    dueDate: '01/25/2024',
    createdAt: '2024-01-22T09:00:00Z'
  },
  {
    id: '2',
    title: 'Study for Physics Exam',
    description: 'Review chapters 3-5, focus on thermodynamics',
    completed: false,
    priority: 'high',
    category: 'Exam',
    dueDate: '01/28/2024',
    createdAt: '2024-01-21T14:30:00Z'
  },
  {
    id: '3',
    title: 'Read Biology Chapter 6',
    description: 'Take notes on photosynthesis process',
    completed: true,
    priority: 'medium',
    category: 'Study',
    dueDate: '01/23/2024',
    createdAt: '2024-01-20T11:15:00Z'
  },
  {
    id: '4',
    title: 'Chemistry Lab Report',
    description: 'Write report on last week\'s experiment',
    completed: false,
    priority: 'medium',
    category: 'Assignment',
    dueDate: '01/26/2024',
    createdAt: '2024-01-19T16:45:00Z'
  }
]

export const mockReadingRoomUsers = [
  {
    id: 1,
    name: 'Sarah Kim',
    hours: 24.5,
    rank: 1,
    status: 'studying',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: 2,
    name: 'Mike Chen',
    hours: 18.2,
    rank: 2,
    status: 'online',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: 3,
    name: 'Emma Davis',
    hours: 15.8,
    rank: 3,
    status: 'break',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: 4,
    name: 'Alex Johnson',
    hours: 12.3,
    rank: 4,
    status: 'offline',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
  }
]

export const mockChatMessages = [
  {
    id: 1,
    user: 'Sarah',
    message: 'Starting my study session now! 📚',
    time: '10:30',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=50'
  },
  {
    id: 2,
    user: 'Mike',
    message: 'Good luck everyone! Let\'s crush these goals 💪',
    time: '10:32',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=50'
  },
  {
    id: 3,
    user: 'Emma',
    message: 'Just finished my chemistry review. Taking a short break ☕',
    time: '10:45',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=50'
  },
  {
    id: 4,
    user: 'Alex',
    message: 'Anyone else working on calculus today?',
    time: '11:15',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=50'
  }
]

export const mockPresets = [
  {
    id: 1,
    name: 'JEE Preparation',
    subjects: [
      { name: 'Mathematics', duration: 90, color: '#EBF5FB' },
      { name: 'Physics', duration: 75, color: '#FEF9E7' },
      { name: 'Chemistry', duration: 75, color: '#E9F7EF' }
    ]
  },
  {
    id: 2,
    name: 'NEET Preparation',
    subjects: [
      { name: 'Biology', duration: 90, color: '#F4ECF7' },
      { name: 'Chemistry', duration: 75, color: '#E9F7EF' },
      { name: 'Physics', duration: 60, color: '#FEF9E7' }
    ]
  },
  {
    id: 3,
    name: 'Regular Study',
    subjects: [
      { name: 'Mathematics', duration: 60, color: '#EBF5FB' },
      { name: 'Science', duration: 45, color: '#E9F7EF' },
      { name: 'English', duration: 45, color: '#FADBD8' }
    ]
  }
]

export const mockGoals = [
  {
    id: 1,
    title: 'Complete JEE Main Mathematics',
    deadline: '2025-08-30',
    priority: 'high',
    completed: false,
    progress: 65
  },
  {
    id: 2,
    title: 'NEET Biology Revision',
    deadline: '2025-07-25',
    priority: 'medium',
    completed: false,
    progress: 40
  },
  {
    id: 3,
    title: 'CAT Quantitative Aptitude',
    deadline: '2025-09-15',
    priority: 'high',
    completed: false,
    progress: 25
  }
]

// Utility functions for mock data
export const generateMockData = () => {
  return {
    user: mockUser,
    studyStats: mockStudyStats,
    achievements: mockAchievements,
    schedules: mockSchedules,
    completedReadings: mockCompletedReadings,
    notes: mockNotes,
    tasks: mockTasks,
    readingRoomUsers: mockReadingRoomUsers,
    chatMessages: mockChatMessages,
    presets: mockPresets,
    goals: mockGoals
  }
}

export const getRandomQuote = () => {
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
  
  return quotes[Math.floor(Math.random() * quotes.length)]
}