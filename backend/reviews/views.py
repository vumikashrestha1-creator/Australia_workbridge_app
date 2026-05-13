# =============================================================
# reviews/views.py
# PURPOSE: Handles all API logic for employer reviews
#
# ENDPOINTS HANDLED HERE:
#   GET    /api/reviews/job/<job_id>/ — get reviews for a job
#   POST   /api/reviews/              — student creates review
#   DELETE /api/reviews/<id>/         — admin deletes review
#   GET    /api/reviews/employer/<id>/ — get employer avg rating
# =============================================================

from django.shortcuts        import get_object_or_404
from django.db.models        import Avg
from rest_framework          import status, permissions
from rest_framework.views    import APIView
from rest_framework.response import Response
from .models                 import Review
from jobs.models             import Job
from users.models            import User
from .serializers            import ReviewSerializer, ReviewCreateSerializer


class IsStudent(permissions.BasePermission):
    """Only students can write reviews."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == 'student'


class JobReviewListView(APIView):
    """
    GET /api/reviews/job/<job_id>/
    Public — anyone can read reviews for a job.
    Shows on job detail page so students can
    read what others say about the employer.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, job_id):
        job     = get_object_or_404(Job, pk=job_id)
        reviews = Review.objects.filter(job=job)

        # Calculate average rating for this job
        avg = reviews.aggregate(Avg('rating'))['rating__avg']
        # aggregate = database-level calculation
        # Avg = average function from django.db.models

        serializer = ReviewSerializer(reviews, many=True)
        return Response({
            'job_id':         job_id,
            'average_rating': round(avg, 1) if avg else 0,
            # round to 1 decimal e.g. 4.3
            'total_reviews':  reviews.count(),
            'reviews':        serializer.data,
        }, status=status.HTTP_200_OK)


class ReviewCreateView(APIView):
    """
    POST /api/reviews/
    Student only — create a new employer review.
    Student must have applied to the job to review it.
    Student can only review each job once.
    """
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def post(self, request):
        serializer = ReviewCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            review = serializer.save()
            return Response(
                ReviewSerializer(review).data,
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ReviewDeleteView(APIView):
    """
    DELETE /api/reviews/<id>/
    Admin only — delete inappropriate reviews.
    Used in admin dashboard to moderate content.
    """
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, pk):
        review = get_object_or_404(Review, pk=pk)
        review.delete()
        return Response(
            {'message': 'Review deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )


class EmployerReviewSummaryView(APIView):
    """
    GET /api/reviews/employer/<employer_id>/
    Public — get all reviews and average rating
    for all jobs posted by one employer.
    Shows on employer profile page.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, employer_id):
        employer = get_object_or_404(
            User,
            pk=employer_id,
            role='employer'
        )

        # Get all jobs by this employer
        jobs = Job.objects.filter(employer=employer)

        # Get all reviews for those jobs
        reviews = Review.objects.filter(job__in=jobs)
        # job__in = job is in the list of employer's jobs

        # Calculate overall average rating
        avg = reviews.aggregate(Avg('rating'))['rating__avg']

        serializer = ReviewSerializer(reviews, many=True)
        return Response({
            'employer_id':    employer_id,
            'employer_name':  employer.company_name or employer.full_name,
            'average_rating': round(avg, 1) if avg else 0,
            'total_reviews':  reviews.count(),
            'reviews':        serializer.data,
        }, status=status.HTTP_200_OK)


class AdminReviewListView(APIView):
    """
    GET /api/reviews/all/
    Admin only — see all reviews on the platform.
    Used for moderation in admin dashboard.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        reviews    = Review.objects.all()
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)