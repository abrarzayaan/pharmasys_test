# pyrefly: ignore [missing-import]
from rest_framework.views import APIView
# pyrefly: ignore [missing-import]
from rest_framework.response import Response
# pyrefly: ignore [missing-import]
from rest_framework import status, permissions
# pyrefly: ignore [missing-import]
from django.contrib.auth import get_user_model

from apps.profiles.models import VendorProfile

User = get_user_model()


class AdminVendorListView(APIView):
    """
    Admin Endpoint to list all registered vendor profiles with status filters and search.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = VendorProfile.objects.select_related('user', 'address').order_by('-created_at')

        ver_status = request.query_params.get('verification_status')
        if ver_status:
            queryset = queryset.filter(verification_status=ver_status)

        acc_status = request.query_params.get('status')
        if acc_status:
            queryset = queryset.filter(status=acc_status)

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                name__icontains=search
            ) | queryset.filter(
                trade_license_no__icontains=search
            ) | queryset.filter(
                user__username__icontains=search
            ) | queryset.filter(
                user__phone_number__icontains=search
            )

        data = []
        for vendor in queryset:
            data.append({
                "id": vendor.id,
                "name": vendor.name,
                "slug": vendor.slug,
                "type": vendor.type,
                "phone": vendor.phone or getattr(vendor.user, 'phone_number', ''),
                "email": vendor.email or getattr(vendor.user, 'email', ''),
                "logo": str(vendor.logo) if vendor.logo else '',
                "cover_image": str(vendor.cover_image) if vendor.cover_image else '',
                "status": vendor.status,  # 'active', 'inactive', 'paused', 'blocked'
                "verification_status": vendor.verification_status,  # 'pending', 'verified', 'rejected'
                "commission_rate": float(vendor.commission_rate),
                "trade_license_no": vendor.trade_license_no,
                "tax_number": vendor.tax_number or '',
                "owner_username": vendor.user.username,
                "address": {
                    "city": vendor.address.city if vendor.address else 'Dhaka',
                    "area": vendor.address.area if vendor.address else '',
                    "full_address": vendor.address.full_address if vendor.address else '',
                } if vendor.address else None,
                "is_profile_complete": bool(vendor.name and vendor.phone and vendor.trade_license_no and vendor.address),
                "created_at": vendor.created_at.isoformat() if vendor.created_at else None,
                "updated_at": vendor.updated_at.isoformat() if vendor.updated_at else None,
            })

        return Response(data, status=status.HTTP_200_OK)


class AdminVendorDetailView(APIView):
    """
    Admin Endpoint to update a vendor's verification_status, status, or commission_rate.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            vendor = VendorProfile.objects.select_related('user', 'address').get(id=pk)
        except VendorProfile.DoesNotExist:
            return Response({"error": "Vendor profile not found."}, status=status.HTTP_404_NOT_FOUND)

        data = request.data

        if 'verification_status' in data:
            new_ver = data['verification_status']
            if new_ver in ['pending', 'verified', 'rejected']:
                vendor.verification_status = new_ver
                if new_ver == 'verified' and vendor.status == 'inactive':
                    vendor.status = 'active'

        if 'status' in data:
            new_status = data['status']
            if new_status in ['active', 'inactive', 'paused', 'blocked']:
                vendor.status = new_status

        if 'commission_rate' in data:
            vendor.commission_rate = data['commission_rate']

        vendor.save()

        return Response({
            "message": f"Vendor '{vendor.name}' verification and status updated successfully.",
            "vendor": {
                "id": vendor.id,
                "name": vendor.name,
                "status": vendor.status,
                "verification_status": vendor.verification_status,
                "commission_rate": float(vendor.commission_rate),
                "updated_at": vendor.updated_at.isoformat() if vendor.updated_at else None,
            }
        }, status=status.HTTP_200_OK)
