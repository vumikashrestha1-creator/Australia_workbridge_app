// =============================================================
// api/adminApi.js
// PURPOSE: Admin-only API client
// Calls the /api/users/admin/* endpoints we defined in Django
// =============================================================

import api from './axios'

const adminApi = {
  stats: async () => {
    const response = await api.get('/auth/admin/stats/')
    return response.data
  },
  listUsers: async () => {
    const response = await api.get('/auth/admin/users/')
    return response.data
  },
  deleteUser: async (userId) => {
    await api.delete(`/auth/admin/users/${userId}/`)
  },
  deleteJob: async (jobId) => {
    await api.delete(`/auth/admin/jobs/${jobId}/`)
  },
}

export default adminApi