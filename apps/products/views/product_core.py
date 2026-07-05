from rest_framework import viewsets, permissions
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from apps.products.models import Product
from apps.products.serializers import ProductSerializer
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10                  # ডিফল্ট প্রোডাক্ট সংখ্যা
    page_size_query_param = 'page_size' # ফ্রন্টএন্ড চাইলে ?page_size=20 দিয়ে কাস্টমাইজ করতে পারবে
    max_page_size = 100

class ProductViewSet(viewsets.ModelViewSet):
    """
    Product CRUD Endpoint.
    - Anyone can see Active/Approved products.
    - Vendors can only manage (Update/Delete) their OWN products.
    """
    serializer_class = ProductSerializer
    pagination_class = StandardResultsSetPagination # <--- এই লাইনটি যুক্ত করে দিতে পারেন
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'brand', 'product_type', 'status', 'approval_status']
    search_fields = ['name', 'sku', 'barcode']
    ordering_fields = ['created_at', 'name']

    def get_queryset(self):
        user = self.request.user
        
        # ১. ইউজার যদি এডমিন/স্টাফ হয়, তবে সব প্রোডাক্ট (ড্রাফট, ডিলিটেড সহ) দেখতে পাবে
        if user.is_authenticated and user.is_staff:
            return Product.objects.all()
            
        # ২. ইউজার যদি লগইন করা থাকে এবং সে যদি একজন ভেন্ডর হয় (এখানে check করতে হবে সে ভেন্ডর কি না)
        elif user.is_authenticated and hasattr(user, 'vendor_profile'): 
            # ভেন্ডররা শুধু তাদের নিজেদের প্রোডাক্টগুলোই (ম্যানেজ/ভিউ করার জন্য) দেখতে পাবে
            return Product.objects.filter(vendor__user=user, deleted_at__isnull=True)
            
        # ৩. ইউজার যদি লগইন না করা থাকে (Anonymous), অথবা লগইন করা কাস্টমার হয়—
        # তারা সবাই অ্যাপ থেকে শুধুমাত্র একটিভ এবং অ্যাপ্রুভড প্রোডাক্টগুলোই দেখতে পাবে (কোনো টোকেন লাগবে না)
        return Product.active_objects.filter(status='active', approval_status='approved')

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def perform_destroy(self, instance):
        # ডাটাবেস থেকে পার্মানেন্টলি ডিলিট না করে সফট ডিলিট করা
        instance.soft_delete()