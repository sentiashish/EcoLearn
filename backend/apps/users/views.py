from rest_framework import viewsets, status, permissions, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import get_user_model
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import UserProfile, TeacherProfile, StudentClass
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserRegistrationSerializer,
    UserSerializer,
    UserUpdateSerializer,
    UserProfileSerializer,
    TeacherProfileSerializer,
    PasswordChangeSerializer,
    StudentClassSerializer,
    ClassEnrollmentSerializer,
    PublicUserSerializer
)
from .permissions import IsOwnerOrReadOnly, IsTeacherOrReadOnly

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT token obtain view."""
    serializer_class = CustomTokenObtainPairSerializer


class UserRegistrationView(generics.CreateAPIView):
    """User registration endpoint."""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        """Create a new user and return registration success with tokens."""
        print("Registration data received:", request.data)  # Debug logging
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate JWT tokens for the new user
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'User registered successfully',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                    'is_email_verified': user.is_email_verified,
                },
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }, status=status.HTTP_201_CREATED)
        
        print("Serializer errors:", serializer.errors)  # Debug logging
        return Response({
            'errors': serializer.errors,
            'message': 'Registration failed'
        }, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for user management."""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['role', 'is_active', 'is_email_verified']
    search_fields = ['first_name', 'last_name', 'email']
    ordering_fields = ['date_joined', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsOwnerOrReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return UserRegistrationSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer
    
    def get_queryset(self):
        """Filter queryset based on user role."""
        user = self.request.user
        
        if user.is_superuser or user.role == User.UserRole.ADMIN:
            return User.objects.all()
        elif user.role == User.UserRole.TEACHER:
            # Teachers can see their students
            return User.objects.filter(
                Q(id=user.id) |
                Q(enrolled_classes__teacher=user)
            ).distinct()
        else:
            # Students can only see themselves
            return User.objects.filter(id=user.id)
    
    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        """Get or update current user profile."""
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        else:
            serializer = UserUpdateSerializer(
                request.user,
                data=request.data,
                partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user password."""
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Password changed successfully.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """Get user leaderboard based on points."""
        users = User.objects.filter(
            role=User.UserRole.STUDENT,
            is_active=True,
            profile__privacy_public_profile=True
        ).select_related('profile').order_by('-profile__total_points')[:50]
        
        serializer = PublicUserSerializer(users, many=True)
        return Response(serializer.data)


class UserProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for user profile management."""
    
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        """Return profiles based on user permissions."""
        user = self.request.user
        
        if user.is_superuser or user.role == User.UserRole.ADMIN:
            return UserProfile.objects.all()
        elif user.role == User.UserRole.TEACHER:
            # Teachers can see their students' profiles
            return UserProfile.objects.filter(
                Q(user=user) |
                Q(user__enrolled_classes__teacher=user)
            ).distinct()
        else:
            # Students can only see their own profile
            return UserProfile.objects.filter(user=user)
    
    @action(detail=True, methods=['post'])
    def update_streak(self, request, pk=None):
        """Update user's daily streak."""
        profile = self.get_object()
        
        if profile.user != request.user:
            return Response(
                {'error': 'Permission denied.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        from datetime import date, timedelta
        today = date.today()
        
        if profile.last_activity_date == today:
            return Response({'message': 'Streak already updated today.'})
        
        if profile.last_activity_date == today - timedelta(days=1):
            profile.streak_days += 1
        else:
            profile.streak_days = 1
        
        profile.last_activity_date = today
        profile.save()
        
        return Response({
            'streak_days': profile.streak_days,
            'last_activity_date': profile.last_activity_date
        })


class TeacherProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for teacher profile management."""
    
    serializer_class = TeacherProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacherOrReadOnly]
    
    def get_queryset(self):
        """Return teacher profiles based on user permissions."""
        user = self.request.user
        
        if user.is_superuser or user.role == User.UserRole.ADMIN:
            return TeacherProfile.objects.all()
        elif user.role == User.UserRole.TEACHER:
            return TeacherProfile.objects.filter(user=user)
        else:
            # Students can see verified teacher profiles
            return TeacherProfile.objects.filter(is_verified=True)


class StudentClassViewSet(viewsets.ModelViewSet):
    """ViewSet for student class management."""
    
    serializer_class = StudentClassSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active', 'teacher']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return classes based on user role."""
        user = self.request.user
        
        if user.is_superuser or user.role == User.UserRole.ADMIN:
            return StudentClass.objects.all()
        elif user.role == User.UserRole.TEACHER:
            return StudentClass.objects.filter(teacher=user)
        else:
            return StudentClass.objects.filter(students=user)
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsTeacherOrReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        """Set teacher as current user when creating class."""
        serializer.save(teacher=self.request.user)
    
    @action(detail=False, methods=['post'])
    def enroll(self, request):
        """Enroll student in class using class code."""
        if request.user.role != User.UserRole.STUDENT:
            return Response(
                {'error': 'Only students can enroll in classes.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ClassEnrollmentSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            try:
                student_class = serializer.save()
                return Response({
                    'message': f'Successfully enrolled in {student_class.name}',
                    'class': StudentClassSerializer(student_class).data
                })
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Leave a class."""
        student_class = self.get_object()
        
        if request.user not in student_class.students.all():
            return Response(
                {'error': 'You are not enrolled in this class.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        student_class.students.remove(request.user)
        return Response({'message': f'Left {student_class.name} successfully.'})
    
    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """Get list of students in the class."""
        student_class = self.get_object()
        
        # Only teacher or admin can see student list
        if (request.user != student_class.teacher and 
            not request.user.is_superuser and 
            request.user.role != User.UserRole.ADMIN):
            return Response(
                {'error': 'Permission denied.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        students = student_class.students.all()
        serializer = PublicUserSerializer(students, many=True)
        return Response(serializer.data)