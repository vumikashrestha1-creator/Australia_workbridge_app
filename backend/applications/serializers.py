# =============================================================
# applications/serializers.py
# PURPOSE: Convert Application objects to/from JSON
# Includes file fields for resume + cover letter
# =============================================================

from rest_framework import serializers
from .models import Application
from users.serializers import UserSerializer
from jobs.serializers import JobSerializer


class ApplicationSerializer(serializers.ModelSerializer):
    """Full data for reading applications — used by both
    student dashboard and employer applicant view."""

    student_details = UserSerializer(source='student', read_only=True)
    job_details     = JobSerializer(source='job', read_only=True)

    class Meta:
        model  = Application
        fields = [
            'id',
            'student',
            'student_details',
            'job',
            'job_details',
            'cover_note',
            'resume',          # file URL
            'cover_letter',    # file URL
            'status',
            'interview_date',
            'interview_notes',
            'applied_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'student', 'applied_at', 'updated_at']


class ApplicationCreateSerializer(serializers.ModelSerializer):
    """Used when student submits a new application."""

    class Meta:
        model  = Application
        fields = ['job', 'cover_note', 'resume', 'cover_letter']

    def validate(self, attrs):
        request = self.context['request']
        student = request.user
        job     = attrs['job']

        # Employer cannot apply to their own job
        if job.employer == student:
            raise serializers.ValidationError(
                'Employers cannot apply to their own jobs'
            )

        # Prevent duplicate applications
        if Application.objects.filter(student=student, job=job).exists():
            raise serializers.ValidationError(
                'You have already applied for this job'
            )

        return attrs

    def create(self, validated_data):
        request = self.context['request']
        application = Application.objects.create(
            student=request.user,
            **validated_data
        )
        return application


class ApplicationStatusSerializer(serializers.ModelSerializer):
    """Used by employer to update status and/or schedule interview."""

    class Meta:
        model  = Application
        fields = ['status', 'interview_date', 'interview_notes']
        extra_kwargs = {
            'interview_date':  {'required': False, 'allow_null': True},
            'interview_notes': {'required': False, 'allow_null': True, 'allow_blank': True},
        }