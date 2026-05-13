# =============================================================
# jobs/urls.py
# PURPOSE: Maps URL patterns to view classes
# Think of this as a menu — each URL is a dish,
# each view is the kitchen that prepares it
#
# All these URLs are prefixed with /api/jobs/
# because of how we included them in workbridge/urls.py
# =============================================================

from django.urls import path
from .views import (
    JobListView,
    JobCreateView,
    JobDetailView,
    JobUpdateView,
    EmployerJobListView,
    AdminJobListView,
)

urlpatterns = [
    # ── PUBLIC ENDPOINTS (no login required) ─────────────────
    path('',
         JobListView.as_view(),
         name='job-list'),
    # GET /api/jobs/ — browse all active jobs with filters

    path('<int:pk>/',
         JobDetailView.as_view(),
         name='job-detail'),
    # GET /api/jobs/1/ — get details of job with id=1

    # ── EMPLOYER ENDPOINTS (login + employer role required) ───
    path('create/',
         JobCreateView.as_view(),
         name='job-create'),
    # POST /api/jobs/create/ — post a new job listing

    path('<int:pk>/edit/',
         JobUpdateView.as_view(),
         name='job-update'),
    # PUT    /api/jobs/1/edit/ — update job with id=1
    # DELETE /api/jobs/1/edit/ — delete job with id=1

    path('my-jobs/',
         EmployerJobListView.as_view(),
         name='my-jobs'),
    # GET /api/jobs/my-jobs/ — employer sees their own listings

    # ── ADMIN ENDPOINTS (admin role required) ─────────────────
    path('all/',
         AdminJobListView.as_view(),
         name='all-jobs'),
    # GET /api/jobs/all/ — admin sees every job in the system
]