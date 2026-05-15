// =============================================================
// context/AuthContext.jsx
// PURPOSE: Global state for the logged-in user
// Available in EVERY component without prop drilling
//
// EXPOSES:
//   user        — current user object (null if logged out)
//   login()     — call this from Login page
//   register()  — call this from Register page
//   logout()    — call this from Navbar
//   loading     — true while checking initial auth state
//
// HOW IT WORKS:
//   1. On app load, check localStorage for saved user
//   2. If found, restore user state (auto-login on refresh)
//   3. Provide login/register/logout methods to any component
// =============================================================

import { createContext, useContext, useState, useEffect } from 'react'
import authApi from '../api/authApi'

// Create the context
const AuthContext = createContext(null)

// Custom hook — use this in components: const { user, login } = useAuth()
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}

// Provider component — wrap App.jsx with this
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // ─── ON APP LOAD — RESTORE USER FROM LOCALSTORAGE ─────
  // Without this, refreshing the page would log them out
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        // If corrupt data, clear it
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  // ─── LOGIN ─────────────────────────────────────────────
  const login = async (email, password) => {
    const data = await authApi.login(email, password)
    // Save tokens and user in localStorage so they persist
    localStorage.setItem('access_token',  data.tokens.access)
    localStorage.setItem('refresh_token', data.tokens.refresh)
    localStorage.setItem('user',          JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  // ─── REGISTER ──────────────────────────────────────────
  const register = async (userData) => {
    const data = await authApi.register(userData)
    localStorage.setItem('access_token',  data.tokens.access)
    localStorage.setItem('refresh_token', data.tokens.refresh)
    localStorage.setItem('user',          JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  // ─── LOGOUT ────────────────────────────────────────────
  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        await authApi.logout(refresh)
      }
    } catch {
      // Even if backend fails, clear local state
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // ─── HELPER ROLE CHECKS (for conditional rendering) ────
  const isStudent  = user?.role === 'student'
  const isEmployer = user?.role === 'employer'
  const isAdmin    = user?.role === 'admin'

  // Value object passed to all child components
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isStudent,
    isEmployer,
    isAdmin,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}