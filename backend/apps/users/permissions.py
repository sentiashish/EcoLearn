from rest_framework import permissions
from django.contrib.auth import get_user_model

User = get_user_model()


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner of the object.
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return obj == request.user


class IsTeacherOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow teachers to create/edit objects.
    """
    
    def has_permission(self, request, view):
        # Read permissions for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Write permissions only for teachers, admins, or superusers
        return (
            request.user.is_authenticated and
            (
                request.user.role == User.UserRole.TEACHER or
                request.user.role == User.UserRole.ADMIN or
                request.user.is_superuser
            )
        )
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any authenticated request
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Write permissions are only allowed to the teacher who owns the object
        if hasattr(obj, 'teacher'):
            return (
                obj.teacher == request.user or
                request.user.role == User.UserRole.ADMIN or
                request.user.is_superuser
            )
        
        # For teacher profile objects
        if hasattr(obj, 'user'):
            return (
                obj.user == request.user or
                request.user.role == User.UserRole.ADMIN or
                request.user.is_superuser
            )
        
        return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to create/edit objects.
    """
    
    def has_permission(self, request, view):
        # Read permissions for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Write permissions only for admins or superusers
        return (
            request.user.is_authenticated and
            (
                request.user.role == User.UserRole.ADMIN or
                request.user.is_superuser
            )
        )


class IsStudentUser(permissions.BasePermission):
    """
    Custom permission to only allow students.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == User.UserRole.STUDENT
        )


class IsTeacherUser(permissions.BasePermission):
    """
    Custom permission to only allow teachers.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == User.UserRole.TEACHER
        )


class IsVerifiedTeacher(permissions.BasePermission):
    """
    Custom permission to only allow verified teachers.
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if request.user.role != User.UserRole.TEACHER:
            return False
        
        # Check if teacher has a verified profile
        try:
            teacher_profile = request.user.teacher_profile
            return teacher_profile.is_verified
        except:
            return False


class IsOwnerOrTeacher(permissions.BasePermission):
    """
    Custom permission to allow owners or their teachers to access objects.
    """
    
    def has_object_permission(self, request, view, obj):
        # Allow access to the owner
        if hasattr(obj, 'user') and obj.user == request.user:
            return True
        
        # Allow access to teachers of the student
        if hasattr(obj, 'user') and obj.user.role == User.UserRole.STUDENT:
            return obj.user.enrolled_classes.filter(teacher=request.user).exists()
        
        # Allow access to admins and superusers
        return (
            request.user.role == User.UserRole.ADMIN or
            request.user.is_superuser
        )


class IsEnrolledStudent(permissions.BasePermission):
    """
    Custom permission to check if student is enrolled in a class.
    """
    
    def has_object_permission(self, request, view, obj):
        # For class-related objects, check if student is enrolled
        if hasattr(obj, 'student_class'):
            return obj.student_class.students.filter(id=request.user.id).exists()
        
        # For class objects themselves
        if hasattr(obj, 'students'):
            return obj.students.filter(id=request.user.id).exists()
        
        return False