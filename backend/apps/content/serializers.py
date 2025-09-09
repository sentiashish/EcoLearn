from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import (
    Category, Tag, Lesson, Quiz, Question, Answer,
    LessonCompletion, QuizAttempt, UserAnswer, ContentRating
)

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for content categories."""
    
    lesson_count = serializers.SerializerMethodField()
    quiz_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'icon', 'color',
            'is_active', 'lesson_count', 'quiz_count', 'created_at'
        ]
        read_only_fields = ['slug', 'created_at']
    
    def get_lesson_count(self, obj):
        return obj.lessons.filter(is_published=True).count()
    
    def get_quiz_count(self, obj):
        return obj.quizzes.filter(is_published=True).count()


class TagSerializer(serializers.ModelSerializer):
    """Serializer for content tags."""
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'created_at']
        read_only_fields = ['slug', 'created_at']


class AnswerSerializer(serializers.ModelSerializer):
    """Serializer for quiz answers."""
    
    class Meta:
        model = Answer
        fields = ['id', 'answer_text', 'is_correct', 'order']
    
    def to_representation(self, instance):
        """Hide correct answer info for students during quiz."""
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        # Hide correct answers during quiz taking
        if (request and hasattr(request, 'hide_correct_answers') and 
            request.hide_correct_answers):
            data.pop('is_correct', None)
        
        return data


class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for quiz questions."""
    
    answers = AnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = [
            'id', 'question_text', 'question_type', 'explanation',
            'points', 'order', 'image', 'answers'
        ]


class QuestionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating questions with answers."""
    
    answers = AnswerSerializer(many=True, write_only=True)
    
    class Meta:
        model = Question
        fields = [
            'question_text', 'question_type', 'explanation',
            'points', 'order', 'image', 'answers'
        ]
    
    def validate(self, data):
        """Validate question and answers."""
        answers = data.get('answers', [])
        question_type = data.get('question_type')
        
        if question_type == Question.QuestionType.MULTIPLE_CHOICE:
            if len(answers) < 2:
                raise serializers.ValidationError(
                    "Multiple choice questions must have at least 2 answers."
                )
            
            correct_answers = [a for a in answers if a.get('is_correct')]
            if len(correct_answers) == 0:
                raise serializers.ValidationError(
                    "Multiple choice questions must have at least one correct answer."
                )
        
        elif question_type == Question.QuestionType.TRUE_FALSE:
            if len(answers) != 2:
                raise serializers.ValidationError(
                    "True/False questions must have exactly 2 answers."
                )
            
            correct_answers = [a for a in answers if a.get('is_correct')]
            if len(correct_answers) != 1:
                raise serializers.ValidationError(
                    "True/False questions must have exactly one correct answer."
                )
        
        return data
    
    def create(self, validated_data):
        """Create question with answers."""
        answers_data = validated_data.pop('answers')
        question = Question.objects.create(**validated_data)
        
        for answer_data in answers_data:
            Answer.objects.create(question=question, **answer_data)
        
        return question


class LessonListSerializer(serializers.ModelSerializer):
    """Serializer for lesson list view."""
    
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    is_completed = serializers.SerializerMethodField()
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'slug', 'description', 'category', 'tags',
            'content_type', 'difficulty_level', 'estimated_duration',
            'thumbnail', 'points_reward', 'author_name', 'is_featured',
            'is_completed', 'completion_count', 'average_rating',
            'created_at', 'published_at'
        ]
    
    def get_is_completed(self, obj):
        """Check if current user completed this lesson."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.completions.filter(user=request.user).exists()
        return False


class LessonDetailSerializer(serializers.ModelSerializer):
    """Serializer for lesson detail view."""
    
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    prerequisites = LessonListSerializer(many=True, read_only=True)
    quizzes = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'slug', 'description', 'content', 'category',
            'tags', 'content_type', 'difficulty_level', 'estimated_duration',
            'thumbnail', 'video_url', 'points_reward', 'author_name',
            'prerequisites', 'quizzes', 'is_completed', 'user_rating',
            'completion_count', 'average_rating', 'created_at', 'published_at'
        ]
    
    def get_quizzes(self, obj):
        """Get published quizzes for this lesson."""
        quizzes = obj.quizzes.filter(is_published=True)
        return QuizListSerializer(quizzes, many=True, context=self.context).data
    
    def get_is_completed(self, obj):
        """Check if current user completed this lesson."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.completions.filter(user=request.user).exists()
        return False
    
    def get_user_rating(self, obj):
        """Get current user's rating for this lesson."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                rating = obj.ratings.get(user=request.user)
                return {
                    'rating': rating.rating,
                    'review': rating.review
                }
            except ContentRating.DoesNotExist:
                return None
        return None


class LessonCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating lessons."""
    
    class Meta:
        model = Lesson
        fields = [
            'title', 'description', 'content', 'category', 'tags',
            'content_type', 'difficulty_level', 'estimated_duration',
            'thumbnail', 'video_url', 'points_reward', 'prerequisites',
            'is_published', 'is_featured', 'order'
        ]
    
    def create(self, validated_data):
        """Create lesson with current user as author."""
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class QuizListSerializer(serializers.ModelSerializer):
    """Serializer for quiz list view."""
    
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    user_attempts = serializers.SerializerMethodField()
    best_score = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'slug', 'description', 'category', 'tags',
            'lesson_title', 'quiz_type', 'time_limit', 'max_attempts',
            'passing_score', 'points_reward', 'question_count',
            'author_name', 'is_featured', 'user_attempts', 'best_score',
            'average_score', 'created_at', 'published_at'
        ]
    
    def get_user_attempts(self, obj):
        """Get number of attempts by current user."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.attempts.filter(user=request.user).count()
        return 0
    
    def get_best_score(self, obj):
        """Get best score by current user."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            best_attempt = obj.attempts.filter(user=request.user).order_by('-score').first()
            return best_attempt.score if best_attempt else None
        return None


class QuizDetailSerializer(serializers.ModelSerializer):
    """Serializer for quiz detail view."""
    
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    lesson = LessonListSerializer(read_only=True)
    questions = QuestionSerializer(many=True, read_only=True)
    user_attempts = serializers.SerializerMethodField()
    can_attempt = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'slug', 'description', 'instructions',
            'category', 'tags', 'lesson', 'quiz_type', 'time_limit',
            'max_attempts', 'passing_score', 'points_reward',
            'shuffle_questions', 'shuffle_answers', 'show_correct_answers',
            'allow_review', 'questions', 'author_name', 'user_attempts',
            'can_attempt', 'average_score', 'created_at', 'published_at'
        ]
    
    def get_user_attempts(self, obj):
        """Get user's attempts for this quiz."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            attempts = obj.attempts.filter(user=request.user).order_by('-started_at')
            return QuizAttemptSerializer(attempts, many=True).data
        return []
    
    def get_can_attempt(self, obj):
        """Check if user can attempt this quiz."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            user_attempts = obj.attempts.filter(user=request.user).count()
            return user_attempts < obj.max_attempts
        return False


class QuizCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating quizzes."""
    
    class Meta:
        model = Quiz
        fields = [
            'title', 'description', 'instructions', 'lesson', 'category',
            'tags', 'quiz_type', 'time_limit', 'max_attempts',
            'passing_score', 'points_reward', 'shuffle_questions',
            'shuffle_answers', 'show_correct_answers', 'allow_review',
            'is_published', 'is_featured'
        ]
    
    def create(self, validated_data):
        """Create quiz with current user as author."""
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class QuizAttemptSerializer(serializers.ModelSerializer):
    """Serializer for quiz attempts."""
    
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    user_answers = serializers.SerializerMethodField()
    
    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'quiz_title', 'score', 'total_questions',
            'correct_answers', 'time_taken', 'is_passed',
            'attempt_number', 'user_answers', 'started_at', 'completed_at'
        ]
        read_only_fields = ['user_answers']
    
    def get_user_answers(self, obj):
        """Get user answers for this attempt."""
        if obj.completed_at:  # Only show answers for completed attempts
            return UserAnswerSerializer(obj.user_answers.all(), many=True).data
        return []


