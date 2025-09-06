import React, { useState } from 'react'
import { X, Calendar, MapPin, User, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const EventModal = ({ event, isOpen, onClose, onRegister, onFeedback, isRegistered }) => {
  const { isLoggedIn } = useAuth()
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)

  if (!isOpen || !event) return null

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isUpcoming = (dateString) => {
    return new Date(dateString) >= new Date()
  }

  const isPastEvent = !isUpcoming(event.date)

  const handleRegister = async () => {
    if (!isLoggedIn) {
      alert('Please log in to register for events')
      return
    }
    
    setLoading(true)
    try {
      await onRegister(event.event_id)
    } finally {
      setLoading(false)
    }
  }

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    if (!feedback.trim()) return
    
    setLoading(true)
    try {
      await onFeedback(event.event_id, feedback)
      setFeedback('')
      setShowFeedbackForm(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Event Status Badge */}
          <div className="mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isUpcoming(event.date) 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isUpcoming(event.date) ? 'Upcoming Event' : 'Past Event'}
            </span>
          </div>

          {/* Event Details */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-3" />
              <span>{formatDate(event.date)}</span>
            </div>
            
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-3" />
              <span>{event.venue}</span>
            </div>
            
            {event.coordinator_id && (
              <div className="flex items-center text-gray-600">
                <User className="h-5 w-5 mr-3" />
                <span>Coordinator: {event.coordinator_id}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">About This Event</h3>
            <p className="text-gray-700 leading-relaxed">{event.description}</p>
          </div>

          {/* Registration Status */}
          {isRegistered && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">✅ You are registered for this event</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Registration Button for Upcoming Events */}
            {isUpcoming(event.date) && !isRegistered && (
              <button
                onClick={handleRegister}
                disabled={loading || !isLoggedIn}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isLoggedIn
                    ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? 'Registering...' : isLoggedIn ? 'Register for Event' : 'Login to Register'}
              </button>
            )}

            {/* Feedback Section for Past Events */}
            {isPastEvent && isLoggedIn && (
              <div className="space-y-3">
                {!showFeedbackForm ? (
                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    className="w-full py-3 px-4 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                  >
                    Leave Feedback
                  </button>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Feedback
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Share your experience with this event..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        rows={4}
                        required
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={loading || !feedback.trim()}
                        className="flex-1 py-2 px-4 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:bg-orange-400 transition-colors"
                      >
                        {loading ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowFeedbackForm(false)
                          setFeedback('')
                        }}
                        className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Login prompt for non-authenticated users */}
            {!isLoggedIn && isPastEvent && (
              <p className="text-center text-gray-600">
                <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Login
                </a> to leave feedback for this event
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventModal
