from rest_framework import serializers

from apps.profiles.models import Address
from apps.orders.choices import PaymentMethod


class OrderCreateSerializer(serializers.Serializer):
    address_id = serializers.PrimaryKeyRelatedField(
        queryset=Address.objects.all(),
        source="address",
    )

    payment_method = serializers.ChoiceField(
        choices=PaymentMethod.choices,
    )

    coupon_code = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    def validate(self, attrs):
        user = self.context["request"].user

        address = attrs["address"]

        if address.consumer.user != user:
            raise serializers.ValidationError(
                {
                    "address_id": "Invalid address."
                }
            )

        return attrs


class OrderSerializer(serializers.Serializer):
    pass