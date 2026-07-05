from rest_framework import viewsets, permissions
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from apps.products.models import Category, Brand
from apps.products.serializers import CategorySerializer, BrandSerializer
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10                  # ডিফল্ট প্রোডাক্ট সংখ্যা
    page_size_query_param = 'page_size' # ফ্রন্টএন্ড চাইলে ?page_size=20 দিয়ে কাস্টমাইজ করতে পারবে
    max_page_size = 100


class BrandViewSet(viewsets.ModelViewSet):
    """
    Brand CRUD Endpoint.
    - Anyone can Read (GET) brands.
    - Only Admin/Staff can Create, Update, Delete (Write ops).
    """
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    pagination_class = StandardResultsSetPagination
    
    # এডভান্সড ফিল্টারিং, সার্চিং এবং সোর্টিং অপশন
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']

    def get_permissions(self):
        """
        Lead Developer Permission Logic:
        নিরাপত্তার জন্য রিড অপারেশন সবার জন্য ওপেন, কিন্তু রাইট অপারেশন শুধু স্টাফ/অ্যাডমিনের জন্য লক।
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]


class CategoryViewSet(viewsets.ModelViewSet):
    """
    Category CRUD Endpoint.
    - Multi-level hierarchy support.
    - Public read, Admin write.
    """
    # ওআরএম অপ্টিমাইজেশন: children রিলেশন এক কুয়েরিতে আনার জন্য prefetch_related ব্যবহার করেছি
    queryset = Category.objects.filter(parent__isnull=True).prefetch_related('children')
    serializer_class = CategorySerializer
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'sort_order']
    search_fields = ['name']
    ordering_fields = ['sort_order', 'name']

    def get_permissions(self):
        """ক্যাটাগরিও ব্র্যান্ডের মতোই পাবলিকলি রিড-অনলি, অ্যাডমিনদের জন্য রাইট-অ্যালাউড।"""
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]