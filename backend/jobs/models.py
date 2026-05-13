# =============================================================
# jobs/models.py
# PURPOSE: Defines the Job database table
# Django reads this file and creates the actual PostgreSQL table
# Every field here becomes a column in the jobs table
# =============================================================

from django.db import models
from users.models import User  # Import our custom User model


class Job(models.Model):
    # ─── CHOICE LISTS ───────────────────────────────────────
    # These restrict what values can be saved in these fields
    # PostgreSQL will reject any value not in this list

    STATUS_CHOICES = [
        ('active', 'Active'),   # Job is visible to students
        ('closed', 'Closed'),   # Job is no longer accepting applications
        ('draft',  'Draft'),    # Employer saved but not published yet
    ]

    CATEGORY_CHOICES = [
        ('technology',  'Technology'),
        ('hospitality', 'Hospitality'),
        ('retail',      'Retail'),
        ('education',   'Education'),
        ('healthcare',  'Healthcare'),
        ('admin',       'Admin & Office'),
        ('finance',     'Finance'),
        ('other',       'Other'),
    ]

    JOB_TYPE_CHOICES = [
        ('part-time',  'Part-time'),
        ('casual',     'Casual'),
        ('internship', 'Internship'),
        ('full-time',  'Full-time'),
    ]

    # ─── RELATIONSHIPS ───────────────────────────────────────
    # ForeignKey means: one employer can have MANY jobs
    # on_delete=CASCADE means: if employer is deleted, their jobs are deleted too
    # related_name='jobs' means: from a user object we can do user.jobs.all()
    employer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='jobs'
    )

    # ─── JOB DETAILS ────────────────────────────────────────
    # These are the main fields students see on a job listing

    title          = models.CharField(max_length=150)
    # CharField = short text with a max length limit

    description    = models.TextField()
    # TextField = long text with no length limit (for job descriptions)

    category       = models.CharField(
                        max_length=50,
                        choices=CATEGORY_CHOICES,
                        default='other'
                     )

    location       = models.CharField(max_length=100)
    # e.g. "Sydney, NSW" or "Melbourne, VIC"

    salary_range   = models.CharField(max_length=50, blank=True, null=True)
    # blank=True = optional in forms
    # null=True  = can be NULL in database
    # e.g. "$28-32/hr"

    hours_per_week = models.IntegerField(default=20)
    # Important for student visa 48hr/fortnight limit

    job_type       = models.CharField(
                        max_length=50,
                        choices=JOB_TYPE_CHOICES,
                        default='part-time'
                     )

    # ─── WORKBRIDGE UNIQUE FEATURE ──────────────────────────
    # This is what makes WorkBridge different from Seek/Indeed
    # Students filter by this to find jobs they are eligible for
    visa_sponsored = models.BooleanField(default=False)
    # True  = employer accepts international students
    # False = employer does not sponsor visas

    # ─── STATUS AND DATES ───────────────────────────────────
    status     = models.CharField(
                    max_length=20,
                    choices=STATUS_CHOICES,
                    default='active'
                 )

    deadline   = models.DateField(blank=True, null=True)
    # Application deadline date

    created_at = models.DateTimeField(auto_now_add=True)
    # auto_now_add=True = automatically set when job is created

    updated_at = models.DateTimeField(auto_now=True)
    # auto_now=True = automatically updated every time job is saved

    # ─── META AND STRING REPRESENTATION ─────────────────────
    class Meta:
        ordering = ['-created_at']
        # Minus sign = descending order (newest jobs first)

    def __str__(self):
        # What shows in Django admin panel for each job
        employer_name = self.employer.company_name or self.employer.full_name
        return f'{self.title} — {employer_name}'