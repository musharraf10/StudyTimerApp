import React from 'react'
import './LoadingSpinner.css'

const LoadingSpinner = ({ size = 'medium', color = '#6366F1' }) => {
  return (
    <div className="loading-container">
      <div 
        className={`loading-spinner ${size}`}
        style={{ borderTopColor: color }}
      />
    </div>
  )
}

export default LoadingSpinner