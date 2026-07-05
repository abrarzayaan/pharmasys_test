from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Apps URLs
    path('api/auth/', include('apps.authentication.urls')),
    path('api/profiles/', include('apps.profiles.urls')), # <- এই লাইনটি যোগ করো
    path('api/products/', include('apps.products.urls')),
    path('api/', include('apps.cart.urls')),
    path("api/coupons/",include("apps.coupons.urls"),),
    
    # Swagger API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    
]