from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Q, F
from django.utils import timezone
from django.core.cache import cache
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.users.permissions import IsOwnerOrReadOnly, IsAdminOrReadOnly
from .models import (
    Badge, PointTransaction, UserBadge, Leaderboard, Achievement
)
from .serializers import (
    BadgeSerializer, BadgeCreateSerializer, PointTransactionSerializer,
    PointTransactionCreateSerializer, UserBadgeSerializer, UserStatsSerializer,
    LeaderboardSerializer, LeaderboardCreateSerializer, LeaderboardEntrySerializer,
    AchievementSerializer, GamificationSummarySerializer, BadgeProgressSerializer
)

User = get_user_model()


class BadgeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing badges."""
    
    queryset = Badge.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['badge_type', 'rarity', 'is_active', 'is_hidden']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'rarity', 'points_required', 'created_at']
    ordering = ['rarity', 'name']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action in ['create', 'update', 'partial_update']:
            return BadgeCreateSerializer
        return BadgeSerializer
    
    def get_queryset(self):
        """Filter badges based on user permissions."""
        queryset = super().get_queryset()
        
        # Non-admin users can't see hidden badges unless they've earned them
        if not self.request.user.is_staff:
            if self.request.user.is_authenticated:
                # Show non-hidden badges + hidden badges user has earned
                earned_hidden_badges = UserBadge.objects.filter(
                    user=self.request.user,
                    badge__is_hidden=True
                ).values_list('badge_id', flat=True)
                
                queryset = queryset.filter(
                    Q(is_hidden=False) | Q(id__in=earned_hidden_badges)
                )
            else:
                queryset = queryset.filter(is_hidden=False)
        
        return queryset.filter(is_active=True)
    
    @action(detail=False, methods=['get'])
    def earned(self, request):
        """Get badges earned by current user."""
        if not request.user.is_authenticated:
            return Response(
                {'detail': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        user_badges = UserBadge.objects.filter(
            user=request.user
        ).select_related('badge').order_by('-earned_at')
        
        serializer = UserBadgeSerializer(user_badges, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def progress(self, request):
        """Get badge progress for current user."""
        if not request.user.is_authenticated:
            return Response(
                {'detail': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Get all active, non-hidden badges
        badges = Badge.objects.filter(is_active=True, is_hidden=False)
        
        progress_data = []
        for badge in badges:
            progress_data.append({
                'badge': badge,
                'user': request.user
            })
        
        serializer = BadgeProgressSerializer(progress_data, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def award(self, request, pk=None):
        """Award badge to a user (admin only)."""
        if not request.user.is_staff:
            return Response(
                {'detail': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        badge = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'detail': 'user_id is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user already has this badge
        if UserBadge.objects.filter(user=user, badge=badge).exists():
            return Response(
                {'detail': 'User already has this badge.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Award the badge
        user_badge = UserBadge.objects.create(user=user, badge=badge)
        
        serializer = UserBadgeSerializer(user_badge)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """Get badge leaderboard."""
        # Get users with most badges
        users_with_badges = User.objects.annotate(
            badge_count=Count('earned_badges')
        ).filter(badge_count__gt=0).order_by('-badge_count')[:50]
        
        leaderboard_data = []
        for rank, user in enumerate(users_with_badges, 1):
            leaderboard_data.append({
                'rank': rank,
                'user_id': user.id,
                'username': user.username,
                'display_name': user.get_full_name() or user.username,
                'avatar': getattr(user.profile, 'avatar', None),
                'score': user.badge_count,
                'metric': 'badges_earned'
            })
        
        serializer = LeaderboardEntrySerializer(leaderboard_data, many=True)
        return Response(serializer.data)


class PointTransactionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing point transactions."""
    
    serializer_class = PointTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['transaction_type', 'user']
    ordering_fields = ['created_at', 'points']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter transactions based on user permissions."""
        if self.request.user.is_staff:
            return PointTransaction.objects.all()
        return PointTransaction.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action in ['create', 'update', 'partial_update']:
            if self.request.user.is_staff:
                return PointTransactionCreateSerializer
            else:
                # Regular users can't create transactions
                return PointTransactionSerializer
        return PointTransactionSerializer
    
    def perform_create(self, serializer):
        """Create point transaction (admin only)."""
        if not self.request.user.is_staff:
            raise permissions.PermissionDenied("Only admins can create point transactions.")
        serializer.save()
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get point transaction summary for current user."""
        user = request.user
        
        # Calculate totals
        total_earned = PointTransaction.objects.filter(
            user=user,
            points__gt=0
        ).aggregate(total=Sum('points'))['total'] or 0
        
        total_spent = abs(PointTransaction.objects.filter(
            user=user,
            points__lt=0
        ).aggregate(total=Sum('points'))['total'] or 0)
        
        current_balance = user.profile.total_points
        
        # Get recent transactions
        recent_transactions = PointTransaction.objects.filter(
            user=user
        ).order_by('-created_at')[:10]
        
        # Get transactions by type
        transactions_by_type = PointTransaction.objects.filter(
            user=user
        ).values('transaction_type').annotate(
            count=Count('id'),
            total_points=Sum('points')
        )
        
        return Response({
            'total_earned': total_earned,
            'total_spent': total_spent,
            'current_balance': current_balance,
            'recent_transactions': PointTransactionSerializer(
                recent_transactions, many=True
            ).data,
            'transactions_by_type': list(transactions_by_type)
        })
    
    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """Get points leaderboard."""
        # Get top point earners
        top_users = User.objects.annotate(
            total_points=Sum('point_transactions__points')
        ).filter(total_points__gt=0).order_by('-total_points')[:50]
        
        leaderboard_data = []
        for rank, user in enumerate(top_users, 1):
            leaderboard_data.append({
                'rank': rank,
                'user_id': user.id,
                'username': user.username,
                'display_name': user.get_full_name() or user.username,
                'avatar': getattr(user.profile, 'avatar', None),
                'score': user.total_points or 0,
                'metric': 'total_points'
            })
        
        serializer = LeaderboardEntrySerializer(leaderboard_data, many=True)
        return Response(serializer.data)


class UserBadgeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing user badges."""
    
    serializer_class = UserBadgeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['user', 'badge__badge_type', 'badge__rarity', 'is_displayed']
    ordering_fields = ['earned_at']
    ordering = ['-earned_at']
    
    def get_queryset(self):
        """Filter user badges based on permissions."""
        if self.request.user.is_staff:
            return UserBadge.objects.all()
        return UserBadge.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['patch'])
    def toggle_display(self, request, pk=None):
        """Toggle badge display status."""
        user_badge = self.get_object()
        
        # Users can only modify their own badges
        if user_badge.user != request.user and not request.user.is_staff:
            return Response(
                {'detail': 'Permission denied.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user_badge.is_displayed = not user_badge.is_displayed
        user_badge.save()
        
        serializer = self.get_serializer(user_badge)
        return Response(serializer.data)


class LeaderboardViewSet(viewsets.ModelViewSet):
    """ViewSet for managing leaderboards."""
    
    queryset = Leaderboard.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['leaderboard_type', 'is_active', 'student_class']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'start_date', 'end_date', 'last_updated']
    ordering = ['-last_updated']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action in ['create', 'update', 'partial_update']:
            return LeaderboardCreateSerializer
        return LeaderboardSerializer
    
    def get_queryset(self):
        """Filter leaderboards based on user permissions."""
        queryset = super().get_queryset()
        
        # Filter by user's class if not admin
        if not self.request.user.is_staff and hasattr(self.request.user, 'profile'):
            user_class = getattr(self.request.user.profile, 'student_class', None)
            if user_class:
                queryset = queryset.filter(
                    Q(student_class__isnull=True) | Q(student_class=user_class)
                )
        
        return queryset.filter(is_active=True)
    
    @action(detail=True, methods=['post'])
    def refresh(self, request, pk=None):
        """Refresh leaderboard data (admin only)."""
        if not request.user.is_staff:
            return Response(
                {'detail': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        leaderboard = self.get_object()
        
        # Clear cache for this leaderboard
        cache_key = f"leaderboard_{leaderboard.id}_data"
        cache.delete(cache_key)
        
        # Update last_updated timestamp
        leaderboard.last_updated = timezone.now()
        leaderboard.save()
        
        serializer = self.get_serializer(leaderboard)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def global_rankings(self, request):
        """Get global rankings across all metrics."""
        rankings = {}
        
        # Points leaderboard
        top_points = User.objects.annotate(
            total_points=Sum('point_transactions__points')
        ).filter(total_points__gt=0).order_by('-total_points')[:10]
        
        rankings['points'] = [{
            'rank': rank,
            'user_id': str(user.id),
            'username': user.username,
            'display_name': user.get_full_name() or user.username,
            'score': user.total_points or 0
        } for rank, user in enumerate(top_points, 1)]
        
        # Badges leaderboard
        top_badges = User.objects.annotate(
            badge_count=Count('earned_badges')
        ).filter(badge_count__gt=0).order_by('-badge_count')[:10]
        
        rankings['badges'] = [{
            'rank': rank,
            'user_id': str(user.id),
            'username': user.username,
            'display_name': user.get_full_name() or user.username,
            'score': user.badge_count
        } for rank, user in enumerate(top_badges, 1)]
        
        # Streak leaderboard
        top_streaks = User.objects.filter(
            profile__current_streak__gt=0
        ).order_by('-profile__current_streak')[:10]
        
        rankings['streaks'] = [{
            'rank': rank,
            'user_id': str(user.id),
            'username': user.username,
            'display_name': user.get_full_name() or user.username,
            'score': user.profile.current_streak
        } for rank, user in enumerate(top_streaks, 1)]
        
        return Response(rankings)


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing achievements."""
    
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['user', 'achievement_type']
    ordering_fields = ['achieved_at', 'points_awarded']
    ordering = ['-achieved_at']
    
    def get_queryset(self):
        """Filter achievements based on permissions."""
        if self.request.user.is_staff:
            return Achievement.objects.all()
        return Achievement.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent achievements across all users."""
        recent_achievements = Achievement.objects.select_related(
            'user'
        ).order_by('-achieved_at')[:20]
        
        serializer = self.get_serializer(recent_achievements, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get achievement summary for current user."""
        user = request.user
        
        # Get achievements by type
        achievements_by_type = Achievement.objects.filter(
            user=user
        ).values('achievement_type').annotate(
            count=Count('id'),
            total_points=Sum('points_awarded')
        )
        
        # Get recent achievements
        recent_achievements = Achievement.objects.filter(
            user=user
        ).order_by('-achieved_at')[:5]
        
        # Calculate totals
        total_achievements = Achievement.objects.filter(user=user).count()
        total_points_from_achievements = Achievement.objects.filter(
            user=user
        ).aggregate(total=Sum('points_awarded'))['total'] or 0
        
        return Response({
            'total_achievements': total_achievements,
            'total_points_from_achievements': total_points_from_achievements,
            'achievements_by_type': list(achievements_by_type),
            'recent_achievements': AchievementSerializer(
                recent_achievements, many=True
            ).data
        })


