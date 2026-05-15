// =============================================================
// api/authApi.js
// PURPOSE: All authentication-related API calls
// Wraps Axios calls so components don't deal with URLs directly
//
// Components call: authApi.login(...)
// authApi handles: POST /api/auth/login/ + saving tokens
// =============================================================

import api from './axios'

const authApi = {

  // ─── REGISTER ──────────────────────────────────────────
  // POST /api/auth/register/
  // Used in the Register page
  register: async (userData) => {
    const response = await api.post('/auth/register/', userData)
    return response.data
    // returns { message, tokens: { access, refresh }, user }
  },

  // ─── LOGIN ─────────────────────────────────────────────
  // POST /api/auth/login/
  // Used in the Login page
  login: async (email, password) => {
    const response = await api.post('/auth/login/', { email, password })
    return response.data
    // returns { message, tokens: { access, refresh }, user }
  },

  // ─── LOGOUT ────────────────────────────────────────────
  // POST /api/auth/logout/
  // Blacklists the refresh token on the backend
  logout: async (refreshToken) => {
    const response = await api.post('/auth/logout/', {
      refresh: refreshToken,
    })
    return response.data
  },

  // ─── GET CURRENT USER ──────────────────────────────────
  // GET /api/auth/me/
  // Used to refresh user data (e.g. after profile update)
  getMe: async () => {
    const response = await api.get('/auth/me/')
    return response.data
  },

  // ─── UPDATE PROFILE ────────────────────────────────────
  // PUT /api/auth/me/
  updateProfile: async (data) => {
    const response = await api.put('/auth/me/', data)
    return response.data
  },
}

export default authApi