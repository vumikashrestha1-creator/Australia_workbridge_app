# =============================================================
# users/views.py
# PURPOSE: All authentication + user profile + admin endpoints
# =============================================================

from rest_framework              import status, permissions, generics
from rest_framework.response     import Response
from rest_framework.views        import APIView
from rest_framework.parsers      import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth         import authenticate

from .models      import User
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer

# Admin needs access to these models for stats
from jobs.models         import Job
from applications.models import Application
from reviews.models      import Review


# ─── HELPER ──────────────────────────────────────────────────

def get_tokens_for_user(user):
    """Generate JWT access + refresh tokens."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access':  str(refresh.access_token),
    }


# ─── AUTH VIEWS ──────────────────────────────────────────────

class RegisterView(APIView):
    """POST /api/auth/register/"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user   = serializer.save()
            tokens = get_tokens_for_user(user)
            return Response({
                'message': 'Account created successfully',
                'tokens':  tokens,
                'user':    UserSerializer(user).data,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """POST /api/auth/login/"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email    = serializer.validated_data['email']
            password = serializer.validated_data['password']
            user     = authenticate(request, username=email, password=password)

            if user is not None:
                tokens = get_tokens_for_user(user)
                return Response({
                    'message': 'Login successful',
                    'tokens':  tokens,
                    'user':    UserSerializer(user).data,
                }, status=status.HTTP_200_OK)

            return Response(
                {'error': 'Invalid email or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """POST /api/auth/logout/ — blacklist refresh token."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token         = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {'message': 'Logged out successfully'},
                status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {'error': 'Invalid token'},
                status=status.HTTP_400_BAD_REQUEST
            )


class MeView(APIView):
    """
    GET /api/auth/me/  — get current user profile
    PUT /api/auth/me/  — update profile (supports file uploads)
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdateProfileView(APIView):
    """PUT /api/users/profile/ — alias for MeView (used by some frontend calls)."""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def put(self, request):
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── ADMIN PERMISSION ────────────────────────────────────────

class IsAdmin(permissions.BasePermission):
    """Only users with role='admin' can access."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


# ─── ADMIN VIEWS ─────────────────────────────────────────────

class AdminStatsView(APIView):
    """
    GET /api/auth/admin/stats/
    Platform-wide metrics for admin Overview tab.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        return Response({
            # Users
            'total_users':     User.objects.count(),
            'total_students':  User.objects.filter(role='student').count(),
            'total_employers': User.objects.filter(role='employer').count(),

            # Jobs — use status field (not is_active)
            'total_jobs':  Job.objects.count(),
            'active_jobs': Job.objects.filter(status='active').count(),

            # Applications by status
            'total_applications':       Application.objects.count(),
            'pending_applications':     Application.objects.filter(status='pending').count(),
            'shortlisted_applications': Application.objects.filter(status='shortlisted').count(),
            'interview_applications':   Application.objects.filter(status='interview').count(),
            'offered_applications':     Application.objects.filter(status='offered').count(),
            'rejected_applications':    Application.objects.filter(status='rejected').count(),

            # Reviews
            'total_reviews': Review.objects.count(),
        })


class AdminUserListView(APIView):
    """
    GET    /api/auth/admin/users/              — list all users
    DELETE /api/auth/admin/users/<user_id>/    — delete one user
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        users      = User.objects.all().order_by('-created_at')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def delete(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            if user.role == 'admin':
                return Response(
                    {'error': 'Cannot delete admin users'},
                    status=status.HTTP_403_FORBIDDEN
                )
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class AdminJobDeleteView(APIView):
    """
    DELETE /api/auth/admin/jobs/<job_id>/
    Admin override — can delete any job regardless of employer.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def delete(self, request, job_id):
        try:
            job = Job.objects.get(id=job_id)
            job.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Job.DoesNotExist:
            return Response(
                {'error': 'Job not found'},
                status=status.HTTP_404_NOT_FOUND
            )