from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.utils.text import slugify
from cloudinary.models import CloudinaryField
from apps.content.models import Category, Tag

User = get_user_model()


class Challenge(models.Model):
    """Model for environmental challenges."""
    
    class DifficultyLevel(models.TextChoices):
        BEGINNER = 'beginner', 'Beginner'
        INTERMEDIATE = 'intermediate', 'Intermediate'
        ADVANCED = 'advanced', 'Advanced'
        EXPERT = 'expert', 'Expert'
    
    class ChallengeType(models.TextChoices):
        WASTE_MANAGEMENT = 'waste_management', 'Waste Management'
        ENERGY_CONSERVATION = 'energy_conservation', 'Energy Conservation'
        WATER_CONSERVATION = 'water_conservation', 'Water Conservation'
        SUSTAINABLE_TRANSPORT = 'sustainable_transport', 'Sustainable Transport'
        TREE_PLANTING = 'tree_planting', 'Tree Planting & Gardening'
        RECYCLING = 'recycling', 'Recycling & Upcycling'
        CLIMATE_ACTION = 'climate_action', 'Climate Action'
        ECO_LIFESTYLE = 'eco_lifestyle', 'Eco-Friendly Lifestyle'
    
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        ARCHIVED = 'archived', 'Archived'
    
    # Basic Information
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    description = models.TextField()
    problem_statement = models.TextField(
        help_text="Detailed problem description with examples"
    )
    
    # Challenge Details
    difficulty_level = models.CharField(
        max_length=20,
        choices=DifficultyLevel.choices,
        default=DifficultyLevel.BEGINNER
    )
    challenge_type = models.CharField(
        max_length=50,
        choices=ChallengeType.choices,
        default=ChallengeType.WASTE_MANAGEMENT
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='challenges'
    )
    tags = models.ManyToManyField(
        Tag,
        blank=True,
        related_name='challenges'
    )
    
    # Content
    input_format = models.TextField(
        help_text="Description of input format",
        blank=True
    )
    output_format = models.TextField(
        help_text="Description of expected output format",
        blank=True
    )
    constraints = models.TextField(
        help_text="Problem constraints and limitations",
        blank=True
    )
    examples = models.JSONField(
        default=list,
        help_text="List of input/output examples"
    )
    hints = models.JSONField(
        default=list,
        help_text="List of hints for solving the challenge"
    )
    
    # Test Cases
    test_cases = models.JSONField(
        default=list,
        help_text="List of test cases with input/expected output"
    )
    hidden_test_cases = models.JSONField(
        default=list,
        help_text="Hidden test cases for evaluation"
    )
    
    # Solution
    solution_code = models.TextField(
        blank=True,
        help_text="Reference solution code"
    )
    solution_explanation = models.TextField(
        blank=True,
        help_text="Explanation of the solution approach"
    )
    
    # Time and Memory Limits
    time_limit = models.PositiveIntegerField(
        default=1000,
        help_text="Time limit in milliseconds"
    )
    memory_limit = models.PositiveIntegerField(
        default=256,
        help_text="Memory limit in MB"
    )
    
    # Gamification
    points_reward = models.PositiveIntegerField(
        default=100,
        validators=[MinValueValidator(1), MaxValueValidator(1000)]
    )
    xp_reward = models.PositiveIntegerField(
        default=50,
        validators=[MinValueValidator(1), MaxValueValidator(500)]
    )
    
    # Publishing
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT
    )
    is_featured = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    
    # Relationships
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='authored_challenges'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Statistics (cached fields)
    submission_count = models.PositiveIntegerField(default=0)
    solved_count = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['difficulty_level', 'challenge_type']),
            models.Index(fields=['status', 'published_at']),
            models.Index(fields=['is_featured', 'status']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def is_published(self):
        """Check if challenge is published."""
        return self.status == self.Status.PUBLISHED
    
    @property
    def success_rate(self):
        """Calculate success rate percentage."""
        if self.submission_count == 0:
            return 0
        return round((self.solved_count / self.submission_count) * 100, 1)
    
    def save(self, *args, **kwargs):
        """Override save to set published_at when status changes to published and generate slug."""
        if not self.slug:
            self.slug = slugify(self.title)
        
        if self.status == self.Status.PUBLISHED and not self.published_at:
            self.published_at = timezone.now()
        elif self.status != self.Status.PUBLISHED:
            self.published_at = None
        
        super().save(*args, **kwargs)


class Submission(models.Model):
    """Model for challenge submissions."""
    
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        RUNNING = 'running', 'Running'
        ACCEPTED = 'accepted', 'Accepted'
        WRONG_ANSWER = 'wrong_answer', 'Wrong Answer'
        TIME_LIMIT_EXCEEDED = 'time_limit_exceeded', 'Time Limit Exceeded'
        MEMORY_LIMIT_EXCEEDED = 'memory_limit_exceeded', 'Memory Limit Exceeded'
        RUNTIME_ERROR = 'runtime_error', 'Runtime Error'
        COMPILATION_ERROR = 'compilation_error', 'Compilation Error'
        INTERNAL_ERROR = 'internal_error', 'Internal Error'
    
    class Language(models.TextChoices):
        PYTHON = 'python', 'Python'
        JAVASCRIPT = 'javascript', 'JavaScript'
        JAVA = 'java', 'Java'
        CPP = 'cpp', 'C++'
        C = 'c', 'C'
        CSHARP = 'csharp', 'C#'
        GO = 'go', 'Go'
        RUST = 'rust', 'Rust'
        KOTLIN = 'kotlin', 'Kotlin'
        SWIFT = 'swift', 'Swift'
    
    # Basic Information
    challenge = models.ForeignKey(
        Challenge,
        on_delete=models.CASCADE,
        related_name='submissions'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='submissions'
    )
    
    # Submission Details
    code = models.TextField(help_text="Submitted code")
    language = models.CharField(
        max_length=20,
        choices=Language.choices,
        default=Language.PYTHON
    )
    
    # Execution Results
    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.PENDING
    )
    score = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Score out of 100"
    )
    
    # Performance Metrics
    execution_time = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Execution time in milliseconds"
    )
    memory_used = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Memory used in KB"
    )
    
    # Test Case Results
    test_results = models.JSONField(
        default=list,
        help_text="Results for each test case"
    )
    passed_test_cases = models.PositiveIntegerField(default=0)
    total_test_cases = models.PositiveIntegerField(default=0)
    
    # Error Information
    error_message = models.TextField(
        blank=True,
        help_text="Error message if submission failed"
    )
    compilation_output = models.TextField(
        blank=True,
        help_text="Compilation output/errors"
    )
    
    # Metadata
    submitted_at = models.DateTimeField(auto_now_add=True)
    evaluated_at = models.DateTimeField(null=True, blank=True)
    
    # Gamification
    points_earned = models.PositiveIntegerField(default=0)
    xp_earned = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['challenge', 'user']),
            models.Index(fields=['status', 'submitted_at']),
            models.Index(fields=['user', 'submitted_at']),
        ]
        unique_together = []
    
    def __str__(self):
        return f"{self.user.email} - {self.challenge.title} ({self.status})"
    
    @property
    def is_accepted(self):
        """Check if submission is accepted."""
        return self.status == self.Status.ACCEPTED
    
    @property
    def success_rate(self):
        """Calculate test case success rate."""
        if self.total_test_cases == 0:
            return 0
        return round((self.passed_test_cases / self.total_test_cases) * 100, 1)
    
    def save(self, *args, **kwargs):
        """Override save to set evaluation timestamp and calculate points."""
        if self.status != self.Status.PENDING and not self.evaluated_at:
            self.evaluated_at = timezone.now()
        
        # Calculate points and XP based on performance
        if self.is_accepted:
            base_points = self.challenge.points_reward
            base_xp = self.challenge.xp_reward
            
            # Bonus for efficiency (faster execution)
            time_bonus = 1.0
            if self.execution_time and self.challenge.time_limit:
                time_ratio = self.execution_time / self.challenge.time_limit
                if time_ratio < 0.5:
                    time_bonus = 1.2  # 20% bonus for very fast solutions
                elif time_ratio < 0.8:
                    time_bonus = 1.1  # 10% bonus for fast solutions
            
            self.points_earned = int(base_points * time_bonus)
            self.xp_earned = int(base_xp * time_bonus)
        else:
            # Partial points for partial solutions
            if self.total_test_cases > 0:
                partial_ratio = self.passed_test_cases / self.total_test_cases
                self.points_earned = int(self.challenge.points_reward * partial_ratio * 0.3)
                self.xp_earned = int(self.challenge.xp_reward * partial_ratio * 0.3)
        
        super().save(*args, **kwargs)


class ChallengeRating(models.Model):
    """Model for challenge ratings and reviews."""
    
    challenge = models.ForeignKey(
        Challenge,
        on_delete=models.CASCADE,
        related_name='ratings'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='challenge_ratings'
    )
    
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5 stars"
    )
    review = models.TextField(
        blank=True,
        help_text="Optional review text"
    )
    
    # Specific rating aspects
    difficulty_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="How well does the difficulty match the stated level?"
    )
    clarity_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="How clear is the problem statement?"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['challenge', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} rated {self.challenge.title}: {self.rating}/5"


class ChallengeFavorite(models.Model):
    """Model for user's favorite challenges."""
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='favorite_challenges'
    )
    challenge = models.ForeignKey(
        Challenge,
        on_delete=models.CASCADE,
        related_name='favorited_by'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'challenge']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} favorited {self.challenge.title}"


class ChallengeDiscussion(models.Model):
    """Model for challenge discussions and comments."""
    
    challenge = models.ForeignKey(
        Challenge,
        on_delete=models.CASCADE,
        related_name='discussions'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='challenge_discussions'
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )
    
    content = models.TextField(help_text="Discussion content")
    is_solution = models.BooleanField(
        default=False,
        help_text="Mark if this is a solution discussion"
    )
    is_spoiler = models.BooleanField(
        default=False,
        help_text="Mark if this contains spoilers"
    )
    
    # Moderation
    is_approved = models.BooleanField(default=True)
    is_flagged = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['challenge', 'created_at']),
            models.Index(fields=['user', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.challenge.title} - {self.user.email}"
    
    @property
    def is_reply(self):
        """Check if this is a reply to another discussion."""
        return self.parent is not None