# pyrefly: ignore [missing-import]
from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from apps.products.models import ProductVariant, ProductImage
from apps.products.serializers import ProductVariantSerializer, ProductImageSerializer
# pyrefly: ignore [missing-import]
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10                  # ডিফল্ট প্রোডাক্ট সংখ্যা
    page_size_query_param = 'page_size' # ফ্রন্টএন্ড চাইলে ?page_size=20 দিয়ে কাস্টমাইজ করতে পারবে
    max_page_size = 100

class ProductVariantViewSet(viewsets.ModelViewSet):
    serializer_class = ProductVariantSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product', 'status']

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.is_staff:
            return ProductVariant.objects.prefetch_related('images').all()
        elif user.is_authenticated and hasattr(user, 'vendor_profile'):
            # Product.vendor points to VendorProfile, not directly to User.
            # Follow the profile's user relation so vendor requests do not try
            # to compare a VendorProfile field with a User instance.
            return ProductVariant.objects.prefetch_related('images').filter(product__vendor__user=user)
        return ProductVariant.objects.prefetch_related('images').filter(status='active', product__status='active', product__approval_status='approved')

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['variant', 'is_primary']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
