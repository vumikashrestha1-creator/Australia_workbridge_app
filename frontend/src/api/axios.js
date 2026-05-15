// =============================================================
// api/axios.js
// PURPOSE: Central Axios instance pre-configured to talk
// to our Django backend. All other API files import this.
//
// WHY: If our backend URL changes (e.g. when deploying to Render),
// we update ONE line here instead of every API file.
// =============================================================

import axios from 'axios'

// Create a configured Axios instance
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',  // Django backend URL
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── REQUEST INTERCEPTOR ────────────────────────────────────
// Runs before every API request
// Automatically attaches the JWT token if user is logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── RESPONSE INTERCEPTOR ───────────────────────────────────
// Runs after every API response
// If token is expired (401), automatically log user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      // Could redirect to login here later
    }
    return Promise.reject(error)
  }
)

export default api