from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import (
    Challenge, Submission, ChallengeRating, ChallengeFavorite, ChallengeDiscussion
)
from apps.content.models import Category

User = get_user_model()


class ChallengeModelTest(TestCase):
    """Test cases for Challenge model."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='creator@example.com',
            password='pass123',
            first_name='Creator',
            last_name='User'
        )
        self.category = Category.objects.create(
            name='Algorithms',
            description='Algorithm challenges'
        )
        self.challenge = Challenge.objects.create(
            title='Two Sum Problem',
            description='Find two numbers that add up to target',
            problem_statement='Given an array of integers...',
            difficulty_level='beginner',
            category=self.category,
            author=self.user,
            time_limit=60,
            memory_limit=128,
            status='published'
        )
    
    def test_challenge_creation(self):
        """Test challenge creation."""
        self.assertEqual(self.challenge.title, 'Two Sum Problem')
        self.assertEqual(self.challenge.difficulty_level, 'beginner')
        self.assertEqual(self.challenge.time_limit, 60)
        self.assertEqual(self.challenge.memory_limit, 128)
    
    def test_challenge_str_representation(self):
        """Test challenge string representation."""
        self.assertEqual(str(self.challenge), 'Two Sum Problem')
    
    def test_challenge_slug_generation(self):
        """Test that slug is generated automatically."""
        self.assertEqual(self.challenge.slug, 'two-sum-problem')


class SubmissionModelTest(TestCase):
    """Test cases for Submission model."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='solver@example.com',
            password='pass123',
            first_name='Solver',
            last_name='User'
        )
        self.creator = User.objects.create_user(
            email='creator@example.com',
            password='pass123',
            first_name='Creator',
            last_name='User'
        )
        self.category = Category.objects.create(
            name='Algorithms',
            description='Algorithm challenges'
        )
        self.challenge = Challenge.objects.create(
            title='Two Sum Problem',
            description='Find two numbers that add up to target',
            problem_statement='Given an array of integers...',
            difficulty_level='beginner',
            category=self.category,
            author=self.creator,
            status='published'
        )
        self.submission = Submission.objects.create(
            challenge=self.challenge,
            user=self.user,
            code='def two_sum(nums, target): pass',
            language='python',
            status='pending'
        )
    
    def test_submission_creation(self):
        """Test submission creation."""
        self.assertEqual(self.submission.challenge, self.challenge)
        self.assertEqual(self.submission.user, self.user)
        self.assertEqual(self.submission.language, 'python')
        self.assertEqual(self.submission.status, 'pending')
    
    def test_submission_str_representation(self):
        """Test submission string representation."""
        expected = f'{self.user.email} - {self.challenge.title} ({self.submission.status})'
        self.assertEqual(str(self.submission), expected)


class ChallengeRatingModelTest(TestCase):
    """Test cases for ChallengeRating model."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='rater@example.com',
            password='pass123',
            first_name='Rater',
            last_name='User'
        )
        self.creator = User.objects.create_user(
            email='creator@example.com',
            password='pass123',
            first_name='Creator',
            last_name='User'
        )
        self.category = Category.objects.create(
            name='Algorithms',
            description='Algorithm challenges'
        )
        self.challenge = Challenge.objects.create(
            title='Two Sum Problem',
            description='Find two numbers that add up to target',
            problem_statement='Given an array of integers...',
            difficulty_level='beginner',
            category=self.category,
            author=self.creator,
            status='published'
        )
        self.rating = ChallengeRating.objects.create(
            challenge=self.challenge,
            user=self.user,
            rating=5,
            review='Great challenge!',
            difficulty_rating=4,
            clarity_rating=5
        )
    
    def test_rating_creation(self):
        """Test rating creation."""
        self.assertEqual(self.rating.challenge, self.challenge)
        self.assertEqual(self.rating.user, self.user)
        self.assertEqual(self.rating.rating, 5)
        self.assertEqual(self.rating.review, 'Great challenge!')
    
    def test_rating_str_representation(self):
        """Test rating string representation."""
        expected = f'{self.user.email} rated {self.challenge.title}: 5/5'
        self.assertEqual(str(self.rating), expected)


class ChallengeDiscussionModelTest(TestCase):
    """Test cases for ChallengeDiscussion model."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='discusser@example.com',
            password='pass123',
            first_name='Discusser',
            last_name='User'
        )
        self.creator = User.objects.create_user(
            email='creator@example.com',
            password='pass123',
            first_name='Creator',
            last_name='User'
        )
        self.category = Category.objects.create(
            name='Algorithms',
            description='Algorithm challenges'
        )
        self.challenge = Challenge.objects.create(
            title='Two Sum Problem',
            description='Find two numbers that add up to target',
            problem_statement='Given an array of integers...',
            difficulty_level='beginner',
            category=self.category,
            author=self.creator,
            status='published'
        )
        self.discussion = ChallengeDiscussion.objects.create(
            challenge=self.challenge,
            user=self.user,
            content='How do I approach this problem?'
        )
    
    def test_discussion_creation(self):
        """Test discussion creation."""
        self.assertEqual(self.discussion.challenge, self.challenge)
        self.assertEqual(self.discussion.user, self.user)
        self.assertEqual(self.discussion.content, 'How do I approach this problem?')
    
    def test_discussion_str_representation(self):
        """Test discussion string representation."""
        expected = f'{self.challenge.title} - {self.user.email}'
        self.assertEqual(str(self.discussion), expected)


