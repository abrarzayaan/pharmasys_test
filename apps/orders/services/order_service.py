from uuid import uuid4

from django.db import transaction

from apps.cart.models import Cart
from apps.checkout.services import CheckoutService
from apps.orders.constants import (
    ADDRESS_SNAPSHOT_FIELDS,
    COUPON_SNAPSHOT_FIELDS,
    ORDER_NUMBER_PREFIX,
)
from apps.orders.models import Order, OrderItem
from apps.orders.services.payment_service import PaymentService


class OrderService:

    @classmethod
    @transaction.atomic
    def create_order(cls, consumer, validated_data):
        payment_method = validated_data["payment_method"]

        checkout = CheckoutService.calculate_checkout(
            user=consumer.user,
            address_id=validated_data["address"].id,
            coupon_code=validated_data.get("coupon_code"),
        )

        cart = checkout["cart"]

        order = cls._create_order(
            consumer=consumer,
            address=checkout["address"],
            coupon=checkout["coupon"],
            subtotal=checkout["subtotal"],
            discount=checkout["discount"],
            tax=checkout["tax"],
            delivery_charge=checkout["delivery_charge"],
            grand_total=checkout["grand_total"],
            payment_method=payment_method,
        )

        cls._create_order_items(
            order=order,
            cart_items=cart.items.select_related(
                "product_variant",
                "product_variant__product",
            ),
        )

        PaymentService.create_payment(order)

        cart.items.all().delete()

        return order

    @classmethod
    def _create_order(
        cls,
        *,
        consumer,
        address,
        coupon,
        subtotal,
        discount,
        tax,
        delivery_charge,
        grand_total,
        payment_method,
    ):
        return Order.objects.create(
            order_number=cls.generate_order_number(),
            customer=consumer,
            address=address,
            address_snapshot=cls.save_address_snapshot(address),
            coupon=coupon,
            coupon_snapshot=cls.save_coupon_snapshot(coupon),
            subtotal=subtotal,
            discount=discount,
            tax=tax,
            delivery_charge=delivery_charge,
            grand_total=grand_total,
            payment_method=payment_method,
        )

    @classmethod
    def _create_order_items(cls, order, cart_items):
        order_items = []

        for item in cart_items:
            variant = item.product_variant

            order_items.append(
                OrderItem(
                    order=order,
                    product_variant=variant,
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                    total_price=item.quantity * item.unit_price,
                    product_snapshot={
                        "product_id": variant.product.id,
                        "variant_id": variant.id,
                        "name": variant.product.name,
                        "sku": variant.sku,
                        "strength": variant.strength,
                        "price": str(variant.price),
                    },
                )
            )

        OrderItem.objects.bulk_create(order_items)

    @classmethod
    def generate_order_number(cls):
        return f"{ORDER_NUMBER_PREFIX}-{uuid4().hex[:8].upper()}"

    @classmethod
    def save_address_snapshot(cls, address):
        return {
            field: getattr(address, field)
            for field in ADDRESS_SNAPSHOT_FIELDS
        }

    @classmethod
    def save_coupon_snapshot(cls, coupon):
        if coupon is None:
            return None

        return {
            field: getattr(coupon, field)
            for field in COUPON_SNAPSHOT_FIELDS
        }

    @classmethod
    def get_cart(cls, consumer):
        return (
            Cart.objects
            .select_related(
                "consumer_profile",
            )
            .prefetch_related(
                "items__product_variant",
                "items__product_variant__product",
            )
            .get(
                consumer_profile=consumer,
            )
        )

    @classmethod
    def validate_cart(cls, cart):
        if not cart.items.exists():
            raise ValueError("Cart is empty.")

    @classmethod
    def cancel_order(cls, order):
        pass