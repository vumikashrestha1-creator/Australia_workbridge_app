from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    MeView,
    AdminUserListView,
    AdminUserDetailView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(),            name='register'),
    path('login/',    LoginView.as_view(),               name='login'),
    path('logout/',   LogoutView.as_view(),              name='logout'),
    path('me/',       MeView.as_view(),                  name='me'),
    path('users/',    AdminUserListView.as_view(),       name='user-list'),
    path('users/<int:pk>/', AdminUserDetailView.as_view(), name='user-detail'),
]