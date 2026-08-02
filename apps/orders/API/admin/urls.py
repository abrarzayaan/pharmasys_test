# pyrefly: ignore [missing-import]
from django.urls import path, include
# pyrefly: ignore [missing-import]
from rest_framework.routers import DefaultRouter
from apps.orders.API.admin.views import AdminOrderViewSet, AdminVendorListView, AdminRiderListView

router = DefaultRouter()
router.register(r"", AdminOrderViewSet, basename="admin-orders")

urlpatterns = [
    path("vendors/", AdminVendorListView.as_view(), name="admin-vendors"),
    path("riders/", AdminRiderListView.as_view(), name="admin-riders"),
    path("", include(router.urls)),
]
