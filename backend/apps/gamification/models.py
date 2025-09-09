from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.core.cache import cache
from django.db.models import Sum, Count, Q
import uuid

User = get_user_model()


class Badge(models.Model):
    """Model for achievement badges."""
    
    class BadgeType(models.TextChoices):
        ACHIEVEMENT = 'achievement', 'Achievement'
        MILESTONE = 'milestone', 'Milestone'
        SPECIAL = 'special', 'Special'
        SEASONAL = 'seasonal', 'Seasonal'
    
    class Rarity(models.TextChoices):
        COMMON = 'common', 'Common'
        UNCOMMON = 'uncommon', 'Uncommon'
        RARE = 'rare', 'Rare'
        EPIC = 'epic', 'Epic'
        LEGENDARY = 'legendary', 'Legendary'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    icon = models.CharField(
        max_length=100,
        help_text="Icon class or emoji for the badge"
    )
    badge_type = models.CharField(
        max_length=20,
        choices=BadgeType.choices,
        default=BadgeType.ACHIEVEMENT
    )
    rarity = models.CharField(
        max_length=20,
        choices=Rarity.choices,
        default=Rarity.COMMON
    )
    points_required = models.PositiveIntegerField(
        default=0,
        help_text="Minimum points required to earn this badge"
    )
    criteria = models.JSONField(
        default=dict,
        help_text="JSON object defining the criteria for earning this badge"
    )
    is_active = models.BooleanField(default=True)
    is_hidden = models.BooleanField(
        default=False,
        help_text="Hidden badges are not shown until earned"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Statistics
    earned_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'gamification_badge'
        ordering = ['rarity', 'name']
        indexes = [
            models.Index(fields=['badge_type']),
            models.Index(fields=['rarity']),
            models.Index(fields=['is_active']),
            models.Index(fields=['points_required']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_rarity_display()})"
    
    @property
    def rarity_color(self):
        """Return color associated with rarity."""
        colors = {
            self.Rarity.COMMON: '#9CA3AF',
            self.Rarity.UNCOMMON: '#10B981',
            self.Rarity.RARE: '#3B82F6',
            self.Rarity.EPIC: '#8B5CF6',
            self.Rarity.LEGENDARY: '#F59E0B',
        }
        return colors.get(self.rarity, '#9CA3AF')
    
    def check_criteria(self, user):
        """Check if user meets the criteria for this badge."""
        if not self.is_active:
            return False
        
        # Basic points check
        if user.profile.total_points < self.points_required:
            return False
        
        # Custom criteria checks
        criteria = self.criteria
        
        # Check lesson completion criteria
        if 'lessons_completed' in criteria:
            required = criteria['lessons_completed']
            completed = user.lesson_completions.count()
            if completed < required:
                return False
        
        # Check quiz completion criteria
        if 'quizzes_completed' in criteria:
            required = criteria['quizzes_completed']
            completed = user.quiz_attempts.filter(
                is_completed=True
            ).count()
            if completed < required:
                return False
        
        # Check challenge completion criteria
        if 'challenges_solved' in criteria:
            required = criteria['challenges_solved']
            solved = user.submissions.filter(
                status='accepted'
            ).values('challenge').distinct().count()
            if solved < required:
                return False
        
        # Check streak criteria
        if 'streak_days' in criteria:
            required = criteria['streak_days']
            if user.profile.current_streak < required:
                return False
        
        # Check specific difficulty criteria
        if 'difficulty_challenges' in criteria:
            for difficulty, count in criteria['difficulty_challenges'].items():
                solved = user.submissions.filter(
                    status='accepted',
                    challenge__difficulty_level=difficulty
                ).values('challenge').distinct().count()
                if solved < count:
                    return False
        
        return True
    
    def award_to_user(self, user):
        """Award this badge to a user if they don't already have it."""
        user_badge, created = UserBadge.objects.get_or_create(
            user=user,
            badge=self
        )
        
        if created:
            # Update badge statistics
            self.earned_count += 1
            self.save(update_fields=['earned_count'])
            
            # Award points for earning the badge
            PointTransaction.objects.create(
                user=user,
                points=self.points_required // 10,  # 10% of required points as bonus
                transaction_type=PointTransaction.TransactionType.BADGE_EARNED,
                description=f"Earned badge: {self.name}",
                reference_id=str(self.id)
            )
        
        return user_badge, created


class PointTransaction(models.Model):
    """Model for tracking point transactions."""
    
    class TransactionType(models.TextChoices):
        LESSON_COMPLETED = 'lesson_completed', 'Lesson Completed'
        QUIZ_COMPLETED = 'quiz_completed', 'Quiz Completed'
        CHALLENGE_SOLVED = 'challenge_solved', 'Challenge Solved'
        DAILY_LOGIN = 'daily_login', 'Daily Login'
        STREAK_BONUS = 'streak_bonus', 'Streak Bonus'
        BADGE_EARNED = 'badge_earned', 'Badge Earned'
        ADMIN_ADJUSTMENT = 'admin_adjustment', 'Admin Adjustment'
        REFERRAL_BONUS = 'referral_bonus', 'Referral Bonus'
        CONTEST_REWARD = 'contest_reward', 'Contest Reward'
        PENALTY = 'penalty', 'Penalty'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='point_transactions'
    )
    points = models.IntegerField(
        validators=[MinValueValidator(-10000), MaxValueValidator(10000)],
        help_text="Positive for earning points, negative for losing points"
    )
    transaction_type = models.CharField(
        max_length=30,
        choices=TransactionType.choices
    )
    description = models.CharField(max_length=255)
    reference_id = models.CharField(
        max_length=100,
        blank=True,
        help_text="ID of the related object (lesson, quiz, challenge, etc.)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Metadata
    metadata = models.JSONField(
        default=dict,
        help_text="Additional data related to the transaction"
    )
    
    class Meta:
        db_table = 'gamification_point_transaction'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['transaction_type']),
            models.Index(fields=['reference_id']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        sign = '+' if self.points >= 0 else ''
        return f"{self.user.email}: {sign}{self.points} pts - {self.description}"
    
    def save(self, *args, **kwargs):
        """Update user's total points when transaction is saved."""
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            # Update user's total points
            self.user.profile.update_total_points()
            
            # Check for new badges
            self.check_badge_eligibility()
    
    def check_badge_eligibility(self):
        """Check if user is eligible for any new badges after this transaction."""
        from .tasks import check_user_badges  # Avoid circular import
        
        # Queue badge check (in a real app, this would be a Celery task)
        # For now, we'll do it synchronously
        badges = Badge.objects.filter(is_active=True)
        for badge in badges:
            if badge.check_criteria(self.user):
                badge.award_to_user(self.user)


class UserBadge(models.Model):
    """Model for tracking badges earned by users."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='earned_badges'
    )
    badge = models.ForeignKey(
        Badge,
        on_delete=models.CASCADE,
        related_name='user_badges'
    )
    earned_at = models.DateTimeField(auto_now_add=True)
    is_displayed = models.BooleanField(
        default=True,
        help_text="Whether this badge is displayed on user's profile"
    )
    
    class Meta:
        db_table = 'gamification_user_badge'
        unique_together = ['user', 'badge']
        ordering = ['-earned_at']
        indexes = [
            models.Index(fields=['user', '-earned_at']),
            models.Index(fields=['badge']),
            models.Index(fields=['is_displayed']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.badge.name}"


class Leaderboard(models.Model):
    """Model for different types of leaderboards."""
    
    class LeaderboardType(models.TextChoices):
        GLOBAL_POINTS = 'global_points', 'Global Points'
        WEEKLY_POINTS = 'weekly_points', 'Weekly Points'
        MONTHLY_POINTS = 'monthly_points', 'Monthly Points'
        CHALLENGES_SOLVED = 'challenges_solved', 'Challenges Solved'
        LESSONS_COMPLETED = 'lessons_completed', 'Lessons Completed'
        CURRENT_STREAK = 'current_streak', 'Current Streak'
        CLASS_POINTS = 'class_points', 'Class Points'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    leaderboard_type = models.CharField(
        max_length=30,
        choices=LeaderboardType.choices
    )
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    # Time-based leaderboards
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    
    # Class-specific leaderboards
    student_class = models.ForeignKey(
        'users.StudentClass',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='leaderboards'
    )
    
    # Cached data
    cached_data = models.JSONField(
        default=dict,
        help_text="Cached leaderboard data for performance"
    )
    last_updated = models.DateTimeField(auto_now=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'gamification_leaderboard'
        ordering = ['name']
        indexes = [
            models.Index(fields=['leaderboard_type']),
            models.Index(fields=['is_active']),
            models.Index(fields=['start_date', 'end_date']),
            models.Index(fields=['student_class']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_leaderboard_type_display()})"
    
    def get_leaderboard_data(self, limit=100):
        """Get current leaderboard data."""
        cache_key = f'leaderboard:{self.id}'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return cached_data
        
        # Generate leaderboard data based on type
        data = self._generate_leaderboard_data(limit)
        
        # Cache for 5 minutes
        cache.set(cache_key, data, 300)
        
        # Update cached data in model
        self.cached_data = data
        self.save(update_fields=['cached_data', 'last_updated'])
        
        return data
    
    def _generate_leaderboard_data(self, limit):
        """Generate leaderboard data based on type."""
        base_queryset = User.objects.filter(is_active=True)
        
        # Filter by class if specified
        if self.student_class:
            base_queryset = base_queryset.filter(
                student_enrollments__student_class=self.student_class
            )
        
        # Filter by date range if specified
        if self.start_date and self.end_date:
            date_filter = Q(
                point_transactions__created_at__gte=self.start_date,
                point_transactions__created_at__lte=self.end_date
            )
        else:
            date_filter = Q()
        
        if self.leaderboard_type == self.LeaderboardType.GLOBAL_POINTS:
            users = base_queryset.order_by('-profile__total_points')[:limit]
            data = [{
                'rank': i + 1,
                'user_id': str(user.id),
                'username': user.username,
                'display_name': user.get_full_name() or user.username,
                'avatar': getattr(user.profile, 'avatar', None),
                'score': user.profile.total_points,
                'metric': 'points'
            } for i, user in enumerate(users)]
        
        elif self.leaderboard_type == self.LeaderboardType.WEEKLY_POINTS:
            week_ago = timezone.now() - timezone.timedelta(days=7)
            users = base_queryset.annotate(
                weekly_points=Sum(
                    'point_transactions__points',
                    filter=Q(point_transactions__created_at__gte=week_ago)
                )
            ).order_by('-weekly_points')[:limit]
            
            data = [{
                'rank': i + 1,
                'user_id': str(user.id),
                'username': user.username,
                'display_name': user.get_full_name() or user.username,
                'avatar': getattr(user.profile, 'avatar', None),
                'score': user.weekly_points or 0,
                'metric': 'weekly_points'
            } for i, user in enumerate(users) if user.weekly_points]
        
        elif self.leaderboard_type == self.LeaderboardType.MONTHLY_POINTS:
            month_ago = timezone.now() - timezone.timedelta(days=30)
            users = base_queryset.annotate(
                monthly_points=Sum(
                    'point_transactions__points',
                    filter=Q(point_transactions__created_at__gte=month_ago)
                )
            ).order_by('-monthly_points')[:limit]
            
            data = [{
                'rank': i + 1,
                'user_id': str(user.id),
                'username': user.username,
                'display_name': user.get_full_name() or user.username,
                'avatar': getattr(user.profile, 'avatar', None),
                'score': user.monthly_points or 0,
                'metric': 'monthly_points'
            } for i, user in enumerate(users) if user.monthly_points]
        
        elif self.leaderboard_type == self.LeaderboardType.CHALLENGES_SOLVED:
            users = base_queryset.annotate(
                challenges_solved=Count(
                    'submissions__challenge',
                    filter=Q(submissions__status='accepted'),
                    distinct=True
                )
            ).order_by('-challenges_solved')[:limit]
            
            data = [{
                'rank': i + 1,
                'user_id': str(user.id),
                'username': user.username,
                'display_name': user.get_full_name() or user.username,
                'avatar': getattr(user.profile, 'avatar', None),
                'score': user.challenges_solved,
                'metric': 'challenges_solved'
            } for i, user in enumerate(users) if user.challenges_solved > 0]
        
        elif self.leaderboard_type == self.LeaderboardType.LESSONS_COMPLETED:
            users = base_queryset.annotate(
                lessons_completed=Count('lesson_completions')
            ).order_by('-lessons_completed')[:limit]
            
            data = [{
                'rank': i + 1,
                'user_id': str(user.id),
                'username': user.username,
                'display_name': user.get_full_name() or user.username,
                'avatar': getattr(user.profile, 'avatar', None),
                'score': user.lessons_completed,
                'metric': 'lessons_completed'
            } for i, user in enumerate(users) if user.lessons_completed > 0]
        
        elif self.leaderboard_type == self.LeaderboardType.CURRENT_STREAK:
            users = base_queryset.order_by('-profile__current_streak')[:limit]
            data = [{
                'rank': i + 1,
                'user_id': str(user.id),
                'username': user.username,
                'display_name': user.get_full_name() or user.username,
                'avatar': getattr(user.profile, 'avatar', None),
                'score': user.profile.current_streak,
                'metric': 'current_streak'
            } for i, user in enumerate(users) if user.profile.current_streak > 0]
        
        else:
            data = []
        
        return data
    
    def refresh_cache(self):
        """Force refresh of leaderboard cache."""
        cache_key = f'leaderboard:{self.id}'
        cache.delete(cache_key)
        return self.get_leaderboard_data()


class Achievement(models.Model):
    """Model for tracking user achievements and milestones."""
    
    class AchievementType(models.TextChoices):
        FIRST_LESSON = 'first_lesson', 'First Lesson Completed'
        FIRST_QUIZ = 'first_quiz', 'First Quiz Completed'
        FIRST_CHALLENGE = 'first_challenge', 'First Challenge Solved'
        STREAK_MILESTONE = 'streak_milestone', 'Streak Milestone'
        POINTS_MILESTONE = 'points_milestone', 'Points Milestone'
        PERFECT_QUIZ = 'perfect_quiz', 'Perfect Quiz Score'
        SPEED_DEMON = 'speed_demon', 'Fast Challenge Solver'
        HELPING_HAND = 'helping_hand', 'Helped Other Students'
        EARLY_BIRD = 'early_bird', 'Early Morning Learner'
        NIGHT_OWL = 'night_owl', 'Late Night Learner'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='achievements'
    )
    achievement_type = models.CharField(
        max_length=30,
        choices=AchievementType.choices
    )
    title = models.CharField(max_length=100)
    description = models.TextField()
    points_awarded = models.PositiveIntegerField(default=0)
    achieved_at = models.DateTimeField(auto_now_add=True)
    
    # Reference to related object
    reference_id = models.CharField(max_length=100, blank=True)
    metadata = models.JSONField(default=dict)
    
    class Meta:
        db_table = 'gamification_achievement'
        unique_together = ['user', 'achievement_type', 'reference_id']
        ordering = ['-achieved_at']
        indexes = [
            models.Index(fields=['user', '-achieved_at']),
            models.Index(fields=['achievement_type']),
            models.Index(fields=['achieved_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"
    
    def save(self, *args, **kwargs):
        """Award points when achievement is saved."""
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new and self.points_awarded > 0:
            PointTransaction.objects.create(
                user=self.user,
                points=self.points_awarded,
                transaction_type=PointTransaction.TransactionType.BADGE_EARNED,
                description=f"Achievement: {self.title}",
                reference_id=str(self.id)
            )