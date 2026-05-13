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
    # Public
    path('',              JobListView.as_view(),         name='job-list'),
    path('<int:pk>/',     JobDetailView.as_view(),       name='job-detail'),
    # Employer
    path('create/',       JobCreateView.as_view(),       name='job-create'),
    path('<int:pk>/edit/', JobUpdateView.as_view(),      name='job-update'),
    path('my-jobs/',      EmployerJobListView.as_view(), name='my-jobs'),
    # Admin
    path('all/',          AdminJobListView.as_view(),    name='all-jobs'),
]