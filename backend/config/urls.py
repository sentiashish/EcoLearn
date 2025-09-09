from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

def api_root(request):
    """API root endpoint with basic information"""
    return JsonResponse({
        'message': 'Welcome to EcoLearn API',
        'version': '1.0.0',
        'endpoints': {
            'admin': '/admin/',
            'api_docs': '/api/docs/',
            'api_redoc': '/api/redoc/',
            'api_schema': '/api/schema/',
            'users': '/api/v1/',
            'content': '/api/v1/content/',
            'challenges': '/api/v1/challenges/',
            'gamification': '/api/v1/gamification/',
        },
        'status': 'healthy'
    })

def health_check(request):
    """Simple health check endpoint"""
    return JsonResponse({
        'status': 'healthy',
        'timestamp': '2025-09-09T11:44:00Z',
        'service': 'EcoLearn API'
    })

urlpatterns = [
    # Root endpoint
    path('', api_root, name='api-root'),
    
    # Health check
    path('health/', health_check, name='health-check'),
    
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API v1
    path('api/v1/', include('apps.users.urls')),
    path('api/v1/content/', include('apps.content.urls')),
    path('api/v1/challenges/', include('apps.challenges.urls')),
    path('api/v1/gamification/', include('apps.gamification.urls')),
    
    # Health check (simple endpoint)
    # path('health/', include('apps.users.health_urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)