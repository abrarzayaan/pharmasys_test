from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.checkout.serializers import CheckoutRequestSerializer, CheckoutResponseSerializer
from apps.checkout.services import CheckoutService


class CheckoutAPIView(APIView):
    @extend_schema(
        request=CheckoutRequestSerializer,
        responses={
            200: CheckoutResponseSerializer,
        },
        tags=["Checkout"],
    )

    def post(self, request):
        request_serializer = CheckoutRequestSerializer(
            data=request.data
        )
        request_serializer.is_valid(raise_exception=True)

        checkout = CheckoutService.generate_checkout(
            user=request.user,
            address_id=request_serializer.validated_data["address_id"],
            coupon_code=request_serializer.validated_data.get(
                "coupon_code"
            ),
        )

        response_serializer = CheckoutResponseSerializer(
            checkout
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_200_OK,
        )