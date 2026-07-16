import { createContext, useContext, useState, useEffect } from 'react'
import { getUser, isLoggedIn, logout as logoutFn } from '../utils/auth.js'

// Create the context
const AuthContext = createContext(null)

// Provider wraps the whole app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser())
  const [loading, setLoading] = useState(false)

  // Called after successful login/signup
  function login(userData) {
    setUser(userData)
  }

  // Called on logout
  function logout() {
    logoutFn()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — use this anywhere in the app


export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}