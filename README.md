# Environmental Education Platform

A comprehensive web application for environmental education featuring interactive lessons, quizzes, and progress tracking.

## Features

- **Interactive Lessons**: Engaging environmental education content
- **Quiz System**: Test knowledge with interactive quizzes
- **Progress Tracking**: Monitor learning progress and achievements
- **User Authentication**: Secure user registration and login
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface built with React and Tailwind CSS

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Query for data fetching
- React Router for navigation
- React Hook Form for form handling
- Lucide React for icons

### Backend
- Django 4.2 with Django REST Framework
- PostgreSQL database
- Redis for caching
- JWT authentication
- CORS configuration
- Comprehensive API endpoints

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 15+
- Redis (optional, for caching)

### Local Development

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

5. Configure your database and other settings in `.env`

6. Run migrations:
   ```bash
   python manage.py migrate
   ```

7. Create a superuser (optional):
   ```bash
   python manage.py createsuperuser
   ```

8. Start the development server:
   ```bash
   python manage.py runserver
   ```

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your configuration:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Deployment

### Frontend Deployment (Vercel)

1. **Prepare Environment Variables**:
   - Update `frontend/.env.production` with your production values
   - Set `VITE_API_BASE_URL` to your backend API URL

2. **Update Vercel Configuration**:
   - Modify `frontend/vercel.json`:
     - Replace `https://your-backend-domain.com` with your actual backend domain
     - Update environment variables as needed

3. **Deploy to Vercel**:
   ```bash
   cd frontend
   npx vercel --prod
   ```

### Backend Deployment (Render)

1. **Prepare Environment Variables**:
   - Update `render.yaml` configuration:
     - Replace `your-backend-domain.onrender.com` with your actual Render app name
     - Replace `your-frontend-domain.vercel.app` with your actual Vercel domain
     - Replace `your-custom-domain.com` with your actual custom domain (if any)

2. **Database Setup**:
   - The `render.yaml` includes PostgreSQL and Redis configuration
   - Database will be automatically created and connected

3. **Deploy to Render**:
   - Connect your GitHub repository to Render
   - Render will automatically deploy using the `render.yaml` configuration

### Environment Variables

#### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api/v1
VITE_WS_BASE_URL=wss://your-backend-domain.com/ws
VITE_APP_NAME=Environmental Education Platform
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production

# Feature flags
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=false

# External services (configure as needed)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_GOOGLE_ANALYTICS_ID=your_ga_id

# Production settings
VITE_MOCK_API=false
VITE_DEBUG_MODE=false
```

#### Backend (.env)
```env
# Django settings
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=your-backend-domain.onrender.com,your-custom-domain.com

# CORS and CSRF
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,https://your-custom-domain.com
CSRF_TRUSTED_ORIGINS=https://your-frontend-domain.vercel.app,https://your-custom-domain.com
CORS_ALLOW_CREDENTIALS=True

# Database (automatically configured on Render)
DATABASE_URL=postgresql://user:password@host:port/database

# Redis (automatically configured on Render)
REDIS_URL=redis://host:port

# Email configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# External services (configure as needed)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

OPENAI_API_KEY=your_openai_key
GOOGLE_MAPS_API_KEY=your_maps_key

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

## API Documentation

The backend provides a comprehensive REST API with the following main endpoints:

- `/api/v1/auth/` - Authentication (login, register, logout)
- `/api/v1/users/` - User management
- `/api/v1/content/` - Educational content and lessons
- `/api/v1/quizzes/` - Quiz system
- `/api/v1/progress/` - User progress tracking

API documentation is available at `/api/docs/` when running the backend server.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.