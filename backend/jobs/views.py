# =============================================================
# jobs/views.py
# PURPOSE: Handles all API logic for job listings
# Think of views as waiters — they take requests,
# go to the database, and return JSON responses
#
# ENDPOINTS HANDLED HERE:
#   GET    /api/jobs/           — list all active jobs (public)
#   POST   /api/jobs/create/    — create a job (employer only)
#   GET    /api/jobs/<id>/      — get one job (public)
#   PUT    /api/jobs/<id>/edit/ — update a job (owner/admin)
#   DELETE /api/jobs/<id>/edit/ — delete a job (owner/admin)
#   GET    /api/jobs/my-jobs/   — employer's own jobs
#   GET    /api/jobs/all/       — all jobs for admin
# =============================================================

from django.db.models        import Q
from django.shortcuts        import get_object_or_404
from rest_framework          import status, permissions
from rest_framework.views    import APIView
from rest_framework.response import Response
from .models                 import Job
from .serializers            import JobSerializer, JobCreateSerializer


# ─── CUSTOM PERMISSION CLASSES ──────────────────────────────
# These control WHO can access each endpoint

class IsEmployerOrAdmin(permissions.BasePermission):
    """
    Custom permission — only employers and admins can post jobs.
    Students cannot create job listings.
    """
    def has_permission(self, request, view):
        # Check user is logged in AND has correct role
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['employer', 'admin']


class IsJobOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission — only the employer who posted the job
    OR an admin can edit or delete it.
    """
    def has_object_permission(self, request, view, obj):
        # obj = the Job instance being accessed
        return (
            obj.employer == request.user or
            request.user.role == 'admin'
        )


# ─── VIEWS ──────────────────────────────────────────────────

class JobListView(APIView):
    """
    GET /api/jobs/
    Public endpoint — no login required.
    Returns all active jobs.
    Supports filters via URL query parameters:
      ?visa_sponsored=true
      ?category=technology
      ?location=Sydney
      ?max_hours=24
      ?search=developer
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Start with all active jobs
        jobs = Job.objects.filter(status='active')

        # ── FILTERS ──────────────────────────────────────────
        # Get filter values from URL query params
        # e.g. /api/jobs/?visa_sponsored=true&location=Sydney

        visa     = request.query_params.get('visa_sponsored')
        category = request.query_params.get('category')
        location = request.query_params.get('location')
        hours    = request.query_params.get('max_hours')
        search   = request.query_params.get('search')

        # Filter by visa sponsorship (WorkBridge unique feature)
        if visa == 'true':
            jobs = jobs.filter(visa_sponsored=True)

        # Filter by job category
        if category:
            jobs = jobs.filter(category=category)

        # Filter by location (case insensitive partial match)
        # icontains = case insensitive LIKE '%location%'
        if location:
            jobs = jobs.filter(location__icontains=location)

        # Filter by maximum hours per week
        # lte = less than or equal to
        if hours:
            try:
                jobs = jobs.filter(hours_per_week__lte=int(hours))
            except ValueError:
                pass  # ignore invalid hour values

        # Search across title, description, and location
        # Q objects allow OR conditions in Django queries
        if search:
            jobs = jobs.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(location__icontains=search)
            )

        # Serialize queryset to JSON and return
        serializer = JobSerializer(jobs, many=True)
        # many=True = serialize a list of objects, not just one
        return Response(serializer.data, status=status.HTTP_200_OK)


class JobCreateView(APIView):
    """
    POST /api/jobs/create/
    Employer or Admin only.
    Creates a new job listing.
    Employer is automatically set from the JWT token.
    """
    permission_classes = [permissions.IsAuthenticated, IsEmployerOrAdmin]

    def post(self, request):
        # Pass request in context so serializer can access request.user
        serializer = JobCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            job = serializer.save()
            # Return full job data using JobSerializer
            return Response(
                JobSerializer(job).data,
                status=status.HTTP_201_CREATED
            )
        # Return validation errors if data is invalid
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class JobDetailView(APIView):
    """
    GET /api/jobs/<id>/
    Public endpoint — no login required.
    Returns full details of one job including employer info.
    get_object_or_404 = return job if exists, else return 404 error
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        # pk = primary key = job ID from URL
        job        = get_object_or_404(Job, pk=pk)
        serializer = JobSerializer(job)
        return Response(serializer.data, status=status.HTTP_200_OK)


class JobUpdateView(APIView):
    """
    PUT    /api/jobs/<id>/edit/ — update job fields
    DELETE /api/jobs/<id>/edit/ — delete the job
    Only the employer who created it or admin can do this.
    """
    permission_classes = [permissions.IsAuthenticated, IsJobOwnerOrAdmin]

    def put(self, request, pk):
        job = get_object_or_404(Job, pk=pk)
        # Check object-level permission (is this their job?)
        self.check_object_permissions(request, job)

        serializer = JobCreateSerializer(
            job,
            data=request.data,
            partial=True,           # partial=True = only update sent fields
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            # Return updated job data
            return Response(
                JobSerializer(job).data,
                status=status.HTTP_200_OK
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        job = get_object_or_404(Job, pk=pk)
        self.check_object_permissions(request, job)
        job.delete()
        return Response(
            {'message': 'Job deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
            # 204 = success but no content to return
        )


class EmployerJobListView(APIView):
    """
    GET /api/jobs/my-jobs/
    Employer only — returns only THIS employer's job listings.
    Used in the employer dashboard to show their own jobs.
    """
    permission_classes = [permissions.IsAuthenticated, IsEmployerOrAdmin]

    def get(self, request):
        # Filter jobs by the logged in employer
        jobs       = Job.objects.filter(employer=request.user)
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminJobListView(APIView):
    """
    GET /api/jobs/all/
    Admin only — returns ALL jobs regardless of status.
    Used in admin dashboard to moderate listings.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        jobs       = Job.objects.all()
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)