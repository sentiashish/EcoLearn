from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router and register viewsets
router = DefaultRouter()
router.register(r'badges', views.BadgeViewSet, basename='badge')
router.register(r'point-transactions', views.PointTransactionViewSet, basename='pointtransaction')
router.register(r'user-badges', views.UserBadgeViewSet, basename='userbadge')
router.register(r'leaderboards', views.LeaderboardViewSet, basename='leaderboard')
router.register(r'achievements', views.AchievementViewSet, basename='achievement')
router.register(r'stats', views.GamificationStatsViewSet, basename='gamificationstats')

# URL patterns
urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Custom endpoints (examples - these are handled by viewset actions)
    # Badge endpoints:
    # GET /api/gamification/badges/ - List all badges
    # POST /api/gamification/badges/ - Create badge (admin only)
    # GET /api/gamification/badges/{id}/ - Get badge details
    # PUT/PATCH /api/gamification/badges/{id}/ - Update badge (admin only)
    # DELETE /api/gamification/badges/{id}/ - Delete badge (admin only)
    # GET /api/gamification/badges/earned/ - Get user's earned badges
    # GET /api/gamification/badges/progress/ - Get user's badge progress
    # POST /api/gamification/badges/{id}/award/ - Award badge to user (admin only)
    # GET /api/gamification/badges/leaderboard/ - Get badge leaderboard
    
    # Point Transaction endpoints:
    # GET /api/gamification/point-transactions/ - List user's transactions
    # POST /api/gamification/point-transactions/ - Create transaction (admin only)
    # GET /api/gamification/point-transactions/{id}/ - Get transaction details
    # GET /api/gamification/point-transactions/summary/ - Get user's point summary
    # GET /api/gamification/point-transactions/leaderboard/ - Get points leaderboard
    
    # User Badge endpoints:
    # GET /api/gamification/user-badges/ - List user's badges
    # GET /api/gamification/user-badges/{id}/ - Get user badge details
    # PATCH /api/gamification/user-badges/{id}/toggle_display/ - Toggle badge display
    
    # Leaderboard endpoints:
    # GET /api/gamification/leaderboards/ - List leaderboards
    # POST /api/gamification/leaderboards/ - Create leaderboard (admin only)
    # GET /api/gamification/leaderboards/{id}/ - Get leaderboard details
    # PUT/PATCH /api/gamification/leaderboards/{id}/ - Update leaderboard (admin only)
    # DELETE /api/gamification/leaderboards/{id}/ - Delete leaderboard (admin only)
    # POST /api/gamification/leaderboards/{id}/refresh/ - Refresh leaderboard (admin only)
    # GET /api/gamification/leaderboards/global_rankings/ - Get global rankings
    
    # Achievement endpoints:
    # GET /api/gamification/achievements/ - List user's achievements
    # GET /api/gamification/achievements/{id}/ - Get achievement details
    # GET /api/gamification/achievements/recent/ - Get recent achievements
    # GET /api/gamification/achievements/summary/ - Get user's achievement summary
    
    # Stats endpoints:
    # GET /api/gamification/stats/user_stats/ - Get user's comprehensive stats
    # GET /api/gamification/stats/system_summary/ - Get system summary (admin only)
    # GET /api/gamification/stats/daily_login_bonus/ - Claim daily login bonus
]

# App name for namespacing
app_name = 'gamification'

# Example usage in other apps:
# from django.urls import reverse
# badge_list_url = reverse('gamification:badge-list')
# user_stats_url = reverse('gamification:gamificationstats-user-stats')
# daily_bonus_url = reverse('gamification:gamificationstats-daily-login-bonus')

# Example API calls:
# GET /api/gamification/badges/?badge_type=achievement&rarity=legendary
# GET /api/gamification/point-transactions/?transaction_type=lesson_completion
# GET /api/gamification/leaderboards/?leaderboard_type=weekly_points&is_active=true
# GET /api/gamification/achievements/?achievement_type=streak_milestone
# POST /api/gamification/badges/1/award/ {"user_id": "uuid-here"}
# PATCH /api/gamification/user-badges/1/toggle_display/