class UserAnswerSerializer(serializers.ModelSerializer):
    """Serializer for user answers."""
    
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    selected_answer_text = serializers.CharField(
        source='selected_answer.answer_text', read_only=True
    )
    correct_answer = serializers.SerializerMethodField()
    
    class Meta:
        model = UserAnswer
        fields = [
            'id', 'question_text', 'selected_answer_text', 'text_answer',
            'is_correct', 'points_earned', 'correct_answer', 'answered_at'
        ]
    
    def get_correct_answer(self, obj):
        """Get the correct answer for the question."""
        correct_answer = obj.question.answers.filter(is_correct=True).first()
        return correct_answer.answer_text if correct_answer else None


class LessonCompletionSerializer(serializers.ModelSerializer):
    """Serializer for lesson completions."""
    
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    points_earned = serializers.CharField(source='lesson.points_reward', read_only=True)
    
    class Meta:
        model = LessonCompletion
        fields = [
            'id', 'lesson_title', 'points_earned',
            'completed_at', 'time_spent'
        ]
        read_only_fields = ['completed_at']
    
    def create(self, validated_data):
        """Create lesson completion for current user."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ContentRatingSerializer(serializers.ModelSerializer):
    """Serializer for content ratings."""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    content_title = serializers.SerializerMethodField()
    
    class Meta:
        model = ContentRating
        fields = [
            'id', 'rating', 'review', 'user_name', 'content_title',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user_name', 'content_title', 'created_at', 'updated_at']
    
    def get_content_title(self, obj):
        """Get title of rated content."""
        if obj.lesson:
            return obj.lesson.title
        elif obj.quiz:
            return obj.quiz.title
        return None
    
    def create(self, validated_data):
        """Create rating for current user."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class QuizTakeSerializer(serializers.Serializer):
    """Serializer for taking a quiz."""
    
    answers = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of answers: [{'question_id': 1, 'answer_id': 2}, ...]"
    )
    time_taken = serializers.IntegerField(min_value=1)
    
    def validate_answers(self, value):
        """Validate quiz answers."""
        quiz = self.context['quiz']
        question_ids = set(quiz.questions.values_list('id', flat=True))
        
        for answer in value:
            if 'question_id' not in answer:
                raise serializers.ValidationError("Each answer must have a question_id.")
            
            if answer['question_id'] not in question_ids:
                raise serializers.ValidationError(
                    f"Question {answer['question_id']} not found in this quiz."
                )
        
        return value
    
    def create(self, validated_data):
        """Create quiz attempt and user answers."""
        quiz = self.context['quiz']
        user = self.context['request'].user
        answers_data = validated_data['answers']
        time_taken = validated_data['time_taken']
        
        with transaction.atomic():
            # Get attempt number
            attempt_number = quiz.attempts.filter(user=user).count() + 1
            
            # Create quiz attempt
            attempt = QuizAttempt.objects.create(
                user=user,
                quiz=quiz,
                attempt_number=attempt_number,
                time_taken=time_taken,
                total_questions=quiz.questions.count(),
                score=0,  # Will be calculated
                correct_answers=0  # Will be calculated
            )
            
            # Process answers
            correct_count = 0
            total_points = 0
            
            for answer_data in answers_data:
                question = Question.objects.get(id=answer_data['question_id'])
                
                user_answer = UserAnswer.objects.create(
                    attempt=attempt,
                    question=question
                )
                
                # Handle different answer types
                if 'answer_id' in answer_data:
                    selected_answer = Answer.objects.get(id=answer_data['answer_id'])
                    user_answer.selected_answer = selected_answer
                    if selected_answer.is_correct:
                        user_answer.is_correct = True
                        user_answer.points_earned = question.points
                        correct_count += 1
                
                elif 'text_answer' in answer_data:
                    user_answer.text_answer = answer_data['text_answer']
                    # Check against correct text answers
                    correct_answers = question.answers.filter(is_correct=True)
                    for correct_answer in correct_answers:
                        if (user_answer.text_answer.lower().strip() == 
                            correct_answer.answer_text.lower().strip()):
                            user_answer.is_correct = True
                            user_answer.points_earned = question.points
                            correct_count += 1
                            break
                
                user_answer.save()
                total_points += user_answer.points_earned
            
            # Calculate final score
            max_points = sum(q.points for q in quiz.questions.all())
            score = int((total_points / max_points) * 100) if max_points > 0 else 0
            
            # Update attempt
            attempt.score = score
            attempt.correct_answers = correct_count
            attempt.completed_at = timezone.now()
            attempt.save()
            
            return attempt