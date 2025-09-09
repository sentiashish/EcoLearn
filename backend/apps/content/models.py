from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
from cloudinary.models import CloudinaryField
import uuid

User = get_user_model()


class Category(models.Model):
    """Content categories for organizing lessons and quizzes."""
    
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Icon class name")
    color = models.CharField(max_length=7, default="#007bff", help_text="Hex color code")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Tag(models.Model):
    """Tags for content organization and filtering."""
    
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Lesson(models.Model):
    """Educational lesson content."""
    
    class DifficultyLevel(models.TextChoices):
        BEGINNER = 'beginner', 'Beginner'
        INTERMEDIATE = 'intermediate', 'Intermediate'
        ADVANCED = 'advanced', 'Advanced'
    
    class ContentType(models.TextChoices):
        TEXT = 'text', 'Text'
        VIDEO = 'video', 'Video'
        INTERACTIVE = 'interactive', 'Interactive'
        MIXED = 'mixed', 'Mixed'
    
    # Basic Information
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    description = models.TextField()
    content = models.TextField(help_text="Main lesson content in HTML/Markdown")
    
    # Categorization
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='lessons'
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name='lessons')
    
    # Content Details
    content_type = models.CharField(
        max_length=20,
        choices=ContentType.choices,
        default=ContentType.TEXT
    )
    difficulty_level = models.CharField(
        max_length=20,
        choices=DifficultyLevel.choices,
        default=DifficultyLevel.BEGINNER
    )
    estimated_duration = models.PositiveIntegerField(
        help_text="Estimated duration in minutes",
        validators=[MinValueValidator(1), MaxValueValidator(300)]
    )
    
    # Media
    thumbnail = CloudinaryField(
        'image',
        blank=True,
        null=True,
        folder='lessons/thumbnails'
    )
    video_url = models.URLField(blank=True, help_text="YouTube or Vimeo URL")
    
    # Gamification
    points_reward = models.PositiveIntegerField(
        default=10,
        validators=[MinValueValidator(1), MaxValueValidator(100)]
    )
    
    # Relationships
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='authored_lessons'
    )
    prerequisites = models.ManyToManyField(
        'self',
        blank=True,
        symmetrical=False,
        related_name='unlocks'
    )
    
    # Status and Visibility
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0, help_text="Display order within category")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['category', 'order', 'title']
        indexes = [
            models.Index(fields=['category', 'is_published']),
            models.Index(fields=['difficulty_level', 'is_published']),
            models.Index(fields=['is_featured', 'is_published']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        
        # Set published_at when first published
        if self.is_published and not self.published_at:
            from django.utils import timezone
            self.published_at = timezone.now()
        
        super().save(*args, **kwargs)
    
    @property
    def completion_count(self):
        """Number of users who completed this lesson."""
        return self.completions.count()
    
    @property
    def average_rating(self):
        """Average rating from user feedback."""
        ratings = self.ratings.aggregate(avg=models.Avg('rating'))['avg']
        return round(ratings, 1) if ratings else 0


class Quiz(models.Model):
    """Quiz associated with lessons or standalone."""
    
    class QuizType(models.TextChoices):
        PRACTICE = 'practice', 'Practice'
        ASSESSMENT = 'assessment', 'Assessment'
        CHALLENGE = 'challenge', 'Challenge'
    
    # Basic Information
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    description = models.TextField()
    instructions = models.TextField(
        blank=True,
        help_text="Special instructions for taking the quiz"
    )
    
    # Relationships
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='quizzes',
        null=True,
        blank=True,
        help_text="Leave blank for standalone quiz"
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='quizzes'
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name='quizzes')
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='authored_quizzes'
    )
    
    # Quiz Configuration
    quiz_type = models.CharField(
        max_length=20,
        choices=QuizType.choices,
        default=QuizType.PRACTICE
    )
    time_limit = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Time limit in minutes (null for no limit)"
    )
    max_attempts = models.PositiveIntegerField(
        default=3,
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    passing_score = models.PositiveIntegerField(
        default=70,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        help_text="Minimum percentage to pass"
    )
    
    # Gamification
    points_reward = models.PositiveIntegerField(
        default=20,
        validators=[MinValueValidator(1), MaxValueValidator(200)]
    )
    
    # Settings
    shuffle_questions = models.BooleanField(default=True)
    shuffle_answers = models.BooleanField(default=True)
    show_correct_answers = models.BooleanField(
        default=True,
        help_text="Show correct answers after completion"
    )
    allow_review = models.BooleanField(
        default=True,
        help_text="Allow reviewing answers before submission"
    )
    
    # Status
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['lesson', 'is_published']),
            models.Index(fields=['category', 'is_published']),
            models.Index(fields=['quiz_type', 'is_published']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        
        # Set published_at when first published
        if self.is_published and not self.published_at:
            from django.utils import timezone
            self.published_at = timezone.now()
        
        super().save(*args, **kwargs)
    
    @property
    def question_count(self):
        """Number of questions in this quiz."""
        return self.questions.count()
    
    @property
    def attempt_count(self):
        """Number of attempts made on this quiz."""
        return self.attempts.count()
    
    @property
    def average_score(self):
        """Average score across all attempts."""
        scores = self.attempts.aggregate(avg=models.Avg('score'))['avg']
        return round(scores, 1) if scores else 0


class Question(models.Model):
    """Individual quiz questions."""
    
    class QuestionType(models.TextChoices):
        MULTIPLE_CHOICE = 'multiple_choice', 'Multiple Choice'
        TRUE_FALSE = 'true_false', 'True/False'
        SHORT_ANSWER = 'short_answer', 'Short Answer'
        ESSAY = 'essay', 'Essay'
        MATCHING = 'matching', 'Matching'
        FILL_BLANK = 'fill_blank', 'Fill in the Blank'
    
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='questions'
    )
    question_text = models.TextField()
    question_type = models.CharField(
        max_length=20,
        choices=QuestionType.choices,
        default=QuestionType.MULTIPLE_CHOICE
    )
    explanation = models.TextField(
        blank=True,
        help_text="Explanation shown after answering"
    )
    points = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    order = models.PositiveIntegerField(default=0)
    
    # Media
    image = CloudinaryField(
        'image',
        blank=True,
        null=True,
        folder='questions/images'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['quiz', 'order']
        indexes = [
            models.Index(fields=['quiz', 'order']),
        ]
    
    def __str__(self):
        return f"{self.quiz.title} - Q{self.order}"


class Answer(models.Model):
    """Answer choices for questions."""
    
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='answers'
    )
    answer_text = models.TextField()
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['question', 'order']
        indexes = [
            models.Index(fields=['question', 'is_correct']),
        ]
    
    def __str__(self):
        return f"{self.question} - {self.answer_text[:50]}"


