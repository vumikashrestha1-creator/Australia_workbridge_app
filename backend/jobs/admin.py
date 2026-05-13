# =============================================================
# jobs/admin.py
# PURPOSE: Registers Job model with Django admin panel
# This makes jobs visible and manageable at /admin/
# =============================================================

from django.contrib import admin
from .models import Job


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    # Columns shown in the jobs list in admin panel
    list_display  = (
        'title',
        'employer',
        'category',
        'location',
        'visa_sponsored',  # shows True/False
        'status',
        'hours_per_week',
        'created_at'
    )

    # Filter sidebar on the right in admin panel
    list_filter   = ('status', 'category', 'visa_sponsored', 'job_type')

    # Search box at the top of admin panel
    search_fields = ('title', 'description', 'location')

    # Default ordering in admin panel (newest first)
    ordering      = ('-created_at',)