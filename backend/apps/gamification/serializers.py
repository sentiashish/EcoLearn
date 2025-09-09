from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Q
from django.utils import timezone
from .models import (
    Badge, PointTransaction, UserBadge, Leaderboard, Achievement
)

User = get_user_model()


class BadgeSerializer(serializers.ModelSerializer):
    """Serializer for Badge model."""
    
    rarity_color = serializers.ReadOnlyField()
    earned_count = serializers.ReadOnlyField()
    is_earned = serializers.SerializerMethodField()
    earned_at = serializers.SerializerMethodField()
    
    class Meta:
        model = Badge
        fields = [
            'id', 'name', 'description', 'icon', 'badge_type',
            'rarity', 'rarity_color', 'points_required', 'criteria',
            'is_active', 'is_hidden', 'earned_count', 'created_at',
            'is_earned', 'earned_at'
        ]
        read_only_fields = ['id', 'earned_count', 'created_at']
    
    def get_is_earned(self, obj):
        """Check if current user has earned this badge."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserBadge.objects.filter(
                user=request.user,
                badge=obj
            ).exists()
        return False
    
    def get_earned_at(self, obj):
        """Get when current user earned this badge."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            user_badge = UserBadge.objects.filter(
                user=request.user,
                badge=obj
            ).first()
            return user_badge.earned_at if user_badge else None
        return None


class BadgeCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating badges."""
    
    class Meta:
        model = Badge
        fields = [
            'name', 'description', 'icon', 'badge_type',
            'rarity', 'points_required', 'criteria',
            'is_active', 'is_hidden'
        ]
    
    def validate_criteria(self, value):
        """Validate badge criteria format."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Criteria must be a JSON object.")
        
        # Validate known criteria keys
        valid_keys = [
            'lessons_completed', 'quizzes_completed', 'challenges_solved',
            'streak_days', 'difficulty_challenges', 'perfect_quizzes',
            'fast_solutions'
        ]
        
        for key in value.keys():
            if key not in valid_keys:
                raise serializers.ValidationError(
                    f"Unknown criteria key: {key}. Valid keys: {valid_keys}"
                )
        
        return value


class PointTransactionSerializer(serializers.ModelSerializer):
    """Serializer for PointTransaction model."""
    
    user_username = serializers.CharField(source='user.username', read_only=True)
    transaction_type_display = serializers.CharField(
        source='get_transaction_type_display',
        read_only=True
    )
    
    class Meta:
        model = PointTransaction
        fields = [
            'id', 'user', 'user_username', 'points', 'transaction_type',
            'transaction_type_display', 'description', 'reference_id',
            'created_at', 'metadata'
        ]
        read_only_fields = ['id', 'user', 'created_at']


class PointTransactionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating point transactions (admin only)."""
    
    class Meta:
        model = PointTransaction
        fields = [
            'user', 'points', 'transaction_type', 'description',
            'reference_id', 'metadata'
        ]
    
    def validate_points(self, value):
        """Validate point values."""
        if abs(value) > 10000:
            raise serializers.ValidationError(
                "Point value cannot exceed 10,000 in either direction."
            )
        return value
    
    def validate(self, attrs):
        """Validate transaction data."""
        # Ensure negative points have appropriate transaction types
        if attrs['points'] < 0:
            allowed_negative_types = [
                PointTransaction.TransactionType.PENALTY,
                PointTransaction.TransactionType.ADMIN_ADJUSTMENT
            ]
            if attrs['transaction_type'] not in allowed_negative_types:
                raise serializers.ValidationError(
                    "Negative points require penalty or admin adjustment type."
                )
        
        return attrs


class UserBadgeSerializer(serializers.ModelSerializer):
    """Serializer for UserBadge model."""
    
    badge = BadgeSerializer(read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserBadge
        fields = [
            'id', 'user', 'user_username', 'badge', 'earned_at', 'is_displayed'
        ]
        read_only_fields = ['id', 'user', 'badge', 'earned_at']


class UserStatsSerializer(serializers.Serializer):
    """Serializer for user gamification statistics."""
    
    total_points = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()
    badges_earned = serializers.IntegerField()
    lessons_completed = serializers.IntegerField()
    quizzes_completed = serializers.IntegerField()
    challenges_solved = serializers.IntegerField()
    global_rank = serializers.IntegerField(allow_null=True)
    weekly_points = serializers.IntegerField()
    monthly_points = serializers.IntegerField()
    recent_badges = UserBadgeSerializer(many=True, read_only=True)
    recent_achievements = serializers.SerializerMethodField()
    point_history = serializers.SerializerMethodField()
    
    def get_recent_achievements(self, obj):
        """Get recent achievements for the user."""
        user = obj.get('user')
        if user:
            recent_achievements = Achievement.objects.filter(
                user=user
            ).order_by('-achieved_at')[:5]
            return AchievementSerializer(recent_achievements, many=True).data
        return []
    
    def get_point_history(self, obj):
        """Get point transaction history for the user."""
        user = obj.get('user')
        if user:
            # Get last 30 days of transactions
            thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
            transactions = PointTransaction.objects.filter(
                user=user,
                created_at__gte=thirty_days_ago
            ).order_by('-created_at')[:20]
            return PointTransactionSerializer(transactions, many=True).data
        return []


class LeaderboardEntrySerializer(serializers.Serializer):
    """Serializer for leaderboard entries."""
    
    rank = serializers.IntegerField()
    user_id = serializers.UUIDField()
    username = serializers.CharField()
    display_name = serializers.CharField()
    avatar = serializers.URLField(allow_null=True)
    score = serializers.IntegerField()
    metric = serializers.CharField()
    
    # Additional user info
    badges_count = serializers.SerializerMethodField()
    current_streak = serializers.SerializerMethodField()
    
    def get_badges_count(self, obj):
        """Get user's badge count."""
        try:
            user = User.objects.get(id=obj['user_id'])
            return user.earned_badges.count()
        except User.DoesNotExist:
            return 0
    
    def get_current_streak(self, obj):
        """Get user's current streak."""
        # Current streak field doesn't exist in UserProfile model
        # Return 0 as default value
        return 0


class LeaderboardSerializer(serializers.ModelSerializer):
    """Serializer for Leaderboard model."""
    
    leaderboard_type_display = serializers.CharField(
        source='get_leaderboard_type_display',
        read_only=True
    )
    entries = serializers.SerializerMethodField()
    user_rank = serializers.SerializerMethodField()
    total_participants = serializers.SerializerMethodField()
    
    class Meta:
        model = Leaderboard
        fields = [
            'id', 'name', 'leaderboard_type', 'leaderboard_type_display',
            'description', 'is_active', 'start_date', 'end_date',
            'student_class', 'last_updated', 'entries', 'user_rank',
            'total_participants'
        ]
        read_only_fields = ['id', 'last_updated']
    
    def get_entries(self, obj):
        """Get leaderboard entries."""
        limit = self.context.get('limit', 100)
        data = obj.get_leaderboard_data(limit)
        return LeaderboardEntrySerializer(data, many=True).data
    
    def get_user_rank(self, obj):
        """Get current user's rank in this leaderboard."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            data = obj.get_leaderboard_data(1000)  # Get more data to find user
            for entry in data:
                if str(entry['user_id']) == str(request.user.id):
                    return entry['rank']
        return None
    
    def get_total_participants(self, obj):
        """Get total number of participants in this leaderboard."""
        data = obj.get_leaderboard_data(10000)  # Get all data
        return len(data)


class LeaderboardCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating leaderboards."""
    
    class Meta:
        model = Leaderboard
        fields = [
            'name', 'leaderboard_type', 'description', 'is_active',
            'start_date', 'end_date', 'student_class'
        ]
    
    def validate(self, attrs):
        """Validate leaderboard data."""
        # Validate date range
        if attrs.get('start_date') and attrs.get('end_date'):
            if attrs['start_date'] >= attrs['end_date']:
                raise serializers.ValidationError(
                    "Start date must be before end date."
                )
        
        # Validate class-specific leaderboards
        if attrs['leaderboard_type'] == Leaderboard.LeaderboardType.CLASS_POINTS:
            if not attrs.get('student_class'):
                raise serializers.ValidationError(
                    "Class leaderboards require a student class."
                )
        
        return attrs


