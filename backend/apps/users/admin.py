from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from .models import UserProfile, TeacherProfile, StudentClass

User = get_user_model()


class UserProfileInline(admin.StackedInline):
    """Inline admin for UserProfile."""
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fields = (
        'bio', 'avatar', 'date_of_birth', 'grade_level',
        'total_points', 'level', 'streak_days', 'last_activity_date',
        'privacy_public_profile'
    )
    readonly_fields = ('total_points', 'level', 'last_activity_date')


class TeacherProfileInline(admin.StackedInline):
    """Inline admin for TeacherProfile."""
    model = TeacherProfile
    can_delete = False
    verbose_name_plural = 'Teacher Profile'
    fields = (
        'employee_id', 'department', 'subjects', 'years_of_experience',
        'qualifications', 'is_verified', 'verification_date'
    )
    readonly_fields = ('verification_date',)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin."""
    
    inlines = (UserProfileInline,)
    
    list_display = (
        'email', 'first_name', 'last_name', 'role',
        'is_active', 'is_email_verified', 'date_joined'
    )
    list_filter = (
        'role', 'is_active', 'is_email_verified',
        'is_staff', 'is_superuser', 'date_joined'
    )
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {
            'fields': ('first_name', 'last_name', 'role')
        }),
        ('Permissions', {
            'fields': (
                'is_active', 'is_email_verified', 'is_staff',
                'is_superuser', 'groups', 'user_permissions'
            )
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined')
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'first_name', 'last_name', 'role',
                'password1', 'password2'
            ),
        }),
    )
    
    def get_inlines(self, request, obj):
        """Show TeacherProfile inline only for teachers."""
        inlines = [UserProfileInline]
        if obj and obj.role == User.UserRole.TEACHER:
            inlines.append(TeacherProfileInline)
        return inlines


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Admin for UserProfile."""
    
    list_display = (
        'user', 'total_points', 'level', 'streak_days',
        'last_activity_date', 'privacy_public_profile'
    )
    list_filter = (
        'level', 'grade_level', 'privacy_public_profile',
        'last_activity_date'
    )
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('total_points', 'level', 'last_activity_date')
    
    fieldsets = (
        ('User Info', {
            'fields': ('user', 'bio', 'avatar', 'date_of_birth', 'grade_level')
        }),
        ('Gamification', {
            'fields': (
                'total_points', 'level', 'streak_days', 'last_activity_date'
            )
        }),
        ('Privacy Settings', {
            'fields': ('privacy_public_profile',)
        }),
    )


@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    """Admin for TeacherProfile."""
    
    list_display = (
        'user', 'department', 'years_of_experience',
        'is_verified', 'verification_date'
    )
    list_filter = (
        'is_verified', 'department',
        'years_of_experience', 'verification_date'
    )
    search_fields = (
        'user__email', 'user__first_name', 'user__last_name',
        'department', 'employee_id'
    )
    readonly_fields = ('verification_date',)
    
    fieldsets = (
        ('Teacher Info', {
            'fields': (
                'user', 'employee_id', 'department', 'subjects',
                'years_of_experience', 'qualifications'
            )
        }),
        ('Verification', {
            'fields': ('is_verified', 'verification_date')
        }),
    )
    
    actions = ['verify_teachers', 'unverify_teachers']
    
    def verify_teachers(self, request, queryset):
        """Verify selected teachers."""
        from django.utils import timezone
        updated = queryset.update(
            is_verified=True,
            verification_date=timezone.now()
        )
        self.message_user(
            request,
            f'{updated} teacher(s) were successfully verified.'
        )
    verify_teachers.short_description = "Verify selected teachers"
    
    def unverify_teachers(self, request, queryset):
        """Unverify selected teachers."""
        updated = queryset.update(
            is_verified=False,
            verification_date=None
        )
        self.message_user(
            request,
            f'{updated} teacher(s) were successfully unverified.'
        )
    unverify_teachers.short_description = "Unverify selected teachers"


@admin.register(StudentClass)
class StudentClassAdmin(admin.ModelAdmin):
    """Admin for StudentClass."""
    
    list_display = (
        'name', 'teacher', 'class_code', 'student_count',
        'is_active', 'created_at'
    )
    list_filter = ('is_active', 'created_at', 'teacher')
    search_fields = (
        'name', 'description', 'class_code',
        'teacher__email', 'teacher__first_name', 'teacher__last_name'
    )
    readonly_fields = ('class_code', 'created_at', 'updated_at')
    filter_horizontal = ('students',)
    
    fieldsets = (
        ('Class Info', {
            'fields': ('name', 'description', 'teacher', 'class_code')
        }),
        ('Students', {
            'fields': ('students',)
        }),
        ('Settings', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def student_count(self, obj):
        """Return number of students in class."""
        return obj.students.count()
    student_count.short_description = 'Students'
    
    def get_queryset(self, request):
        """Optimize queryset with prefetch_related."""
        return super().get_queryset(request).select_related('teacher').prefetch_related('students')