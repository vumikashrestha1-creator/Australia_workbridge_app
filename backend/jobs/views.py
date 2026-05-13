from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Job
from .serializers import JobSerializer, JobCreateSerializer


class IsEmployerOrAdmin(permissions.BasePermission):
    """Only employers and admins can post jobs."""
    def has_permission(self, request, view):
        return request.user.role in ['employer', 'admin']


class IsJobOwnerOrAdmin(permissions.BasePermission):
    """Only the employer who posted the job or admin can edit/delete."""
    def has_object_permission(self, request, view, obj):
        return obj.employer == request.user or request.user.role == 'admin'


class JobListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        jobs = Job.objects.filter(status='active')

        # Filters — this is our visa-aware search feature
        visa    = request.query_params.get('visa_sponsored')
        category = request.query_params.get('category')
        location = request.query_params.get('location')
        hours   = request.query_params.get('max_hours')
        search  = request.query_params.get('search')

        if visa == 'true':
            jobs = jobs.filter(visa_sponsored=True)
        if category:
            jobs = jobs.filter(category=category)
        if location:
            jobs = jobs.filter(location__icontains=location)
        if hours:
            jobs = jobs.filter(hours_per_week__lte=int(hours))
        if search:
            jobs = jobs.filter(title__icontains=search) | \
                   jobs.filter(description__icontains=search)

        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)


class JobCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsEmployerOrAdmin]

    def post(self, request):
        serializer = JobCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            job = serializer.save()
            return Response(
                JobSerializer(job).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class JobDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        job = get_object_or_404(Job, pk=pk)
        serializer = JobSerializer(job)
        return Response(serializer.data)


class JobUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsJobOwnerOrAdmin]

    def put(self, request, pk):
        job = get_object_or_404(Job, pk=pk)
        self.check_object_permissions(request, job)
        serializer = JobCreateSerializer(
            job,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(JobSerializer(job).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        job = get_object_or_404(Job, pk=pk)
        self.check_object_permissions(request, job)
        job.delete()
        return Response(
            {'message': 'Job deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )


class EmployerJobListView(APIView):
    """Employer sees only their own jobs."""
    permission_classes = [permissions.IsAuthenticated, IsEmployerOrAdmin]

    def get(self, request):
        jobs = Job.objects.filter(employer=request.user)
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)


class AdminJobListView(APIView):
    """Admin sees all jobs."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        jobs = Job.objects.all()
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)