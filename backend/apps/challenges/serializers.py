from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.content.serializers import CategorySerializer, TagSerializer
from apps.users.serializers import PublicUserProfileSerializer, PublicUserSerializer
from .models import (
    Challenge, Submission, ChallengeRating,
    ChallengeFavorite, ChallengeDiscussion, CarbonFootprint
)

User = get_user_model()


class ChallengeListSerializer(serializers.ModelSerializer):
    """Serializer for challenge list view."""
    
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    author = PublicUserSerializer(read_only=True)
    
    # Statistics
    submission_count = serializers.IntegerField(read_only=True)
    solved_count = serializers.IntegerField(read_only=True)
    success_rate = serializers.ReadOnlyField()
    average_rating = serializers.DecimalField(
        max_digits=3, decimal_places=2, read_only=True
    )
    
    # User-specific fields
    is_solved = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    user_best_submission = serializers.SerializerMethodField()
    
    class Meta:
        model = Challenge
        fields = [
            'id', 'title', 'slug', 'description', 'difficulty_level',
            'challenge_type', 'category', 'tags', 'author',
            'points_reward', 'xp_reward', 'is_featured',
            'submission_count', 'solved_count', 'success_rate',
            'average_rating', 'created_at', 'published_at',
            'is_solved', 'is_favorited', 'user_best_submission'
        ]
    
    def get_is_solved(self, obj):
        """Check if current user has solved this challenge."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.submissions.filter(
                user=request.user,
                status=Submission.Status.ACCEPTED
            ).exists()
        return False
    
    def get_is_favorited(self, obj):
        """Check if current user has favorited this challenge."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False
    
    def get_user_best_submission(self, obj):
        """Get user's best submission for this challenge."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            best_submission = obj.submissions.filter(
                user=request.user
            ).order_by('-score', 'execution_time').first()
            
            if best_submission:
                return {
                    'id': best_submission.id,
                    'status': best_submission.status,
                    'score': best_submission.score,
                    'execution_time': best_submission.execution_time,
                    'submitted_at': best_submission.submitted_at
                }
        return None


class ChallengeDetailSerializer(serializers.ModelSerializer):
    """Serializer for challenge detail view."""
    
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    author = PublicUserSerializer(read_only=True)
    
    # Statistics
    submission_count = serializers.IntegerField(read_only=True)
    solved_count = serializers.IntegerField(read_only=True)
    success_rate = serializers.ReadOnlyField()
    average_rating = serializers.DecimalField(
        max_digits=3, decimal_places=2, read_only=True
    )
    
    # User-specific fields
    is_solved = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    user_submissions = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Challenge
        fields = [
            'id', 'title', 'slug', 'description', 'problem_statement',
            'difficulty_level', 'challenge_type', 'category', 'tags',
            'input_format', 'output_format', 'constraints', 'examples',
            'hints', 'time_limit', 'memory_limit', 'points_reward',
            'xp_reward', 'author', 'is_featured', 'submission_count',
            'solved_count', 'success_rate', 'average_rating',
            'created_at', 'published_at', 'is_solved', 'is_favorited',
            'user_submissions', 'user_rating'
        ]
    
    def get_is_solved(self, obj):
        """Check if current user has solved this challenge."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.submissions.filter(
                user=request.user,
                status=Submission.Status.ACCEPTED
            ).exists()
        return False
    
    def get_is_favorited(self, obj):
        """Check if current user has favorited this challenge."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False
    
    def get_user_submissions(self, obj):
        """Get current user's submissions for this challenge."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            submissions = obj.submissions.filter(
                user=request.user
            ).order_by('-submitted_at')[:5]  # Last 5 submissions
            
            return [{
                'id': sub.id,
                'status': sub.status,
                'score': sub.score,
                'language': sub.language,
                'execution_time': sub.execution_time,
                'memory_used': sub.memory_used,
                'submitted_at': sub.submitted_at
            } for sub in submissions]
        return []
    
    def get_user_rating(self, obj):
        """Get current user's rating for this challenge."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            rating = obj.ratings.filter(user=request.user).first()
            if rating:
                return {
                    'rating': rating.rating,
                    'difficulty_rating': rating.difficulty_rating,
                    'clarity_rating': rating.clarity_rating,
                    'review': rating.review
                }
        return None


class ChallengeCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating challenges."""
    
    category_id = serializers.IntegerField(write_only=True, required=False)
    tag_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Challenge
        fields = [
            'title', 'description', 'problem_statement', 'difficulty_level',
            'challenge_type', 'category_id', 'tag_ids', 'input_format',
            'output_format', 'constraints', 'examples', 'hints',
            'test_cases', 'hidden_test_cases', 'solution_code',
            'solution_explanation', 'time_limit', 'memory_limit',
            'points_reward', 'xp_reward', 'status', 'is_featured'
        ]
    
    def validate_examples(self, value):
        """Validate examples format."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Examples must be a list.")
        
        for i, example in enumerate(value):
            if not isinstance(example, dict):
                raise serializers.ValidationError(
                    f"Example {i+1} must be an object."
                )
            
            required_fields = ['input', 'output']
            for field in required_fields:
                if field not in example:
                    raise serializers.ValidationError(
                        f"Example {i+1} must have '{field}' field."
                    )
        
        return value
    
    def validate_test_cases(self, value):
        """Validate test cases format."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Test cases must be a list.")
        
        if len(value) == 0:
            raise serializers.ValidationError(
                "At least one test case is required."
            )
        
        for i, test_case in enumerate(value):
            if not isinstance(test_case, dict):
                raise serializers.ValidationError(
                    f"Test case {i+1} must be an object."
                )
            
            required_fields = ['input', 'expected_output']
            for field in required_fields:
                if field not in test_case:
                    raise serializers.ValidationError(
                        f"Test case {i+1} must have '{field}' field."
                    )
        
        return value
    
    def validate_points_reward(self, value):
        """Validate points reward based on difficulty."""
        difficulty_points = {
            Challenge.DifficultyLevel.BEGINNER: (50, 200),
            Challenge.DifficultyLevel.INTERMEDIATE: (100, 400),
            Challenge.DifficultyLevel.ADVANCED: (200, 600),
            Challenge.DifficultyLevel.EXPERT: (300, 1000),
        }
        
        difficulty = self.initial_data.get('difficulty_level')
        if difficulty and difficulty in difficulty_points:
            min_points, max_points = difficulty_points[difficulty]
            if not (min_points <= value <= max_points):
                raise serializers.ValidationError(
                    f"Points for {difficulty} difficulty should be between "
                    f"{min_points} and {max_points}."
                )
        
        return value
    
    def create(self, validated_data):
        """Create challenge with relationships."""
        category_id = validated_data.pop('category_id', None)
        tag_ids = validated_data.pop('tag_ids', [])
        
        # Set author from request user
        validated_data['author'] = self.context['request'].user
        
        # Set category
        if category_id:
            from apps.content.models import Category
            try:
                validated_data['category'] = Category.objects.get(id=category_id)
            except Category.DoesNotExist:
                raise serializers.ValidationError(
                    {'category_id': 'Invalid category ID.'}
                )
        
        challenge = Challenge.objects.create(**validated_data)
        
        # Set tags
        if tag_ids:
            from apps.content.models import Tag
            tags = Tag.objects.filter(id__in=tag_ids)
            challenge.tags.set(tags)
        
        return challenge
    
    def update(self, instance, validated_data):
        """Update challenge with relationships."""
        category_id = validated_data.pop('category_id', None)
        tag_ids = validated_data.pop('tag_ids', None)
        
        # Update category
        if category_id is not None:
            if category_id:
                from apps.content.models import Category
                try:
                    validated_data['category'] = Category.objects.get(id=category_id)
                except Category.DoesNotExist:
                    raise serializers.ValidationError(
                        {'category_id': 'Invalid category ID.'}
                    )
            else:
                validated_data['category'] = None
        
        # Update challenge
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update tags
        if tag_ids is not None:
            from apps.content.models import Tag
            tags = Tag.objects.filter(id__in=tag_ids)
            instance.tags.set(tags)
        
        return instance


