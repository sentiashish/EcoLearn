from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    UserViewSet,
    UserProfileViewSet,
    TeacherProfileViewSet,
    StudentClassViewSet
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', UserProfileViewSet, basename='userprofile')
router.register(r'teacher-profiles', TeacherProfileViewSet, basename='teacherprofile')
router.register(r'classes', StudentClassViewSet, basename='studentclass')

urlpatterns = [
    # JWT Authentication endpoints
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Include router URLs
    path('', include(router.urls)),
]

# URL patterns for reference:
# POST /api/v1/users/auth/login/ - Login (get JWT tokens)
# POST /api/v1/users/auth/refresh/ - Refresh JWT token
# 
# User Management:
# GET /api/v1/users/users/ - List users (filtered by role)
# POST /api/v1/users/users/ - Register new user
# GET /api/v1/users/users/{id}/ - Get user details
# PUT/PATCH /api/v1/users/users/{id}/ - Update user
# DELETE /api/v1/users/users/{id}/ - Delete user
# GET /api/v1/users/users/me/ - Get current user profile
# PUT/PATCH /api/v1/users/users/me/ - Update current user profile
# POST /api/v1/users/users/change_password/ - Change password
# GET /api/v1/users/users/leaderboard/ - Get user leaderboard
# 
# User Profiles:
# GET /api/v1/users/profiles/ - List user profiles
# GET /api/v1/users/profiles/{id}/ - Get profile details
# PUT/PATCH /api/v1/users/profiles/{id}/ - Update profile
# POST /api/v1/users/profiles/{id}/update_streak/ - Update daily streak
# 
# Teacher Profiles:
# GET /api/v1/users/teacher-profiles/ - List teacher profiles
# GET /api/v1/users/teacher-profiles/{id}/ - Get teacher profile
# PUT/PATCH /api/v1/users/teacher-profiles/{id}/ - Update teacher profile
# 
# Student Classes:
# GET /api/v1/users/classes/ - List classes (filtered by role)
# POST /api/v1/users/classes/ - Create new class (teachers only)
# GET /api/v1/users/classes/{id}/ - Get class details
# PUT/PATCH /api/v1/users/classes/{id}/ - Update class (teacher only)
# DELETE /api/v1/users/classes/{id}/ - Delete class (teacher only)
# POST /api/v1/users/classes/enroll/ - Enroll in class using code
# POST /api/v1/users/classes/{id}/leave/ - Leave a class
# GET /api/v1/users/classes/{id}/students/ - Get class students (teacher only)