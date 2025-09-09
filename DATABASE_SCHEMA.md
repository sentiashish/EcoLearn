# Database Schema - Gamified Environmental Education Platform

## Entity Relationship Overview

```
User (1) ──── (M) Profile
User (1) ──── (M) PointTransaction
User (1) ──── (M) UserBadge
User (1) ──── (M) ChallengeSubmission
User (1) ──── (M) QuizAttempt
User (1) ──── (M) LessonProgress

Lesson (1) ──── (M) Quiz
Lesson (1) ──── (M) LessonProgress
Lesson (1) ──── (M) MediaFile

Quiz (1) ──── (M) Question
Quiz (1) ──── (M) QuizAttempt

Challenge (1) ──── (M) ChallengeSubmission

Badge (1) ──── (M) UserBadge

Category (1) ──── (M) Lesson
Category (1) ──── (M) Challenge
```

---

## Core Models

### 1. User Management

#### User (extends AbstractUser)
```python
class User(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    ]
    
    email = models.EmailField(unique=True)
    username = None  # Remove username, use email instead
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    is_email_verified = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
```

**SQL Schema:**
```sql
CREATE TABLE users_user (
    id SERIAL PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    role VARCHAR(10) NOT NULL DEFAULT 'student',
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    date_joined TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT users_user_role_check CHECK (role IN ('student', 'teacher', 'admin'))
);

CREATE INDEX users_user_email_idx ON users_user(email);
CREATE INDEX users_user_role_idx ON users_user(role);
```

#### Profile
```python
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    school = models.CharField(max_length=200, blank=True)
    grade_level = models.CharField(max_length=20, blank=True)
    points_balance = models.PositiveIntegerField(default=0)
    total_points_earned = models.PositiveIntegerField(default=0)
    streak_days = models.PositiveIntegerField(default=0)
    last_activity = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**SQL Schema:**
```sql
CREATE TABLE users_profile (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users_user(id) ON DELETE CASCADE,
    avatar VARCHAR(100),
    bio TEXT,
    school VARCHAR(200),
    grade_level VARCHAR(20),
    points_balance INTEGER NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
    total_points_earned INTEGER NOT NULL DEFAULT 0 CHECK (total_points_earned >= 0),
    streak_days INTEGER NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
    last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX users_profile_points_balance_idx ON users_profile(points_balance DESC);
CREATE INDEX users_profile_last_activity_idx ON users_profile(last_activity);
```

---

### 2. Content Management

#### Category
```python
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)  # Icon class or emoji
    color = models.CharField(max_length=7, default='#10b981')  # Hex color
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### Lesson
```python
class Lesson(models.Model):
    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    content = models.TextField()  # Rich HTML content
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='lessons')
    difficulty_level = models.CharField(max_length=12, choices=DIFFICULTY_CHOICES)
    estimated_duration = models.PositiveIntegerField(help_text='Duration in minutes')
    points_reward = models.PositiveIntegerField(default=50)
    thumbnail = models.ImageField(upload_to='lessons/thumbnails/', null=True, blank=True)
    is_published = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**SQL Schema:**
```sql
CREATE TABLE content_lesson (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    category_id INTEGER NOT NULL REFERENCES content_category(id) ON DELETE CASCADE,
    difficulty_level VARCHAR(12) NOT NULL,
    estimated_duration INTEGER NOT NULL CHECK (estimated_duration > 0),
    points_reward INTEGER NOT NULL DEFAULT 50 CHECK (points_reward >= 0),
    thumbnail VARCHAR(100),
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT content_lesson_difficulty_check CHECK (
        difficulty_level IN ('beginner', 'intermediate', 'advanced')
    )
);

CREATE INDEX content_lesson_category_idx ON content_lesson(category_id);
CREATE INDEX content_lesson_difficulty_idx ON content_lesson(difficulty_level);
CREATE INDEX content_lesson_published_idx ON content_lesson(is_published);
CREATE INDEX content_lesson_order_idx ON content_lesson("order");
```

#### MediaFile
```python
class MediaFile(models.Model):
    MEDIA_TYPES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('audio', 'Audio'),
        ('document', 'Document'),
    ]
    
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='media_files')
    file = models.FileField(upload_to='lessons/media/')
    file_type = models.CharField(max_length=10, choices=MEDIA_TYPES)
    title = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    thumbnail = models.ImageField(upload_to='lessons/media/thumbnails/', null=True, blank=True)
    duration = models.PositiveIntegerField(null=True, blank=True, help_text='Duration in seconds')
    file_size = models.PositiveIntegerField(help_text='File size in bytes')
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### LessonProgress
```python
class LessonProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False)
    progress_percentage = models.PositiveIntegerField(default=0, validators=[MaxValueValidator(100)])
    time_spent = models.PositiveIntegerField(default=0, help_text='Time spent in minutes')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'lesson']
```

---

### 3. Quiz System

#### Quiz
```python
class Quiz(models.Model):
    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name='quiz')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    passing_score = models.PositiveIntegerField(default=80, validators=[MaxValueValidator(100)])
    time_limit = models.PositiveIntegerField(null=True, blank=True, help_text='Time limit in seconds')
    max_attempts = models.PositiveIntegerField(default=3)
    points_reward = models.PositiveIntegerField(default=25)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### Question
```python
class Question(models.Model):
    QUESTION_TYPES = [
        ('multiple_choice', 'Multiple Choice'),
        ('true_false', 'True/False'),
        ('short_answer', 'Short Answer'),
    ]
    
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=15, choices=QUESTION_TYPES)
    options = models.JSONField(default=list, help_text='List of answer options')
    correct_answer = models.JSONField(help_text='Correct answer(s)')
    explanation = models.TextField(blank=True)
    points = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### QuizAttempt
```python
class QuizAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    answers = models.JSONField(default=dict)
    score = models.PositiveIntegerField(validators=[MaxValueValidator(100)])
    passed = models.BooleanField()
    time_taken = models.PositiveIntegerField(help_text='Time taken in seconds')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField()
```

---

### 4. Challenge System

#### Challenge
```python
class Challenge(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    instructions = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='challenges')
    difficulty = models.CharField(max_length=6, choices=DIFFICULTY_CHOICES)
    points_reward = models.PositiveIntegerField()
    estimated_time = models.CharField(max_length=50, help_text='e.g., "30 minutes", "1 day"')
    image = models.ImageField(upload_to='challenges/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### ChallengeSubmission
```python
class ChallengeSubmission(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('needs_revision', 'Needs Revision'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    evidence_image = models.ImageField(upload_to='submissions/')
    description = models.TextField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, 
        related_name='reviewed_submissions'
    )
    reviewer_feedback = models.TextField(blank=True)
    points_awarded = models.PositiveIntegerField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'challenge']
```

**SQL Schema:**
```sql
CREATE TABLE challenges_submission (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users_user(id) ON DELETE CASCADE,
    challenge_id INTEGER NOT NULL REFERENCES challenges_challenge(id) ON DELETE CASCADE,
    evidence_image VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(15) NOT NULL DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by_id INTEGER REFERENCES users_user(id) ON DELETE SET NULL,
    reviewer_feedback TEXT,
    points_awarded INTEGER CHECK (points_awarded >= 0),
    
    CONSTRAINT challenges_submission_status_check CHECK (
        status IN ('pending', 'approved', 'rejected', 'needs_revision')
    ),
    CONSTRAINT challenges_submission_unique_user_challenge UNIQUE (user_id, challenge_id)
);

CREATE INDEX challenges_submission_status_idx ON challenges_submission(status);
CREATE INDEX challenges_submission_submitted_at_idx ON challenges_submission(submitted_at);
```

---

### 5. Gamification System

#### Badge
```python
class Badge(models.Model):
    RARITY_CHOICES = [
        ('common', 'Common'),
        ('uncommon', 'Uncommon'),
        ('rare', 'Rare'),
        ('epic', 'Epic'),
        ('legendary', 'Legendary'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=10, help_text='Emoji or icon class')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='badges')
    rarity = models.CharField(max_length=9, choices=RARITY_CHOICES, default='common')
    criteria = models.JSONField(help_text='Criteria for earning this badge')
    points_required = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### UserBadge
```python
class UserBadge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)
    progress_data = models.JSONField(default=dict, blank=True)
    
    class Meta:
        unique_together = ['user', 'badge']
```

#### PointTransaction
```python
class PointTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('lesson_completed', 'Lesson Completed'),
        ('quiz_passed', 'Quiz Passed'),
        ('challenge_approved', 'Challenge Approved'),
        ('badge_earned', 'Badge Earned'),
        ('daily_login', 'Daily Login'),
        ('streak_bonus', 'Streak Bonus'),
        ('admin_adjustment', 'Admin Adjustment'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.IntegerField()  # Can be negative for deductions
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    description = models.CharField(max_length=200)
    
    # Generic foreign key for related object
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    balance_after = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='created_transactions'
    )
```

**SQL Schema:**
```sql
CREATE TABLE gamification_pointtransaction (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users_user(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    description VARCHAR(200) NOT NULL,
    content_type_id INTEGER REFERENCES django_content_type(id) ON DELETE CASCADE,
    object_id INTEGER,
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by_id INTEGER REFERENCES users_user(id) ON DELETE SET NULL,
    
    CONSTRAINT gamification_pointtransaction_type_check CHECK (
        transaction_type IN (
            'lesson_completed', 'quiz_passed', 'challenge_approved',
            'badge_earned', 'daily_login', 'streak_bonus', 'admin_adjustment'
        )
    )
);

CREATE INDEX gamification_pointtransaction_user_idx ON gamification_pointtransaction(user_id);
CREATE INDEX gamification_pointtransaction_created_at_idx ON gamification_pointtransaction(created_at);
CREATE INDEX gamification_pointtransaction_type_idx ON gamification_pointtransaction(transaction_type);
```

---

### 6. Analytics & Reporting

#### UserActivity
```python
class UserActivity(models.Model):
    ACTION_TYPES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('lesson_started', 'Lesson Started'),
        ('lesson_completed', 'Lesson Completed'),
        ('quiz_attempted', 'Quiz Attempted'),
        ('challenge_submitted', 'Challenge Submitted'),
        ('badge_earned', 'Badge Earned'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    
    # Generic foreign key for related object
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## Database Indexes and Performance

### Key Indexes
```sql
-- User performance indexes
CREATE INDEX users_profile_leaderboard_idx ON users_profile(points_balance DESC, total_points_earned DESC);
CREATE INDEX users_user_active_idx ON users_user(is_active, role);

-- Content performance indexes
CREATE INDEX content_lesson_published_order_idx ON content_lesson(is_published, "order");
CREATE INDEX content_lesson_category_published_idx ON content_lesson(category_id, is_published);

-- Challenge performance indexes
CREATE INDEX challenges_submission_pending_idx ON challenges_submission(status, submitted_at) 
    WHERE status = 'pending';

-- Gamification performance indexes
CREATE INDEX gamification_pointtransaction_user_recent_idx ON gamification_pointtransaction(user_id, created_at DESC);
CREATE INDEX gamification_userbadge_user_earned_idx ON gamification_userbadge(user_id, earned_at DESC);

-- Analytics indexes
CREATE INDEX analytics_useractivity_user_recent_idx ON analytics_useractivity(user_id, created_at DESC);
CREATE INDEX analytics_useractivity_action_date_idx ON analytics_useractivity(action_type, created_at);
```

### Database Constraints
```sql
-- Ensure point balance consistency
ALTER TABLE users_profile ADD CONSTRAINT points_balance_non_negative 
    CHECK (points_balance >= 0);

-- Ensure quiz scores are valid percentages
ALTER TABLE content_quizattempt ADD CONSTRAINT valid_score 
    CHECK (score >= 0 AND score <= 100);

-- Ensure lesson progress percentage is valid
ALTER TABLE content_lessonprogress ADD CONSTRAINT valid_progress 
    CHECK (progress_percentage >= 0 AND progress_percentage <= 100);

-- Ensure challenge dates are logical
ALTER TABLE challenges_challenge ADD CONSTRAINT valid_date_range 
    CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date);
```

## Sample Data Relationships

### User Journey Example
```sql
-- Student completes a lesson
INSERT INTO content_lessonprogress (user_id, lesson_id, is_completed, progress_percentage, time_spent)
VALUES (1, 1, true, 100, 15);

-- Award points for lesson completion
INSERT INTO gamification_pointtransaction (user_id, amount, transaction_type, description, balance_after)
VALUES (1, 50, 'lesson_completed', 'Completed: Climate Change Basics', 50);

-- Update user's point balance
UPDATE users_profile SET points_balance = 50, total_points_earned = 50 WHERE user_id = 1;

-- Check for badge eligibility and award
INSERT INTO gamification_userbadge (user_id, badge_id)
VALUES (1, 1);  -- "First Steps" badge
```

This database schema provides a robust foundation for the gamified environmental education platform with proper relationships, constraints, and performance optimizations.