import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import redis from 'redis'
import authRoutes from './routes/auth.js'
import studyRoutes from './routes/study.js'
import userRoutes from './routes/user.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Redis client setup
let redisClient
try {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  })
  
  redisClient.on('error', (err) => {
    console.log('Redis Client Error', err)
  })
  
  redisClient.on('connect', () => {
    console.log('Connected to Redis')
  })
  
  await redisClient.connect()
} catch (error) {
  console.log('Redis connection failed:', error)
  redisClient = null
}

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Add Redis client to request object
app.use((req, res, next) => {
  req.redisClient = redisClient
  next()
})

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/focusvault', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/study', studyRoutes)
app.use('/api/user', userRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    redis: redisClient?.isOpen ? 'connected' : 'disconnected'
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error)
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully')
  
  if (redisClient) {
    await redisClient.quit()
  }
  
  await mongoose.connection.close()
  process.exit(0)
})