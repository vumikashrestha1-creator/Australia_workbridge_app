# =============================================================
# reviews/serializers.py
# PURPOSE: Converts Review objects to JSON and validates input
#
# Two serializers:
#   ReviewSerializer       — full data for responses
#   ReviewCreateSerializer — for creating new reviews
# =============================================================

from rest_framework import serializers
from .models import Review
from users.serializers import UserSerializer


class ReviewSerializer(serializers.ModelSerializer):
    # ─── NESTED DATA ─────────────────────────────────────────
    # Include student details so frontend can show
    # reviewer name and visa type in review cards

    student_details = UserSerializer(
        source='student',
        read_only=True
    )

    class Meta:
        model  = Review
        fields = [
            'id',
            'student',          # student ID
            'student_details',  # full student object
            'job',              # job ID
            'rating',           # 1 to 5
            'comment',          # written review
            'created_at',
        ]
        read_only_fields = ['id', 'student', 'created_at']


class ReviewCreateSerializer(serializers.ModelSerializer):
    # ─── USED WHEN STUDENT CREATES A REVIEW ─────────────────
    # Student sends job ID, rating, and optional comment
    # student is set automatically from JWT token

    class Meta:
        model  = Review
        fields = ['job', 'rating', 'comment']

    def validate_rating(self, value):
        # Make sure rating is between 1 and 5
        if value < 1 or value > 5:
            raise serializers.ValidationError(
                'Rating must be between 1 and 5'
            )
        return value

    def validate(self, attrs):
        request = self.context['request']
        student = request.user
        job     = attrs['job']

        # Check student has not already reviewed this job
        if Review.objects.filter(student=student, job=job).exists():
            raise serializers.ValidationError(
                'You have already reviewed this employer'
            )

        # Check student actually applied for this job
        from applications.models import Application
        if not Application.objects.filter(
            student=student,
            job=job
        ).exists():
            raise serializers.ValidationError(
                'You can only review employers you have applied to'
            )

        return attrs

    def create(self, validated_data):
        # Automatically set student from logged in user
        request = self.context['request']
        review  = Review.objects.create(
            student=request.user,
            **validated_data
        )
        return review