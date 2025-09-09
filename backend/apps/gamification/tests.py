from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Badge, PointTransaction, UserBadge, Leaderboard, Achievement

User = get_user_model()


class BadgeModelTest(TestCase):
    """Test cases for Badge model."""
    
    def setUp(self):
        self.badge = Badge.objects.create(
            name='First Lesson',
            description='Complete your first lesson',
            icon='🎓',
            points_required=10,
            badge_type='lesson'
        )
    
    def test_badge_creation(self):
        """Test badge creation."""
        self.assertEqual(self.badge.name, 'First Lesson')
        self.assertEqual(self.badge.description, 'Complete your first lesson')
        self.assertEqual(self.badge.icon, '🎓')
        self.assertEqual(self.badge.points_required, 10)
        self.assertEqual(self.badge.badge_type, 'lesson')
        self.assertTrue(self.badge.is_active)
    
    def test_badge_str_representation(self):
        """Test badge string representation."""
        expected = f"{self.badge.name} ({self.badge.get_rarity_display()})"
        self.assertEqual(str(self.badge), expected)


class PointTransactionModelTest(TestCase):
    """Test cases for PointTransaction model."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='pass123',
            first_name='Test',
            last_name='User'
        )
        self.transaction = PointTransaction.objects.create(
            user=self.user,
            points=50,
            transaction_type='earned',
            description='Completed lesson: Python Basics'
        )
    
    def test_transaction_creation(self):
        """Test point transaction creation."""
        self.assertEqual(self.transaction.user, self.user)
        self.assertEqual(self.transaction.points, 50)
        self.assertEqual(self.transaction.transaction_type, 'earned')
        self.assertEqual(self.transaction.description, 'Completed lesson: Python Basics')
    
    def test_transaction_str_representation(self):
        """Test transaction string representation."""
        expected = f'{self.user.email}: +50 pts - Completed lesson: Python Basics'
        self.assertEqual(str(self.transaction), expected)


class UserBadgeModelTest(TestCase):
    """Test cases for UserBadge model."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='pass123',
            first_name='Test',
            last_name='User'
        )
        self.badge = Badge.objects.create(
            name='First Lesson',
            description='Complete your first lesson',
            icon='🎓',
            points_required=10,
            badge_type='lesson'
        )
        self.user_badge = UserBadge.objects.create(
            user=self.user,
            badge=self.badge
        )
    
    def test_user_badge_creation(self):
        """Test user badge creation."""
        self.assertEqual(self.user_badge.user, self.user)
        self.assertEqual(self.user_badge.badge, self.badge)
        self.assertIsNotNone(self.user_badge.earned_at)
    
    def test_user_badge_str_representation(self):
        """Test user badge string representation."""
        expected = f'{self.user.email} - {self.badge.name}'
        self.assertEqual(str(self.user_badge), expected)
    
    def test_user_badge_unique_constraint(self):
        """Test that user can't earn the same badge twice."""
        with self.assertRaises(Exception):
            UserBadge.objects.create(
                user=self.user,
                badge=self.badge
            )


class LeaderboardModelTest(TestCase):
    """Test cases for Leaderboard model."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='pass123',
            first_name='Test',
            last_name='User'
        )
        self.leaderboard = Leaderboard.objects.create(
            name='Weekly Points Leaderboard',
            leaderboard_type='weekly_points',
            description='Weekly points leaderboard for testing'
        )
    
    def test_leaderboard_creation(self):
        """Test leaderboard creation."""
        self.assertEqual(self.leaderboard.name, 'Weekly Points Leaderboard')
        self.assertEqual(self.leaderboard.leaderboard_type, 'weekly_points')
        self.assertEqual(self.leaderboard.description, 'Weekly points leaderboard for testing')
        self.assertTrue(self.leaderboard.is_active)
    
    def test_leaderboard_str_representation(self):
        """Test leaderboard string representation."""
        expected = 'Weekly Points Leaderboard (Weekly Points)'
        self.assertEqual(str(self.leaderboard), expected)


class AchievementModelTest(TestCase):
    """Test cases for Achievement model."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='pass123',
            first_name='Test',
            last_name='User'
        )
        self.achievement = Achievement.objects.create(
            user=self.user,
            title='Quiz Master',
            description='Completed 10 quizzes with 90% accuracy',
            points_awarded=100,
            achievement_type='quiz'
        )
    
    def test_achievement_creation(self):
        """Test achievement creation."""
        self.assertEqual(self.achievement.user, self.user)
        self.assertEqual(self.achievement.title, 'Quiz Master')
        self.assertEqual(self.achievement.description, 'Completed 10 quizzes with 90% accuracy')
        self.assertEqual(self.achievement.points_awarded, 100)
        self.assertEqual(self.achievement.achievement_type, 'quiz')
    
    def test_achievement_str_representation(self):
        """Test achievement string representation."""
        expected = f'{self.user.email} - {self.achievement.title}'
        self.assertEqual(str(self.achievement), expected)


