import React, { useState, useEffect } from 'react'
import { Calendar, MapPin, User, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import EventModal from './EventModal'

const EventList = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [registrationStatus, setRegistrationStatus] = useState({})
  const { isLoggedIn, isAdmin, user, getAuthHeaders } = useAuth()

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    const checkRegistrations = async () => {
      if (!isLoggedIn || events.length === 0) return
      
      const status = {}
      for (const event of events) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/registrations/check/${event.event_id}`,
            {
              headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
              }
            }
          )
          if (response.ok) {
            const data = await response.json()
            status[event.event_id] = data.isRegistered
          }
        } catch (err) {
          console.error('Error checking registration:', err)
        }
      }
      setRegistrationStatus(status)
    }
    
    checkRegistrations()
  }, [isLoggedIn, events, getAuthHeaders])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      
      // Fetch events from the database API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Sort events by date - latest first (newest dates at top)
      const sortedEvents = data.sort((a, b) => new Date(b.date) - new Date(a.date))
      setEvents(sortedEvents)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
  }

  const handleRegister = async (eventId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/registrations`,
        {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ event_id: eventId })
        }
      )

      const data = await response.json()
      
      if (response.ok) {
        setRegistrationStatus(prev => ({
          ...prev,
          [eventId]: true
        }))
        alert('Registration successful!')
      } else {
        alert(data.error || 'Registration failed')
      }
    } catch (err) {
      console.error('Registration error:', err)
      alert('Network error. Please try again.')
    }
  }

  const handleFeedback = async (eventId, feedbackText) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/feedback`,
        {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            event_id: eventId,
            feedback: feedbackText
          })
        }
      )

      const data = await response.json()
      
      if (response.ok) {
        alert('Feedback submitted successfully!')
      } else {
        alert(data.error || 'Failed to submit feedback')
      }
    } catch (err) {
      console.error('Feedback error:', err)
      alert('Network error. Please try again.')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const isUpcoming = (dateString) => {
    return new Date(dateString) >= new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">All Events</h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600">Error loading events: {error}</p>
              <button 
                onClick={fetchEvents}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">All Events</h1>
            <div className="bg-white border border-gray-200 rounded-lg p-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No events available at the moment.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">All Events</h1>
          <p className="text-gray-600 text-lg">Latest events shown first</p>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded mt-4"></div>
        </div>

        {/* Create Event Button for Admins and Coordinators */}
        {isLoggedIn && (isAdmin() || user?.role === 'coordinator') && (
          <div className="mb-8 text-center">
            <Link
              to="/create-event"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Event
            </Link>
          </div>
        )}

        <div className="space-y-6">
          {events.map((event) => (
            <div
              key={event.event_id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isUpcoming(event.date) 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isUpcoming(event.date) ? 'Upcoming' : 'Past Event'}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      {event.title}
                    </h2>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="flex items-center text-gray-500 mb-2">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.venue}</span>
                    </div>

                    {event.coordinator_id && (
                      <div className="flex items-center text-gray-500">
                        <User className="h-4 w-4 mr-2" />
                        <span className="text-sm">Coordinator: {event.coordinator_id}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-center space-y-3">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {new Date(event.date).getDate()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(event.date).getFullYear()}
                      </div>
                      <div className="text-sm font-semibold text-blue-600 mt-2">
                        {formatTime(event.date)}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleEventClick(event)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 text-gray-500">
          Showing {events.length} {events.length === 1 ? 'event' : 'events'}
        </div>

        {/* Event Modal */}
        <EventModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRegister={handleRegister}
          onFeedback={handleFeedback}
          isRegistered={selectedEvent ? registrationStatus[selectedEvent.event_id] : false}
        />
      </div>
    </div>
  )
}

export default EventList