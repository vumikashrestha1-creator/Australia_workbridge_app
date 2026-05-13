# =============================================================
# reviews/models.py
# PURPOSE: Defines the Review database table
# Students leave reviews for employers after applying
# This is WorkBridge's unique trust feature —
# other job platforms like Seek don't have this
#
# RELATIONSHIPS:
#   One student can review many employers
#   One job can have many reviews
#   One student can only review one job ONCE (unique_together)
# =============================================================

from django.db import models
from users.models import User
from jobs.models import Job


class Review(models.Model):

    # ─── RATING CHOICES ─────────────────────────────────────
    # Star rating from 1 to 5
    RATING_CHOICES = [
        (1, '1 Star  — Very Poor'),
        (2, '2 Stars — Poor'),
        (3, '3 Stars — Average'),
        (4, '4 Stars — Good'),
        (5, '5 Stars — Excellent'),
    ]

    # ─── RELATIONSHIPS ───────────────────────────────────────
    # Which student wrote this review
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reviews'
        # student.reviews.all() = all reviews by this student
    )

    # Which job/employer is being reviewed
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='reviews'
        # job.reviews.all() = all reviews for this job
    )

    # ─── REVIEW CONTENT ──────────────────────────────────────
    rating = models.IntegerField(choices=RATING_CHOICES)
    # 1 to 5 stars

    comment = models.TextField(blank=True, null=True)
    # Optional written review

    # ─── TIMESTAMP ───────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)

    # ─── CONSTRAINTS ─────────────────────────────────────────
    class Meta:
        ordering = ['-created_at']
        # newest reviews first

        unique_together = ['student', 'job']
        # One student can only leave one review per job
        # Prevents spam reviews

    def __str__(self):
        return f'{self.student.full_name} → {self.job.title} ({self.rating}★)'