class GamificationStatsViewSet(viewsets.ViewSet):
    """ViewSet for gamification statistics and analytics."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def user_stats(self, request):
        """Get comprehensive stats for current user."""
        user = request.user
        
        # Calculate various statistics
        total_points = user.profile.total_points
        badges_earned = user.earned_badges.count()
        
        # Get activity counts
        lessons_completed = user.lesson_completions.count()
        quizzes_completed = user.quiz_attempts.filter(is_completed=True).count()
        challenges_solved = user.submissions.filter(
            status='accepted'
        ).values('challenge').distinct().count()
        
        # Calculate rank
        users_with_more_points = User.objects.filter(
            profile__total_points__gt=total_points
        ).count()
        global_rank = users_with_more_points + 1 if total_points > 0 else None
        
        # Get time-based points
        week_ago = timezone.now() - timezone.timedelta(days=7)
        month_ago = timezone.now() - timezone.timedelta(days=30)
        
        weekly_points = PointTransaction.objects.filter(
            user=user,
            created_at__gte=week_ago
        ).aggregate(total=Sum('points'))['total'] or 0
        
        monthly_points = PointTransaction.objects.filter(
            user=user,
            created_at__gte=month_ago
        ).aggregate(total=Sum('points'))['total'] or 0
        
        # Get recent badges
        recent_badges = UserBadge.objects.filter(
            user=user
        ).select_related('badge').order_by('-earned_at')[:5]
        
        stats_data = {
            'user': user,
            'total_points': total_points,
            'current_streak': 0,  # Default value since field doesn't exist
            'longest_streak': 0,  # Default value since field doesn't exist
            'badges_earned': badges_earned,
            'lessons_completed': lessons_completed,
            'quizzes_completed': quizzes_completed,
            'challenges_solved': challenges_solved,
            'global_rank': global_rank,
            'weekly_points': weekly_points,
            'monthly_points': monthly_points,
            'recent_badges': recent_badges
        }
        
        serializer = UserStatsSerializer(stats_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def system_summary(self, request):
        """Get system-wide gamification summary (admin only)."""
        if not request.user.is_staff:
            return Response(
                {'detail': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Calculate system statistics
        total_users = User.objects.count()
        total_points_awarded = PointTransaction.objects.filter(
            points__gt=0
        ).aggregate(total=Sum('points'))['total'] or 0
        
        total_badges_earned = UserBadge.objects.count()
        total_achievements = Achievement.objects.count()
        active_badges = Badge.objects.filter(is_active=True).count()
        active_leaderboards = Leaderboard.objects.filter(is_active=True).count()
        
        # Get top performers
        top_point_earners = User.objects.annotate(
            total_points=Sum('point_transactions__points')
        ).filter(total_points__gt=0).order_by('-total_points')[:10]
        
        top_point_data = [{
            'rank': rank,
            'user_id': user.id,
            'username': user.username,
            'display_name': user.get_full_name() or user.username,
            'avatar': getattr(user.profile, 'avatar', None),
            'score': user.total_points or 0,
            'metric': 'total_points'
        } for rank, user in enumerate(top_point_earners, 1)]
        
        # Get recent badge earners
        recent_badge_earners = UserBadge.objects.select_related(
            'user', 'badge'
        ).order_by('-earned_at')[:10]
        
        # Get statistics by category
        points_by_type = dict(PointTransaction.objects.values(
            'transaction_type'
        ).annotate(total=Sum('points')))
        
        badges_by_rarity = dict(Badge.objects.values(
            'rarity'
        ).annotate(count=Count('id')))
        
        achievements_by_type = dict(Achievement.objects.values(
            'achievement_type'
        ).annotate(count=Count('id')))
        
        summary_data = {
            'total_users': total_users,
            'total_points_awarded': total_points_awarded,
            'total_badges_earned': total_badges_earned,
            'total_achievements': total_achievements,
            'active_badges': active_badges,
            'active_leaderboards': active_leaderboards,
            'top_point_earners': top_point_data,
            'recent_badge_earners': recent_badge_earners,
            'points_by_type': points_by_type,
            'badges_by_rarity': badges_by_rarity,
            'achievements_by_type': achievements_by_type
        }
        
        serializer = GamificationSummarySerializer(summary_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def daily_login_bonus(self, request):
        """Award daily login bonus to user."""
        user = request.user
        today = timezone.now().date()
        
        # Check if user already got bonus today
        existing_bonus = PointTransaction.objects.filter(
            user=user,
            transaction_type=PointTransaction.TransactionType.DAILY_LOGIN,
            created_at__date=today
        ).exists()
        
        if existing_bonus:
            return Response({
                'detail': 'Daily login bonus already claimed today.',
                'points_awarded': 0
            })
        
        # Award daily login bonus
        base_points = 10
        streak_bonus = min(user.profile.current_streak * 2, 50)  # Max 50 bonus points
        total_points = base_points + streak_bonus
        
        PointTransaction.objects.create(
            user=user,
            points=total_points,
            transaction_type=PointTransaction.TransactionType.DAILY_LOGIN,
            description=f"Daily login bonus (streak: {user.profile.current_streak})"
        )
        
        return Response({
            'detail': 'Daily login bonus awarded!',
            'points_awarded': total_points,
            'base_points': base_points,
            'streak_bonus': streak_bonus,
            'current_streak': user.profile.current_streak
        })