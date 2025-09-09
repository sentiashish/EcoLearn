from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.cache import cache
from .models import (
    PointTransaction, Badge, UserBadge, Achievement, Leaderboard
)

User = get_user_model()


@receiver(post_save, sender='content.LessonCompletion')
def award_lesson_completion_points(sender, instance, created, **kwargs):
    """Award points when a lesson is completed."""
    if created:
        # Base points for lesson completion
        base_points = 10
        
        # Bonus points based on lesson difficulty
        difficulty_bonus = {
            'beginner': 0,
            'intermediate': 5,
            'advanced': 10,
            'expert': 15
        }
        
        lesson_difficulty = getattr(instance.lesson, 'difficulty_level', 'beginner')
        bonus = difficulty_bonus.get(lesson_difficulty, 0)
        total_points = base_points + bonus
        
        # Create point transaction
        PointTransaction.objects.create(
            user=instance.user,
            points=total_points,
            transaction_type=PointTransaction.TransactionType.LESSON_COMPLETED,
            description=f"Completed lesson: {instance.lesson.title}",
            reference_id=str(instance.lesson.id),
            metadata={
                'lesson_title': instance.lesson.title,
                'difficulty': lesson_difficulty,
                'base_points': base_points,
                'bonus_points': bonus
            }
        )
        
        # Check for first lesson achievement
        if not Achievement.objects.filter(
            user=instance.user,
            achievement_type=Achievement.AchievementType.FIRST_LESSON
        ).exists():
            Achievement.objects.create(
                user=instance.user,
                achievement_type=Achievement.AchievementType.FIRST_LESSON,
                title="First Steps",
                description="Completed your first lesson!",
                points_awarded=25,
                reference_id=str(instance.lesson.id)
            )


@receiver(post_save, sender='content.QuizAttempt')
def award_quiz_completion_points(sender, instance, created, **kwargs):
    """Award points when a quiz is completed."""
    if instance.is_completed and instance.score is not None:
        # Check if we already awarded points for this attempt
        existing_transaction = PointTransaction.objects.filter(
            user=instance.user,
            transaction_type=PointTransaction.TransactionType.QUIZ_COMPLETED,
            reference_id=str(instance.id)
        ).exists()
        
        if not existing_transaction:
            # Base points based on score percentage
            base_points = max(5, int(instance.score * 0.2))  # 20% of score as points
            
            # Perfect score bonus
            perfect_bonus = 10 if instance.score >= 100 else 0
            
            # Quiz difficulty bonus
            difficulty_bonus = {
                'beginner': 0,
                'intermediate': 5,
                'advanced': 10,
                'expert': 15
            }
            
            quiz_difficulty = getattr(instance.quiz, 'difficulty_level', 'beginner')
            bonus = difficulty_bonus.get(quiz_difficulty, 0)
            total_points = base_points + perfect_bonus + bonus
            
            # Create point transaction
            PointTransaction.objects.create(
                user=instance.user,
                points=total_points,
                transaction_type=PointTransaction.TransactionType.QUIZ_COMPLETED,
                description=f"Completed quiz: {instance.quiz.title} ({instance.score}%)",
                reference_id=str(instance.id),
                metadata={
                    'quiz_title': instance.quiz.title,
                    'score': instance.score,
                    'difficulty': quiz_difficulty,
                    'base_points': base_points,
                    'perfect_bonus': perfect_bonus,
                    'difficulty_bonus': bonus
                }
            )
            
            # Check for first quiz achievement
            if not Achievement.objects.filter(
                user=instance.user,
                achievement_type=Achievement.AchievementType.FIRST_QUIZ
            ).exists():
                Achievement.objects.create(
                    user=instance.user,
                    achievement_type=Achievement.AchievementType.FIRST_QUIZ,
                    title="Quiz Master",
                    description="Completed your first quiz!",
                    points_awarded=25,
                    reference_id=str(instance.quiz.id)
                )
            
            # Check for perfect quiz achievement
            if instance.score >= 100:
                perfect_count = Achievement.objects.filter(
                    user=instance.user,
                    achievement_type=Achievement.AchievementType.PERFECT_QUIZ
                ).count()
                
                if perfect_count < 5:  # Award up to 5 perfect quiz achievements
                    Achievement.objects.create(
                        user=instance.user,
                        achievement_type=Achievement.AchievementType.PERFECT_QUIZ,
                        title=f"Perfect Score #{perfect_count + 1}",
                        description=f"Achieved a perfect score on {instance.quiz.title}!",
                        points_awarded=15,
                        reference_id=str(instance.id)
                    )


