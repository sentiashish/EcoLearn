from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.db.models import Count, Avg
from .models import (
    Challenge, Submission, ChallengeRating,
    ChallengeFavorite, ChallengeDiscussion
)


class SubmissionInline(admin.TabularInline):
    """Inline for submissions in challenge admin."""
    model = Submission
    extra = 0
    readonly_fields = ['user', 'submitted_at', 'status', 'score']
    fields = ['user', 'language', 'status', 'score', 'submitted_at']
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False


class ChallengeRatingInline(admin.TabularInline):
    """Inline for ratings in challenge admin."""
    model = ChallengeRating
    extra = 0
    readonly_fields = ['user', 'rating', 'created_at']
    fields = ['user', 'rating', 'difficulty_rating', 'clarity_rating', 'created_at']
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False


class ChallengeDiscussionInline(admin.TabularInline):
    """Inline for discussions in challenge admin."""
    model = ChallengeDiscussion
    extra = 0
    readonly_fields = ['user', 'created_at', 'is_approved']
    fields = ['user', 'content', 'is_approved', 'created_at']
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    """Admin interface for Challenge model."""
    
    list_display = [
        'title', 'author', 'difficulty_level', 'challenge_type',
        'status', 'submission_count', 'average_rating', 'is_featured',
        'created_at', 'published_at'
    ]
    
    list_filter = [
        'difficulty_level', 'challenge_type', 'status', 'is_featured',
        'category', 'created_at', 'published_at'
    ]
    
    search_fields = [
        'title', 'description', 'problem_statement',
        'author__username', 'author__email'
    ]
    
    readonly_fields = [
        'created_at', 'updated_at', 'submission_count',
        'average_rating'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title', 'description', 'author', 'category',
                'tags', 'is_featured'
            )
        }),
        ('Challenge Details', {
            'fields': (
                'difficulty_level', 'challenge_type', 'problem_statement',
                'input_format', 'output_format', 'constraints',
                'sample_input', 'sample_output', 'explanation'
            )
        }),
        ('Evaluation', {
            'fields': (
                'time_limit', 'memory_limit', 'test_cases',
                'solution_template', 'starter_code'
            )
        }),
        ('Status & Publishing', {
            'fields': (
                'status', 'published_at', 'points_reward'
            )
        }),
        ('Statistics', {
            'fields': (
                'submission_count', 'average_rating',
                'created_at', 'updated_at'
            ),
            'classes': ('collapse',)
        })
    )
    
    filter_horizontal = ['tags']
    
    inlines = [SubmissionInline, ChallengeRatingInline, ChallengeDiscussionInline]
    
    actions = ['publish_challenges', 'unpublish_challenges', 'feature_challenges', 'unfeature_challenges']
    
    def get_queryset(self, request):
        """Optimize queryset with annotations."""
        queryset = super().get_queryset(request)
        return queryset.select_related(
            'author', 'category'
        ).prefetch_related(
            'tags'
        ).annotate(
            submission_count_annotated=Count('submissions'),
            average_rating_annotated=Avg('ratings__rating')
        )
    
    def submission_count(self, obj):
        """Display submission count."""
        count = getattr(obj, 'submission_count_annotated', obj.submission_count)
        if count > 0:
            url = reverse('admin:challenges_submission_changelist')
            return format_html(
                '<a href="{}?challenge__id__exact={}">{}</a>',
                url, obj.id, count
            )
        return count
    submission_count.short_description = 'Submissions'
    submission_count.admin_order_field = 'submission_count_annotated'
    
    def average_rating(self, obj):
        """Display average rating."""
        rating = getattr(obj, 'average_rating_annotated', obj.average_rating)
        if rating:
            return f"{rating:.1f} ⭐"
        return "No ratings"
    average_rating.short_description = 'Avg Rating'
    average_rating.admin_order_field = 'average_rating_annotated'
    
    def publish_challenges(self, request, queryset):
        """Publish selected challenges."""
        updated = queryset.update(status=Challenge.Status.PUBLISHED)
        self.message_user(
            request,
            f"{updated} challenge(s) published successfully."
        )
    publish_challenges.short_description = "Publish selected challenges"
    
    def unpublish_challenges(self, request, queryset):
        """Unpublish selected challenges."""
        updated = queryset.update(status=Challenge.Status.DRAFT)
        self.message_user(
            request,
            f"{updated} challenge(s) unpublished successfully."
        )
    unpublish_challenges.short_description = "Unpublish selected challenges"
    
    def feature_challenges(self, request, queryset):
        """Feature selected challenges."""
        updated = queryset.update(is_featured=True)
        self.message_user(
            request,
            f"{updated} challenge(s) featured successfully."
        )
    feature_challenges.short_description = "Feature selected challenges"
    
    def unfeature_challenges(self, request, queryset):
        """Unfeature selected challenges."""
        updated = queryset.update(is_featured=False)
        self.message_user(
            request,
            f"{updated} challenge(s) unfeatured successfully."
        )
    unfeature_challenges.short_description = "Unfeature selected challenges"


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    """Admin interface for Submission model."""
    
    list_display = [
        'id', 'challenge_link', 'user_link', 'language',
        'status', 'score', 'execution_time', 'memory_used',
        'submitted_at', 'evaluated_at'
    ]
    
    list_filter = [
        'status', 'language', 'submitted_at', 'evaluated_at',
        'challenge__difficulty_level', 'challenge__challenge_type'
    ]
    
    search_fields = [
        'user__username', 'user__email', 'challenge__title',
        'id'
    ]
    
    readonly_fields = [
        'submitted_at', 'evaluated_at', 'execution_time',
        'memory_used', 'passed_test_cases', 'total_test_cases'
    ]
    
    fieldsets = (
        ('Submission Info', {
            'fields': (
                'challenge', 'user', 'language', 'status'
            )
        }),
        ('Code', {
            'fields': ('code',),
            'classes': ('wide',)
        }),
        ('Evaluation Results', {
            'fields': (
                'score', 'execution_time', 'memory_used',
                'passed_test_cases', 'total_test_cases',
                'error_message', 'output'
            )
        }),
        ('Timestamps', {
            'fields': ('submitted_at', 'evaluated_at'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['reevaluate_submissions']
    
    def get_queryset(self, request):
        """Optimize queryset."""
        return super().get_queryset(request).select_related(
            'user', 'challenge'
        )
    
    def challenge_link(self, obj):
        """Link to challenge admin."""
        url = reverse('admin:challenges_challenge_change', args=[obj.challenge.id])
        return format_html('<a href="{}">{}</a>', url, obj.challenge.title)
    challenge_link.short_description = 'Challenge'
    challenge_link.admin_order_field = 'challenge__title'
    
    def user_link(self, obj):
        """Link to user admin."""
        url = reverse('admin:users_user_change', args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, obj.user.username)
    user_link.short_description = 'User'
    user_link.admin_order_field = 'user__username'
    
    def reevaluate_submissions(self, request, queryset):
        """Reevaluate selected submissions."""
        updated = queryset.update(
            status=Submission.Status.PENDING,
            evaluated_at=None
        )
        # TODO: Queue submissions for reevaluation
        self.message_user(
            request,
            f"{updated} submission(s) queued for reevaluation."
        )
    reevaluate_submissions.short_description = "Reevaluate selected submissions"


@admin.register(ChallengeRating)
class ChallengeRatingAdmin(admin.ModelAdmin):
    """Admin interface for ChallengeRating model."""
    
    list_display = [
        'challenge_link', 'user_link', 'rating',
        'difficulty_rating', 'clarity_rating', 'created_at'
    ]
    
    list_filter = [
        'rating', 'difficulty_rating', 'clarity_rating',
        'created_at', 'challenge__difficulty_level'
    ]
    
    search_fields = [
        'user__username', 'challenge__title', 'review'
    ]
    
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Rating Info', {
            'fields': (
                'challenge', 'user', 'rating',
                'difficulty_rating', 'clarity_rating'
            )
        }),
        ('Review', {
            'fields': ('review',),
            'classes': ('wide',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        """Optimize queryset."""
        return super().get_queryset(request).select_related(
            'user', 'challenge'
        )
    
    def challenge_link(self, obj):
        """Link to challenge admin."""
        url = reverse('admin:challenges_challenge_change', args=[obj.challenge.id])
        return format_html('<a href="{}">{}</a>', url, obj.challenge.title)
    challenge_link.short_description = 'Challenge'
    challenge_link.admin_order_field = 'challenge__title'
    
    def user_link(self, obj):
        """Link to user admin."""
        url = reverse('admin:users_user_change', args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, obj.user.username)
    user_link.short_description = 'User'
    user_link.admin_order_field = 'user__username'


@admin.register(ChallengeFavorite)
class ChallengeFavoriteAdmin(admin.ModelAdmin):
    """Admin interface for ChallengeFavorite model."""
    
    list_display = [
        'challenge_link', 'user_link', 'created_at'
    ]
    
    list_filter = [
        'created_at', 'challenge__difficulty_level',
        'challenge__challenge_type'
    ]
    
    search_fields = [
        'user__username', 'challenge__title'
    ]
    
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        """Optimize queryset."""
        return super().get_queryset(request).select_related(
            'user', 'challenge'
        )
    
    def challenge_link(self, obj):
        """Link to challenge admin."""
        url = reverse('admin:challenges_challenge_change', args=[obj.challenge.id])
        return format_html('<a href="{}">{}</a>', url, obj.challenge.title)
    challenge_link.short_description = 'Challenge'
    challenge_link.admin_order_field = 'challenge__title'
    
    def user_link(self, obj):
        """Link to user admin."""
        url = reverse('admin:users_user_change', args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, obj.user.username)
    user_link.short_description = 'User'
    user_link.admin_order_field = 'user__username'


class ChallengeDiscussionReplyInline(admin.TabularInline):
    """Inline for discussion replies."""
    model = ChallengeDiscussion
    fk_name = 'parent'
    extra = 0
    readonly_fields = ['user', 'created_at']
    fields = ['user', 'content', 'is_approved', 'created_at']
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False


@admin.register(ChallengeDiscussion)
class ChallengeDiscussionAdmin(admin.ModelAdmin):
    """Admin interface for ChallengeDiscussion model."""
    
    list_display = [
        'content_preview', 'challenge_link', 'user_link', 'is_solution',
        'is_spoiler', 'is_approved', 'reply_count', 'created_at'
    ]
    
    list_filter = [
        'is_solution', 'is_spoiler', 'is_approved',
        'created_at', 'challenge__difficulty_level'
    ]
    
    search_fields = [
        'content', 'user__username', 'challenge__title'
    ]
    
    readonly_fields = ['created_at', 'updated_at', 'reply_count']
    
    fieldsets = (
        ('Discussion Info', {
            'fields': (
                'challenge', 'user', 'parent'
            )
        }),
        ('Content', {
            'fields': ('content',),
            'classes': ('wide',)
        }),
        ('Settings', {
            'fields': (
                'is_solution', 'is_spoiler', 'is_approved'
            )
        }),
        ('Statistics', {
            'fields': ('reply_count',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['approve_discussions', 'disapprove_discussions']
    
    inlines = [ChallengeDiscussionReplyInline]
    
    def get_queryset(self, request):
        """Optimize queryset."""
        return super().get_queryset(request).select_related(
            'user', 'challenge', 'parent'
        ).annotate(
            reply_count_annotated=Count('replies')
        )
    
    def challenge_link(self, obj):
        """Link to challenge admin."""
        url = reverse('admin:challenges_challenge_change', args=[obj.challenge.id])
        return format_html('<a href="{}">{}</a>', url, obj.challenge.title)
    challenge_link.short_description = 'Challenge'
    challenge_link.admin_order_field = 'challenge__title'
    
    def user_link(self, obj):
        """Link to user admin."""
        url = reverse('admin:users_user_change', args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, obj.user.username)
    user_link.short_description = 'User'
    user_link.admin_order_field = 'user__username'
    
    def content_preview(self, obj):
        """Display a preview of the discussion content."""
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'
    
    def reply_count(self, obj):
        """Display reply count."""
        count = getattr(obj, 'reply_count_annotated', 0)
        if count > 0:
            url = reverse('admin:challenges_challengediscussion_changelist')
            return format_html(
                '<a href="{}?parent__id__exact={}">{}</a>',
                url, obj.id, count
            )
        return count
    reply_count.short_description = 'Replies'
    reply_count.admin_order_field = 'reply_count_annotated'
    
    def approve_discussions(self, request, queryset):
        """Approve selected discussions."""
        updated = queryset.update(is_approved=True)
        self.message_user(
            request,
            f"{updated} discussion(s) approved successfully."
        )
    approve_discussions.short_description = "Approve selected discussions"
    
    def disapprove_discussions(self, request, queryset):
        """Disapprove selected discussions."""
        updated = queryset.update(is_approved=False)
        self.message_user(
            request,
            f"{updated} discussion(s) disapproved successfully."
        )
    disapprove_discussions.short_description = "Disapprove selected discussions"