class SubmissionSerializer(serializers.ModelSerializer):
    """Serializer for submission list/detail view."""
    
    challenge = serializers.StringRelatedField(read_only=True)
    user = PublicUserSerializer(read_only=True)
    success_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = Submission
        fields = [
            'id', 'challenge', 'user', 'language', 'status', 'score',
            'execution_time', 'memory_used', 'passed_test_cases',
            'total_test_cases', 'success_rate', 'points_earned',
            'xp_earned', 'submitted_at', 'evaluated_at'
        ]


class SubmissionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating submissions."""
    
    challenge_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Submission
        fields = ['challenge_id', 'code', 'language']
    
    def validate_challenge_id(self, value):
        """Validate challenge exists and is published."""
        try:
            challenge = Challenge.objects.get(id=value)
            if challenge.status != Challenge.Status.PUBLISHED:
                raise serializers.ValidationError(
                    "Cannot submit to unpublished challenge."
                )
            return value
        except Challenge.DoesNotExist:
            raise serializers.ValidationError("Invalid challenge ID.")
    
    def validate_code(self, value):
        """Validate code is not empty."""
        if not value.strip():
            raise serializers.ValidationError("Code cannot be empty.")
        
        if len(value) > 50000:  # 50KB limit
            raise serializers.ValidationError(
                "Code is too long. Maximum 50KB allowed."
            )
        
        return value
    
    def create(self, validated_data):
        """Create submission."""
        challenge_id = validated_data.pop('challenge_id')
        challenge = Challenge.objects.get(id=challenge_id)
        
        validated_data['challenge'] = challenge
        validated_data['user'] = self.context['request'].user
        
        return Submission.objects.create(**validated_data)


class SubmissionDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed submission view (includes code)."""
    
    challenge = ChallengeListSerializer(read_only=True)
    user = PublicUserSerializer(read_only=True)
    success_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = Submission
        fields = [
            'id', 'challenge', 'user', 'code', 'language', 'status',
            'score', 'execution_time', 'memory_used', 'test_results',
            'passed_test_cases', 'total_test_cases', 'success_rate',
            'error_message', 'compilation_output', 'points_earned',
            'xp_earned', 'submitted_at', 'evaluated_at'
        ]


class ChallengeRatingSerializer(serializers.ModelSerializer):
    """Serializer for challenge ratings."""
    
    user = PublicUserSerializer(read_only=True)
    challenge_title = serializers.CharField(source='challenge.title', read_only=True)
    
    class Meta:
        model = ChallengeRating
        fields = [
            'id', 'challenge', 'challenge_title', 'user', 'rating',
            'difficulty_rating', 'clarity_rating', 'review',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['challenge', 'user']
    
    def validate(self, data):
        """Validate user has attempted the challenge."""
        request = self.context.get('request')
        challenge = self.context.get('challenge')
        
        if request and challenge:
            # Check if user has submitted to this challenge
            has_submission = challenge.submissions.filter(
                user=request.user
            ).exists()
            
            if not has_submission:
                raise serializers.ValidationError(
                    "You must attempt the challenge before rating it."
                )
        
        return data
    
    def create(self, validated_data):
        """Create rating."""
        validated_data['user'] = self.context['request'].user
        validated_data['challenge'] = self.context['challenge']
        return super().create(validated_data)


class ChallengeFavoriteSerializer(serializers.ModelSerializer):
    """Serializer for challenge favorites."""
    
    challenge = ChallengeListSerializer(read_only=True)
    
    class Meta:
        model = ChallengeFavorite
        fields = ['id', 'challenge', 'created_at']
        read_only_fields = ['user']


class ChallengeDiscussionSerializer(serializers.ModelSerializer):
    """Serializer for challenge discussions."""
    
    user = PublicUserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    reply_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChallengeDiscussion
        fields = [
            'id', 'user', 'parent', 'content', 'is_solution',
            'is_spoiler', 'is_approved', 'replies', 'reply_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['challenge', 'user', 'is_approved']
    
    def get_replies(self, obj):
        """Get replies to this discussion."""
        if obj.parent is None:  # Only get replies for top-level discussions
            replies = obj.replies.filter(is_approved=True).order_by('created_at')
            return ChallengeDiscussionSerializer(
                replies,
                many=True,
                context=self.context
            ).data
        return []
    
    def get_reply_count(self, obj):
        """Get number of replies."""
        return obj.replies.filter(is_approved=True).count()
    
    def create(self, validated_data):
        """Create discussion."""
        validated_data['user'] = self.context['request'].user
        validated_data['challenge'] = self.context['challenge']
        return super().create(validated_data)


class LeaderboardSerializer(serializers.Serializer):
    """Serializer for leaderboard data."""
    
    user = PublicUserSerializer(read_only=True)
    rank = serializers.IntegerField(read_only=True)
    score = serializers.IntegerField(read_only=True)
    solved_count = serializers.IntegerField(read_only=True)
    total_points = serializers.IntegerField(read_only=True)
    avg_execution_time = serializers.FloatField(read_only=True)


class CarbonFootprintSerializer(serializers.ModelSerializer):
    """Serializer for carbon footprint calculations."""
    
    user = PublicUserSerializer(read_only=True)
    challenge = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = CarbonFootprint
        fields = [
            'id', 'user', 'challenge',
            # Transportation
            'car_distance', 'car_efficiency', 'public_transport_distance',
            'flights_short', 'flights_long',
            # Energy
            'electricity_usage', 'heating_gas', 'renewable_energy',
            # Lifestyle
            'meat_consumption', 'local_food', 'waste_recycling',
            # Results
            'transport_emissions', 'energy_emissions', 'lifestyle_emissions',
            'total_emissions', 'eco_score', 'recommendations',
            # Metadata
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'transport_emissions', 'energy_emissions', 'lifestyle_emissions',
            'total_emissions', 'eco_score', 'recommendations', 'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        """Create carbon footprint calculation."""
        validated_data['user'] = self.context['request'].user
        validated_data['challenge_id'] = 1  # Carbon Footprint Calculator challenge
        return super().create(validated_data)


class CarbonFootprintCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating carbon footprint calculations."""
    
    class Meta:
        model = CarbonFootprint
        fields = [
            # Transportation
            'car_distance', 'car_efficiency', 'public_transport_distance',
            'flights_short', 'flights_long',
            # Energy
            'electricity_usage', 'heating_gas', 'renewable_energy',
            # Lifestyle
            'meat_consumption', 'local_food', 'waste_recycling'
        ]
    
    def create(self, validated_data):
        """Create carbon footprint calculation."""
        validated_data['user'] = self.context['request'].user
        # Get or create the Carbon Footprint Calculator challenge
        try:
            from .models import Challenge
            challenge = Challenge.objects.get(id=1)
            validated_data['challenge'] = challenge
        except Challenge.DoesNotExist:
            raise serializers.ValidationError("Carbon Footprint Calculator challenge not found")
        return super().create(validated_data)