@receiver(post_save, sender='challenges.Submission')
def award_challenge_points(sender, instance, created, **kwargs):
    """Award points when a challenge is solved."""
    if instance.status == 'accepted':
        # Check if we already awarded points for this challenge
        existing_transaction = PointTransaction.objects.filter(
            user=instance.user,
            transaction_type=PointTransaction.TransactionType.CHALLENGE_SOLVED,
            reference_id=str(instance.challenge.id)
        ).exists()
        
        if not existing_transaction:
            # Points based on challenge difficulty
            difficulty_points = {
                'beginner': 20,
                'intermediate': 35,
                'advanced': 50,
                'expert': 75
            }
            
            challenge_difficulty = instance.challenge.difficulty_level
            base_points = difficulty_points.get(challenge_difficulty, 20)
            
            # Bonus for optimal solution (based on execution time and memory)
            performance_bonus = 0
            if hasattr(instance, 'execution_time') and instance.execution_time:
                # Award bonus for fast solutions (implementation depends on challenge)
                if instance.execution_time < 1000:  # Less than 1 second
                    performance_bonus += 5
            
            total_points = base_points + performance_bonus
            
            # Create point transaction
            PointTransaction.objects.create(
                user=instance.user,
                points=total_points,
                transaction_type=PointTransaction.TransactionType.CHALLENGE_SOLVED,
                description=f"Solved challenge: {instance.challenge.title}",
                reference_id=str(instance.challenge.id),
                metadata={
                    'challenge_title': instance.challenge.title,
                    'difficulty': challenge_difficulty,
                    'base_points': base_points,
                    'performance_bonus': performance_bonus,
                    'execution_time': getattr(instance, 'execution_time', None)
                }
            )
            
            # Check for first challenge achievement
            if not Achievement.objects.filter(
                user=instance.user,
                achievement_type=Achievement.AchievementType.FIRST_CHALLENGE
            ).exists():
                Achievement.objects.create(
                    user=instance.user,
                    achievement_type=Achievement.AchievementType.FIRST_CHALLENGE,
                    title="Problem Solver",
                    description="Solved your first coding challenge!",
                    points_awarded=50,
                    reference_id=str(instance.challenge.id)
                )
            
            # Check for speed demon achievement
            if (hasattr(instance, 'execution_time') and 
                instance.execution_time and 
                instance.execution_time < 500):  # Very fast solution
                
                speed_count = Achievement.objects.filter(
                    user=instance.user,
                    achievement_type=Achievement.AchievementType.SPEED_DEMON
                ).count()
                
                if speed_count < 3:  # Award up to 3 speed achievements
                    Achievement.objects.create(
                        user=instance.user,
                        achievement_type=Achievement.AchievementType.SPEED_DEMON,
                        title=f"Speed Demon #{speed_count + 1}",
                        description=f"Lightning-fast solution in {instance.execution_time}ms!",
                        points_awarded=20,
                        reference_id=str(instance.id),
                        metadata={'execution_time': instance.execution_time}
                    )


@receiver(post_save, sender=PointTransaction)
def check_point_milestones(sender, instance, created, **kwargs):
    """Check for point milestone achievements."""
    if created and instance.points > 0:
        user = instance.user
        total_points = user.profile.total_points
        
        # Define point milestones
        milestones = [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000]
        
        for milestone in milestones:
            if total_points >= milestone:
                # Check if user already has this milestone
                if not Achievement.objects.filter(
                    user=user,
                    achievement_type=Achievement.AchievementType.POINTS_MILESTONE,
                    reference_id=str(milestone)
                ).exists():
                    Achievement.objects.create(
                        user=user,
                        achievement_type=Achievement.AchievementType.POINTS_MILESTONE,
                        title=f"{milestone:,} Points Milestone",
                        description=f"Reached {milestone:,} total points!",
                        points_awarded=milestone // 10,  # 10% bonus
                        reference_id=str(milestone),
                        metadata={'milestone': milestone}
                    )


