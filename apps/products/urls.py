from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.products import views

# DRF Router ইনিশিয়ালাইজেশন
router = DefaultRouter()

# সব ভিউসেটকে রাউটারে রেজিস্টার করা হচ্ছে
router.register(r'brands', views.BrandViewSet, basename='brand')
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'variants', views.ProductVariantViewSet, basename='variant')
router.register(r'images', views.ProductImageViewSet, basename='image')
router.register(r'attributes', views.ProductAttributeViewSet, basename='attribute')
router.register(r'attribute-values', views.ProductAttributeValueViewSet, basename='attribute-value')
router.register(r'inventories', views.InventoryViewSet, basename='inventory')

# ইউআরএল প্যাটার্নস
urlpatterns = [
    path('', include(router.urls)),
]