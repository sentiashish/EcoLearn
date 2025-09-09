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


class CarbonFootprint(models.Model):
    """Model for storing carbon footprint calculations."""
    
    # User and challenge relationship
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='carbon_footprints'
    )
    challenge = models.ForeignKey(
        Challenge,
        on_delete=models.CASCADE,
        related_name='carbon_calculations'
    )
    
    # Transportation data
    car_distance = models.FloatField(
        default=0.0,
        help_text="Daily car distance in kilometers"
    )
    car_efficiency = models.FloatField(
        default=8.0,
        help_text="Car fuel efficiency in L/100km"
    )
    public_transport_distance = models.FloatField(
        default=0.0,
        help_text="Daily public transport distance in kilometers"
    )
    flights_short = models.IntegerField(
        default=0,
        help_text="Number of short-haul flights per year"
    )
    flights_long = models.IntegerField(
        default=0,
        help_text="Number of long-haul flights per year"
    )
    
    # Energy consumption
    electricity_usage = models.FloatField(
        default=0.0,
        help_text="Monthly electricity usage in kWh"
    )
    heating_gas = models.FloatField(
        default=0.0,
        help_text="Monthly natural gas usage in cubic meters"
    )
    renewable_energy = models.BooleanField(
        default=False,
        help_text="Uses renewable energy sources"
    )
    
    # Food and consumption
    meat_consumption = models.CharField(
        max_length=20,
        choices=[
            ('high', 'High (daily)'),
            ('medium', 'Medium (few times/week)'),
            ('low', 'Low (rarely)'),
            ('none', 'Vegetarian/Vegan'),
        ],
        default='medium'
    )
    local_food = models.BooleanField(
        default=False,
        help_text="Primarily buys local/organic food"
    )
    waste_recycling = models.BooleanField(
        default=True,
        help_text="Regularly recycles waste"
    )
    
    # Calculated results
    transport_emissions = models.FloatField(
        default=0.0,
        help_text="Transport emissions in kg CO2/year"
    )
    energy_emissions = models.FloatField(
        default=0.0,
        help_text="Energy emissions in kg CO2/year"
    )
    lifestyle_emissions = models.FloatField(
        default=0.0,
        help_text="Lifestyle emissions in kg CO2/year"
    )
    total_emissions = models.FloatField(
        default=0.0,
        help_text="Total carbon footprint in kg CO2/year"
    )
    
    # Recommendations and score
    eco_score = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Eco-friendliness score out of 100"
    )
    recommendations = models.JSONField(
        default=list,
        help_text="Personalized recommendations for reducing carbon footprint"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['challenge', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.total_emissions:.1f} kg CO2/year"
    
    def save(self, *args, **kwargs):
        """Calculate emissions before saving."""
        self.calculate_emissions()
        super().save(*args, **kwargs)
    
    def calculate_emissions(self):
        """Calculate carbon emissions for each category."""
        # Transport emissions (kg CO2/year)
        car_emissions = (self.car_distance * 365 * self.car_efficiency * 2.31) / 100  # 2.31 kg CO2 per liter
        transport_emissions = (self.public_transport_distance * 365 * 0.1)  # 0.1 kg CO2 per km
        flight_emissions = (self.flights_short * 200) + (self.flights_long * 1000)  # Approximate emissions
        
        self.transport_emissions = car_emissions + transport_emissions + flight_emissions
        
        # Energy emissions (kg CO2/year)
        electricity_emissions = self.electricity_usage * 12 * 0.5  # 0.5 kg CO2 per kWh (varies by country)
        gas_emissions = self.heating_gas * 12 * 2.0  # 2.0 kg CO2 per cubic meter
        
        if self.renewable_energy:
            electricity_emissions *= 0.1  # 90% reduction for renewable energy
            
        self.energy_emissions = electricity_emissions + gas_emissions
        
        # Lifestyle emissions (kg CO2/year)
        meat_multipliers = {
            'high': 1000,
            'medium': 600,
            'low': 300,
            'none': 150
        }
        
        diet_emissions = meat_multipliers.get(self.meat_consumption, 600)
        
        if self.local_food:
            diet_emissions *= 0.8  # 20% reduction for local food
            
        waste_emissions = 50 if not self.waste_recycling else 20
        
        self.lifestyle_emissions = diet_emissions + waste_emissions
        
        # Total emissions
        self.total_emissions = self.transport_emissions + self.energy_emissions + self.lifestyle_emissions
        
        # Calculate eco score (inverse relationship with emissions)
        world_average = 4000  # kg CO2 per person per year
        self.eco_score = max(0, min(100, int(100 - (self.total_emissions / world_average * 100))))
        
        # Generate recommendations
        self.generate_recommendations()
    
    def generate_recommendations(self):
        """Generate personalized recommendations."""
        recommendations = []
        
        if self.car_distance > 20:
            recommendations.append("Consider using public transport or cycling for shorter trips")
        
        if self.flights_short > 4:
            recommendations.append("Try to reduce short-haul flights by using trains or buses")
            
        if self.electricity_usage > 300:
            recommendations.append("Switch to LED bulbs and energy-efficient appliances")
            
        if not self.renewable_energy:
            recommendations.append("Consider switching to a renewable energy provider")
            
        if self.meat_consumption in ['high', 'medium']:
            recommendations.append("Try having meat-free days to reduce your dietary footprint")
            
        if not self.local_food:
            recommendations.append("Buy local and seasonal produce when possible")
            
        if not self.waste_recycling:
            recommendations.append("Start recycling and composting organic waste")
            
        if self.total_emissions > 4000:
            recommendations.append("Your footprint is above the global average - small changes can make a big difference!")
        elif self.total_emissions < 2000:
            recommendations.append("Great job! You're already living sustainably")
            
        self.recommendations = recommendations