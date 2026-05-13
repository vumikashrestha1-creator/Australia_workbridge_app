from django.db import models
from users.models import User


class Job(models.Model):

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('draft',  'Draft'),
    ]

    CATEGORY_CHOICES = [
        ('technology',   'Technology'),
        ('hospitality',  'Hospitality'),
        ('retail',       'Retail'),
        ('education',    'Education'),
        ('healthcare',   'Healthcare'),
        ('admin',        'Admin & Office'),
        ('finance',      'Finance'),
        ('other',        'Other'),
    ]

    # Who posted this job
    employer        = models.ForeignKey(
                        User,
                        on_delete=models.CASCADE,
                        related_name='jobs'
                      )

    # Job details
    title           = models.CharField(max_length=150)
    description     = models.TextField()
    category        = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    location        = models.CharField(max_length=100)
    salary_range    = models.CharField(max_length=50, blank=True, null=True)
    hours_per_week  = models.IntegerField()
    job_type        = models.CharField(max_length=50, default='part-time')

    # Visa friendliness — WorkBridge unique feature
    visa_sponsored  = models.BooleanField(default=False)

    # Status and dates
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    deadline        = models.DateField(blank=True, null=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']  # newest first

    def __str__(self):
        return f'{self.title} — {self.employer.company_name}'