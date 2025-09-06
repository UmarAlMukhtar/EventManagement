import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock } from 'lucide-react'

const EventList = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Sample data for demonstration
  const sampleEvents = [
    {
      id: 1,
      title: "Tech Conference 2025",
      description: "Join us for the biggest tech conference of the year featuring keynotes from industry leaders and hands-on workshops.",
      date: "2025-10-15T09:00:00Z",
      time: "9:00 AM - 6:00 PM",
      location: "Convention Center, San Francisco",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      title: "Music Festival",
      description: "Experience three days of incredible music with top artists from around the world in a beautiful outdoor setting.",
      date: "2025-09-20T16:00:00Z",
      time: "4:00 PM - 11:00 PM",
      location: "Central Park, New York",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      title: "Art Exhibition",
      description: "Discover contemporary art from emerging and established artists in this curated exhibition showcasing diverse mediums.",
      date: "2025-11-01T10:00:00Z",
      time: "10:00 AM - 8:00 PM",
      location: "Modern Art Museum, Los Angeles",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
    },
    {
      id: 4,
      title: "Food & Wine Festival",
      description: "Taste exquisite dishes from renowned chefs and sample fine wines from local and international vineyards.",
      date: "2025-09-30T12:00:00Z",
      time: "12:00 PM - 10:00 PM",
      location: "Waterfront Plaza, Seattle",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop"
    },
    {
      id: 5,
      title: "Business Summit",
      description: "Network with industry professionals and learn about the latest business trends and strategies for success.",
      date: "2025-12-05T08:00:00Z",
      time: "8:00 AM - 5:00 PM",
      location: "Business Center, Chicago",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop"
    },
    {
      id: 6,
      title: "Marathon Race",
      description: "Challenge yourself in this annual marathon featuring scenic routes through the city and surrounding areas.",
      date: "2025-08-10T06:00:00Z",
      time: "6:00 AM - 2:00 PM",
      location: "City Center, Boston",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
    }
  ]

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Use sample data for now
      const data = sampleEvents
      
      // Sort events by date to separate upcoming from recent
      const sortedEvents = data.sort((a, b) => new Date(a.date) - new Date(b.date))
      const now = new Date()
      
      // Separate upcoming and past events
      const upcomingEvents = sortedEvents.filter(event => new Date(event.date) >= now)
      const pastEvents = sortedEvents.filter(event => new Date(event.date) < now)
      
      // Show upcoming events if available, otherwise show recent events
      setEvents(upcomingEvents.length > 0 ? upcomingEvents : pastEvents.reverse())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(events.length / 3))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(events.length / 3)) % Math.ceil(events.length / 3))
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const isUpcoming = (dateString) => {
    return new Date(dateString) >= new Date()
  }

  if (loading) {
    return (
      <div className="event-list py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="event-list py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Events</h2>
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
      <div className="event-list py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Events</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No events available at the moment.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const hasUpcomingEvents = events.some(event => isUpcoming(event.date))
  const title = hasUpcomingEvents ? "Upcoming Events" : "Recent Events"

  const visibleEvents = events.slice(currentIndex * 3, (currentIndex + 1) * 3)
  const totalSlides = Math.ceil(events.length / 3)

  return (
    <div className="event-list py-12 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded"></div>
        </div>

        {events.length > 3 && (
          <div className="flex justify-center items-center mb-8">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow mr-4 disabled:opacity-50"
              disabled={totalSlides <= 1}
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            
            <div className="flex space-x-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow ml-4 disabled:opacity-50"
              disabled={totalSlides <= 1}
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleEvents.map((event, index) => (
            <div
              key={event.event_id || index}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
            >
              {/* Placeholder image since no image field in database */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="text-white text-center p-4">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-medium opacity-90">Event Image</p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isUpcoming(event.date) 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isUpcoming(event.date) ? 'Upcoming' : 'Past'}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {event.title}
                </h3>
                
                {event.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {event.description}
                  </p>
                )}

                <div className="space-y-2 text-sm text-gray-500">
                  {event.date && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                  )}
                  
                  {event.venue && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.venue}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length > 3 && (
          <div className="text-center mt-8 text-gray-500">
            Showing {currentIndex * 3 + 1} - {Math.min((currentIndex + 1) * 3, events.length)} of {events.length} events
          </div>
        )}
      </div>
    </div>
  )
}

export default EventList;