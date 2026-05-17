// =============================================================
// context/AuthContext.jsx
// PURPOSE: Global user state + auth actions
// Exposes refreshUser() so child components can update user
// after profile changes (e.g. resume upload)
// =============================================================

import { createContext, useContext, useState, useEffect } from 'react'
import authApi from '../api/authApi'

const AuthContext = createContext(null)

// Custom hook — use in components: const { user, login } = useAuth()
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount — restore user from localStorage so they
  // stay logged in across page refreshes
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  // ─── LOGIN ─────────────────────────────────────────────
  const login = async (email, password) => {
    const data = await authApi.login(email, password)
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
      // ignore backend errors — still clear local state
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // ─── REFRESH USER (called after profile edits) ─────────
  // Updates global state + localStorage with new user data
  // Used by Profile page after resume upload
  const refreshUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  const isStudent  = user?.role === 'student'
  const isEmployer = user?.role === 'employer'
  const isAdmin    = user?.role === 'admin'

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
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