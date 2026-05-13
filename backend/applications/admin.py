# =============================================================
# applications/admin.py
# PURPOSE: Register Application model in Django admin panel
# Allows admin to view and manage all applications at /admin/
# =============================================================

from django.contrib import admin
from .models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    # Columns shown in applications list
    list_display  = (
        'student',
        'job',
        'status',
        'applied_at',
        'updated_at'
    )

    # Filter sidebar
    list_filter   = ('status',)

    # Search box
    search_fields = (
        'student__full_name',
        'student__email',
        'job__title'
    )

    # Default ordering — newest first
    ordering      = ('-applied_at',)