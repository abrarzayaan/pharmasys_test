from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema

from apps.orders.models import Order
from apps.orders.serializers.order import OrderDetailSerializer
from apps.orders.API.rider.serializers import RiderOrderStatusUpdateSerializer
from apps.orders.services.admin_order_service import AdminOrderService
from apps.orders.permissions import IsRiderUser


class RiderOrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for riders to view their assigned orders and update delivery status.
    """
    permission_classes = [IsAuthenticated, IsRiderUser]
    serializer_class = OrderDetailSerializer

    def get_queryset(self):
        # Riders can only see orders assigned to them
        return Order.objects.filter(
            assigned_rider=self.request.user.rider_profile
        ).select_related(
            "customer__user", "assigned_rider__user", "payment"
        ).prefetch_related(
            "items__product_variant__product",
            "items__vendor__user",
            "status_history__changed_by"
        )

    @action(detail=True, methods=["patch"])
    def status(self, request, pk=None):
        """
        Update the status of an assigned order (e.g. Out For Delivery, Delivered).
        """
        order = self.get_object()
        serializer = RiderOrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        updated_order = AdminOrderService.change_order_status(
            order=order,
            new_status=serializer.validated_data["status"],
            changed_by=request.user,
            remarks=serializer.validated_data.get("remarks")
        )
        return Response(
            self.get_serializer(updated_order).data,
            status=status.HTTP_200_OK
        )
