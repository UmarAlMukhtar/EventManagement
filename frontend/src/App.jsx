import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import NavBar from './components/NavBar';
import EventList from './components/EventList';
import UserProfile from './components/UserProfile';
import Login from './components/Login';
import Register from './components/Register';
import CreateEvent from './components/CreateEvent';
import Footer from './components/Footer';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth()
  
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }
  
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

const AppContent = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<EventList />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-event" 
            element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App;