class ChallengeAPITest(APITestCase):
    """Test cases for Challenge API endpoints."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='pass123',
            first_name='Test',
            last_name='User',
            role='teacher'
        )
        self.creator = User.objects.create_user(
            email='creator@example.com',
            password='pass123',
            first_name='Creator',
            last_name='User'
        )
        self.category = Category.objects.create(
            name='Algorithms',
            description='Algorithm challenges'
        )
        self.challenge = Challenge.objects.create(
            title='Two Sum Problem',
            description='Find two numbers that add up to target',
            problem_statement='Given an array of integers...',
            difficulty_level='beginner',
            category=self.category,
            author=self.creator,
            status='published'
        )
    
    def test_challenge_list_public_access(self):
        """Test that challenge list is publicly accessible."""
        url = reverse('challenges:challenge-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_challenge_detail_public_access(self):
        """Test that challenge detail is publicly accessible."""
        url = reverse('challenges:challenge-detail', kwargs={'pk': self.challenge.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Two Sum Problem')
    
    def test_challenge_creation_requires_authentication(self):
        """Test that challenge creation requires authentication."""
        url = reverse('challenges:challenge-list')
        data = {
            'title': 'New Challenge',
            'description': 'New challenge description',
            'problem_statement': 'Solve this problem...',
            'difficulty_level': 'medium',
            'category': self.category.pk
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_authenticated_user_can_create_challenge(self):
        """Test that authenticated user can create challenge."""
        self.client.force_authenticate(user=self.user)
        url = reverse('challenges:challenge-list')
        data = {
            'title': 'New Challenge',
            'description': 'New challenge description',
            'problem_statement': 'Solve this problem...',
            'difficulty': 'medium',
            'category': self.category.pk
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Challenge.objects.filter(title='New Challenge').exists())


class SubmissionAPITest(APITestCase):
    """Test cases for Submission API endpoints."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='pass123',
            first_name='Test',
            last_name='User'
        )
        self.creator = User.objects.create_user(
            email='creator@example.com',
            password='pass123',
            first_name='Creator',
            last_name='User'
        )
        self.category = Category.objects.create(
            name='Algorithms',
            description='Algorithm challenges'
        )
        self.challenge = Challenge.objects.create(
            title='Two Sum Problem',
            description='Find two numbers that add up to target',
            problem_statement='Given an array of integers...',
            difficulty_level='beginner',
            category=self.category,
            author=self.creator,
            status='published'
        )
    
    def test_submission_creation_requires_authentication(self):
        """Test that submission creation requires authentication."""
        url = reverse('challenges:submission-list')
        data = {
            'challenge_id': self.challenge.pk,
            'code': 'def solution(): pass',
            'language': 'python'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_authenticated_user_can_submit(self):
        """Test that authenticated user can submit solution."""
        self.client.force_authenticate(user=self.user)
        url = reverse('challenges:submission-list')
        data = {
            'challenge_id': self.challenge.pk,
            'code': 'def solution(): pass',
            'language': 'python'
        }
        response = self.client.post(url, data, format='json')
        if response.status_code != status.HTTP_201_CREATED:
            print(f"Response status: {response.status_code}")
            print(f"Response data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Submission.objects.filter(user=self.user, challenge=self.challenge).exists())