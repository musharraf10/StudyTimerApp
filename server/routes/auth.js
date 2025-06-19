import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { authMiddleware } from '../middleware/auth.js'
import { cacheMiddleware, setCacheData } from '../middleware/cache.js'

const router = express.Router()

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d'
  })
}

// Register
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Create user
    const user = new User({
      displayName: name,
      email,
      password,
      loginMethod: 'email'
    })

    await user.save()

    // Generate token
    const token = generateToken(user._id)

    // Cache user data
    if (req.redisClient) {
      await setCacheData(req.redisClient, `user:${user._id}`, user.getProfile(), 3600)
    }

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: user.getProfile()
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate token
    const token = generateToken(user._id)

    // Cache user data
    if (req.redisClient) {
      await setCacheData(req.redisClient, `user:${user._id}`, user.getProfile(), 3600)
    }

    res.json({
      message: 'Login successful',
      token,
      user: user.getProfile()
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get current user
router.get('/me', authMiddleware, cacheMiddleware('user'), async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Cache user data
    if (req.redisClient) {
      await setCacheData(req.redisClient, `user:${user._id}`, user.getProfile(), 3600)
    }

    res.json({ user: user.getProfile() })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { displayName, phone, settings } = req.body

    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Update fields
    if (displayName) user.displayName = displayName
    if (phone !== undefined) user.phone = phone
    if (settings) {
      user.settings = { ...user.settings, ...settings }
    }

    await user.save()

    // Clear cache
    if (req.redisClient) {
      await req.redisClient.del(`user:${user._id}`)
    }

    res.json({
      message: 'Profile updated successfully',
      user: user.getProfile()
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Change password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' })
    }

    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // Clear cache
    if (req.redisClient) {
      await req.redisClient.del(`user:${req.userId}`)
    }

    res.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router