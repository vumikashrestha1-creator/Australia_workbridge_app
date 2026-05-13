from rest_framework import serializers
from .models import Job
from users.serializers import UserSerializer


class JobSerializer(serializers.ModelSerializer):
    # Show employer details in response
    employer_details = UserSerializer(source='employer', read_only=True)
    # Count applications for this job
    application_count = serializers.SerializerMethodField()

    class Meta:
        model  = Job
        fields = [
            'id', 'title', 'description', 'category',
            'location', 'salary_range', 'hours_per_week',
            'job_type', 'visa_sponsored', 'status',
            'deadline', 'created_at', 'updated_at',
            'employer', 'employer_details',
            'application_count',
        ]
        read_only_fields = ['id', 'employer', 'created_at', 'updated_at']

    def get_application_count(self, obj):
        return obj.applications.count()


class JobCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Job
        fields = [
            'title', 'description', 'category',
            'location', 'salary_range', 'hours_per_week',
            'job_type', 'visa_sponsored', 'status', 'deadline',
        ]

    def create(self, validated_data):
        # Automatically set employer to logged in user
        request = self.context['request']
        job = Job.objects.create(
            employer=request.user,
            **validated_data
        )
        return job