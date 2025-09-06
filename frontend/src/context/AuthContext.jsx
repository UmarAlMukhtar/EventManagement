import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkAuthStatus = useCallback(() => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const decodedToken = jwtDecode(token)
        const currentTime = Date.now() / 1000
        
        if (decodedToken.exp > currentTime) {
          setIsLoggedIn(true)
          setUser({
            user_id: decodedToken.user_id,
            role: decodedToken.role
          })
        } else {
          // Token expired
          logout()
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  const login = (token) => {
    try {
      localStorage.setItem('token', token)
      const decodedToken = jwtDecode(token)
      setIsLoggedIn(true)
      setUser({
        user_id: decodedToken.user_id,
        role: decodedToken.role
      })
    } catch (error) {
      console.error('Error during login:', error)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setUser(null)
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  const value = {
    isLoggedIn,
    user,
    loading,
    login,
    logout,
    getAuthHeaders,
    isAdmin
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
