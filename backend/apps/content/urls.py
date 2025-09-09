from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, TagViewSet, LessonViewSet,
    QuizViewSet, QuestionViewSet, ContentRatingViewSet
)

app_name = 'content'

# Create router and register viewsets
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'lessons', LessonViewSet, basename='lesson')
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'ratings', ContentRatingViewSet, basename='rating')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # Additional custom endpoints can be added here
    # Example:
    # path('lessons/<int:lesson_id>/quiz/', views.lesson_quiz, name='lesson-quiz'),
    # path('categories/<int:category_id>/lessons/', views.category_lessons, name='category-lessons'),
]

# URL patterns for reference:
# GET /api/content/categories/ - List all categories
# POST /api/content/categories/ - Create new category (teachers only)
# GET /api/content/categories/{id}/ - Get category details
# PUT/PATCH /api/content/categories/{id}/ - Update category (teachers only)
# DELETE /api/content/categories/{id}/ - Delete category (teachers only)
#
# GET /api/content/tags/ - List all tags
# POST /api/content/tags/ - Create new tag (teachers only)
# GET /api/content/tags/{id}/ - Get tag details
# PUT/PATCH /api/content/tags/{id}/ - Update tag (teachers only)
# DELETE /api/content/tags/{id}/ - Delete tag (teachers only)
#
# GET /api/content/lessons/ - List lessons
# POST /api/content/lessons/ - Create new lesson (teachers only)
# GET /api/content/lessons/{id}/ - Get lesson details
# PUT/PATCH /api/content/lessons/{id}/ - Update lesson (teachers only)
# DELETE /api/content/lessons/{id}/ - Delete lesson (teachers only)
# POST /api/content/lessons/{id}/complete/ - Mark lesson as completed
# POST /api/content/lessons/{id}/rate/ - Rate a lesson
# GET /api/content/lessons/featured/ - Get featured lessons
# GET /api/content/lessons/my_progress/ - Get user's lesson progress
#
# GET /api/content/quizzes/ - List quizzes
# POST /api/content/quizzes/ - Create new quiz (teachers only)
# GET /api/content/quizzes/{id}/ - Get quiz details
# PUT/PATCH /api/content/quizzes/{id}/ - Update quiz (teachers only)
# DELETE /api/content/quizzes/{id}/ - Delete quiz (teachers only)
# GET /api/content/quizzes/{id}/start/ - Start a quiz (get questions)
# POST /api/content/quizzes/{id}/take/ - Submit quiz answers
# GET /api/content/quizzes/{id}/attempts/ - Get user's quiz attempts
# POST /api/content/quizzes/{id}/rate/ - Rate a quiz
#
# GET /api/content/questions/ - List questions (teachers only)
# POST /api/content/questions/ - Create new question (teachers only)
# GET /api/content/questions/{id}/ - Get question details (teachers only)
# PUT/PATCH /api/content/questions/{id}/ - Update question (teachers only)
# DELETE /api/content/questions/{id}/ - Delete question (teachers only)
#
# GET /api/content/ratings/ - List ratings
# POST /api/content/ratings/ - Create new rating
# GET /api/content/ratings/{id}/ - Get rating details
# PUT/PATCH /api/content/ratings/{id}/ - Update rating (owner only)
# DELETE /api/content/ratings/{id}/ - Delete rating (owner only)