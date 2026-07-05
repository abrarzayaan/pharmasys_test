from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.views import TokenObtainPairView
from drf_spectacular.utils import extend_schema
from rest_framework_simplejwt.tokens import RefreshToken

from apps.authentication.serializers import RegisterSerializer, LoginSerializer, CustomTokenSerializer
from apps.authentication.models import UserRole

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    try:
        role = UserRole.objects.get(user=user).role.name
    except UserRole.DoesNotExist:
        role = "consumer"

    refresh["role"] = role
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token)
    }


class RegisterView(APIView):
    @extend_schema(request=RegisterSerializer)
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            "message": "Registration Successful and Profile Created!"
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    @extend_schema(request=LoginSerializer)
    def post(self, request):
        phone = request.data.get("phone")
        password = request.data.get("password")
        
        # কাস্টম ইউজারে USERNAME_FIELD='phone_number' হওয়ায় ব্যাকএন্ডে এটি username হিসেবে পাস করতে হয়
        user = authenticate(username=phone, password=password)
        
        if user is not None:
            tokens = get_tokens_for_user(user)
            return Response(tokens, status=status.HTTP_200_OK)
        
        return Response({
            "error": "Invalid phone number or password"
        }, status=status.HTTP_401_UNAUTHORIZED)


class CustomTokenView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer