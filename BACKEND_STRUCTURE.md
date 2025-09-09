# Backend File Tree - Django + DRF Structure

```
backend/
├── manage.py
├── requirements.txt
├── requirements-dev.txt
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── pytest.ini
├── .gitignore
├── README.md
│
├── config/                          # Main Django project
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py                  # Base settings
│   │   ├── development.py           # Dev-specific settings
│   │   ├── production.py            # Production settings
│   │   └── testing.py               # Test settings
│   ├── urls.py                      # Root URL configuration
│   ├── wsgi.py                      # WSGI application
│   └── asgi.py                      # ASGI application (for WebSockets)
│
├── apps/                            # Django applications
│   ├── __init__.py
│   │
│   ├── users/                       # User management & authentication
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py                # User, Profile models
│   │   ├── serializers.py           # DRF serializers
│   │   ├── views.py                 # API views
│   │   ├── urls.py                  # App URLs
│   │   ├── permissions.py           # Custom permissions
│   │   ├── managers.py              # Custom model managers
│   │   ├── signals.py               # Django signals
│   │   ├── migrations/
│   │   │   └── __init__.py
│   │   └── tests/
│   │       ├── __init__.py
│   │       ├── test_models.py
│   │       ├── test_views.py
│   │       └── test_serializers.py
│   │
│   ├── content/                     # Lessons, quizzes, media
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py                # Lesson, Quiz, Question models
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── filters.py               # Django-filter classes
│   │   ├── utils.py                 # Content utilities
│   │   ├── migrations/
│   │   │   └── __init__.py
│   │   └── tests/
│   │       ├── __init__.py
│   │       ├── test_models.py
│   │       ├── test_views.py
│   │       └── test_serializers.py
│   │
│   ├── challenges/                  # Challenge system
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py                # Challenge, Submission models
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── permissions.py           # Challenge-specific permissions
│   │   ├── tasks.py                 # Celery tasks (optional)
│   │   ├── migrations/
│   │   │   └── __init__.py
│   │   └── tests/
│   │       ├── __init__.py
│   │       ├── test_models.py
│   │       ├── test_views.py
│   │       └── test_serializers.py
│   │
│   ├── gamification/                # Points, badges, leaderboard
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py                # Badge, PointTransaction models
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── services.py              # Business logic
│   │   ├── utils.py                 # Gamification utilities
│   │   ├── migrations/
│   │   │   └── __init__.py
│   │   └── tests/
│   │       ├── __init__.py
│   │       ├── test_models.py
│   │       ├── test_views.py
│   │       ├── test_services.py
│   │       └── test_serializers.py
│   │
│   └── analytics/                   # Admin analytics & reporting
│       ├── __init__.py
│       ├── admin.py
│       ├── apps.py
│       ├── models.py                # Analytics models
│       ├── serializers.py
│       ├── views.py
│       ├── urls.py
│       ├── services.py              # Analytics calculations
│       ├── migrations/
│       │   └── __init__.py
│       └── tests/
│           ├── __init__.py
│           ├── test_models.py
│           ├── test_views.py
│           └── test_services.py
│
├── core/                            # Shared utilities
│   ├── __init__.py
│   ├── exceptions.py                # Custom exceptions
│   ├── permissions.py               # Base permissions
│   ├── pagination.py                # Custom pagination
│   ├── renderers.py                 # Custom DRF renderers
│   ├── throttling.py                # Rate limiting
│   ├── validators.py                # Custom validators
│   ├── mixins.py                    # Reusable mixins
│   ├── utils.py                     # General utilities
│   └── middleware.py                # Custom middleware
│
├── media/                           # User uploaded files
│   ├── avatars/
│   ├── lessons/
│   ├── challenges/
│   └── submissions/
│
├── static/                          # Static files
│   ├── admin/
│   ├── css/
│   ├── js/
│   └── images/
│
├── templates/                       # Django templates
│   ├── admin/
│   │   └── base_site.html          # Custom admin template
│   └── emails/                      # Email templates
│       ├── welcome.html
│       ├── challenge_approved.html
│       └── badge_earned.html
│
├── fixtures/                        # Sample data
│   ├── users.json
│   ├── lessons.json
│   ├── challenges.json
│   └── badges.json
│
├── scripts/                         # Management scripts
│   ├── __init__.py
│   ├── setup_dev_data.py           # Load development data
│   ├── backup_db.py                # Database backup
│   └── generate_reports.py         # Analytics reports
│
├── docs/                           # API documentation
│   ├── api_schema.yml              # OpenAPI schema
│   └── postman_collection.json    # Postman collection
│
└── tests/                          # Integration tests
    ├── __init__.py
    ├── conftest.py                 # Pytest configuration
    ├── factories.py                # Test data factories
    ├── test_integration.py         # End-to-end tests
    └── test_api_contract.py        # API contract tests
```

## Key Configuration Files

### requirements.txt
```
Django==4.2.7
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.0
django-cors-headers==4.3.1
django-filter==23.3
django-storages==1.14.2
Pillow==10.0.1
psycopg2-binary==2.9.7
redis==5.0.1
celery==5.3.4
gunicorn==21.2.0
whitenoise==6.6.0
python-decouple==3.8
drf-spectacular==0.26.5
```

### requirements-dev.txt
```
-r requirements.txt
pytest==7.4.3
pytest-django==4.7.0
pytest-cov==4.1.0
factory-boy==3.3.0
black==23.10.1
flake8==6.1.0
isort==5.12.0
pre-commit==3.5.0
django-debug-toolbar==4.2.0
```

### .env.example
```
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/enviro_edu

# Redis (for caching and Celery)
REDIS_URL=redis://localhost:6379/0

# Email Settings
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# File Storage (AWS S3 or Cloudinary)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=us-east-1

# Or Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=15  # minutes
JWT_REFRESH_TOKEN_LIFETIME=7  # days

# Rate Limiting
RATE_LIMIT_ANON=100/hour
RATE_LIMIT_USER=1000/hour

# Celery (optional)
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/1
```

### Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Run application
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: enviro_edu
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  web:
    build: .
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis
    environment:
      - DEBUG=True
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/enviro_edu
      - REDIS_URL=redis://redis:6379/0

  celery:
    build: .
    command: celery -A config worker -l info
    volumes:
      - .:/app
    depends_on:
      - db
      - redis
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/enviro_edu
      - CELERY_BROKER_URL=redis://redis:6379/1

volumes:
  postgres_data:
```

## Management Commands

### Custom Django Commands
```
backend/apps/users/management/
├── __init__.py
└── commands/
    ├── __init__.py
    ├── create_superuser_if_none.py
    ├── load_sample_data.py
    └── generate_test_users.py
```

## Testing Structure

### pytest.ini
```ini
[tool:pytest]
DJANGO_SETTINGS_MODULE = config.settings.testing
addopts = --cov=apps --cov-report=html --cov-report=term-missing
testpaths = apps tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
```

### conftest.py
```python
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.users.models import Profile

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user_student(db):
    user = User.objects.create_user(
        email='student@test.com',
        password='testpass123',
        first_name='Test',
        last_name='Student',
        role='student'
    )
    return user

@pytest.fixture
def user_teacher(db):
    user = User.objects.create_user(
        email='teacher@test.com',
        password='testpass123',
        first_name='Test',
        last_name='Teacher',
        role='teacher'
    )
    return user
```

This backend structure provides a solid foundation for the gamified environmental education platform with proper separation of concerns, comprehensive testing setup, and production-ready configuration.