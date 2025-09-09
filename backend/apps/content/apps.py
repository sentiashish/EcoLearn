from django.apps import AppConfig


class ContentConfig(AppConfig):
    """Configuration for the content app."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.content'
    verbose_name = 'Content Management'
    
    def ready(self):
        """Import signals when app is ready."""
        import apps.content.signals