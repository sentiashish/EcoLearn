from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import (
    Category, Tag, Lesson, Quiz, Question, Answer,
    LessonCompletion, QuizAttempt, ContentRating
)

User = get_user_model()


class CategoryModelTest(TestCase):
    """Test cases for Category model."""
    
    def setUp(self):
        self.category = Category.objects.create(
            name='Programming',
            description='Programming tutorials and lessons'
        )
    
    def test_category_creation(self):
        """Test category creation."""
        self.assertEqual(self.category.name, 'Programming')
        self.assertEqual(self.category.slug, 'programming')
        self.assertTrue(self.category.is_active)
    
    def test_category_str_representation(self):
        """Test category string representation."""
        self.assertEqual(str(self.category), 'Programming')


class TagModelTest(TestCase):
    """Test cases for Tag model."""
    
    def setUp(self):
        self.tag = Tag.objects.create(name='Python')
    
    def test_tag_creation(self):
        """Test tag creation."""
        self.assertEqual(self.tag.name, 'Python')
        self.assertEqual(self.tag.slug, 'python')
    
    def test_tag_str_representation(self):
        """Test tag string representation."""
        self.assertEqual(str(self.tag), 'Python')


class LessonModelTest(TestCase):
    """Test cases for Lesson model."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='instructor@example.com',
            password='pass123',
            first_name='Instructor',
            last_name='User'
        )
        self.category = Category.objects.create(
            name='Programming',
            description='Programming lessons'
        )
        self.lesson = Lesson.objects.create(
            title='Python Basics',
            description='Learn Python fundamentals',
            content='Learn Python fundamentals',
            category=self.category,
            author=self.user,
            difficulty_level='beginner',
            estimated_duration=30,
            is_published=True
        )
    
    def test_lesson_creation(self):
        """Test lesson creation."""
        self.assertEqual(self.lesson.title, 'Python Basics')
        self.assertEqual(self.lesson.slug, 'python-basics')
        self.assertEqual(self.lesson.difficulty_level, 'beginner')
        self.assertTrue(self.lesson.is_published)
    
    def test_lesson_str_representation(self):
        """Test lesson string representation."""
        self.assertEqual(str(self.lesson), 'Python Basics')


class QuizModelTest(TestCase):
    """Test cases for Quiz model."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='instructor@example.com',
            password='pass123',
            first_name='Instructor',
            last_name='User'
        )
        self.category = Category.objects.create(
            name='Programming',
            description='Programming quizzes'
        )
        self.quiz = Quiz.objects.create(
            title='Python Quiz',
            description='Test your Python knowledge',
            category=self.category,
            author=self.user,
            time_limit=30,
            passing_score=70
        )
    
    def test_quiz_creation(self):
        """Test quiz creation."""
        self.assertEqual(self.quiz.title, 'Python Quiz')
        self.assertEqual(self.quiz.time_limit, 30)
        self.assertEqual(self.quiz.passing_score, 70)
        self.assertFalse(self.quiz.is_published)  # Default is False
    
    def test_quiz_str_representation(self):
        """Test quiz string representation."""
        self.assertEqual(str(self.quiz), 'Python Quiz')


class QuestionModelTest(TestCase):
    """Test cases for Question model."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='instructor@example.com',
            password='pass123',
            first_name='Instructor',
            last_name='User'
        )
        self.category = Category.objects.create(
            name='Programming',
            description='Programming quizzes'
        )
        self.quiz = Quiz.objects.create(
            title='Python Quiz',
            description='Test your Python knowledge',
            category=self.category,
            author=self.user
        )
        self.question = Question.objects.create(
            quiz=self.quiz,
            question_text='What is Python?',
            question_type='multiple_choice',
            points=10
        )
    
    def test_question_creation(self):
        """Test question creation."""
        self.assertEqual(self.question.question_text, 'What is Python?')
        self.assertEqual(self.question.question_type, 'multiple_choice')
        self.assertEqual(self.question.points, 10)
    
    def test_question_str_representation(self):
        """Test question string representation."""
        self.assertEqual(str(self.question), 'Python Quiz - Q0')


class LessonAPITest(APITestCase):
    """Test cases for Lesson API endpoints."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='pass123',
            first_name='Test',
            last_name='User'
        )
        self.instructor = User.objects.create_user(
            email='instructor@example.com',
            password='pass123',
            first_name='Instructor',
            last_name='User'
        )
        self.category = Category.objects.create(
            name='Programming',
            description='Programming lessons'
        )
        self.lesson = Lesson.objects.create(
            title='Python Basics',
            description='Learn Python fundamentals',
            content='Learn Python fundamentals',
            category=self.category,
            author=self.instructor,
            estimated_duration=30,
            is_published=True
        )
    
    def test_lesson_list_public_access(self):
        """Test that lesson list is publicly accessible."""
        url = reverse('content:lesson-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_lesson_detail_public_access(self):
        """Test that lesson detail is publicly accessible."""
        url = reverse('content:lesson-detail', kwargs={'pk': self.lesson.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Python Basics')
    
    def test_lesson_creation_requires_authentication(self):
        """Test that lesson creation requires authentication."""
        url = reverse('content:lesson-list')
        data = {
            'title': 'New Lesson',
            'content': 'New lesson content',
            'category': self.category.pk
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class QuizAPITest(APITestCase):
    """Test cases for Quiz API endpoints."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='pass123',
            first_name='Test',
            last_name='User'
        )
        self.instructor = User.objects.create_user(
            email='instructor@example.com',
            password='pass123',
            first_name='Instructor',
            last_name='User'
        )
        self.category = Category.objects.create(
            name='Programming',
            description='Programming quizzes'
        )
        self.quiz = Quiz.objects.create(
            title='Python Quiz',
            description='Test your Python knowledge',
            category=self.category,
            author=self.instructor,
            is_published=True
        )
    
    def test_quiz_list_public_access(self):
        """Test that quiz list is publicly accessible."""
        url = reverse('content:quiz-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_quiz_detail_public_access(self):
        """Test that quiz detail is publicly accessible."""
        url = reverse('content:quiz-detail', kwargs={'pk': self.quiz.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Python Quiz')