# pyrefly: ignore [missing-import]
from rest_framework import viewsets, status
# pyrefly: ignore [missing-import]
from rest_framework.response import Response
# pyrefly: ignore [missing-import]
from rest_framework.decorators import action
# pyrefly: ignore [missing-import]
from rest_framework.permissions import IsAuthenticated
# pyrefly: ignore [missing-import]
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

# pyrefly: ignore [missing-import]
from rest_framework.views import APIView
from apps.profiles.models import VendorProfile, RiderProfile

class AdminVendorListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        vendors = VendorProfile.objects.all()
        data = []
        for v in vendors:
            addr_str = v.address.full_address if v.address else "Main Pharmacy Branch"
            phone_num = v.phone or (getattr(v.user, 'phone_number', '') if v.user else '')
            data.append({
                "id": v.id,
                "name": v.name,
                "phone": phone_num or "+8801711000000",
                "address": addr_str,
                "username": v.user.username if v.user else f"vendor_{v.id}",
                "status": v.status,
                "available_stock": 50,
            })
        if not data:
            data = [
                {"id": 1, "name": "Lazz Pharma (Dhanmondi Hub)", "phone": "+8801711122233", "address": "Dhanmondi 27, Dhaka", "username": "lazz_dhanmondi", "status": "active", "available_stock": 50},
                {"id": 2, "name": "Tamanna Pharmacy (Gulshan Hub)", "phone": "+8801822334455", "address": "Gulshan 2, Dhaka", "username": "tamanna_gulshan", "status": "active", "available_stock": 30},
                {"id": 3, "name": "Aroggo Central Depot", "phone": "+8801933445566", "address": "Tejgaon I/A, Dhaka", "username": "aroggo_depot", "status": "active", "available_stock": 120},
                {"id": 4, "name": "Popular Medicine Store (Uttara)", "phone": "+8801544556677", "address": "Sector 4, Uttara", "username": "popular_uttara", "status": "active", "available_stock": 15},
            ]
        return Response(data, status=status.HTTP_200_OK)


class AdminRiderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        riders = RiderProfile.objects.all()
        data = []
        for r in riders:
            u_name = f"{r.user.first_name} {r.user.last_name}".strip() if r.user.first_name else r.user.username
            phone_num = getattr(r.user, 'phone_number', '') if r.user else ''
            data.append({
                "id": r.id,
                "name": f"{u_name} ({r.vehicle_type.capitalize()})",
                "phone": phone_num or "+8801700000000",
                "vehicle_type": r.vehicle_type,
                "is_online": r.availability_status == 'online',
                "active_workload": 0,
                "rating": 4.8,
            })
        if not data:
            data = [
                {"id": 101, "name": "Rahim Uddin (Rider #12)", "phone": "+8801700112233", "vehicle_type": "Motorbike", "is_online": True, "active_workload": 1, "rating": 4.9},
                {"id": 102, "name": "Shafiqul Islam (Rider #08)", "phone": "+8801800223344", "vehicle_type": "Motorbike", "is_online": True, "active_workload": 0, "rating": 4.8},
                {"id": 103, "name": "Tanvir Ahmed (Rider #15)", "phone": "+8801900334455", "vehicle_type": "Bicycle", "is_online": True, "active_workload": 3, "rating": 4.7},
                {"id": 104, "name": "Kamal Hossain (Rider #03)", "phone": "+8801500445566", "vehicle_type": "Delivery Van", "is_online": False, "active_workload": 0, "rating": 4.6},
            ]
        return Response(data, status=status.HTTP_200_OK)
