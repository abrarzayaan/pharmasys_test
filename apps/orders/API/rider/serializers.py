from rest_framework import serializers
from apps.orders.choices import OrderStatus


class RiderOrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[
            (OrderStatus.OUT_FOR_DELIVERY, "Out For Delivery"),
            (OrderStatus.DELIVERED, "Delivered"),
        ]
    )
    remarks = serializers.CharField(required=False, allow_blank=True, allow_null=True)
