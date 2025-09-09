# Deployment Plan - Docker + CI/CD Strategy

## Overview

**Local Development:** Docker Compose  
**Frontend Deployment:** Vercel  
**Backend Deployment:** Railway/Render  
**Database:** PostgreSQL (managed service)  
**File Storage:** Cloudinary/AWS S3  
**CI/CD:** GitHub Actions  

---

## Local Development Setup

### Quick Start Commands
```bash
# Clone and setup
git clone <repository-url>
cd enviro-edu-platform

# Backend setup
cd backend
cp .env.example .env
# Edit .env with your local settings
docker-compose up -d db redis
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements-dev.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py loaddata fixtures/sample_data.json
python manage.py runserver

# Frontend setup (new terminal)
cd frontend
cp .env.example .env.local
# Edit .env.local with your settings
npm install
npm run dev
```

### Docker Compose Configuration

#### docker-compose.yml (Root)
```yaml
version: '3.8'

services:
  # Database
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: enviro_edu
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/scripts/init_db.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis for caching and Celery
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - ./backend:/app
      - media_files:/app/media
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    environment:
      - DEBUG=True
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/enviro_edu
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/1
    env_file:
      - ./backend/.env

  # Celery Worker (optional)
  celery:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    command: celery -A config worker -l info
    volumes:
      - ./backend:/app
    depends_on:
      - db
      - redis
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/enviro_edu
      - CELERY_BROKER_URL=redis://redis:6379/1
    env_file:
      - ./backend/.env

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    command: npm run dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - VITE_API_BASE_URL=http://localhost:8000/api/v1
    env_file:
      - ./frontend/.env.local

volumes:
  postgres_data:
  redis_data:
  media_files:
```

#### Backend Dockerfile.dev
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements-dev.txt

# Copy project
COPY . .

# Create media directory
RUN mkdir -p media

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

#### Frontend Dockerfile.dev
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

---

## Production Deployment

### Backend Production (Railway/Render)

#### Dockerfile (Production)
```dockerfile
FROM python:3.11-slim as builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy project
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app

# Collect static files
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
```

#### railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT",
    "healthcheckPath": "/api/v1/health/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### render.yaml
```yaml
services:
  - type: web
    name: enviro-edu-backend
    env: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn config.wsgi:application"
    healthCheckPath: "/api/v1/health/"
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: DATABASE_URL
        fromDatabase:
          name: enviro-edu-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          type: redis
          name: enviro-edu-redis
          property: connectionString

databases:
  - name: enviro-edu-db
    databaseName: enviro_edu
    user: enviro_user

  - name: enviro-edu-redis
    type: redis
```

### Frontend Production (Vercel)

#### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend-domain.railway.app/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "https://your-backend-domain.railway.app/api/v1",
    "VITE_APP_NAME": "Environmental Education Platform"
  }
}
```

#### Frontend Dockerfile (Alternative to Vercel)
```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        
        # Cache static assets
        location /assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # API proxy
        location /api/ {
            proxy_pass https://your-backend-domain.railway.app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # SPA fallback
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

---

## CI/CD Pipeline (GitHub Actions)

### .github/workflows/ci.yml
```yaml
name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  # Backend Tests
  backend-test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Cache pip dependencies
      uses: actions/cache@v3
      with:
        path: ~/.cache/pip
        key: ${{ runner.os }}-pip-${{ hashFiles('backend/requirements-dev.txt') }}
    
    - name: Install dependencies
      working-directory: ./backend
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements-dev.txt
    
    - name: Run linting
      working-directory: ./backend
      run: |
        flake8 .
        black --check .
        isort --check-only .
    
    - name: Run tests
      working-directory: ./backend
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379/0
        SECRET_KEY: test-secret-key
      run: |
        python manage.py migrate
        pytest --cov=apps --cov-report=xml
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./backend/coverage.xml
        flags: backend

  # Frontend Tests
  frontend-test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install dependencies
      working-directory: ./frontend
      run: npm ci
    
    - name: Run linting
      working-directory: ./frontend
      run: |
        npm run lint
        npm run type-check
    
    - name: Run tests
      working-directory: ./frontend
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./frontend/coverage/lcov.info
        flags: frontend

  # Security Scan
  security-scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy scan results to GitHub Security tab
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'
```

### .github/workflows/deploy-backend.yml
```yaml
name: Deploy Backend

on:
  push:
    branches: [ main ]
    paths: [ 'backend/**' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to Railway
      uses: railwayapp/railway-deploy@v1
      with:
        railway_token: ${{ secrets.RAILWAY_TOKEN }}
        service: 'backend'
    
    # Alternative: Deploy to Render
    # - name: Deploy to Render
    #   uses: johnbeynon/render-deploy-action@v0.0.8
    #   with:
    #     service-id: ${{ secrets.RENDER_SERVICE_ID }}
    #     api-key: ${{ secrets.RENDER_API_KEY }}
```

### .github/workflows/deploy-frontend.yml
```yaml
name: Deploy Frontend

on:
  push:
    branches: [ main ]
    paths: [ 'frontend/**' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        working-directory: ./frontend
        vercel-args: '--prod'
```

### .github/workflows/lighthouse.yml
```yaml
name: Lighthouse Performance Audit

on:
  pull_request:
    branches: [ main ]
    paths: [ 'frontend/**' ]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install dependencies
      working-directory: ./frontend
      run: npm ci
    
    - name: Build application
      working-directory: ./frontend
      run: npm run build
    
    - name: Serve application
      working-directory: ./frontend
      run: |
        npm install -g serve
        serve -s dist -l 3000 &
        sleep 5
    
    - name: Run Lighthouse
      uses: treosh/lighthouse-ci-action@v9
      with:
        configPath: './frontend/lighthouserc.json'
        uploadArtifacts: true
        temporaryPublicStorage: true
```

---

## Environment Variables

### Backend Production Environment
```bash
# Django Settings
DEBUG=False
SECRET_KEY=your-super-secret-production-key
ALLOWED_HOSTS=your-domain.railway.app,your-custom-domain.com
CSRF_TRUSTED_ORIGINS=https://your-domain.railway.app,https://your-custom-domain.com

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Redis
REDIS_URL=redis://user:password@host:port/0

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Security
SECURE_SSL_REDIRECT=True
SECURE_PROXY_SSL_HEADER=HTTP_X_FORWARDED_PROTO,https
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_BROWSER_XSS_FILTER=True
SECURE_CONTENT_TYPE_NOSNIFF=True

# Monitoring (optional)
SENTRY_DSN=your-sentry-dsn
```

### Frontend Production Environment
```bash
# API Configuration
VITE_API_BASE_URL=https://your-backend-domain.railway.app/api/v1
VITE_WS_BASE_URL=wss://your-backend-domain.railway.app/ws

# App Configuration
VITE_APP_NAME="Environmental Education Platform"
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_WEBSOCKETS=true

# External Services
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Production Settings
VITE_MOCK_API=false
VITE_DEBUG_MODE=false
```

---

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Security scan completed
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Static files optimized
- [ ] Performance audit completed

### Backend Deployment
- [ ] Database backup created
- [ ] Migrations applied
- [ ] Static files collected
- [ ] Health check endpoint working
- [ ] SSL certificate configured
- [ ] Monitoring setup (Sentry, etc.)

### Frontend Deployment
- [ ] Build optimization verified
- [ ] CDN configuration
- [ ] PWA manifest validated
- [ ] Lighthouse score >90
- [ ] Analytics tracking setup

### Post-deployment
- [ ] Smoke tests passed
- [ ] Performance monitoring active
- [ ] Error tracking configured
- [ ] Backup strategy verified
- [ ] Documentation updated

This deployment plan provides a comprehensive strategy for both local development and production deployment with industry-standard practices for security, performance, and reliability.