import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Loader } from 'lucide-react'
import { AuthContext } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import './Login.css'

const LoginScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      // Implement Google sign-in
      toast.success('Google sign-in coming soon!')
    } catch (error) {
      toast.error('Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
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
      </div>

      <div className="login-container">
        <motion.div 
          className="login-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="login-header">
            <motion.div 
              className="logo-container"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="app-logo">FOCUSVAULT</h1>
            </motion.div>
            <p className="login-subtitle">Welcome back to your vault</p>
          </div>

          {/* Login Form */}
          <motion.form 
            className="login-form"
            onSubmit={handleLogin}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
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
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            {/* Login Button */}
            <motion.button
              type="submit"
              className="login-button"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <Loader className="loading-icon" size={20} />
              ) : (
                'Sign In'
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
              onClick={handleGoogleSignIn}
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              <span className="google-icon">G</span>
              Continue with Google
            </motion.button>

            {/* Sign Up Link */}
            <div className="auth-link">
              <span>Don't have an account? </span>
              <Link to="/signup" className="link-text">
                Sign Up
              </Link>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginScreen