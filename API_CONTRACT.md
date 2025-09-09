# API Contract - Gamified Environmental Education Platform

## Base URL
```
Local: http://localhost:8000/api/v1/
Production: https://your-domain.com/api/v1/
```

## Authentication
**Type:** JWT Bearer Token  
**Header:** `Authorization: Bearer <access_token>`  
**Refresh:** Automatic via httpOnly cookies (production)

---

## 🔐 Authentication Endpoints

### POST /auth/register/
**Purpose:** User registration
```json
// Request
{
  "email": "student@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "role": "student",
  "school": "Green Valley High"
}

// Response (201)
{
  "user": {
    "id": 1,
    "email": "student@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student",
    "profile": {
      "avatar": null,
      "bio": "",
      "school": "Green Valley High",
      "points_balance": 0
    }
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

### POST /auth/login/
**Purpose:** User authentication
```json
// Request
{
  "email": "student@example.com",
  "password": "SecurePass123!"
}

// Response (200)
{
  "user": { /* same as register */ },
  "tokens": { /* same as register */ }
}
```

### POST /auth/refresh/
**Purpose:** Refresh access token
```json
// Request
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}

// Response (200)
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

---

## 👤 User Management

### GET /users/profile/
**Purpose:** Get current user profile
```json
// Response (200)
{
  "id": 1,
  "email": "student@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "student",
  "profile": {
    "avatar": "https://cdn.example.com/avatars/user1.jpg",
    "bio": "Environmental enthusiast",
    "school": "Green Valley High",
    "points_balance": 1250,
    "badges_count": 5,
    "challenges_completed": 12
  }
}
```

### PATCH /users/profile/
**Purpose:** Update user profile
```json
// Request
{
  "first_name": "Johnny",
  "profile": {
    "bio": "Passionate about saving the planet!",
    "avatar": "<base64_image_or_file_upload>"
  }
}

// Response (200)
{ /* updated profile object */ }
```

---

## 📚 Content Management

### GET /lessons/
**Purpose:** List all lessons with pagination
```json
// Query params: ?page=1&difficulty=beginner&search=climate

// Response (200)
{
  "count": 25,
  "next": "http://localhost:8000/api/v1/lessons/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Climate Change Basics",
      "description": "Understanding the fundamentals of climate change",
      "difficulty_level": "beginner",
      "estimated_duration": 15,
      "thumbnail": "https://cdn.example.com/lessons/climate-basics.jpg",
      "is_completed": false,
      "progress_percentage": 0,
      "points_reward": 50
    }
  ]
}
```

### GET /lessons/{id}/
**Purpose:** Get lesson details
```json
// Response (200)
{
  "id": 1,
  "title": "Climate Change Basics",
  "description": "Understanding the fundamentals of climate change",
  "content": "<rich_html_content>",
  "difficulty_level": "beginner",
  "estimated_duration": 15,
  "media_files": [
    {
      "type": "video",
      "url": "https://cdn.example.com/videos/climate-intro.mp4",
      "thumbnail": "https://cdn.example.com/thumbs/climate-intro.jpg"
    }
  ],
  "quiz": {
    "id": 1,
    "questions_count": 5,
    "passing_score": 80,
    "user_attempts": 0,
    "best_score": null
  },
  "is_completed": false,
  "progress_percentage": 0
}
```

### POST /lessons/{id}/complete/
**Purpose:** Mark lesson as completed
```json
// Request
{
  "time_spent": 18  // minutes
}

// Response (200)
{
  "points_earned": 50,
  "new_balance": 1300,
  "badges_unlocked": [
    {
      "id": 2,
      "name": "Climate Warrior",
      "description": "Completed first climate lesson",
      "icon": "🌍"
    }
  ]
}
```

---

## 🧠 Quiz System

### GET /quizzes/{id}/
**Purpose:** Get quiz questions
```json
// Response (200)
{
  "id": 1,
  "lesson_id": 1,
  "title": "Climate Change Quiz",
  "questions": [
    {
      "id": 1,
      "question": "What is the main cause of climate change?",
      "type": "multiple_choice",
      "options": [
        "Solar radiation",
        "Greenhouse gases",
        "Ocean currents",
        "Volcanic activity"
      ]
    }
  ],
  "passing_score": 80,
  "time_limit": 300  // seconds
}
```

### POST /quizzes/{id}/submit/
**Purpose:** Submit quiz answers
```json
// Request
{
  "answers": [
    {
      "question_id": 1,
      "selected_option": 1  // index of selected option
    }
  ],
  "time_taken": 245  // seconds
}

// Response (200)
{
  "score": 85,
  "passed": true,
  "correct_answers": 4,
  "total_questions": 5,
  "points_earned": 25,
  "feedback": [
    {
      "question_id": 1,
      "correct": true,
      "explanation": "Greenhouse gases trap heat in the atmosphere."
    }
  ]
}
```

---

## 🏆 Challenge System

### GET /challenges/
**Purpose:** List available challenges
```json
// Response (200)
{
  "results": [
    {
      "id": 1,
      "title": "Plastic-Free Day",
      "description": "Go a full day without using single-use plastics",
      "category": "waste_reduction",
      "points_reward": 100,
      "difficulty": "medium",
      "estimated_time": "1 day",
      "instructions": "Document your plastic-free alternatives",
      "is_active": true,
      "user_submission": null  // or submission object if exists
    }
  ]
}
```

### POST /challenges/{id}/submit/
**Purpose:** Submit challenge evidence
```json
// Request (multipart/form-data)
{
  "evidence_image": "<file_upload>",
  "description": "Used my reusable water bottle and brought lunch in glass containers"
}

// Response (201)
{
  "id": 15,
  "challenge": 1,
  "status": "pending",
  "evidence_image": "https://cdn.example.com/submissions/user1_challenge1.jpg",
  "description": "Used my reusable water bottle and brought lunch in glass containers",
  "submitted_at": "2024-01-15T10:30:00Z",
  "reviewed_at": null,
  "reviewer_feedback": null
}
```

### GET /challenges/submissions/
**Purpose:** Get user's challenge submissions
```json
// Response (200)
{
  "results": [
    {
      "id": 15,
      "challenge": {
        "id": 1,
        "title": "Plastic-Free Day",
        "points_reward": 100
      },
      "status": "approved",
      "evidence_image": "https://cdn.example.com/submissions/user1_challenge1.jpg",
      "description": "Used my reusable water bottle...",
      "submitted_at": "2024-01-15T10:30:00Z",
      "reviewed_at": "2024-01-15T14:20:00Z",
      "reviewer_feedback": "Great effort! Love the glass containers.",
      "points_earned": 100
    }
  ]
}
```

---

## 🎯 Gamification

### GET /gamification/leaderboard/
**Purpose:** Get leaderboard rankings
```json
// Query params: ?scope=global&period=week

// Response (200)
{
  "user_rank": 15,
  "user_points": 1250,
  "rankings": [
    {
      "rank": 1,
      "user": {
        "id": 5,
        "first_name": "Emma",
        "last_name": "Green",
        "avatar": "https://cdn.example.com/avatars/user5.jpg"
      },
      "points": 2850,
      "badges_count": 12
    }
  ],
  "total_participants": 156
}
```

### GET /gamification/badges/
**Purpose:** Get available badges
```json
// Response (200)
{
  "results": [
    {
      "id": 1,
      "name": "First Steps",
      "description": "Complete your first lesson",
      "icon": "🌱",
      "category": "learning",
      "points_required": 0,
      "is_earned": true,
      "earned_at": "2024-01-10T09:15:00Z",
      "rarity": "common"
    }
  ]
}
```

### GET /gamification/points/history/
**Purpose:** Get points transaction history
```json
// Response (200)
{
  "results": [
    {
      "id": 25,
      "amount": 100,
      "transaction_type": "challenge_completed",
      "description": "Plastic-Free Day challenge approved",
      "timestamp": "2024-01-15T14:20:00Z",
      "balance_after": 1350
    }
  ]
}
```

---

## 👨‍🏫 Teacher Endpoints

### GET /teacher/submissions/pending/
**Purpose:** Get pending challenge submissions for review
**Permission:** Teacher role required
```json
// Response (200)
{
  "results": [
    {
      "id": 16,
      "student": {
        "id": 3,
        "first_name": "Alex",
        "last_name": "Smith",
        "email": "alex@example.com"
      },
      "challenge": {
        "id": 2,
        "title": "Energy Conservation",
        "points_reward": 75
      },
      "evidence_image": "https://cdn.example.com/submissions/user3_challenge2.jpg",
      "description": "Turned off all lights and unplugged devices",
      "submitted_at": "2024-01-16T08:45:00Z"
    }
  ]
}
```

### POST /teacher/submissions/{id}/review/
**Purpose:** Approve or reject challenge submission
```json
// Request
{
  "status": "approved",  // or "rejected"
  "feedback": "Excellent work! Your energy-saving efforts are commendable."
}

// Response (200)
{
  "id": 16,
  "status": "approved",
  "reviewer_feedback": "Excellent work! Your energy-saving efforts are commendable.",
  "reviewed_at": "2024-01-16T10:30:00Z",
  "points_awarded": 75
}
```

---

## 🔧 Admin Endpoints

### GET /admin/analytics/overview/
**Purpose:** Get platform analytics
**Permission:** Admin role required
```json
// Response (200)
{
  "total_users": 1247,
  "active_users_week": 892,
  "lessons_completed": 5634,
  "challenges_submitted": 2341,
  "pending_reviews": 23,
  "top_performing_lessons": [
    {
      "id": 1,
      "title": "Climate Change Basics",
      "completion_rate": 0.87,
      "avg_score": 82.5
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "validation_error",
  "message": "Invalid input data",
  "details": {
    "email": ["This field is required."]
  }
}
```

### 401 Unauthorized
```json
{
  "error": "authentication_required",
  "message": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "error": "permission_denied",
  "message": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "error": "not_found",
  "message": "The requested resource was not found."
}
```

### 429 Too Many Requests
```json
{
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded. Try again in 60 seconds."
}
```

---

## Rate Limits
- **Authentication:** 5 requests/minute
- **File uploads:** 10 requests/hour
- **General API:** 100 requests/minute
- **Admin endpoints:** 200 requests/minute

## File Upload Limits
- **Images:** Max 5MB, formats: JPG, PNG, WebP
- **Videos:** Max 50MB, formats: MP4, WebM
- **Documents:** Max 10MB, formats: PDF