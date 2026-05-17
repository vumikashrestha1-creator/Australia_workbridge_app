// =============================================================
// api/applicationsApi.js
// PURPOSE: All application-related API calls
// =============================================================

import api from './axios'

const applicationsApi = {

  // ─── STUDENT — LIST MY APPLICATIONS ────────────────────
  // GET /api/applications/
  myApplications: async () => {
    const response = await api.get('/applications/')
    return response.data
  },

  // ─── STUDENT — APPLY FOR A JOB ────────────────────────
  // POST /api/applications/
  apply: async (jobId, coverNote) => {
    const response = await api.post('/applications/', {
      job: jobId,
      cover_note: coverNote,
    })
    return response.data
  },

  // ─── GET ONE APPLICATION ──────────────────────────────
  // GET /api/applications/<id>/
  getById: async (id) => {
    const response = await api.get(`/applications/${id}/`)
    return response.data
  },

  // ─── EMPLOYER — UPDATE STATUS ─────────────────────────
  // PUT /api/applications/<id>/status/
  // payload can include: { status, interview_date, interview_notes }
  updateStatus: async (id, status) => {
    const response = await api.put(`/applications/${id}/status/`, payload)
    return response.data
      },

  // ─── EMPLOYER — APPLICANTS FOR A JOB ──────────────────
  // GET /api/applications/job/<jobId>/
  byJob: async (jobId) => {
    const response = await api.get(`/applications/job/${jobId}/`)
    return response.data
  },
}

export default applicationsApi