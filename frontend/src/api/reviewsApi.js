// =============================================================
// api/reviewsApi.js
// PURPOSE: All review-related API calls
// =============================================================

import api from './axios'

const reviewsApi = {

  // ─── GET REVIEWS FOR A JOB ────────────────────────────
  // GET /api/reviews/job/<jobId>/
  // Returns: { average_rating, total_reviews, reviews: [...] }
  byJob: async (jobId) => {
    const response = await api.get(`/reviews/job/${jobId}/`)
    return response.data
  },

  // ─── GET EMPLOYER SUMMARY ─────────────────────────────
  // GET /api/reviews/employer/<employerId>/
  byEmployer: async (employerId) => {
    const response = await api.get(`/reviews/employer/${employerId}/`)
    return response.data
  },

  // ─── CREATE REVIEW ────────────────────────────────────
  // POST /api/reviews/
  create: async (jobId, rating, comment) => {
    const response = await api.post('/reviews/', {
      job: jobId,
      rating,
      comment,
    })
    return response.data
  },
}

export default reviewsApi