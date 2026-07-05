from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from apps.coupons.models import Coupon
from apps.coupons.serializers import (
    CouponCreateSerializer,
    CouponUpdateSerializer,
    CouponListSerializer,
    CouponDetailSerializer,
)



class CouponListCreateAPIView(GenericAPIView):
    queryset = Coupon.objects.all()

    def get(self, request):
        coupons = self.get_queryset()
        serializer = CouponListSerializer(coupons, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CouponCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )


class CouponRetrieveUpdateDeleteAPIView(GenericAPIView):
    queryset = Coupon.objects.all()

    def get_object(self, pk):
        return self.get_queryset().get(pk=pk)

    def get(self, request, pk):
        coupon = self.get_object(pk)
        serializer = CouponDetailSerializer(coupon)
        return Response(serializer.data)

    def patch(self, request, pk):
        coupon = self.get_object(pk)
        serializer = CouponUpdateSerializer(
            coupon,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    def delete(self, request, pk):
        coupon = self.get_object(pk)
        coupon.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


