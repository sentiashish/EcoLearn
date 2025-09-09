from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from .models import User, UserProfile, TeacherProfile, StudentClass


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with additional user data."""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['email'] = user.email
        token['role'] = user.role
        token['full_name'] = user.full_name
        
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add user data to response
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': self.user.role,
            'is_email_verified': self.user.is_email_verified,
        }
        
        return data


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = (
            'email', 'first_name', 'last_name', 'role',
            'password', 'password_confirm'
        )
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile."""
    
    avatar_url = serializers.SerializerMethodField()
    level_progress = serializers.ReadOnlyField()
    
    class Meta:
        model = UserProfile
        fields = (
            'avatar', 'avatar_url', 'bio', 'date_of_birth', 'phone_number',
            'grade_level', 'school_name', 'city', 'country',
            'total_points', 'level', 'experience_points', 'streak_days',
            'level_progress', 'email_notifications', 'push_notifications',
            'privacy_public_profile'
        )
        read_only_fields = ('total_points', 'level', 'experience_points', 'streak_days')
    
    def get_avatar_url(self, obj):
        if obj.avatar:
            return obj.avatar.url
        return None


class TeacherProfileSerializer(serializers.ModelSerializer):
    """Serializer for teacher profile."""
    
    class Meta:
        model = TeacherProfile
        fields = (
            'employee_id', 'department', 'subjects', 'years_of_experience',
            'qualifications', 'is_verified', 'verification_date'
        )
        read_only_fields = ('is_verified', 'verification_date')


class UserSerializer(serializers.ModelSerializer):
    """Comprehensive user serializer with profile data."""
    
    profile = UserProfileSerializer(read_only=True)
    teacher_profile = TeacherProfileSerializer(read_only=True)
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'is_email_verified', 'is_active',
            'date_joined', 'profile', 'teacher_profile'
        )
        read_only_fields = ('id', 'date_joined', 'is_email_verified')


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user basic information."""
    
    class Meta:
        model = User
        fields = ('first_name', 'last_name')


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for changing password."""
    
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(required=True)
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match.")
        return attrs
    
    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class StudentClassSerializer(serializers.ModelSerializer):
    """Serializer for student classes."""
    
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    student_count = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentClass
        fields = (
            'id', 'name', 'description', 'teacher', 'teacher_name',
            'class_code', 'student_count', 'is_active',
            'created_at', 'updated_at'
        )
        read_only_fields = ('class_code', 'created_at', 'updated_at')
    
    def get_student_count(self, obj):
        return obj.students.count()
    
    def create(self, validated_data):
        class_instance = super().create(validated_data)
        class_instance.generate_class_code()
        class_instance.save()
        return class_instance


class ClassEnrollmentSerializer(serializers.Serializer):
    """Serializer for enrolling in a class using class code."""
    
    class_code = serializers.CharField(max_length=10)
    
    def validate_class_code(self, value):
        try:
            student_class = StudentClass.objects.get(
                class_code=value.upper(),
                is_active=True
            )
        except StudentClass.DoesNotExist:
            raise serializers.ValidationError("Invalid class code.")
        
        return value
    
    def save(self):
        user = self.context['request'].user
        class_code = self.validated_data['class_code'].upper()
        student_class = StudentClass.objects.get(class_code=class_code)
        
        if user in student_class.students.all():
            raise serializers.ValidationError("Already enrolled in this class.")
        
        student_class.students.add(user)
        return student_class


class PublicUserSerializer(serializers.ModelSerializer):
    """Public user serializer for leaderboards and public profiles."""
    
    avatar_url = serializers.SerializerMethodField()
    total_points = serializers.IntegerField(source='profile.total_points')
    level = serializers.IntegerField(source='profile.level')
    
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'avatar_url', 'total_points', 'level')
    
    def get_avatar_url(self, obj):
        if hasattr(obj, 'profile') and obj.profile.avatar:
            return obj.profile.avatar.url
        return None


class PublicUserProfileSerializer(serializers.ModelSerializer):
    """Public user profile serializer for challenges and other apps."""
    
    user = PublicUserSerializer(read_only=True)
    avatar_url = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = (
            'user', 'avatar_url', 'total_points', 'level',
            'bio', 'city', 'country', 'created_at'
        )
        read_only_fields = ('total_points', 'level')
    
    def get_avatar_url(self, obj):
        if obj.avatar:
            return obj.avatar.url
        return None