# =============================================================
# applications/views.py
# PURPOSE: API endpoints for job applications
# =============================================================

from django.shortcuts        import get_object_or_404
from rest_framework          import status, permissions
from rest_framework.views    import APIView
from rest_framework.response import Response
from rest_framework.parsers  import MultiPartParser, FormParser, JSONParser
from .models                 import Application
from jobs.models             import Job
from .serializers            import (
    ApplicationSerializer,
    ApplicationCreateSerializer,
    ApplicationStatusSerializer,
)


# ─── CUSTOM PERMISSIONS ──────────────────────────────────────

class IsStudent(permissions.BasePermission):
    """Only students can apply for jobs."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == 'student'


class IsEmployerOrAdmin(permissions.BasePermission):
    """Only employers and admins can update applications."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['employer', 'admin']


# ─── STUDENT ENDPOINTS ───────────────────────────────────────

class StudentApplicationListView(APIView):
    """
    GET  /api/applications/  — list student's own applications
    POST /api/applications/  — student submits a new application
                                with optional cover letter file
    """
    permission_classes = [permissions.IsAuthenticated]

    # Accept JSON requests AND multipart/form-data (file uploads)
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        applications = Application.objects.filter(student=request.user)
        serializer   = ApplicationSerializer(applications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
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
    Student → only their own | Employer → only their jobs | Admin → all
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        application = get_object_or_404(Application, pk=pk)

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


# ─── EMPLOYER ENDPOINTS ──────────────────────────────────────

class ApplicationStatusUpdateView(APIView):
    """
    PUT /api/applications/<id>/status/
    Employer updates status and/or schedules interview.
    """
    permission_classes = [permissions.IsAuthenticated, IsEmployerOrAdmin]

    def put(self, request, pk):
        application = get_object_or_404(Application, pk=pk)

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
    Employer sees all applicants for a job they own.
    """
    permission_classes = [permissions.IsAuthenticated, IsEmployerOrAdmin]

    def get(self, request, job_id):
        job = get_object_or_404(Job, pk=job_id)

        if (request.user.role == 'employer' and
                job.employer != request.user):
            return Response(
                {'error': 'Not authorised'},
                status=status.HTTP_403_FORBIDDEN
            )

        applications = Application.objects.filter(job=job)
        serializer   = ApplicationSerializer(applications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ─── ADMIN ENDPOINTS ─────────────────────────────────────────

class AdminApplicationListView(APIView):
    """GET /api/applications/all/ — admin sees all applications."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        applications = Application.objects.all()
        serializer   = ApplicationSerializer(applications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class ApplicationWithdrawView(APIView):
    """
    DELETE /api/applications/<id>/withdraw/
    Student can withdraw their own pending application.
    Only allowed if status is still 'pending'.
    """
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        application = get_object_or_404(Application, pk=pk)

        # Only the student who applied can withdraw
        if application.student != request.user:
            return Response(
                {'error': 'Not authorised'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Can only withdraw if still pending
        if application.status != 'pending':
            return Response(
                {'error': 'You can only withdraw pending applications'},
                status=status.HTTP_400_BAD_REQUEST
            )

        application.delete()
        return Response(
            {'message': 'Application withdrawn successfully'},
            status=status.HTTP_204_NO_CONTENT
        )