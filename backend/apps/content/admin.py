from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    Category, Tag, Lesson, Quiz, Question, Answer,
    LessonCompletion, QuizAttempt, UserAnswer, ContentRating
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin interface for Category model."""
    
    list_display = [
        'name', 'description', 'lesson_count', 'quiz_count',
        'is_active', 'created_at'
    ]
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at']
    
    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'description', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def lesson_count(self, obj):
        """Display number of lessons in this category."""
        count = obj.lessons.count()
        if count > 0:
            url = reverse('admin:content_lesson_changelist') + f'?category__id__exact={obj.id}'
            return format_html('<a href="{}">{} lessons</a>', url, count)
        return '0 lessons'
    lesson_count.short_description = 'Lessons'
    
    def quiz_count(self, obj):
        """Display number of quizzes in this category."""
        count = obj.quizzes.count()
        if count > 0:
            url = reverse('admin:content_quiz_changelist') + f'?category__id__exact={obj.id}'
            return format_html('<a href="{}">{} quizzes</a>', url, count)
        return '0 quizzes'
    quiz_count.short_description = 'Quizzes'


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    """Admin interface for Tag model."""
    
    list_display = ['name', 'usage_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at']
    
    def usage_count(self, obj):
        """Display how many times this tag is used."""
        lesson_count = obj.lessons.count()
        quiz_count = obj.quizzes.count()
        total = lesson_count + quiz_count
        return f'{total} items ({lesson_count} lessons, {quiz_count} quizzes)'
    usage_count.short_description = 'Usage'


class LessonCompletionInline(admin.TabularInline):
    """Inline for lesson completions."""
    model = LessonCompletion
    extra = 0
    readonly_fields = ['user', 'completed_at', 'time_spent']
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False


class ContentRatingInline(admin.TabularInline):
    """Inline for content ratings."""
    model = ContentRating
    extra = 0
    readonly_fields = ['user', 'rating', 'review', 'created_at']
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    """Admin interface for Lesson model."""
    
    list_display = [
        'title', 'category', 'author', 'difficulty_level',
        'content_type', 'is_published', 'is_featured',
        'completion_count', 'avg_rating', 'created_at'
    ]
    list_filter = [
        'category', 'difficulty_level', 'content_type',
        'is_published', 'is_featured', 'created_at', 'author'
    ]
    search_fields = ['title', 'description', 'content']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['tags', 'prerequisites']
    readonly_fields = [
        'created_at', 'updated_at', 'completion_count',
        'avg_rating', 'view_content'
    ]
    inlines = [LessonCompletionInline, ContentRatingInline]
    
    fieldsets = (
        (None, {
            'fields': (
                'title', 'slug', 'description', 'category',
                'author', 'difficulty_level', 'content_type'
            )
        }),
        ('Content', {
            'fields': ('content', 'view_content', 'estimated_duration')
        }),
        ('Media', {
            'fields': ('thumbnail', 'video_url'),
            'classes': ('collapse',)
        }),
        ('Organization', {
            'fields': ('tags', 'prerequisites', 'order')
        }),
        ('Gamification', {
            'fields': ('points_reward',)
        }),
        ('Publishing', {
            'fields': (
                'is_published', 'published_at', 'is_featured'
            )
        }),
        ('Statistics', {
            'fields': ('completion_count', 'avg_rating'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def completion_count(self, obj):
        """Display number of completions."""
        return obj.completions.count()
    completion_count.short_description = 'Completions'
    
    def avg_rating(self, obj):
        """Display average rating."""
        if obj.average_rating:
            return f'{obj.average_rating:.1f}/5.0'
        return 'No ratings'
    avg_rating.short_description = 'Avg Rating'
    
    def view_content(self, obj):
        """Display truncated content for preview."""
        if obj.content:
            content = obj.content[:200] + '...' if len(obj.content) > 200 else obj.content
            return mark_safe(f'<div style="max-width: 400px; word-wrap: break-word;">{content}</div>')
        return 'No content'
    view_content.short_description = 'Content Preview'
    
    actions = ['publish_lessons', 'unpublish_lessons', 'feature_lessons', 'unfeature_lessons']
    
    def publish_lessons(self, request, queryset):
        """Publish selected lessons."""
        updated = queryset.update(is_published=True)
        self.message_user(request, f'{updated} lessons published successfully.')
    publish_lessons.short_description = 'Publish selected lessons'
    
    def unpublish_lessons(self, request, queryset):
        """Unpublish selected lessons."""
        updated = queryset.update(is_published=False)
        self.message_user(request, f'{updated} lessons unpublished successfully.')
    unpublish_lessons.short_description = 'Unpublish selected lessons'
    
    def feature_lessons(self, request, queryset):
        """Feature selected lessons."""
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} lessons featured successfully.')
    feature_lessons.short_description = 'Feature selected lessons'
    
    def unfeature_lessons(self, request, queryset):
        """Unfeature selected lessons."""
        updated = queryset.update(is_featured=False)
        self.message_user(request, f'{updated} lessons unfeatured successfully.')
    unfeature_lessons.short_description = 'Unfeature selected lessons'


class AnswerInline(admin.TabularInline):
    """Inline for question answers."""
    model = Answer
    extra = 2
    fields = ['answer_text', 'is_correct', 'order']


class QuizAttemptInline(admin.TabularInline):
    """Inline for quiz attempts."""
    model = QuizAttempt
    extra = 0
    readonly_fields = [
        'user', 'score', 'started_at',
        'completed_at', 'time_taken'
    ]
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    """Admin interface for Quiz model."""
    
    list_display = [
        'title', 'category', 'lesson', 'author', 'quiz_type',
        'question_count', 'is_published', 'is_featured',
        'attempt_count', 'avg_score', 'created_at'
    ]
    list_filter = [
        'category', 'quiz_type', 'is_published', 'is_featured',
        'created_at', 'author', 'lesson'
    ]
    search_fields = ['title', 'description']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['tags']
    readonly_fields = [
        'created_at', 'updated_at', 'question_count',
        'attempt_count', 'avg_score'
    ]
    inlines = [QuizAttemptInline, ContentRatingInline]
    
    fieldsets = (
        (None, {
            'fields': (
                'title', 'slug', 'description', 'category',
                'lesson', 'author', 'quiz_type'
            )
        }),
        ('Settings', {
            'fields': (
                'time_limit', 'max_attempts', 'passing_score',
                'shuffle_questions', 'shuffle_answers',
                'show_correct_answers', 'allow_review'
            )
        }),
        ('Content', {
            'fields': ('instructions', 'tags')
        }),
        ('Gamification', {
            'fields': ('points_reward',)
        }),
        ('Publishing', {
            'fields': ('is_published', 'published_at', 'is_featured')
        }),
        ('Statistics', {
            'fields': ('question_count', 'attempt_count', 'avg_score'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def question_count(self, obj):
        """Display number of questions."""
        count = obj.questions.count()
        if count > 0:
            url = reverse('admin:content_question_changelist') + f'?quiz__id__exact={obj.id}'
            return format_html('<a href="{}">{} questions</a>', url, count)
        return '0 questions'
    question_count.short_description = 'Questions'
    
    def attempt_count(self, obj):
        """Display number of attempts."""
        return obj.attempts.count()
    attempt_count.short_description = 'Attempts'
    
    def avg_score(self, obj):
        """Display average score."""
        if obj.average_score:
            return f'{obj.average_score:.1f}%'
        return 'No attempts'
    avg_score.short_description = 'Avg Score'
    
    actions = ['publish_quizzes', 'unpublish_quizzes']
    
    def publish_quizzes(self, request, queryset):
        """Publish selected quizzes."""
        updated = queryset.update(is_published=True)
        self.message_user(request, f'{updated} quizzes published successfully.')
    publish_quizzes.short_description = 'Publish selected quizzes'
    
    def unpublish_quizzes(self, request, queryset):
        """Unpublish selected quizzes."""
        updated = queryset.update(is_published=False)
        self.message_user(request, f'{updated} quizzes unpublished successfully.')
    unpublish_quizzes.short_description = 'Unpublish selected quizzes'


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    """Admin interface for Question model."""
    
    list_display = [
        'text_preview', 'quiz', 'question_type', 'points',
        'answer_count', 'order', 'created_at'
    ]
    list_filter = ['quiz', 'question_type', 'created_at']
    search_fields = ['question_text', 'quiz__title']
    readonly_fields = ['created_at', 'updated_at', 'answer_count']
    inlines = [AnswerInline]
    
    fieldsets = (
        (None, {
            'fields': ('quiz', 'text', 'question_type', 'points', 'order')
        }),
        ('Additional Info', {
            'fields': ('explanation', 'image'),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('answer_count',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def text_preview(self, obj):
        """Display truncated question text."""
        return obj.text[:100] + '...' if len(obj.text) > 100 else obj.text
    text_preview.short_description = 'Question'
    
    def answer_count(self, obj):
        """Display number of answers."""
        return obj.answers.count()
    answer_count.short_description = 'Answers'


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    """Admin interface for Answer model."""
    
    list_display = [
        'text_preview', 'question', 'is_correct', 'order', 'created_at'
    ]
    list_filter = ['is_correct', 'question__quiz', 'created_at']
    search_fields = ['answer_text', 'question__question_text']
    readonly_fields = ['created_at']
    
    def text_preview(self, obj):
        """Display truncated answer text."""
        return obj.text[:100] + '...' if len(obj.text) > 100 else obj.text
    text_preview.short_description = 'Answer'


@admin.register(LessonCompletion)
class LessonCompletionAdmin(admin.ModelAdmin):
    """Admin interface for LessonCompletion model."""
    
    list_display = [
        'user', 'lesson', 'completed_at', 'time_spent_display'
    ]
    list_filter = ['completed_at', 'lesson__category']
    search_fields = ['user__email', 'lesson__title']
    readonly_fields = ['completed_at']
    
    def time_spent_display(self, obj):
        """Display time spent in readable format."""
        if obj.time_spent:
            hours = obj.time_spent // 3600
            minutes = (obj.time_spent % 3600) // 60
            seconds = obj.time_spent % 60
            
            if hours > 0:
                return f'{hours}h {minutes}m {seconds}s'
            elif minutes > 0:
                return f'{minutes}m {seconds}s'
            else:
                return f'{seconds}s'
        return 'Not recorded'
    time_spent_display.short_description = 'Time Spent'


class UserAnswerInline(admin.TabularInline):
    """Inline for user answers in quiz attempts."""
    model = UserAnswer
    extra = 0
    readonly_fields = ['question', 'selected_answer', 'is_correct']
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    """Admin interface for QuizAttempt model."""
    
    list_display = [
        'user', 'quiz', 'score', 'is_passed',
        'started_at', 'completed_at', 'time_taken_display'
    ]
    list_filter = [
        'quiz', 'is_passed', 'started_at', 'completed_at'
    ]
    search_fields = ['user__email', 'quiz__title']
    readonly_fields = [
        'started_at', 'completed_at', 'time_taken',
        'is_passed'
    ]
    inlines = [UserAnswerInline]
    
    def time_taken_display(self, obj):
        """Display time taken in readable format."""
        if obj.time_taken:
            total_seconds = int(obj.time_taken.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            
            if hours > 0:
                return f'{hours}h {minutes}m {seconds}s'
            elif minutes > 0:
                return f'{minutes}m {seconds}s'
            else:
                return f'{seconds}s'
        return 'Not completed'
    time_taken_display.short_description = 'Time Taken'


@admin.register(UserAnswer)
class UserAnswerAdmin(admin.ModelAdmin):
    """Admin interface for UserAnswer model."""
    
    list_display = [
        'attempt', 'question', 'selected_answer', 'is_correct'
    ]
    list_filter = ['is_correct', 'attempt__quiz']
    search_fields = [
        'attempt__user__email', 'question__text',
        'selected_answer__text'
    ]
    readonly_fields = ['is_correct']


@admin.register(ContentRating)
class ContentRatingAdmin(admin.ModelAdmin):
    """Admin interface for ContentRating model."""
    
    list_display = [
        'user', 'content_title', 'rating', 'has_review', 'created_at'
    ]
    list_filter = ['rating', 'created_at']
    search_fields = [
        'user__email', 'lesson__title', 'quiz__title', 'review'
    ]
    readonly_fields = ['created_at', 'updated_at']
    
    def content_title(self, obj):
        """Display the title of rated content."""
        if obj.lesson:
            return f'Lesson: {obj.lesson.title}'
        elif obj.quiz:
            return f'Quiz: {obj.quiz.title}'
        return 'Unknown content'
    content_title.short_description = 'Content'
    
    def has_review(self, obj):
        """Display whether rating has a review."""
        return bool(obj.review)
    has_review.boolean = True
    has_review.short_description = 'Has Review'