class LessonCompletion(models.Model):
    """Track lesson completions by users."""
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='lesson_completions'
    )
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='completions'
    )
    completed_at = models.DateTimeField(auto_now_add=True)
    time_spent = models.PositiveIntegerField(
        default=0,
        help_text="Time spent in seconds"
    )
    
    class Meta:
        unique_together = ['user', 'lesson']
        indexes = [
            models.Index(fields=['user', 'completed_at']),
            models.Index(fields=['lesson', 'completed_at']),
        ]
    
    def __str__(self):
        return f"{self.user} completed {self.lesson}"


class QuizAttempt(models.Model):
    """Track quiz attempts by users."""
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='quiz_attempts'
    )
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='attempts'
    )
    score = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    total_questions = models.PositiveIntegerField()
    correct_answers = models.PositiveIntegerField()
    time_taken = models.PositiveIntegerField(
        help_text="Time taken in seconds"
    )
    is_passed = models.BooleanField(default=False)
    attempt_number = models.PositiveIntegerField(default=1)
    
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['user', 'quiz', 'attempt_number']),
            models.Index(fields=['quiz', 'is_passed']),
        ]
    
    def __str__(self):
        return f"{self.user} - {self.quiz} (Attempt {self.attempt_number})"
    
    def save(self, *args, **kwargs):
        # Calculate if passed based on score and quiz passing score
        if self.quiz:
            self.is_passed = self.score >= self.quiz.passing_score
        super().save(*args, **kwargs)


class UserAnswer(models.Model):
    """Store user answers for quiz attempts."""
    
    attempt = models.ForeignKey(
        QuizAttempt,
        on_delete=models.CASCADE,
        related_name='user_answers'
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='user_answers'
    )
    selected_answer = models.ForeignKey(
        Answer,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text="For multiple choice questions"
    )
    text_answer = models.TextField(
        blank=True,
        help_text="For text-based questions"
    )
    is_correct = models.BooleanField(default=False)
    points_earned = models.PositiveIntegerField(default=0)
    
    answered_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['attempt', 'question']
        indexes = [
            models.Index(fields=['attempt', 'question']),
        ]
    
    def __str__(self):
        return f"{self.attempt.user} - {self.question}"


class ContentRating(models.Model):
    """User ratings for lessons and quizzes."""
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='content_ratings'
    )
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='ratings',
        null=True,
        blank=True
    )
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='ratings',
        null=True,
        blank=True
    )
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    review = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(lesson__isnull=False, quiz__isnull=True) |
                    models.Q(lesson__isnull=True, quiz__isnull=False)
                ),
                name='rating_content_type_check'
            )
        ]
        unique_together = [
            ['user', 'lesson'],
            ['user', 'quiz']
        ]
    
    def __str__(self):
        content = self.lesson or self.quiz
        return f"{self.user} rated {content} - {self.rating} stars"