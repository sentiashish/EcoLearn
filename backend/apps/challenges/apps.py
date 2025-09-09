from django.apps import AppConfig


class ChallengesConfig(AppConfig):
    """Configuration for the challenges app."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.challenges'
    verbose_name = 'Challenges'
    
    def ready(self):
        """Import signals when the app is ready."""
        import apps.challenges.signals