# =============================================================
# applications/models.py
# PURPOSE: Defines the Application database table
# An application is created when a student applies for a job
# Tracks the status of each application through its lifecycle
#
# RELATIONSHIPS:
#   One student can have MANY applications
#   One job can have MANY applications
#   One student can only apply to one job ONCE (unique_together)
# =============================================================

from django.db import models
from users.models import User
from jobs.models import Job


class Application(models.Model):

    # ─── STATUS LIFECYCLE ───────────────────────────────────
    # This is the application pipeline shown in student dashboard
    # pending → shortlisted → interview → offered OR rejected
    STATUS_CHOICES = [
        ('pending',     'Pending'),      # just applied, employer hasn't reviewed
        ('shortlisted', 'Shortlisted'),  # employer liked the application
        ('interview',   'Interview'),    # employer wants to interview
        ('offered',     'Offered'),      # student got the job
        ('rejected',    'Rejected'),     # employer rejected the application
    ]

    # ─── RELATIONSHIPS ───────────────────────────────────────
    # Which student applied
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,   # delete applications if student deleted
        related_name='applications' # student.applications.all()
    )

    # Which job they applied for
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,   # delete applications if job deleted
        related_name='applications' # job.applications.all()
    )

    # ─── APPLICATION DETAILS ────────────────────────────────
    cover_note = models.TextField(blank=True, null=True)
    # Optional message from student to employer

    # ─── INTERVIEW SCHEDULING ────────────────────────────────
    interview_date = models.DateTimeField(blank=True, null=True)
    # When the interview is scheduled — set by employer
    interview_notes = models.TextField(blank=True, null=True)
    # Optional: meeting link, instructions, location

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
        # Always starts as pending when student applies
    )

    # ─── TIMESTAMPS ─────────────────────────────────────────
    applied_at = models.DateTimeField(auto_now_add=True)
    # When student submitted the application

    updated_at = models.DateTimeField(auto_now=True)
    # When employer last updated the status

    # ─── CONSTRAINTS ────────────────────────────────────────
    class Meta:
        ordering = ['-applied_at']
        # newest applications first

        unique_together = ['student', 'job']
        # Prevents a student from applying to the same job twice
        # Django will return an error if they try

    def __str__(self):
        return f'{self.student.full_name} → {self.job.title} ({self.status})'