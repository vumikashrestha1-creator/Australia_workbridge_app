# =============================================================
# applications/serializers.py
# PURPOSE: Converts Application objects to JSON
# Two serializers:
#   ApplicationSerializer       — full data for responses
#   ApplicationCreateSerializer — for creating new applications
#   ApplicationStatusSerializer — for employer updating status
# =============================================================

from rest_framework import serializers
from .models import Application
from users.serializers import UserSerializer
from jobs.serializers import JobSerializer


class ApplicationSerializer(serializers.ModelSerializer):
    # ─── NESTED DATA ────────────────────────────────────────
    # Include full student and job details in response
    # so frontend doesn't need to make extra API calls

    student_details = UserSerializer(
        source='student',
        read_only=True
    )
    # Returns full student profile in response

    job_details = JobSerializer(
        source='job',
        read_only=True
    )
    # Returns full job details in response

    class Meta:
        model  = Application
        fields = [
            'id',
            'student',          # student ID
            'student_details',  # full student object
            'job',              # job ID
            'job_details',      # full job object
            'cover_note',
            'status',
            'applied_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'student',
            'applied_at',
            'updated_at'
        ]


class ApplicationCreateSerializer(serializers.ModelSerializer):
    # ─── USED WHEN STUDENT APPLIES FOR A JOB ────────────────
    # Student only sends job ID and optional cover note
    # student is set automatically from JWT token in views.py

    class Meta:
        model  = Application
        fields = ['job', 'cover_note']

    def validate(self, attrs):
        # Get the logged in student from request context
        request = self.context['request']
        student = request.user
        job     = attrs['job']

        # Check student is not applying to their own job
        if job.employer == student:
            raise serializers.ValidationError(
                'Employers cannot apply to their own jobs'
            )

        # Check student has not already applied to this job
        if Application.objects.filter(student=student, job=job).exists():
            raise serializers.ValidationError(
                'You have already applied for this job'
            )

        return attrs

    def create(self, validated_data):
        # Automatically set student from logged in user
        request = self.context['request']
        application = Application.objects.create(
            student=request.user,
            **validated_data
        )
        return application


class ApplicationStatusSerializer(serializers.ModelSerializer):
    # ─── USED WHEN EMPLOYER UPDATES APPLICATION STATUS ──────
    # Employer can only change the status field
    # They cannot change anything else

    class Meta:
        model  = Application
        fields = ['status']
        # Only status can be updated by employer