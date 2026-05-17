// =============================================================
// api/authApi.js
// PURPOSE: All auth-related API calls
// updateProfile handles BOTH regular JSON and file uploads
// =============================================================

import api from './axios'

const authApi = {

  // ─── REGISTER ──────────────────────────────────────────
  register: async (userData) => {
    const response = await api.post('/auth/register/', userData)
    return response.data
  },

  // ─── LOGIN ─────────────────────────────────────────────
  login: async (email, password) => {
    const response = await api.post('/auth/login/', { email, password })
    return response.data
  },

  // ─── LOGOUT ────────────────────────────────────────────
  logout: async (refreshToken) => {
    const response = await api.post('/auth/logout/', {
      refresh: refreshToken,
    })
    return response.data
  },

  // ─── GET CURRENT USER ──────────────────────────────────
  getMe: async () => {
    const response = await api.get('/auth/me/')
    return response.data
  },

  // ─── UPDATE PROFILE (TEXT OR FILE) ─────────────────────
  // If data contains a File, sends as multipart/form-data
  // Otherwise sends as JSON
  updateProfile: async (data) => {
    const hasFile = Object.values(data).some((v) => v instanceof File)

    if (hasFile) {
      // Build FormData for file upload
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value)
        }
      })
      const response = await api.put('/auth/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    }

    // No file — regular JSON request
    const response = await api.put('/auth/me/', data)
    return response.data
  },
}

export default authApi