class AchievementSerializer(serializers.ModelSerializer):
    """Serializer for Achievement model."""
    
    user_username = serializers.CharField(source='user.username', read_only=True)
    achievement_type_display = serializers.CharField(
        source='get_achievement_type_display',
        read_only=True
    )
    
    class Meta:
        model = Achievement
        fields = [
            'id', 'user', 'user_username', 'achievement_type',
            'achievement_type_display', 'title', 'description',
            'points_awarded', 'achieved_at', 'reference_id', 'metadata'
        ]
        read_only_fields = ['id', 'user', 'achieved_at']


class GamificationSummarySerializer(serializers.Serializer):
    """Serializer for gamification system summary."""
    
    total_users = serializers.IntegerField()
    total_points_awarded = serializers.IntegerField()
    total_badges_earned = serializers.IntegerField()
    total_achievements = serializers.IntegerField()
    active_badges = serializers.IntegerField()
    active_leaderboards = serializers.IntegerField()
    
    # Top performers
    top_point_earners = LeaderboardEntrySerializer(many=True)
    most_active_users = serializers.SerializerMethodField()
    recent_badge_earners = UserBadgeSerializer(many=True)
    
    # System statistics
    points_by_type = serializers.DictField()
    badges_by_rarity = serializers.DictField()
    achievements_by_type = serializers.DictField()
    
    def get_most_active_users(self, obj):
        """Get most active users (by recent transactions)."""
        week_ago = timezone.now() - timezone.timedelta(days=7)
        active_users = User.objects.annotate(
            recent_transactions=Count(
                'point_transactions',
                filter=Q(point_transactions__created_at__gte=week_ago)
            )
        ).filter(recent_transactions__gt=0).order_by('-recent_transactions')[:10]
        
        return [{
            'user_id': str(user.id),
            'username': user.username,
            'display_name': user.get_full_name() or user.username,
            'transaction_count': user.recent_transactions
        } for user in active_users]


class BadgeProgressSerializer(serializers.Serializer):
    """Serializer for badge progress tracking."""
    
    badge = BadgeSerializer()
    is_earned = serializers.BooleanField()
    progress_percentage = serializers.FloatField()
    current_progress = serializers.DictField()
    required_progress = serializers.DictField()
    next_milestone = serializers.CharField(allow_null=True)
    
    def to_representation(self, instance):
        """Calculate progress for a badge."""
        badge = instance['badge']
        user = instance['user']
        
        # Check if already earned
        is_earned = UserBadge.objects.filter(user=user, badge=badge).exists()
        
        if is_earned:
            return {
                'badge': BadgeSerializer(badge).data,
                'is_earned': True,
                'progress_percentage': 100.0,
                'current_progress': {},
                'required_progress': {},
                'next_milestone': None
            }
        
        # Calculate progress based on criteria
        criteria = badge.criteria
        current_progress = {}
        progress_percentages = []
        
        # Check lessons completed
        if 'lessons_completed' in criteria:
            required = criteria['lessons_completed']
            current = user.lesson_completions.count()
            current_progress['lessons_completed'] = current
            progress_percentages.append(min(100, (current / required) * 100))
        
        # Check quizzes completed
        if 'quizzes_completed' in criteria:
            required = criteria['quizzes_completed']
            current = user.quiz_attempts.filter(is_completed=True).count()
            current_progress['quizzes_completed'] = current
            progress_percentages.append(min(100, (current / required) * 100))
        
        # Check challenges solved
        if 'challenges_solved' in criteria:
            required = criteria['challenges_solved']
            current = user.submissions.filter(
                status='accepted'
            ).values('challenge').distinct().count()
            current_progress['challenges_solved'] = current
            progress_percentages.append(min(100, (current / required) * 100))
        
        # Check streak days
        if 'streak_days' in criteria:
            required = criteria['streak_days']
            current = user.profile.current_streak
            current_progress['streak_days'] = current
            progress_percentages.append(min(100, (current / required) * 100))
        
        # Calculate overall progress
        overall_progress = sum(progress_percentages) / len(progress_percentages) if progress_percentages else 0
        
        # Determine next milestone
        next_milestone = None
        for key, required in criteria.items():
            current = current_progress.get(key, 0)
            if current < required:
                next_milestone = f"{key}: {current}/{required}"
                break
        
        return {
            'badge': BadgeSerializer(badge).data,
            'is_earned': False,
            'progress_percentage': round(overall_progress, 1),
            'current_progress': current_progress,
            'required_progress': criteria,
            'next_milestone': next_milestone
        }