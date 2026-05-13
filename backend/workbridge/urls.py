# =============================================================
# workbridge/urls.py
# PURPOSE: Main URL router — connects all app URLs together
# Every request comes here first then gets routed to the
# correct app based on the URL prefix
# =============================================================

from django.contrib import admin
from django.urls    import path, include

urlpatterns = [
    # Django built-in admin panel
    path('admin/', admin.site.urls),

    # Users app — auth, register, login, profile
    path('api/auth/', include('users.urls')),

    # Jobs app — listings, create, update, delete
    path('api/jobs/', include('jobs.urls')),

    # Applications app — apply, track, update status
    path('api/applications/', include('applications.urls')),
]