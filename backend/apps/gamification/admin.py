from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.db.models import Count, Sum
from django.utils import timezone
from .models import (
    Badge, PointTransaction, UserBadge, Leaderboard, Achievement
)


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    """Admin interface for Badge model."""
    
    list_display = [
        'name', 'badge_type', 'rarity', 'rarity_color_display',
        'points_required', 'earned_count', 'is_active', 'is_hidden',
        'created_at'
    ]
    list_filter = [
        'badge_type', 'rarity', 'is_active', 'is_hidden', 'created_at'
    ]
    search_fields = ['name', 'description']
    readonly_fields = ['earned_count', 'created_at', 'updated_at']
    ordering = ['rarity', 'name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'icon')
        }),
        ('Badge Properties', {
            'fields': ('badge_type', 'rarity', 'points_required')
        }),
        ('Criteria', {
            'fields': ('criteria',),
            'description': 'JSON object defining badge requirements'
        }),
        ('Status', {
            'fields': ('is_active', 'is_hidden')
        }),
        ('Statistics', {
            'fields': ('earned_count',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['activate_badges', 'deactivate_badges', 'make_hidden', 'make_visible']
    
    def rarity_color_display(self, obj):
        """Display rarity with color."""
        color = obj.rarity_color
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_rarity_display()
        )
    rarity_color_display.short_description = 'Rarity'
    
    def earned_count(self, obj):
        """Display number of users who earned this badge."""
        count = obj.user_badges.count()
        if count > 0:
            url = reverse('admin:gamification_userbadge_changelist')
            return format_html(
                '<a href="{}?badge__id__exact={}">{} users</a>',
                url, obj.id, count
            )
        return '0 users'
    earned_count.short_description = 'Earned by'
    
    def activate_badges(self, request, queryset):
        """Activate selected badges."""
        updated = queryset.update(is_active=True)
        self.message_user(
            request,
            f'{updated} badges were successfully activated.'
        )
    activate_badges.short_description = 'Activate selected badges'
    
    def deactivate_badges(self, request, queryset):
        """Deactivate selected badges."""
        updated = queryset.update(is_active=False)
        self.message_user(
            request,
            f'{updated} badges were successfully deactivated.'
        )
    deactivate_badges.short_description = 'Deactivate selected badges'
    
    def make_hidden(self, request, queryset):
        """Make selected badges hidden."""
        updated = queryset.update(is_hidden=True)
        self.message_user(
            request,
            f'{updated} badges were made hidden.'
        )
    make_hidden.short_description = 'Make selected badges hidden'
    
    def make_visible(self, request, queryset):
        """Make selected badges visible."""
        updated = queryset.update(is_hidden=False)
        self.message_user(
            request,
            f'{updated} badges were made visible.'
        )
    make_visible.short_description = 'Make selected badges visible'


@admin.register(PointTransaction)
class PointTransactionAdmin(admin.ModelAdmin):
    """Admin interface for PointTransaction model."""
    
    list_display = [
        'user_link', 'points', 'transaction_type', 'description',
        'reference_id', 'created_at'
    ]
    list_filter = [
        'transaction_type', 'created_at'
    ]
    search_fields = ['user__username', 'user__email', 'description', 'reference_id']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Transaction Details', {
            'fields': ('user', 'points', 'transaction_type', 'description')
        }),
        ('Reference', {
            'fields': ('reference_id', 'metadata')
        }),
        ('Timestamp', {
            'fields': ('created_at',)
        })
    )
    
    def user_link(self, obj):
        """Display user as clickable link."""
        url = reverse('admin:users_user_change', args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, obj.user.username)
    user_link.short_description = 'User'
    user_link.admin_order_field = 'user__username'
    
    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        return super().get_queryset(request).select_related('user')


class PointTransactionInline(admin.TabularInline):
    """Inline for point transactions."""
    model = PointTransaction
    extra = 0
    readonly_fields = ['created_at']
    fields = ['points', 'transaction_type', 'description', 'created_at']
    ordering = ['-created_at']


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    """Admin interface for UserBadge model."""
    
    list_display = [
        'user_link', 'badge_link', 'badge_rarity', 'earned_at', 'is_displayed'
    ]
    list_filter = [
        'badge__rarity', 'badge__badge_type', 'is_displayed', 'earned_at'
    ]
    search_fields = [
        'user__username', 'user__email', 'badge__name'
    ]
    readonly_fields = ['earned_at']
    ordering = ['-earned_at']
    date_hierarchy = 'earned_at'
    
    def user_link(self, obj):
        """Display user as clickable link."""
        url = reverse('admin:users_user_change', args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, obj.user.username)
    user_link.short_description = 'User'
    user_link.admin_order_field = 'user__username'
    
    def badge_link(self, obj):
        """Display badge as clickable link."""
        url = reverse('admin:gamification_badge_change', args=[obj.badge.id])
        return format_html('<a href="{}">{}</a>', url, obj.badge.name)
    badge_link.short_description = 'Badge'
    badge_link.admin_order_field = 'badge__name'
    
    def badge_rarity(self, obj):
        """Display badge rarity with color."""
        color = obj.badge.rarity_color
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.badge.get_rarity_display()
        )
    badge_rarity.short_description = 'Rarity'
    
    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        return super().get_queryset(request).select_related('user', 'badge')


class UserBadgeInline(admin.TabularInline):
    """Inline for user badges."""
    model = UserBadge
    extra = 0
    readonly_fields = ['earned_at']
    fields = ['badge', 'earned_at', 'is_displayed']
    ordering = ['-earned_at']


@admin.register(Leaderboard)
class LeaderboardAdmin(admin.ModelAdmin):
    """Admin interface for Leaderboard model."""
    
    list_display = [
        'name', 'leaderboard_type', 'is_active', 'student_class',
        'start_date', 'end_date', 'participant_count', 'last_updated'
    ]
    list_filter = [
        'leaderboard_type', 'is_active', 'student_class',
        'start_date', 'end_date'
    ]
    search_fields = ['name', 'description']
    readonly_fields = ['last_updated', 'participant_count']
    ordering = ['-last_updated']
    date_hierarchy = 'start_date'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'leaderboard_type')
        }),
        ('Configuration', {
            'fields': ('is_active', 'student_class')
        }),
        ('Time Period', {
            'fields': ('start_date', 'end_date')
        }),
        ('Statistics', {
            'fields': ('participant_count', 'last_updated'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['refresh_leaderboards', 'activate_leaderboards', 'deactivate_leaderboards']
    
    def participant_count(self, obj):
        """Display number of participants."""
        try:
            data = obj.get_leaderboard_data(1000)
            return f"{len(data)} participants"
        except Exception:
            return "Error calculating"
    participant_count.short_description = 'Participants'
    
    def refresh_leaderboards(self, request, queryset):
        """Refresh selected leaderboards."""
        from django.core.cache import cache
        
        for leaderboard in queryset:
            # Clear cache
            cache_key = f"leaderboard_{leaderboard.id}_data"
            cache.delete(cache_key)
            
            # Update timestamp
            leaderboard.last_updated = timezone.now()
            leaderboard.save()
        
        self.message_user(
            request,
            f'{queryset.count()} leaderboards were refreshed.'
        )
    refresh_leaderboards.short_description = 'Refresh selected leaderboards'
    
    def activate_leaderboards(self, request, queryset):
        """Activate selected leaderboards."""
        updated = queryset.update(is_active=True)
        self.message_user(
            request,
            f'{updated} leaderboards were activated.'
        )
    activate_leaderboards.short_description = 'Activate selected leaderboards'
    
    def deactivate_leaderboards(self, request, queryset):
        """Deactivate selected leaderboards."""
        updated = queryset.update(is_active=False)
        self.message_user(
            request,
            f'{updated} leaderboards were deactivated.'
        )
    deactivate_leaderboards.short_description = 'Deactivate selected leaderboards'


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    """Admin interface for Achievement model."""
    
    list_display = [
        'user_link', 'achievement_type', 'title', 'points_awarded',
        'achieved_at', 'reference_id'
    ]
    list_filter = [
        'achievement_type', 'achieved_at'
    ]
    search_fields = [
        'user__username', 'user__email', 'title', 'description', 'reference_id'
    ]
    readonly_fields = ['achieved_at']
    ordering = ['-achieved_at']
    date_hierarchy = 'achieved_at'
    
    fieldsets = (
        ('Achievement Details', {
            'fields': ('user', 'achievement_type', 'title', 'description')
        }),
        ('Rewards', {
            'fields': ('points_awarded',)
        }),
        ('Reference', {
            'fields': ('reference_id', 'metadata')
        }),
        ('Timestamp', {
            'fields': ('achieved_at',)
        })
    )
    
    def user_link(self, obj):
        """Display user as clickable link."""
        url = reverse('admin:users_user_change', args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, obj.user.username)
    user_link.short_description = 'User'
    user_link.admin_order_field = 'user__username'
    
    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        return super().get_queryset(request).select_related('user')


class AchievementInline(admin.TabularInline):
    """Inline for achievements."""
    model = Achievement
    extra = 0
    readonly_fields = ['achieved_at']
    fields = ['achievement_type', 'title', 'points_awarded', 'achieved_at']
    ordering = ['-achieved_at']


# Custom admin site configuration
admin.site.site_header = "Gamification Administration"
admin.site.site_title = "Gamification Admin"
admin.site.index_title = "Welcome to Gamification Administration"

# Register inlines with User model if needed
# This would be done in the users app admin.py:
# from apps.gamification.admin import UserBadgeInline, PointTransactionInline, AchievementInline
# 
# class UserAdmin(BaseUserAdmin):
#     inlines = [UserBadgeInline, PointTransactionInline, AchievementInline]