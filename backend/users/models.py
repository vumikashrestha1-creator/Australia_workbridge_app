from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # bcrypt hashing happens here
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):

    ROLE_CHOICES = [
        ('student', 'Student'),
        ('employer', 'Employer'),
        ('admin', 'Admin'),
    ]

    VISA_CHOICES = [
        ('500', 'Student Visa 500'),
        ('485', 'Graduate Visa 485'),
        ('417', 'Working Holiday 417'),
        ('pr', 'Permanent Resident'),
        ('other', 'Other'),
    ]

    # Core fields
    email           = models.EmailField(unique=True)
    full_name       = models.CharField(max_length=100)
    role            = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')

    # Student-only fields
    visa_type       = models.CharField(max_length=10, choices=VISA_CHOICES, blank=True, null=True)
    university      = models.CharField(max_length=100, blank=True, null=True)

    # Employer-only fields
    company_name    = models.CharField(max_length=100, blank=True, null=True)
    abn             = models.CharField(max_length=20, blank=True, null=True)

    # System fields
    is_active       = models.BooleanField(default=True)
    is_staff        = models.BooleanField(default=False)
    created_at      = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'       # login with email not username
    REQUIRED_FIELDS = ['full_name']

    def __str__(self):
        return f'{self.email} ({self.role})'