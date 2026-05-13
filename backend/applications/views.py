# =============================================================
# applications/views.py
# PURPOSE: Handles all API logic for job applications
#
# ENDPOINTS HANDLED HERE:
#   POST /api/applications/        — student applies for a job
#   GET  /api/applications/        — student sees their applications
#   GET  /api/applications/<id>/   — get one application detail
#   PUT  /api/applications/<id>/status/ — employer updates status
#   GET  /api/applications/job/<job_id>/ — employer sees applicants
# =============================================================

from django.shortcuts        import get_object_or_404
from rest_framework          import status, permissions
from rest_framework.views    import APIView
from rest_framework.response import Response
from .models                 import Application
from jobs.models             import Job
from .serializers            import (
    ApplicationSerializer,
    ApplicationCreateSerializer,
    ApplicationStatusSerializer,
)


class IsStudent(permissions.BasePermission):
    """Only students can apply for jobs."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == 'student'


class IsEmployerOrAdmin(permissions.BasePermission):
    """Only employers and admins can update application status."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['employer', 'admin']


class StudentApplicationListView(APIView):
    """
    GET  /api/applications/
    Student only — returns all applications submitted by
    the currently logged in student.
    Used in the student dashboard application tracker.

    POST /api/applications/
    Student only — submit a new job application.
    Student is automatically set from JWT token.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Only return applications for this student
        applications = Application.objects.filter(
            student=request.user
        )
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        # Check user is a student
        if request.user.role != 'student':
            return Response(
                {'error': 'Only students can apply for jobs'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = ApplicationCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            application = serializer.save()
            return Response(
                ApplicationSerializer(application).data,
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ApplicationDetailView(APIView):
    """
    GET /api/applications/<id>/
    Returns full details of one application.
    Student can only see their own application.
    Employer can only see applications for their jobs.
    Admin can see all.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        application = get_object_or_404(Application, pk=pk)

        # Permission check
        # Student can only see their own applications
        # Employer can only see applications for their jobs
        if (request.user.role == 'student' and
                application.student != request.user):
            return Response(
                {'error': 'Not authorised'},
                status=status.HTTP_403_FORBIDDEN
            )

        if (request.user.role == 'employer' and
                application.job.employer != request.user):
            return Response(
                {'error': 'Not authorised'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ApplicationStatusUpdateView(APIView):
    """
    PUT /api/applications/<id>/status/
    Employer only — update the status of an application.
    Used in employer dashboard to move applicants through pipeline.
    e.g. pending → shortlisted → interview → offered/rejected
    """
    permission_classes = [permissions.IsAuthenticated, IsEmployerOrAdmin]

    def put(self, request, pk):
        application = get_object_or_404(Application, pk=pk)

        # Make sure employer owns the job this application is for
        if (request.user.role == 'employer' and
                application.job.employer != request.user):
            return Response(
                {'error': 'Not authorised to update this application'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ApplicationStatusSerializer(
            application,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(
                ApplicationSerializer(application).data,
                status=status.HTTP_200_OK
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class JobApplicationListView(APIView):
    """
    GET /api/applications/job/<job_id>/
    Employer only — see all applicants for a specific job.
    Used in employer dashboard applicants section.
    """
    permission_classes = [permissions.IsAuthenticated, IsEmployerOrAdmin]

    def get(self, request, job_id):
        job = get_object_or_404(Job, pk=job_id)

        # Make sure this employer owns the job
        if (request.user.role == 'employer' and
                job.employer != request.user):
            return Response(
                {'error': 'Not authorised'},
                status=status.HTTP_403_FORBIDDEN
            )

        applications = Application.objects.filter(job=job)
        serializer   = ApplicationSerializer(applications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminApplicationListView(APIView):
    """
    GET /api/applications/all/
    Admin only — see all applications across the platform.
    Used in admin dashboard.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        applications = Application.objects.all()
        serializer   = ApplicationSerializer(applications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)