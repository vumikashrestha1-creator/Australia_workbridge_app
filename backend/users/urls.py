# =============================================================
# users/urls.py
# =============================================================

from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    MeView,
    UpdateProfileView,
    AdminStatsView,
    AdminUserListView,
    AdminJobDeleteView,
)

urlpatterns = [
    # Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/',    LoginView.as_view(),    name='login'),
    path('logout/',   LogoutView.as_view(),   name='logout'),
    path('me/',       MeView.as_view(),       name='me'),
    path('profile/',  UpdateProfileView.as_view(), name='profile'),

    # Admin
    path('admin/stats/',               AdminStatsView.as_view(),    name='admin-stats'),
    path('admin/users/',               AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:user_id>/', AdminUserListView.as_view(), name='admin-user-delete'),
    path('admin/jobs/<int:job_id>/',   AdminJobDeleteView.as_view(),name='admin-job-delete'),
]