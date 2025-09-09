from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.core.validators import RegexValidator
from cloudinary.models import CloudinaryField


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication."""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and return a regular user with an email and password."""
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and return a superuser with an email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom user model with email as the unique identifier."""
    
    class UserRole(models.TextChoices):
        STUDENT = 'student', 'Student'
        TEACHER = 'teacher', 'Teacher'
        ADMIN = 'admin', 'Admin'
    
    username = None  # Remove username field
    email = models.EmailField(unique=True, db_index=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    role = models.CharField(
        max_length=10,
        choices=UserRole.choices,
        default=UserRole.STUDENT
    )
    is_email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


class UserProfile(models.Model):
    """Extended user profile with additional information."""
    
    class GradeLevel(models.TextChoices):
        GRADE_6 = '6', 'Grade 6'
        GRADE_7 = '7', 'Grade 7'
        GRADE_8 = '8', 'Grade 8'
        GRADE_9 = '9', 'Grade 9'
        GRADE_10 = '10', 'Grade 10'
        GRADE_11 = '11', 'Grade 11'
        GRADE_12 = '12', 'Grade 12'
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    avatar = CloudinaryField(
        'avatar',
        null=True,
        blank=True,
        folder='avatars/',
        transformation={
            'width': 200,
            'height': 200,
            'crop': 'fill',
            'gravity': 'face'
        }
    )
    bio = models.TextField(max_length=500, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    phone_number = models.CharField(
        max_length=15,
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
            )
        ]
    )
    grade_level = models.CharField(
        max_length=2,
        choices=GradeLevel.choices,
        null=True,
        blank=True
    )
    school_name = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=50, blank=True)
    country = models.CharField(max_length=50, blank=True)
    
    # Gamification fields
    total_points = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)
    experience_points = models.PositiveIntegerField(default=0)
    streak_days = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    
    # Preferences
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    privacy_public_profile = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"{self.user.full_name}'s Profile"
    
    @property
    def level_progress(self):
        """Calculate progress to next level (0-100)."""
        points_for_current_level = (self.level - 1) * 1000
        points_for_next_level = self.level * 1000
        current_level_points = self.total_points - points_for_current_level
        points_needed = points_for_next_level - points_for_current_level
        return min(100, (current_level_points / points_needed) * 100)
    
    def update_level(self):
        """Update user level based on total points."""
        new_level = (self.total_points // 1000) + 1
        if new_level != self.level:
            self.level = new_level
            self.save(update_fields=['level'])
            return True
        return False


class TeacherProfile(models.Model):
    """Additional profile information for teachers."""
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='teacher_profile',
        limit_choices_to={'role': User.UserRole.TEACHER}
    )
    employee_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    department = models.CharField(max_length=100, blank=True)
    subjects = models.JSONField(default=list, blank=True)  # List of subjects taught
    years_of_experience = models.PositiveIntegerField(default=0)
    qualifications = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'teacher_profiles'
        verbose_name = 'Teacher Profile'
        verbose_name_plural = 'Teacher Profiles'
    
    def __str__(self):
        return f"Teacher: {self.user.full_name}"


class StudentClass(models.Model):
    """Class/Group management for students."""
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='taught_classes',
        limit_choices_to={'role': User.UserRole.TEACHER}
    )
    students = models.ManyToManyField(
        User,
        related_name='enrolled_classes',
        limit_choices_to={'role': User.UserRole.STUDENT},
        blank=True
    )
    class_code = models.CharField(max_length=10, unique=True)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'student_classes'
        verbose_name = 'Student Class'
        verbose_name_plural = 'Student Classes'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.teacher.full_name}"
    
    def generate_class_code(self):
        """Generate a unique class code."""
        import random
        import string
        
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            if not StudentClass.objects.filter(class_code=code).exists():
                self.class_code = code
                break