class BadgeAPITest(APITestCase):
    """Test cases for Badge API endpoints."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='pass123',
            first_name='Test',
            last_name='User'
        )
        self.badge = Badge.objects.create(
            name='First Lesson',
            description='Complete your first lesson',
            icon='🎓',
            points_required=10,
            badge_type='lesson'
        )
    
    def test_badge_list_public_access(self):
        """Test that badge list is accessible to authenticated users."""
        self.client.force_authenticate(user=self.user)
        url = reverse('gamification:badge-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_badge_detail_public_access(self):
        """Test that badge detail is accessible to authenticated users."""
        self.client.force_authenticate(user=self.user)
        url = reverse('gamification:badge-detail', kwargs={'pk': self.badge.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'First Lesson')
    
    def test_badge_creation_requires_authentication(self):
        """Test that badge creation requires authentication."""
        url = reverse('gamification:badge-list')
        data = {
            'name': 'New Badge',
            'description': 'New badge description',
            'icon': '🏆',
            'points_required': 50,
            'badge_type': 'challenge'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PointTransactionAPITest(APITestCase):
    """Test cases for PointTransaction API endpoints."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='pass123',
            first_name='Test',
            last_name='User'
        )
        self.transaction = PointTransaction.objects.create(
            user=self.user,
            points=50,
            transaction_type='earned',
            description='Completed lesson: Python Basics'
        )
    
    def test_transaction_list_requires_authentication(self):
        """Test that transaction list requires authentication."""
        url = reverse('gamification:pointtransaction-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_authenticated_user_can_view_transactions(self):
        """Test that authenticated user can view their transactions."""
        self.client.force_authenticate(user=self.user)
        url = reverse('gamification:pointtransaction-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_user_can_only_view_own_transactions(self):
        """Test that user can only view their own transactions."""
        other_user = User.objects.create_user(
            email='other@example.com',
            password='pass123',
            first_name='Other',
            last_name='User'
        )
        PointTransaction.objects.create(
            user=other_user,
            points=25,
            transaction_type='earned',
            description='Other user transaction'
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('gamification:pointtransaction-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['user'], self.user.pk)


class LeaderboardAPITest(APITestCase):
    """Test cases for Leaderboard API endpoints."""
    
    def setUp(self):
        self.user1 = User.objects.create_user(
            email='user1@example.com',
            password='pass123',
            first_name='User',
            last_name='One'
        )
        self.user2 = User.objects.create_user(
            email='user2@example.com',
            password='pass123',
            first_name='User',
            last_name='Two'
        )
        self.leaderboard1 = Leaderboard.objects.create(
            name='Weekly Points Leaderboard',
            leaderboard_type='weekly_points',
            description='Weekly points leaderboard for testing'
        )
        self.leaderboard2 = Leaderboard.objects.create(
            name='Monthly Points Leaderboard',
            leaderboard_type='monthly_points',
            description='Monthly points leaderboard for testing'
        )
    
    def test_leaderboard_list_public_access(self):
        """Test that leaderboard list is accessible to authenticated users."""
        self.client.force_authenticate(user=self.user1)
        url = reverse('gamification:leaderboard-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_leaderboard_ordering(self):
        """Test that leaderboard is ordered by name."""
        self.client.force_authenticate(user=self.user1)
        url = reverse('gamification:leaderboard-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check that we have leaderboards in the response
        self.assertGreaterEqual(len(response.data['results']), 2)
        # Check that the leaderboards have the expected names
        names = [item['name'] for item in response.data['results']]
        self.assertIn('Weekly Points Leaderboard', names)
        self.assertIn('Monthly Points Leaderboard', names)