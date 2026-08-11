# pyrefly: ignore [missing-import]
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
        if not user or user.is_anonymous:
            return Inventory.objects.none()
        if user.is_staff or user.is_superuser:
            return Inventory.objects.all()
        if hasattr(user, 'vendor_profile'):
            return Inventory.objects.filter(vendor=user.vendor_profile)
        return Inventory.objects.filter(vendor__user=user)