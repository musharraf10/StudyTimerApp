import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Loader } from 'lucide-react'
import { AuthContext } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import './Signup.css'

const SignupScreen = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  
  const { signup } = useContext(AuthContext)
  const navigate = useNavigate()

  const calculatePasswordStrength = (pwd) => {
    let score = 0
    if (pwd.length >= 6) score += 1
    if (pwd.length >= 8) score += 1
    if (/[A-Z]/.test(pwd)) score += 1
    if (/[0-9]/.test(pwd)) score += 1
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1
    return score / 5
  }

  const handlePasswordChange = (value) => {
    setPassword(value)
    setPasswordStrength(calculatePasswordStrength(value))
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    
    if (!name || !email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await signup(name, email, password)
      toast.success('Account created successfully!')
      navigate('/')
    } catch (error) {
      toast.error(error.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const getStrengthColor = () => {
    if (passwordStrength < 0.3) return '#EF4444'
    if (passwordStrength < 0.6) return '#F59E0B'
    if (passwordStrength < 0.8) return '#10B981'
    return '#059669'
  }

  const getStrengthText = () => {
    if (passwordStrength < 0.3) return 'Weak'
    if (passwordStrength < 0.6) return 'Fair'
    if (passwordStrength < 0.8) return 'Good'
    return 'Strong'
  }

  return (
    <div className="signup-screen">
      {/* Background Elements */}
      <div className="background-elements">
        <motion.div 
          className="floating-circle circle-1"
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        <motion.div 
          className="floating-circle circle-2"
          animate={{ 
            rotate: -360,
            scale: [1, 0.9, 1]
          }}
          transition={{ 
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        <motion.div 
          className="floating-circle circle-3"
          animate={{ 
            rotate: 180,
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            rotate: { duration: 30, repeat: Infinity, ease: "linear" },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
        />
      </div>

      <div className="signup-container">
        <motion.div 
          className="signup-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="signup-header">
            <motion.div 
              className="logo-container"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="app-logo">FOCUSVAULT</h1>
            </motion.div>
            <p className="signup-subtitle">Join the vault today</p>
          </div>

          {/* Signup Form */}
          <motion.form 
            className="signup-form"
            onSubmit={handleSignup}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Name Input */}
            <div className="input-group">
              <div className="input-container">
                <User className="input-icon" size={20} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="input-group">
              <div className="input-container">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="input-group">
              <div className="input-container">
                <Lock className="input-icon" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="form-input"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <motion.div 
                  className="password-strength"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="strength-bar">
                    <motion.div 
                      className="strength-fill"
                      style={{ backgroundColor: getStrengthColor() }}
                      initial={{ width: 0 }}
                      animate={{ width: `${passwordStrength * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span 
                    className="strength-text"
                    style={{ color: getStrengthColor() }}
                  >
                    {getStrengthText()}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Signup Button */}
            <motion.button
              type="submit"
              className="signup-button"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <Loader className="loading-icon" size={20} />
              ) : (
                'Create Account'
              )}
            </motion.button>

            {/* Divider */}
            <div className="divider">
              <span>or</span>
            </div>

            {/* Google Button */}
            <motion.button
              type="button"
              className="google-button"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              <span className="google-icon">G</span>
              Sign Up with Google
            </motion.button>

            {/* Login Link */}
            <div className="auth-link">
              <span>Already have an account? </span>
              <Link to="/login" className="link-text">
                Sign In
              </Link>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  )
}

export default SignupScreen