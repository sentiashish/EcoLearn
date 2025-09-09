from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Avg, Count
from django.contrib.auth import get_user_model
from .models import Challenge, Submission, ChallengeRating

User = get_user_model()


@receiver(post_save, sender=Submission)
def update_challenge_statistics(sender, instance, created, **kwargs):
    """Update challenge statistics when a submission is saved."""
    if created or instance.status != Submission.Status.PENDING:
        challenge = instance.challenge
        
        # Update submission count
        challenge.submission_count = challenge.submissions.count()
        
        # Update solved count (accepted submissions)
        challenge.solved_count = challenge.submissions.filter(
            status=Submission.Status.ACCEPTED
        ).count()
        
        challenge.save(update_fields=['submission_count', 'solved_count'])


@receiver(post_save, sender=Submission)
def award_points_for_submission(sender, instance, created, **kwargs):
    """Award points and XP to user for successful submissions."""
    if not created and instance.is_accepted:
        user = instance.user
        
        # Check if this is the first accepted submission for this challenge
        previous_accepted = Submission.objects.filter(
            challenge=instance.challenge,
            user=user,
            status=Submission.Status.ACCEPTED,
            submitted_at__lt=instance.submitted_at
        ).exists()
        
        if not previous_accepted:
            # Award points and XP only for first successful submission
            user.userprofile.total_points += instance.points_earned
            user.userprofile.total_xp += instance.xp_earned
            user.userprofile.challenges_solved += 1
            
            user.userprofile.save(update_fields=[
                'total_points', 'total_xp', 'challenges_solved'
            ])


@receiver(post_save, sender=ChallengeRating)
def update_challenge_rating(sender, instance, created, **kwargs):
    """Update challenge average rating when a rating is saved."""
    challenge = instance.challenge
    
    # Calculate new average rating
    avg_rating = challenge.ratings.aggregate(
        avg_rating=Avg('rating')
    )['avg_rating']
    
    challenge.average_rating = round(avg_rating, 2) if avg_rating else None
    challenge.save(update_fields=['average_rating'])


@receiver(post_delete, sender=ChallengeRating)
def update_challenge_rating_on_delete(sender, instance, **kwargs):
    """Update challenge average rating when a rating is deleted."""
    challenge = instance.challenge
    
    # Calculate new average rating
    avg_rating = challenge.ratings.aggregate(
        avg_rating=Avg('rating')
    )['avg_rating']
    
    challenge.average_rating = round(avg_rating, 2) if avg_rating else None
    challenge.save(update_fields=['average_rating'])


@receiver(post_save, sender=Submission)
def update_user_statistics(sender, instance, created, **kwargs):
    """Update user statistics when a submission is saved."""
    if created:
        user = instance.user
        profile = user.profile
        
        # Note: UserProfile model doesn't have submission tracking fields
        # This signal is kept for future extension when those fields are added
        pass


@receiver(post_save, sender=Challenge)
def update_author_statistics(sender, instance, created, **kwargs):
    """Update author statistics when a challenge is created or published."""
    if created or (instance.status == Challenge.Status.PUBLISHED):
        author = instance.author
        
        if hasattr(author, 'teacher_profile'):
            teacher_profile = author.teacher_profile
            
            # Note: TeacherProfile model doesn't have challenge tracking fields
            # This signal is kept for future extension when those fields are added
            pass


@receiver(post_save, sender=Submission)
def create_point_transaction(sender, instance, created, **kwargs):
    """Create point transaction record for successful submissions."""
    if not created and instance.is_accepted and instance.points_earned > 0:
        # Import here to avoid circular imports
        from apps.gamification.models import PointTransaction
        
        # Check if transaction already exists
        existing_transaction = PointTransaction.objects.filter(
            user=instance.user,
            source_type='challenge_submission',
            source_id=instance.id
        ).exists()
        
        if not existing_transaction:
            PointTransaction.objects.create(
                user=instance.user,
                points=instance.points_earned,
                transaction_type=PointTransaction.TransactionType.EARNED,
                source_type='challenge_submission',
                source_id=instance.id,
                description=f'Solved challenge: {instance.challenge.title}'
            )


@receiver(post_save, sender=Submission)
def check_badge_eligibility(sender, instance, created, **kwargs):
    """Check if user is eligible for badges after submission."""
    if not created and instance.is_accepted:
        user = instance.user
        
        # Import here to avoid circular imports
        try:
            from apps.gamification.models import Badge, UserBadge
            
            # Check for "First Challenge" badge
            if user.userprofile.challenges_solved == 1:
                first_challenge_badge = Badge.objects.filter(
                    slug='first-challenge'
                ).first()
                
                if first_challenge_badge:
                    UserBadge.objects.get_or_create(
                        user=user,
                        badge=first_challenge_badge
                    )
            
            # Check for milestone badges (10, 50, 100 challenges)
            milestones = [10, 50, 100, 250, 500]
            for milestone in milestones:
                if user.userprofile.challenges_solved == milestone:
                    badge_slug = f'challenges-{milestone}'
                    milestone_badge = Badge.objects.filter(
                        slug=badge_slug
                    ).first()
                    
                    if milestone_badge:
                        UserBadge.objects.get_or_create(
                            user=user,
                            badge=milestone_badge
                        )
            
            # Check for difficulty-specific badges
            difficulty_counts = {
                Challenge.DifficultyLevel.BEGINNER: 0,
                Challenge.DifficultyLevel.INTERMEDIATE: 0,
                Challenge.DifficultyLevel.ADVANCED: 0,
                Challenge.DifficultyLevel.EXPERT: 0,
            }
            
            # Count solved challenges by difficulty
            for submission in user.submissions.filter(
                status=Submission.Status.ACCEPTED
            ).select_related('challenge'):
                difficulty = submission.challenge.difficulty_level
                if difficulty in difficulty_counts:
                    difficulty_counts[difficulty] += 1
            
            # Award difficulty badges
            for difficulty, count in difficulty_counts.items():
                if count >= 10:  # 10 challenges of same difficulty
                    badge_slug = f'{difficulty}-master'
                    difficulty_badge = Badge.objects.filter(
                        slug=badge_slug
                    ).first()
                    
                    if difficulty_badge:
                        UserBadge.objects.get_or_create(
                            user=user,
                            badge=difficulty_badge
                        )
        
        except ImportError:
            # Gamification app not available yet
            pass


@receiver(post_save, sender=Submission)
def update_leaderboard_cache(sender, instance, created, **kwargs):
    """Update leaderboard cache when submission status changes."""
    if not created and instance.status != Submission.Status.PENDING:
        # Import here to avoid circular imports
        from django.core.cache import cache
        
        # Clear relevant cache keys
        cache_keys = [
            'leaderboard:global',
            f'leaderboard:challenge:{instance.challenge.id}',
            f'leaderboard:user:{instance.user.id}',
        ]
        
        for key in cache_keys:
            cache.delete(key)