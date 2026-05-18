// =============================================================
// api/jobsApi.js
// PURPOSE: All job-related API calls
// Wraps Axios calls so components don't deal with URLs directly
// =============================================================

import api from './axios'

const jobsApi = {

  // ─── LIST JOBS WITH OPTIONAL FILTERS ──────────────────
  // GET /api/jobs/
  // Used in the JobListings page
  // params example: { visa_sponsored: true, category: 'technology', search: 'developer' }
  list: async (params = {}) => {
    const response = await api.get('/jobs/', { params })
    return response.data
  },

  // ─── GET ONE JOB BY ID ────────────────────────────────
  // GET /api/jobs/<id>/
  getById: async (id) => {
    const response = await api.get(`/jobs/${id}/`)
    return response.data
  },

  // ─── CREATE A NEW JOB ─────────────────────────────────
  // POST /api/jobs/create/
  // Employer only
  create: async (jobData) => {
    const response = await api.post('/jobs/create/', jobData)
    return response.data
  },

  // ─── UPDATE A JOB ─────────────────────────────────────
  // PUT /api/jobs/<id>/edit/
  update: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}/edit/`, jobData)
    return response.data
  },

  // ─── DELETE A JOB ─────────────────────────────────────
  // DELETE /api/jobs/<id>/edit/
  remove: async (id) => {
    const response = await api.delete(`/jobs/${id}/edit/`)
    return response.data
  },

  // ─── EMPLOYER — MY JOBS ───────────────────────────────
  // GET /api/jobs/my-jobs/
  myJobs: async () => {
    const response = await api.get('/jobs/my-jobs/')
    return response.data
  },

  // ─── ADMIN — ALL JOBS ─────────────────────────────────
  // GET /api/jobs/all/
  all: async () => {
    const response = await api.get('/jobs/all/')
    return response.data
  },

  // Alias used by AdminDashboard
  getAll: async () => {
    const response = await api.get('/jobs/all/')
    return response.data
  },
}

export default jobsApi