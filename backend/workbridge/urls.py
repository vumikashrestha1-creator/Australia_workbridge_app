# =============================================================
# workbridge/urls.py
# PURPOSE: Master URL router for entire WorkBridge backend
# All API requests come here first then get routed
# to the correct app based on URL prefix
#
# FULL API STRUCTURE:
#   /admin/              — Django admin panel
#   /api/auth/           — register, login, logout, profile
#   /api/jobs/           — job listings CRUD + filters
#   /api/applications/   — apply, track, update status
#   /api/reviews/        — employer reviews and ratings
# =============================================================

from django.contrib import admin
from django.urls    import path, include

urlpatterns = [
    # Django built-in admin panel
    path('admin/', admin.site.urls),

    # Users app — authentication and user management
    path('api/auth/', include('users.urls')),

    # Jobs app — job listings with visa filter
    path('api/jobs/', include('jobs.urls')),

    # Applications app — apply and track pipeline
    path('api/applications/', include('applications.urls')),

    # Reviews app — employer trust ratings
    path('api/reviews/', include('reviews.urls')),
]