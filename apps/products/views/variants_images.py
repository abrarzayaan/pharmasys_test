# pyrefly: ignore [missing-import]
from rest_framework import viewsets, permissions
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from apps.products.models import ProductVariant, ProductImage
from apps.products.serializers import ProductVariantSerializer, ProductImageSerializer
# pyrefly: ignore [missing-import]
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 36
    page_size_query_param = 'page_size'
    max_page_size = 1000

class ProductVariantViewSet(viewsets.ModelViewSet):
    serializer_class = ProductVariantSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['product', 'status']
    search_fields = ['variant_name', 'sku', 'barcode', 'product__name']

    def get_queryset(self):
        user = self.request.user
        qs = ProductVariant.objects.select_related('product', 'product__category', 'product__brand').prefetch_related('images')
        if user.is_authenticated and (user.is_staff or user.is_superuser):
            return qs.all()
        elif user.is_authenticated and hasattr(user, 'vendor_profile'):
            return qs.filter(product__vendor__user=user)
        return qs.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.select_related('variant').all()
    serializer_class = ProductImageSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['variant', 'is_primary']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