@receiver(post_save, sender='users.UserProfile')
def check_streak_milestones(sender, instance, created, **kwargs):
    """Check for streak milestone achievements."""
    if not created and instance.streak_days > 0:
        user = instance.user
        streak = instance.streak_days
        
        # Define streak milestones
        milestones = [3, 7, 14, 30, 60, 100, 365]
        
        for milestone in milestones:
            if streak >= milestone:
                # Check if user already has this milestone
                if not Achievement.objects.filter(
                    user=user,
                    achievement_type=Achievement.AchievementType.STREAK_MILESTONE,
                    reference_id=str(milestone)
                ).exists():
                    Achievement.objects.create(
                        user=user,
                        achievement_type=Achievement.AchievementType.STREAK_MILESTONE,
                        title=f"{milestone} Day Streak",
                        description=f"Maintained a {milestone}-day learning streak!",
                        points_awarded=milestone * 2,  # 2 points per day
                        reference_id=str(milestone),
                        metadata={'streak_days': milestone}
                    )


@receiver(post_save, sender=PointTransaction)
def update_leaderboard_cache(sender, instance, created, **kwargs):
    """Invalidate leaderboard caches when points change."""
    if created:
        # Clear relevant leaderboard caches
        cache_patterns = [
            'leaderboard:*',
            f'user_rank:{instance.user.id}:*'
        ]
        
        # In a real implementation, you'd use cache.delete_pattern
        # For now, we'll clear specific known caches
        leaderboards = Leaderboard.objects.filter(is_active=True)
        for leaderboard in leaderboards:
            cache_key = f'leaderboard:{leaderboard.id}'
            cache.delete(cache_key)


@receiver(post_save, sender=UserBadge)
def badge_earned_notification(sender, instance, created, **kwargs):
    """Send notification when a badge is earned."""
    if created:
        # TODO: Implement notification system
        # This could send email, push notification, or in-app notification
        pass


@receiver(post_save, sender=Achievement)
def achievement_earned_notification(sender, instance, created, **kwargs):
    """Send notification when an achievement is earned."""
    if created:
        # TODO: Implement notification system
        # This could send email, push notification, or in-app notification
        pass


@receiver(post_save, sender=PointTransaction)
def check_badge_eligibility(sender, instance, created, **kwargs):
    """Check if user is eligible for new badges after earning points."""
    if created and instance.points > 0:
        user = instance.user
        
        # Get all active badges that user doesn't have
        earned_badge_ids = user.earned_badges.values_list('badge_id', flat=True)
        available_badges = Badge.objects.filter(
            is_active=True
        ).exclude(id__in=earned_badge_ids)
        
        # Check each badge's criteria
        for badge in available_badges:
            if badge.check_criteria(user):
                badge.award_to_user(user)


@receiver(post_save, sender=User)
def create_daily_login_points(sender, instance, created, **kwargs):
    """Award daily login points."""
    if not created and instance.last_login:
        # Check if user already got daily login points today
        today = timezone.now().date()
        existing_transaction = PointTransaction.objects.filter(
            user=instance,
            transaction_type=PointTransaction.TransactionType.DAILY_LOGIN,
            created_at__date=today
        ).exists()
        
        if not existing_transaction:
            # Award daily login points
            PointTransaction.objects.create(
                user=instance,
                points=5,
                transaction_type=PointTransaction.TransactionType.DAILY_LOGIN,
                description="Daily login bonus",
                metadata={'login_date': today.isoformat()}
            )
            
            # Check for early bird or night owl achievements
            current_hour = timezone.now().hour
            
            if 5 <= current_hour <= 8:  # Early morning (5 AM - 8 AM)
                early_bird_count = Achievement.objects.filter(
                    user=instance,
                    achievement_type=Achievement.AchievementType.EARLY_BIRD
                ).count()
                
                if early_bird_count < 10:  # Award up to 10 early bird achievements
                    Achievement.objects.create(
                        user=instance,
                        achievement_type=Achievement.AchievementType.EARLY_BIRD,
                        title=f"Early Bird #{early_bird_count + 1}",
                        description=f"Logged in early at {current_hour}:00!",
                        points_awarded=10,
                        metadata={'login_hour': current_hour}
                    )
            
            elif 22 <= current_hour <= 23 or 0 <= current_hour <= 2:  # Late night
                night_owl_count = Achievement.objects.filter(
                    user=instance,
                    achievement_type=Achievement.AchievementType.NIGHT_OWL
                ).count()
                
                if night_owl_count < 10:  # Award up to 10 night owl achievements
                    Achievement.objects.create(
                        user=instance,
                        achievement_type=Achievement.AchievementType.NIGHT_OWL,
                        title=f"Night Owl #{night_owl_count + 1}",
                        description=f"Logged in late at {current_hour}:00!",
                        points_awarded=10,
                        metadata={'login_hour': current_hour}
                    )


# Helper function to create default badges
def create_default_badges():
    """Create default badges for the system."""
    default_badges = [
        {
            'name': 'First Steps',
            'description': 'Complete your first lesson',
            'icon': '🎯',
            'badge_type': Badge.BadgeType.ACHIEVEMENT,
            'rarity': Badge.Rarity.COMMON,
            'points_required': 0,
            'criteria': {'lessons_completed': 1}
        },
        {
            'name': 'Quiz Master',
            'description': 'Complete 10 quizzes',
            'icon': '🧠',
            'badge_type': Badge.BadgeType.ACHIEVEMENT,
            'rarity': Badge.Rarity.UNCOMMON,
            'points_required': 100,
            'criteria': {'quizzes_completed': 10}
        },
        {
            'name': 'Problem Solver',
            'description': 'Solve your first coding challenge',
            'icon': '💡',
            'badge_type': Badge.BadgeType.ACHIEVEMENT,
            'rarity': Badge.Rarity.COMMON,
            'points_required': 0,
            'criteria': {'challenges_solved': 1}
        },
        {
            'name': 'Streak Warrior',
            'description': 'Maintain a 7-day learning streak',
            'icon': '🔥',
            'badge_type': Badge.BadgeType.MILESTONE,
            'rarity': Badge.Rarity.RARE,
            'points_required': 50,
            'criteria': {'streak_days': 7}
        },
        {
            'name': 'Point Collector',
            'description': 'Earn 1000 total points',
            'icon': '💎',
            'badge_type': Badge.BadgeType.MILESTONE,
            'rarity': Badge.Rarity.EPIC,
            'points_required': 1000,
            'criteria': {}
        },
        {
            'name': 'Challenge Champion',
            'description': 'Solve 50 coding challenges',
            'icon': '🏆',
            'badge_type': Badge.BadgeType.ACHIEVEMENT,
            'rarity': Badge.Rarity.LEGENDARY,
            'points_required': 500,
            'criteria': {'challenges_solved': 50}
        },
        {
            'name': 'Perfectionist',
            'description': 'Get perfect scores on 5 quizzes',
            'icon': '⭐',
            'badge_type': Badge.BadgeType.ACHIEVEMENT,
            'rarity': Badge.Rarity.EPIC,
            'points_required': 200,
            'criteria': {'perfect_quizzes': 5}
        },
        {
            'name': 'Speed Demon',
            'description': 'Solve challenges with lightning speed',
            'icon': '⚡',
            'badge_type': Badge.BadgeType.SPECIAL,
            'rarity': Badge.Rarity.RARE,
            'points_required': 100,
            'criteria': {'fast_solutions': 3}
        }
    ]
    
    for badge_data in default_badges:
        Badge.objects.get_or_create(
            name=badge_data['name'],
            defaults=badge_data
        )