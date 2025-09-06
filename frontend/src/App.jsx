import React, { useState } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import EventList from './components/EventList'
import Login from './components/Login'
import Register from './components/Register.jsx'
import UserProfile from './components/UserProfile'
import Footer from './components/Footer'

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const ProtectedRoute = ({ children, isLoggedIn }) => {
    return isLoggedIn ? children : <Navigate to="/login" replace />
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <NavBar isLoggedIn={isLoggedIn} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<EventList />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <UserProfile />
                </ProtectedRoute>
              } 
            />
            <Route path="/events" element={<EventList />} />
            <Route 
              path="/login" 
              element={<Login setIsLoggedIn={setIsLoggedIn} />} 
            />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App