// =============================================================
// api/applicationsApi.js
// PURPOSE: All application-related API calls
// apply() sends resume + cover letter as multipart form data
// =============================================================

import api from './axios'

const applicationsApi = {

  // ─── STUDENT — MY APPLICATIONS ─────────────────────────
  myApplications: async () => {
    const response = await api.get('/applications/')
    return response.data
  },

  // ─── STUDENT — APPLY FOR A JOB ────────────────────────
  // payload = { jobId, coverNote, resumeFile, coverLetterFile }
  apply: async ({ jobId, coverNote, resumeFile, coverLetterFile }) => {
    const hasFiles = resumeFile || coverLetterFile

    if (hasFiles) {
      const formData = new FormData()
      formData.append('job', jobId)
      formData.append('cover_note', coverNote || '')
      if (resumeFile)      formData.append('resume', resumeFile)
      if (coverLetterFile) formData.append('cover_letter', coverLetterFile)

      const response = await api.post('/applications/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    }

    const response = await api.post('/applications/', {
      job: jobId,
      cover_note: coverNote,
    })
    return response.data
  },

  // ─── GET ONE APPLICATION ──────────────────────────────
  getById: async (id) => {
    const response = await api.get(`/applications/${id}/`)
    return response.data
  },

  // ─── EMPLOYER — UPDATE STATUS / INTERVIEW ─────────────
  updateStatus: async (id, payload) => {
    const response = await api.put(`/applications/${id}/status/`, payload)
    return response.data
  },

  // ─── EMPLOYER — APPLICANTS FOR A JOB ──────────────────
  byJob: async (jobId) => {
    const response = await api.get(`/applications/job/${jobId}/`)
    return response.data
  },

  // ─── STUDENT — WITHDRAW APPLICATION ──────────────────
  // DELETE /api/applications/<id>/withdraw/
  // Only works if status is still 'pending'
  withdraw: async (id) => {
    const response = await api.delete(`/applications/${id}/withdraw/`)
    return response.data
  },
}

export default applicationsApi