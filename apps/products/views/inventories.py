from rest_framework import viewsets, permissions
from apps.products.models import Inventory
from apps.products.serializers import InventorySerializer

class InventoryViewSet(viewsets.ModelViewSet):
    """
    Inventory Management.
    - Only authenticated Vendors can see/manage their own stock.
    - Admins can see all stock.
    """
    serializer_class = InventorySerializer
    filterset_fields = ['variant', 'status']
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Inventory.objects.all()
        # ভেন্ডর যেন শুধু নিজের প্রোডাক্ট ভ্যারিয়েন্টের ইনভেন্টরি দেখতে পারে
        return Inventory.objects.filter(vendor=user)