from django.urls import path
from apps.authentication.views import RegisterView, LoginView, CustomTokenView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', LoginView.as_view(), name='auth_login'),
    path('token/', CustomTokenView.as_view(), name='token_obtain_pair'),
]