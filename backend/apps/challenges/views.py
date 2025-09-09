from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Avg, Count, F, Max
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.contrib.auth import get_user_model
from django.core.cache import cache
from .models import (
    Challenge, Submission, ChallengeRating,
    ChallengeFavorite, ChallengeDiscussion
)
from .serializers import (
    ChallengeListSerializer, ChallengeDetailSerializer, ChallengeCreateSerializer,
    SubmissionSerializer, SubmissionCreateSerializer, SubmissionDetailSerializer,
    ChallengeRatingSerializer, ChallengeFavoriteSerializer,
    ChallengeDiscussionSerializer, LeaderboardSerializer
)
from apps.users.permissions import IsTeacherOrReadOnly, IsOwnerOrReadOnly

User = get_user_model()


class ChallengeViewSet(viewsets.ModelViewSet):
    """ViewSet for challenges."""
    
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'difficulty_level', 'challenge_type', 'category',
        'is_featured', 'author'
    ]
    search_fields = ['title', 'description', 'problem_statement']
    ordering_fields = ['title', 'created_at', 'published_at', 'difficulty_level']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return challenges based on user permissions."""
        user = self.request.user
        
        if user.is_authenticated and (
            user.is_superuser or 
            user.role == User.UserRole.ADMIN or
            user.role == User.UserRole.TEACHER
        ):
            # Teachers and admins can see all challenges
            return Challenge.objects.all().select_related(
                'category', 'author'
            ).prefetch_related('tags')
        else:
            # Students and anonymous users see only published challenges
            return Challenge.objects.filter(
                status=Challenge.Status.PUBLISHED
            ).select_related(
                'category', 'author'
            ).prefetch_related('tags')
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return ChallengeListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ChallengeCreateSerializer
        else:
            return ChallengeDetailSerializer
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsTeacherOrReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticatedOrReadOnly]
        
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit solution to a challenge."""
        challenge = self.get_object()
        
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Add challenge_id to request data
        data = request.data.copy()
        data['challenge_id'] = challenge.id
        
        serializer = SubmissionCreateSerializer(
            data=data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            submission = serializer.save()
            
            # TODO: Queue submission for evaluation
            # This would typically involve sending to a code execution service
            
            return Response({
                'message': 'Submission received successfully!',
                'submission_id': submission.id,
                'status': submission.status
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def submissions(self, request, pk=None):
        """Get user's submissions for this challenge."""
        challenge = self.get_object()
        
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        submissions = challenge.submissions.filter(
            user=request.user
        ).order_by('-submitted_at')
        
        serializer = SubmissionSerializer(
            submissions,
            many=True,
            context={'request': request}
        )
        
        return Response({
            'submissions': serializer.data,
            'total_count': submissions.count()
        })
    
    @action(detail=True, methods=['post'])
    def favorite(self, request, pk=None):
        """Add/remove challenge from favorites."""
        challenge = self.get_object()
        
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        favorite, created = ChallengeFavorite.objects.get_or_create(
            user=request.user,
            challenge=challenge
        )
        
        if created:
            return Response({
                'message': 'Challenge added to favorites!',
                'is_favorited': True
            })
        else:
            favorite.delete()
            return Response({
                'message': 'Challenge removed from favorites!',
                'is_favorited': False
            })
    
    @action(detail=True, methods=['post'])
    def rate(self, request, pk=None):
        """Rate a challenge."""
        challenge = self.get_object()
        
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        serializer = ChallengeRatingSerializer(
            data=request.data,
            context={'request': request, 'challenge': challenge}
        )
        
        if serializer.is_valid():
            # Update or create rating
            rating, created = ChallengeRating.objects.update_or_create(
                user=request.user,
                challenge=challenge,
                defaults={
                    'rating': serializer.validated_data['rating'],
                    'difficulty_rating': serializer.validated_data['difficulty_rating'],
                    'clarity_rating': serializer.validated_data['clarity_rating'],
                    'review': serializer.validated_data.get('review', '')
                }
            )
            
            action_text = 'created' if created else 'updated'
            return Response({
                'message': f'Rating {action_text} successfully!',
                'rating': ChallengeRatingSerializer(rating).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def leaderboard(self, request, pk=None):
        """Get leaderboard for this challenge."""
        challenge = self.get_object()
        
        # Check cache first
        cache_key = f'leaderboard:challenge:{challenge.id}'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        # Get best submissions for each user
        best_submissions = Submission.objects.filter(
            challenge=challenge,
            status=Submission.Status.ACCEPTED
        ).values('user').annotate(
            best_score=Max('score'),
            best_time=Max('execution_time'),
            submission_count=Count('id')
        ).order_by('-best_score', 'best_time')
        
        leaderboard_data = []
        for i, submission_data in enumerate(best_submissions[:100]):
            user = User.objects.get(id=submission_data['user'])
            leaderboard_data.append({
                'rank': i + 1,
                'user': user,
                'score': submission_data['best_score'],
                'execution_time': submission_data['best_time'],
                'submission_count': submission_data['submission_count']
            })
        
        serializer = LeaderboardSerializer(leaderboard_data, many=True)
        
        # Cache for 5 minutes
        cache.set(cache_key, serializer.data, 300)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured challenges."""
        featured_challenges = self.get_queryset().filter(
            is_featured=True,
            status=Challenge.Status.PUBLISHED
        )[:10]
        
        serializer = ChallengeListSerializer(
            featured_challenges,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_progress(self, request):
        """Get current user's challenge progress."""
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        user = request.user
        
        # Get statistics
        total_challenges = self.get_queryset().filter(
            status=Challenge.Status.PUBLISHED
        ).count()
        
        solved_challenges = Challenge.objects.filter(
            submissions__user=user,
            submissions__status=Submission.Status.ACCEPTED
        ).distinct().count()
        
        attempted_challenges = Challenge.objects.filter(
            submissions__user=user
        ).distinct().count()
        
        # Get difficulty breakdown
        difficulty_stats = {}
        for difficulty in Challenge.DifficultyLevel.choices:
            difficulty_key = difficulty[0]
            total = self.get_queryset().filter(
                difficulty_level=difficulty_key,
                status=Challenge.Status.PUBLISHED
            ).count()
            
            solved = Challenge.objects.filter(
                difficulty_level=difficulty_key,
                submissions__user=user,
                submissions__status=Submission.Status.ACCEPTED
            ).distinct().count()
            
            difficulty_stats[difficulty_key] = {
                'total': total,
                'solved': solved,
                'percentage': round((solved / total) * 100, 1) if total > 0 else 0
            }
        
        # Get recent submissions
        recent_submissions = user.submissions.select_related(
            'challenge'
        ).order_by('-submitted_at')[:10]
        
        return Response({
            'total_challenges': total_challenges,
            'solved_challenges': solved_challenges,
            'attempted_challenges': attempted_challenges,
            'completion_percentage': round(
                (solved_challenges / total_challenges) * 100, 1
            ) if total_challenges > 0 else 0,
            'difficulty_stats': difficulty_stats,
            'recent_submissions': SubmissionSerializer(
                recent_submissions,
                many=True,
                context={'request': request}
            ).data
        })
    
    @action(detail=False, methods=['get'])
    def recommendations(self, request):
        """Get recommended challenges for the user."""
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        user = request.user
        
        # Get user's solved challenges to determine skill level
        solved_challenges = Challenge.objects.filter(
            submissions__user=user,
            submissions__status=Submission.Status.ACCEPTED
        ).distinct()
        
        # Determine user's current level
        if solved_challenges.count() == 0:
            # New user - recommend beginner challenges
            recommended = self.get_queryset().filter(
                difficulty_level=Challenge.DifficultyLevel.BEGINNER,
                status=Challenge.Status.PUBLISHED
            ).exclude(
                submissions__user=user
            )[:10]
        else:
            # Get user's most common difficulty level
            difficulty_counts = {}
            for challenge in solved_challenges:
                difficulty = challenge.difficulty_level
                difficulty_counts[difficulty] = difficulty_counts.get(difficulty, 0) + 1
            
            most_common_difficulty = max(difficulty_counts, key=difficulty_counts.get)
            
            # Recommend challenges of similar or slightly higher difficulty
            difficulty_order = [
                Challenge.DifficultyLevel.BEGINNER,
                Challenge.DifficultyLevel.INTERMEDIATE,
                Challenge.DifficultyLevel.ADVANCED,
                Challenge.DifficultyLevel.EXPERT
            ]
            
            current_index = difficulty_order.index(most_common_difficulty)
            target_difficulties = [most_common_difficulty]
            
            if current_index < len(difficulty_order) - 1:
                target_difficulties.append(difficulty_order[current_index + 1])
            
            recommended = self.get_queryset().filter(
                difficulty_level__in=target_difficulties,
                status=Challenge.Status.PUBLISHED
            ).exclude(
                submissions__user=user,
                submissions__status=Submission.Status.ACCEPTED
            )[:10]
        
        serializer = ChallengeListSerializer(
            recommended,
            many=True,
            context={'request': request}
        )
        
        return Response(serializer.data)


class SubmissionViewSet(viewsets.ModelViewSet):
    """ViewSet for submissions."""
    
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['challenge', 'language', 'status']
    ordering_fields = ['submitted_at', 'score', 'execution_time']
    ordering = ['-submitted_at']
    
    def get_queryset(self):
        """Return submissions based on user permissions."""
        user = self.request.user
        
        if user.is_superuser or user.role == User.UserRole.ADMIN:
            return Submission.objects.all().select_related(
                'challenge', 'user'
            )
        elif user.role == User.UserRole.TEACHER:
            # Teachers can see submissions to their challenges
            return Submission.objects.filter(
                Q(user=user) | Q(challenge__author=user)
            ).select_related('challenge', 'user')
        else:
            # Students can only see their own submissions
            return Submission.objects.filter(
                user=user
            ).select_related('challenge', 'user')
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'retrieve':
            return SubmissionDetailSerializer
        elif self.action == 'create':
            return SubmissionCreateSerializer
        else:
            return SubmissionSerializer
    
    def perform_create(self, serializer):
        """Create submission and queue for evaluation."""
        submission = serializer.save()
        
        # TODO: Queue submission for evaluation
        # This would typically involve sending to a code execution service
        
        return submission
    
    @action(detail=True, methods=['post'])
    def resubmit(self, request, pk=None):
        """Resubmit a submission for evaluation."""
        submission = self.get_object()
        
        # Check if user owns this submission or is admin/teacher
        if (submission.user != request.user and 
            not request.user.is_superuser and
            request.user.role not in [User.UserRole.ADMIN, User.UserRole.TEACHER]):
            return Response(
                {'error': 'Permission denied.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Reset submission status
        submission.status = Submission.Status.PENDING
        submission.evaluated_at = None
        submission.save()
        
        # TODO: Queue submission for evaluation
        
        return Response({
            'message': 'Submission queued for re-evaluation.',
            'submission_id': submission.id
        })


class ChallengeRatingViewSet(viewsets.ModelViewSet):
    """ViewSet for challenge ratings."""
    
    serializer_class = ChallengeRatingSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['challenge', 'rating']
    ordering_fields = ['rating', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return ratings based on user permissions."""
        user = self.request.user
        
        if user.is_superuser or user.role == User.UserRole.ADMIN:
            return ChallengeRating.objects.all().select_related(
                'user', 'challenge'
            )
        else:
            # Users can see their own ratings and public ratings with reviews
            return ChallengeRating.objects.filter(
                Q(user=user) | Q(review__isnull=False)
            ).select_related('user', 'challenge')


class ChallengeFavoriteViewSet(viewsets.ModelViewSet):
    """ViewSet for challenge favorites."""
    
    serializer_class = ChallengeFavoriteSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        """Return user's favorite challenges."""
        return ChallengeFavorite.objects.filter(
            user=self.request.user
        ).select_related('challenge')
    
    def perform_create(self, serializer):
        """Create favorite with current user."""
        serializer.save(user=self.request.user)


class ChallengeDiscussionViewSet(viewsets.ModelViewSet):
    """ViewSet for challenge discussions."""
    
    serializer_class = ChallengeDiscussionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['challenge', 'is_solution', 'is_spoiler']
    ordering_fields = ['created_at']
    ordering = ['created_at']
    
    def get_queryset(self):
        """Return approved discussions."""
        return ChallengeDiscussion.objects.filter(
            is_approved=True,
            parent=None  # Only top-level discussions
        ).select_related('user', 'challenge')
    
    def perform_create(self, serializer):
        """Create discussion with current user."""
        challenge_id = self.request.data.get('challenge_id')
        if challenge_id:
            try:
                challenge = Challenge.objects.get(id=challenge_id)
                serializer.save(
                    user=self.request.user,
                    challenge=challenge
                )
            except Challenge.DoesNotExist:
                raise serializers.ValidationError(
                    {'challenge_id': 'Invalid challenge ID.'}
                )
        else:
            raise serializers.ValidationError(
                {'challenge_id': 'Challenge ID is required.'}
            )
    
    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        """Reply to a discussion."""
        parent_discussion = self.get_object()
        
        data = request.data.copy()
        data['parent'] = parent_discussion.id
        
        serializer = ChallengeDiscussionSerializer(
            data=data,
            context={
                'request': request,
                'challenge': parent_discussion.challenge
            }
        )
        
        if serializer.is_valid():
            reply = serializer.save(
                user=request.user,
                challenge=parent_discussion.challenge,
                parent=parent_discussion
            )
            
            return Response({
                'message': 'Reply posted successfully!',
                'reply': ChallengeDiscussionSerializer(reply).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def flag(self, request, pk=None):
        """Flag a discussion for moderation."""
        discussion = self.get_object()
        
        # TODO: Implement flagging logic
        # This could involve creating a moderation record
        
        return Response({
            'message': 'Discussion flagged for moderation.'
        })