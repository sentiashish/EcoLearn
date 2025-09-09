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
- SQLite database (for local development)
- JWT authentication
- CORS configuration
- Comprehensive API endpoints

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+

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
   
   For local development, you can use the default SQLite database settings.

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Create a superuser (optional):
   ```bash
   python manage.py createsuperuser
   ```

7. Start the development server:
   ```bash
   python manage.py runserver
   ```
   
   The backend will be available at `http://localhost:8000`

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
   
   For local development, set `VITE_API_BASE_URL=http://localhost:8000/api/v1`

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Local Development Environment Variables

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Environmental Education Platform
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
```

### Backend (.env)
```env
# Django settings for local development
DEBUG=True
SECRET_KEY=your-local-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS settings for local development
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CORS_ALLOW_CREDENTIALS=True

# SQLite database (default for local development)
# DATABASE_URL=sqlite:///db.sqlite3

# Email configuration (optional for local development)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
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