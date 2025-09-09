from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from .models import (
    LessonCompletion, QuizAttempt, UserAnswer,
    Question, Answer, ContentRating
)


@receiver(post_save, sender=LessonCompletion)
def award_lesson_completion_points(sender, instance, created, **kwargs):
    """Award points when a lesson is completed."""
    if created:
        from apps.gamification.models import PointTransaction
        
        # Award points for lesson completion
        PointTransaction.objects.create(
            user=instance.user,
            points=instance.lesson.points_reward,
            transaction_type=PointTransaction.TransactionType.LESSON_COMPLETION,
            description=f"Completed lesson: {instance.lesson.title}",
            related_lesson=instance.lesson
        )
        
        # Update user's streak if applicable
        profile = instance.user.profile
        today = timezone.now().date()
        
        if profile.last_activity_date != today:
            if profile.last_activity_date == today - timezone.timedelta(days=1):
                profile.streak_days += 1
            else:
                profile.streak_days = 1
            
            profile.last_activity_date = today
            profile.save()


@receiver(post_save, sender=QuizAttempt)
def handle_quiz_completion(sender, instance, created, **kwargs):
    """Handle quiz completion - award points and update progress."""
    if created and instance.completed_at:
        from apps.gamification.models import PointTransaction
        
        # Award points based on performance
        base_points = instance.quiz.points_reward
        
        # Bonus points for high scores
        if instance.score >= 90:
            bonus_multiplier = 1.5
        elif instance.score >= 80:
            bonus_multiplier = 1.2
        else:
            bonus_multiplier = 1.0
        
        # Bonus for first attempt
        if instance.attempt_number == 1:
            bonus_multiplier += 0.1
        
        total_points = int(base_points * bonus_multiplier)
        
        # Create point transaction
        PointTransaction.objects.create(
            user=instance.user,
            points=total_points,
            transaction_type=PointTransaction.TransactionType.QUIZ_COMPLETION,
            description=f"Quiz: {instance.quiz.title} (Score: {instance.score}%)",
            related_quiz=instance.quiz
        )
        
        # Award bonus points for passing
        if instance.is_passed:
            PointTransaction.objects.create(
                user=instance.user,
                points=10,
                transaction_type=PointTransaction.TransactionType.QUIZ_PASSED,
                description=f"Passed quiz: {instance.quiz.title}",
                related_quiz=instance.quiz
            )


@receiver(pre_save, sender=QuizAttempt)
def set_quiz_attempt_completion(sender, instance, **kwargs):
    """Set completion time when quiz is finished."""
    if instance.completed_at is None and instance.score is not None:
        instance.completed_at = timezone.now()


@receiver(post_save, sender=UserAnswer)
def calculate_answer_correctness(sender, instance, created, **kwargs):
    """Calculate if the user answer is correct and award points."""
    if created:
        question = instance.question
        
        # Check correctness based on question type
        if question.question_type == Question.QuestionType.MULTIPLE_CHOICE:
            if instance.selected_answer:
                instance.is_correct = instance.selected_answer.is_correct
                if instance.is_correct:
                    instance.points_earned = question.points
        
        elif question.question_type == Question.QuestionType.TRUE_FALSE:
            if instance.selected_answer:
                instance.is_correct = instance.selected_answer.is_correct
                if instance.is_correct:
                    instance.points_earned = question.points
        
        elif question.question_type in [
            Question.QuestionType.SHORT_ANSWER,
            Question.QuestionType.FILL_BLANK
        ]:
            # For text answers, check against correct answers
            correct_answers = question.answers.filter(is_correct=True)
            user_answer_lower = instance.text_answer.lower().strip()
            
            for correct_answer in correct_answers:
                if user_answer_lower == correct_answer.answer_text.lower().strip():
                    instance.is_correct = True
                    instance.points_earned = question.points
                    break
        
        # Save the updated instance
        if instance.pk:
            UserAnswer.objects.filter(pk=instance.pk).update(
                is_correct=instance.is_correct,
                points_earned=instance.points_earned
            )


@receiver(post_save, sender=ContentRating)
def update_content_rating_cache(sender, instance, created, **kwargs):
    """Update cached rating values when a new rating is added."""
    # This could trigger a cache update or recalculation
    # For now, we'll just pass as the property methods handle calculation
    pass


@receiver(post_save, sender=Question)
def ensure_question_has_correct_answer(sender, instance, created, **kwargs):
    """Ensure multiple choice questions have at least one correct answer."""
    if instance.question_type == Question.QuestionType.MULTIPLE_CHOICE:
        # Check if there's at least one correct answer
        if not instance.answers.filter(is_correct=True).exists():
            # This is handled in the admin/serializer validation
            pass


@receiver(post_save, sender=Answer)
def validate_true_false_answers(sender, instance, created, **kwargs):
    """Ensure True/False questions have exactly 2 answers."""
    if instance.question.question_type == Question.QuestionType.TRUE_FALSE:
        answer_count = instance.question.answers.count()
        if answer_count > 2:
            # This should be handled in validation
            pass