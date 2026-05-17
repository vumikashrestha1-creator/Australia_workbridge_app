# =============================================================
# users/serializers.py
# PURPOSE: Convert User objects to/from JSON
# Validates registration, login, profile updates
# =============================================================

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    """Used when a new user signs up."""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model  = User
        fields = [
            'email', 'full_name', 'password', 'password2',
            'role', 'visa_type', 'university',
            'company_name', 'abn',
        ]

    def validate(self, attrs):
        # Make sure both passwords match
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {'password': 'Passwords do not match'}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)  # bcrypt hash
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """Used to validate login credentials."""
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.ModelSerializer):
    """
    Used to display + update user profile.
    Includes resume URL — frontend uses this to show
    uploaded file in profile page.
    """
    class Meta:
        model  = User
        fields = [
            'id', 'email', 'full_name', 'role',
            'visa_type', 'university',
            'company_name', 'abn',
            'resume',         # NEW — resume file URL
            'is_active', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']