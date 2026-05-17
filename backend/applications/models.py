# =============================================================
# applications/models.py
# PURPOSE: Application model with per-application resume + cover letter
# =============================================================

from django.db import models
from users.models import User
from jobs.models import Job


class Application(models.Model):

    STATUS_CHOICES = [
        ('pending',     'Pending'),
        ('shortlisted', 'Shortlisted'),
        ('interview',   'Interview'),
        ('offered',     'Offered'),
        ('rejected',    'Rejected'),
    ]

    # Relationships
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='applications'
    )

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='applications'
    )

    # Application content
    cover_note = models.TextField(blank=True, null=True)

    # File uploads (per application)
    resume = models.FileField(
        upload_to='resumes/',
        blank=True,
        null=True,
    )

    cover_letter = models.FileField(
        upload_to='cover_letters/',
        blank=True,
        null=True,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    # Interview scheduling
    interview_date  = models.DateTimeField(blank=True, null=True)
    interview_notes = models.TextField(blank=True, null=True)

    # Timestamps
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering        = ['-applied_at']
        unique_together = ['student', 'job']

    def __str__(self):
        return f'{self.student.full_name} -> {self.job.title} ({self.status})'