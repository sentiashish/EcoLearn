from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ChallengeViewSet, SubmissionViewSet, ChallengeRatingViewSet,
    ChallengeFavoriteViewSet, ChallengeDiscussionViewSet, CarbonFootprintViewSet
)

app_name = 'challenges'

# Create router and register viewsets
router = DefaultRouter()
router.register(r'challenges', ChallengeViewSet, basename='challenge')
router.register(r'submissions', SubmissionViewSet, basename='submission')
router.register(r'ratings', ChallengeRatingViewSet, basename='rating')
router.register(r'favorites', ChallengeFavoriteViewSet, basename='favorite')
router.register(r'discussions', ChallengeDiscussionViewSet, basename='discussion')
router.register(r'carbon-footprint', CarbonFootprintViewSet, basename='carbon-footprint')

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Custom endpoints (examples)
    # path('challenges/<int:challenge_id>/submit/', views.submit_solution, name='submit-solution'),
    # path('challenges/<int:challenge_id>/test/', views.test_solution, name='test-solution'),
    # path('submissions/<int:submission_id>/evaluate/', views.evaluate_submission, name='evaluate-submission'),
]

# Available URL patterns:
# GET    /api/challenges/                          - List challenges
# POST   /api/challenges/                          - Create challenge (teachers only)
# GET    /api/challenges/{id}/                     - Get challenge details
# PUT    /api/challenges/{id}/                     - Update challenge (author/admin only)
# PATCH  /api/challenges/{id}/                     - Partial update challenge
# DELETE /api/challenges/{id}/                     - Delete challenge (author/admin only)
# POST   /api/challenges/{id}/submit/              - Submit solution to challenge
# GET    /api/challenges/{id}/submissions/         - Get user's submissions for challenge
# POST   /api/challenges/{id}/favorite/            - Add/remove from favorites
# POST   /api/challenges/{id}/rate/                - Rate challenge
# GET    /api/challenges/{id}/leaderboard/         - Get challenge leaderboard
# GET    /api/challenges/featured/                 - Get featured challenges
# GET    /api/challenges/my_progress/              - Get user's challenge progress
# GET    /api/challenges/recommendations/          - Get recommended challenges
#
# GET    /api/submissions/                         - List user's submissions
# POST   /api/submissions/                         - Create submission
# GET    /api/submissions/{id}/                    - Get submission details
# PUT    /api/submissions/{id}/                    - Update submission (owner only)
# DELETE /api/submissions/{id}/                    - Delete submission (owner only)
# POST   /api/submissions/{id}/resubmit/           - Resubmit for evaluation
#
# GET    /api/ratings/                             - List ratings
# POST   /api/ratings/                             - Create rating
# GET    /api/ratings/{id}/                        - Get rating details
# PUT    /api/ratings/{id}/                        - Update rating (owner only)
# DELETE /api/ratings/{id}/                       - Delete rating (owner only)
#
# GET    /api/favorites/                           - List user's favorites
# POST   /api/favorites/                           - Add to favorites
# GET    /api/favorites/{id}/                      - Get favorite details
# DELETE /api/favorites/{id}/                      - Remove from favorites
#
# GET    /api/discussions/                         - List discussions
# POST   /api/discussions/                         - Create discussion
# GET    /api/discussions/{id}/                    - Get discussion details
# PUT    /api/discussions/{id}/                    - Update discussion (owner only)
# DELETE /api/discussions/{id}/                    - Delete discussion (owner only)
# POST   /api/discussions/{id}/reply/              - Reply to discussion
# POST   /api/discussions/{id}/flag/               - Flag discussion for moderation