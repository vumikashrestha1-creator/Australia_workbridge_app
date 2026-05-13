# =============================================================
# jobs/serializers.py
# PURPOSE: Converts Job objects to JSON and validates input
# Think of this as a translator between Python and JSON
# Two serializers:
#   JobSerializer      = for reading/returning job data
#   JobCreateSerializer = for creating/updating jobs
# =============================================================

from rest_framework import serializers
from .models import Job
from users.serializers import UserSerializer


class JobSerializer(serializers.ModelSerializer):
    # ─── READ-ONLY EXTRA FIELDS ─────────────────────────────
    # These fields are NOT in the database directly
    # They are calculated or pulled from related models

    employer_details = UserSerializer(
        source='employer',  # gets the employer User object
        read_only=True      # only shown in responses, not required in requests
    )

    application_count = serializers.SerializerMethodField()
    # SerializerMethodField = calculated field using a method below

    class Meta:
        model  = Job
        # All fields returned when frontend requests job data
        fields = [
            'id',
            'title',
            'description',
            'category',
            'location',
            'salary_range',
            'hours_per_week',
            'job_type',
            'visa_sponsored',   # WorkBridge unique feature
            'status',
            'deadline',
            'created_at',
            'updated_at',
            'employer',          # just the employer ID
            'employer_details',  # full employer object (name, company etc)
            'application_count', # how many students applied
        ]
        read_only_fields = ['id', 'employer', 'created_at', 'updated_at']
        # read_only = these cannot be changed by the frontend

    def get_application_count(self, obj):
        # obj = the Job instance
        # obj.applications = all applications for this job
        # .count() = total number
        return obj.applications.count()


class JobCreateSerializer(serializers.ModelSerializer):
    # ─── USED FOR CREATING AND UPDATING JOBS ────────────────
    # Simpler than JobSerializer — only the fields employer fills in
    # employer field is NOT here because we set it automatically in create()

    class Meta:
        model  = Job
        fields = [
            'title',
            'description',
            'category',
            'location',
            'salary_range',
            'hours_per_week',
            'job_type',
            'visa_sponsored',
            'status',
            'deadline',
        ]

    def create(self, validated_data):
        # validated_data = cleaned data after all validation passed
        # context['request'] = the HTTP request object
        # request.user = the currently logged in employer
        request = self.context['request']
        job = Job.objects.create(
            employer=request.user,  # automatically link job to employer
            **validated_data         # spread all other fields
        )
        return job

    def update(self, instance, validated_data):
        # instance = existing Job object
        # Update only the fields that were sent
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance