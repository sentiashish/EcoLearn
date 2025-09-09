from django.apps import AppConfig


class GamificationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.gamification'
    verbose_name = 'Gamification'
    
    def ready(self):
        """Import signals when the app is ready."""
        import apps.gamification.signals