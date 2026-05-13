# =============================================================
# applications/urls.py
# PURPOSE: Maps URL patterns to application views
# All URLs prefixed with /api/applications/
# =============================================================

from django.urls import path
from .views import (
    StudentApplicationListView,
    ApplicationDetailView,
    ApplicationStatusUpdateView,
    JobApplicationListView,
    AdminApplicationListView,
)

urlpatterns = [
    # ── STUDENT ENDPOINTS ────────────────────────────────────
    path('',
         StudentApplicationListView.as_view(),
         name='application-list'),
    # GET  /api/applications/ — student sees their applications
    # POST /api/applications/ — student submits an application

    path('<int:pk>/',
         ApplicationDetailView.as_view(),
         name='application-detail'),
    # GET /api/applications/1/ — full details of one application

    # ── EMPLOYER ENDPOINTS ───────────────────────────────────
    path('<int:pk>/status/',
         ApplicationStatusUpdateView.as_view(),
         name='application-status'),
    # PUT /api/applications/1/status/ — update application status

    path('job/<int:job_id>/',
         JobApplicationListView.as_view(),
         name='job-applications'),
    # GET /api/applications/job/1/ — all applicants for job id=1

    # ── ADMIN ENDPOINTS ──────────────────────────────────────
    path('all/',
         AdminApplicationListView.as_view(),
         name='all-applications'),
    # GET /api/applications/all/ — admin sees everything
]