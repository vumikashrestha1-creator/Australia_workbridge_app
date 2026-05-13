# =============================================================
# reviews/urls.py
# PURPOSE: Maps URL patterns to review views
# All URLs prefixed with /api/reviews/
# =============================================================

from django.urls import path
from .views import (
    JobReviewListView,
    ReviewCreateView,
    ReviewDeleteView,
    EmployerReviewSummaryView,
    AdminReviewListView,
)

urlpatterns = [
    # ── PUBLIC ENDPOINTS ─────────────────────────────────────
    path('job/<int:job_id>/',
         JobReviewListView.as_view(),
         name='job-reviews'),
    # GET /api/reviews/job/1/ — all reviews for job id=1

    path('employer/<int:employer_id>/',
         EmployerReviewSummaryView.as_view(),
         name='employer-reviews'),
    # GET /api/reviews/employer/2/ — employer profile reviews

    # ── STUDENT ENDPOINTS ────────────────────────────────────
    path('',
         ReviewCreateView.as_view(),
         name='review-create'),
    # POST /api/reviews/ — student creates a review

    # ── ADMIN ENDPOINTS ──────────────────────────────────────
    path('<int:pk>/',
         ReviewDeleteView.as_view(),
         name='review-delete'),
    # DELETE /api/reviews/1/ — admin deletes review id=1

    path('all/',
         AdminReviewListView.as_view(),
         name='all-reviews'),
    # GET /api/reviews/all/ — admin sees all reviews
]