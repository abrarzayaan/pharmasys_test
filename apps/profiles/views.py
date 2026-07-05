from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema

from apps.profiles.models import ConsumerProfile, VendorProfile, RiderProfile
from apps.profiles.serializers import ConsumerProfileSerializer, VendorProfileSerializer, RiderProfileSerializer
from apps.profiles.permissions import IsConsumer, IsVendor, IsRider

from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from apps.profiles.models import Address
from apps.profiles.serializers import AddressSerializer


class UserAddressListCreateView(ListCreateAPIView):
    """
    লগইন করা ইউজারের সব অ্যাড্রেস দেখা (GET) এবং নতুন অ্যাড্রেস তৈরি করার (POST) এপিআই।
    """
    permission_classes = [IsAuthenticated]
    serializer_class = AddressSerializer

    def get_queryset(self):
        # কেবলমাত্র নিজের একটিভ অ্যাড্রেসগুলোই দেখতে পাবে
        return Address.objects.filter(user=self.request.user, status='active')

    def perform_create(self, serializer):
        if serializer.validated_data.get('is_default', False):
            Address.objects.filter(user=self.request.user).update(is_default=False)
        serializer.save(user=self.request.user)


class UserAddressDetailView(RetrieveUpdateDestroyAPIView):
    """
    নির্দিষ্ট একটি অ্যাড্রেস দেখা, আপডেট করা বা ডিলিট (Hidden) করার এপিআই।
    """
    permission_classes = [IsAuthenticated]
    serializer_class = AddressSerializer
    lookup_field = 'id'

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        # প্রোডাকশন স্ট্যান্ডার্ড অনুযায়ী আমরা ডাটাবেজ থেকে অ্যাড্রেস পার্মানেন্টলি ডিলিট না করে status hidden করে দেব
        instance.status = 'hidden'
        instance.save()



class ConsumerProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsConsumer]

    @extend_schema(request=ConsumerProfileSerializer, responses=ConsumerProfileSerializer)
    def patch(self, request):
        try:
            profile = request.user.consumer_profile
        except ConsumerProfile.DoesNotExist:
            return Response({"error": "Consumer profile not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ConsumerProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class VendorProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsVendor]

    @extend_schema(request=VendorProfileSerializer, responses=VendorProfileSerializer)
    def patch(self, request):
        try:
            profile = request.user.vendor_profile
        except VendorProfile.DoesNotExist:
            return Response({"error": "Vendor profile not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = VendorProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class RiderProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsRider]

    @extend_schema(request=RiderProfileSerializer, responses=RiderProfileSerializer)
    def patch(self, request):
        try:
            profile = request.user.rider_profile
        except RiderProfile.DoesNotExist:
            return Response({"error": "Rider profile not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = RiderProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)