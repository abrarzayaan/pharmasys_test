from drf_spectacular.utils import extend_schema

from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.cart.models import Cart, CartItem
from apps.cart.serializers import (
    CartSerializer,
    AddToCartSerializer,
    UpdateCartItemSerializer,
    RemoveCartItemSerializer,
)


@extend_schema(
    tags=["Cart"],
    responses=CartSerializer,
)
class CartView(GenericAPIView):

    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):

        cart, _ = Cart.objects.get_or_create(user=request.user)

        serializer = self.get_serializer(cart)

        return Response(serializer.data)


@extend_schema(
    tags=["Cart"],
    request=AddToCartSerializer,
    responses={201: CartSerializer},
)
class AddToCartView(GenericAPIView):

    serializer_class = AddToCartSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        serializer.save()

        cart = Cart.objects.get(user=request.user)

        return Response(
            CartSerializer(cart).data,
            status=status.HTTP_201_CREATED,
        )


class CartItemView(GenericAPIView):

    permission_classes = [IsAuthenticated]

    def get_cart_item(self, pk):

        return CartItem.objects.filter(
            id=pk,
            cart__user=self.request.user,
        ).first()

    @extend_schema(
        tags=["Cart"],
        request=UpdateCartItemSerializer,
        responses={200: CartSerializer},
    )
    def patch(self, request, pk):

        cart_item = self.get_cart_item(pk)

        if not cart_item:
            return Response(
                {"detail": "Cart item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = UpdateCartItemSerializer(
            data=request.data,
            context={
                "cart_item": cart_item,
            },
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        cart = Cart.objects.get(user=request.user)

        return Response(CartSerializer(cart).data)

    @extend_schema(
        tags=["Cart"],
        responses={200: CartSerializer},
    )
    def delete(self, request, pk):

        cart_item = self.get_cart_item(pk)

        if not cart_item:
            return Response(
                {"detail": "Cart item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = RemoveCartItemSerializer(
            context={
                "cart_item": cart_item,
            }
        )

        serializer.save()

        cart, _ = Cart.objects.get_or_create(user=request.user)

        return Response(CartSerializer(cart).data)


@extend_schema(
    tags=["Cart"],
    responses={
        200: {
            "type": "object",
            "properties": {
                "message": {
                    "type": "string"
                }
            }
        }
    },
)
class ClearCartView(GenericAPIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request):

        cart, _ = Cart.objects.get_or_create(user=request.user)

        cart.items.all().delete()

        return Response(
            {
                "message": "Cart cleared successfully."
            }
        )