from django.urls import path
from apps.profiles.views import *

urlpatterns = [
    path('consumer/update/', ConsumerProfileUpdateView.as_view(), name='consumer_profile_update'),
    path('vendor/update/', VendorProfileUpdateView.as_view(), name='vendor_profile_update'),
    path('rider/update/', RiderProfileUpdateView.as_view(), name='rider_profile_update'),

    # অ্যাড্রেস ম্যানেজমেন্ট (নতুন যুক্ত হলো)
    path('addresses/', UserAddressListCreateView.as_view(), name='user_address_list_create'),
    path('addresses/<int:id>/', UserAddressDetailView.as_view(), name='user_address_detail'),
]