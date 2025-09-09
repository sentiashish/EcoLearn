from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, UserProfile, TeacherProfile


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create a UserProfile when a new User is created."""
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save the UserProfile when the User is saved."""
    if hasattr(instance, 'profile'):
        instance.profile.save()
    else:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def create_teacher_profile(sender, instance, created, **kwargs):
    """Create a TeacherProfile when a new Teacher user is created."""
    if created and instance.role == User.UserRole.TEACHER:
        TeacherProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def handle_role_change(sender, instance, **kwargs):
    """Handle role changes for existing users."""
    if not kwargs.get('created', False):  # Only for existing users
        if instance.role == User.UserRole.TEACHER:
            # Create teacher profile if it doesn't exist
            if not hasattr(instance, 'teacher_profile'):
                TeacherProfile.objects.create(user=instance)
        else:
            # Remove teacher profile if role changed from teacher
            if hasattr(instance, 'teacher_profile'):
                instance.teacher_profile.delete()