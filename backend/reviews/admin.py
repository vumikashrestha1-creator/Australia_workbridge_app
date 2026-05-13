# =============================================================
# reviews/admin.py
# PURPOSE: Register Review model with Django admin panel
# Admin can view and delete reviews at /admin/
# =============================================================

from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    # Columns in admin list view
    list_display  = (
        'student',
        'job',
        'rating',
        'created_at'
    )

    # Filter sidebar
    list_filter   = ('rating',)

    # Search box
    search_fields = (
        'student__full_name',
        'job__title',
        'comment'
    )

    # Default ordering — newest first
    ordering      = ('-created_at',)