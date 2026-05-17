// =============================================================
// api/axios.js
// PURPOSE: Central Axios instance + media URL helper
// =============================================================

import axios from 'axios'

// Backend base URL (without /api at end)
export const BACKEND_URL = 'http://127.0.0.1:8000'

// Helper to convert relative media URLs to absolute Django URLs
// e.g. "/media/resumes/foo.pdf" -> "http://127.0.0.1:8000/media/resumes/foo.pdf"
export const mediaUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path  // already absolute
  return BACKEND_URL + path
}

// Configured Axios instance
const api = axios.create({
  baseURL: BACKEND_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT token to every request
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

// Handle expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    }
    return Promise.reject(error)
  }
)

export default api