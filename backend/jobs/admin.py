from django.contrib import admin
from .models import Job


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display  = ('title', 'employer', 'category', 'location',
                     'visa_sponsored', 'status', 'created_at')
    list_filter   = ('status', 'category', 'visa_sponsored')
    search_fields = ('title', 'description', 'location')
    ordering      = ('-created_at',)