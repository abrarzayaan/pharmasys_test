from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema

from apps.orders.models import Order
from apps.orders.serializers.order import OrderDetailSerializer
from apps.orders.API.admin.serializers import (
    AdminOrderVendorAssignSerializer,
    AdminOrderRiderAssignSerializer,
    AdminOrderStatusUpdateSerializer,
)
from apps.orders.services.admin_order_service import AdminOrderService
from apps.orders.permissions import IsAdminUser


class AdminOrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for admin actions: list, retrieve, assign vendor, assign rider, confirm order, and update order status.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = OrderDetailSerializer

    def get_queryset(self):
        queryset = Order.objects.select_related(
            "customer__user", "assigned_rider__user", "payment"
        ).prefetch_related(
            "items__product_variant__product",
            "items__vendor__user",
            "status_history__changed_by"
        )
        
        # Filtering query params
        order_status = self.request.query_params.get("order_status")
        if order_status:
            queryset = queryset.filter(order_status=order_status)
            
        payment_status = self.request.query_params.get("payment_status")
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)
            
        order_number = self.request.query_params.get("order_number")
        if order_number:
            queryset = queryset.filter(order_number__icontains=order_number)
            
        return queryset

    @action(detail=True, methods=["patch"], url_path="assign-vendor")
    def assign_vendor(self, request, pk=None):
        """
        Assign vendors to individual order items.
        """
        order = self.get_object()
        serializer = AdminOrderVendorAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        updated_order = AdminOrderService.assign_vendor(
            order=order,
            items=serializer.validated_data["items"],
            changed_by=request.user
        )
        return Response(
            self.get_serializer(updated_order).data,
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["patch"], url_path="assign-rider")
    def assign_rider(self, request, pk=None):
        """
        Assign rider to the order.
        """
        order = self.get_object()
        serializer = AdminOrderRiderAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        updated_order = AdminOrderService.assign_rider(
            order=order,
            rider=serializer.validated_data["rider"],
            changed_by=request.user
        )
        return Response(
            self.get_serializer(updated_order).data,
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["patch"])
    def confirm(self, request, pk=None):
        """
        Confirm the order, validate inventory, and deduct stock.
        """
        order = self.get_object()
        updated_order = AdminOrderService.confirm_order(
            order=order,
            changed_by=request.user
        )
        return Response(
            self.get_serializer(updated_order).data,
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["patch"])
    def status(self, request, pk=None):
        """
        Change status of the order (e.g. Processing, Packed, Out for Delivery, Delivered, Cancelled).
        """
        order = self.get_object()
        serializer = AdminOrderStatusUpdateSerializer(data=request.data)
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
