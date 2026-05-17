# =============================================================
# workbridge/urls.py
# Master URL router
# Also serves uploaded files in development mode
# =============================================================

from django.contrib            import admin
from django.urls               import path, include
from django.conf               import settings
from django.conf.urls.static   import static

urlpatterns = [
    path('admin/',            admin.site.urls),
    path('api/auth/',         include('users.urls')),
    path('api/jobs/',         include('jobs.urls')),
    path('api/applications/', include('applications.urls')),
    path('api/reviews/',      include('reviews.urls')),
]

# Serve uploaded files (resumes, cover letters) in development
# In production we'd use a cloud storage service instead
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)