from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Avg, Count
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.contrib.auth import get_user_model
from .models import (
    Category, Tag, Lesson, Quiz, Question, Answer,
    LessonCompletion, QuizAttempt, UserAnswer, ContentRating
)
from .serializers import (
    CategorySerializer, TagSerializer,
    LessonListSerializer, LessonDetailSerializer, LessonCreateSerializer,
    QuizListSerializer, QuizDetailSerializer, QuizCreateSerializer,
    QuestionSerializer, QuestionCreateSerializer,
    LessonCompletionSerializer, QuizAttemptSerializer,
    ContentRatingSerializer, QuizTakeSerializer
)
from apps.users.permissions import IsTeacherOrReadOnly, IsOwnerOrReadOnly

User = get_user_model()


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for content categories."""
    
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsTeacherOrReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticatedOrReadOnly]
        
        return [permission() for permission in permission_classes]


class TagViewSet(viewsets.ModelViewSet):
    """ViewSet for content tags."""
    
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsTeacherOrReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticatedOrReadOnly]
        
        return [permission() for permission in permission_classes]


class LessonViewSet(viewsets.ModelViewSet):
    """ViewSet for lessons."""
    
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'category', 'difficulty_level', 'content_type',
        'is_featured', 'author'
    ]
    search_fields = ['title', 'description', 'content']
    ordering_fields = ['title', 'created_at', 'published_at', 'order']
    ordering = ['category', 'order', 'title']
    
    def get_queryset(self):
        """Return lessons based on user permissions."""
        user = self.request.user
        
        if user.is_authenticated and (
            user.is_superuser or 
            user.role == User.UserRole.ADMIN or
            user.role == User.UserRole.TEACHER
        ):
            # Teachers and admins can see all lessons including unpublished
            return Lesson.objects.all().select_related(
                'category', 'author'
            ).prefetch_related('tags', 'prerequisites')
        else:
            # Students and anonymous users see only published lessons
            return Lesson.objects.filter(
                is_published=True
            ).select_related(
                'category', 'author'
            ).prefetch_related('tags', 'prerequisites')
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return LessonListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return LessonCreateSerializer
        else:
            return LessonDetailSerializer
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsTeacherOrReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticatedOrReadOnly]
        
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark lesson as completed by current user."""
        lesson = self.get_object()
        
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if already completed
        completion, created = LessonCompletion.objects.get_or_create(
            user=request.user,
            lesson=lesson,
            defaults={'time_spent': request.data.get('time_spent', 0)}
        )
        
        if created:
            return Response({
                'message': 'Lesson completed successfully!',
                'points_earned': lesson.points_reward
            })
        else:
            return Response({
                'message': 'Lesson already completed.',
                'completed_at': completion.completed_at
            })
    
    @action(detail=True, methods=['post'])
    def rate(self, request, pk=None):
        """Rate a lesson."""
        lesson = self.get_object()
        
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if user has completed the lesson
        if not lesson.completions.filter(user=request.user).exists():
            return Response(
                {'error': 'You must complete the lesson before rating it.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ContentRatingSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            # Update or create rating
            rating, created = ContentRating.objects.update_or_create(
                user=request.user,
                lesson=lesson,
                defaults={
                    'rating': serializer.validated_data['rating'],
                    'review': serializer.validated_data.get('review', '')
                }
            )
            
            action_text = 'created' if created else 'updated'
            return Response({
                'message': f'Rating {action_text} successfully!',
                'rating': ContentRatingSerializer(rating).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured lessons."""
        featured_lessons = self.get_queryset().filter(
            is_featured=True,
            is_published=True
        )[:10]
        
        serializer = LessonListSerializer(
            featured_lessons,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_progress(self, request):
        """Get current user's lesson progress."""
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        completed_lessons = LessonCompletion.objects.filter(
            user=request.user
        ).select_related('lesson')
        
        serializer = LessonCompletionSerializer(
            completed_lessons,
            many=True,
            context={'request': request}
        )
        
        total_lessons = self.get_queryset().filter(is_published=True).count()
        completed_count = completed_lessons.count()
        
        return Response({
            'completed_lessons': serializer.data,
            'total_lessons': total_lessons,
            'completed_count': completed_count,
            'completion_percentage': round(
                (completed_count / total_lessons) * 100, 1
            ) if total_lessons > 0 else 0
        })


class QuizViewSet(viewsets.ModelViewSet):
    """ViewSet for quizzes."""
    
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'category', 'quiz_type', 'lesson', 'is_featured', 'author'
    ]
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'created_at', 'published_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return quizzes based on user permissions."""
        user = self.request.user
        
        if user.is_authenticated and (
            user.is_superuser or 
            user.role == User.UserRole.ADMIN or
            user.role == User.UserRole.TEACHER
        ):
            # Teachers and admins can see all quizzes
            return Quiz.objects.all().select_related(
                'category', 'lesson', 'author'
            ).prefetch_related('tags', 'questions')
        else:
            # Students see only published quizzes
            return Quiz.objects.filter(
                is_published=True
            ).select_related(
                'category', 'lesson', 'author'
            ).prefetch_related('tags', 'questions')
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return QuizListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return QuizCreateSerializer
        else:
            return QuizDetailSerializer
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsTeacherOrReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticatedOrReadOnly]
        
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['post'])
    def take(self, request, pk=None):
        """Take a quiz."""
        quiz = self.get_object()
        
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if user can attempt this quiz
        user_attempts = quiz.attempts.filter(user=request.user).count()
        if user_attempts >= quiz.max_attempts:
            return Response(
                {'error': f'Maximum attempts ({quiz.max_attempts}) reached.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = QuizTakeSerializer(
            data=request.data,
            context={'request': request, 'quiz': quiz}
        )
        
        if serializer.is_valid():
            attempt = serializer.save()
            return Response({
                'message': 'Quiz completed successfully!',
                'attempt': QuizAttemptSerializer(attempt).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def start(self, request, pk=None):
        """Start a quiz (get questions without answers)."""
        quiz = self.get_object()
        
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if user can attempt this quiz
        user_attempts = quiz.attempts.filter(user=request.user).count()
        if user_attempts >= quiz.max_attempts:
            return Response(
                {'error': f'Maximum attempts ({quiz.max_attempts}) reached.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get questions (hide correct answers)
        questions = quiz.questions.all().prefetch_related('answers')
        
        # Set context to hide correct answers
        request.hide_correct_answers = True
        
        serializer = QuestionSerializer(
            questions,
            many=True,
            context={'request': request}
        )
        
        return Response({
            'quiz': {
                'id': quiz.id,
                'title': quiz.title,
                'instructions': quiz.instructions,
                'time_limit': quiz.time_limit,
                'question_count': questions.count(),
                'shuffle_questions': quiz.shuffle_questions,
                'shuffle_answers': quiz.shuffle_answers
            },
            'questions': serializer.data
        })
    
    @action(detail=True, methods=['get'])
    def attempts(self, request, pk=None):
        """Get user's attempts for this quiz."""
        quiz = self.get_object()
        
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        attempts = quiz.attempts.filter(user=request.user).order_by('-started_at')
        serializer = QuizAttemptSerializer(attempts, many=True)
        
        return Response({
            'attempts': serializer.data,
            'remaining_attempts': max(0, quiz.max_attempts - attempts.count())
        })
    
    @action(detail=True, methods=['post'])
    def rate(self, request, pk=None):
        """Rate a quiz."""
        quiz = self.get_object()
        
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if user has attempted the quiz
        if not quiz.attempts.filter(user=request.user).exists():
            return Response(
                {'error': 'You must attempt the quiz before rating it.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ContentRatingSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            # Update or create rating
            rating, created = ContentRating.objects.update_or_create(
                user=request.user,
                quiz=quiz,
                defaults={
                    'rating': serializer.validated_data['rating'],
                    'review': serializer.validated_data.get('review', '')
                }
            )
            
            action_text = 'created' if created else 'updated'
            return Response({
                'message': f'Rating {action_text} successfully!',
                'rating': ContentRatingSerializer(rating).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class QuestionViewSet(viewsets.ModelViewSet):
    """ViewSet for quiz questions."""
    
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacherOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['quiz', 'question_type']
    ordering_fields = ['order', 'created_at']
    ordering = ['quiz', 'order']
    
    def get_queryset(self):
        """Return questions based on user permissions."""
        user = self.request.user
        
        if user.is_superuser or user.role == User.UserRole.ADMIN:
            return Question.objects.all().prefetch_related('answers')
        elif user.role == User.UserRole.TEACHER:
            # Teachers can see questions from their quizzes
            return Question.objects.filter(
                quiz__author=user
            ).prefetch_related('answers')
        else:
            # Students shouldn't directly access questions
            return Question.objects.none()
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action in ['create', 'update', 'partial_update']:
            return QuestionCreateSerializer
        return QuestionSerializer
    
    def perform_create(self, serializer):
        """Ensure user can only create questions for their quizzes."""
        quiz = serializer.validated_data['quiz']
        
        if (not self.request.user.is_superuser and 
            self.request.user.role != User.UserRole.ADMIN and
            quiz.author != self.request.user):
            raise PermissionDenied("You can only add questions to your own quizzes.")
        
        serializer.save()


class ContentRatingViewSet(viewsets.ModelViewSet):
    """ViewSet for content ratings."""
    
    serializer_class = ContentRatingSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['rating', 'lesson', 'quiz']
    ordering_fields = ['rating', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return ratings based on user permissions."""
        user = self.request.user
        
        if user.is_superuser or user.role == User.UserRole.ADMIN:
            return ContentRating.objects.all().select_related(
                'user', 'lesson', 'quiz'
            )
        else:
            # Users can see their own ratings and public ratings
            return ContentRating.objects.filter(
                Q(user=user) | Q(review__isnull=False)
            ).select_related('user', 'lesson', 'quiz')