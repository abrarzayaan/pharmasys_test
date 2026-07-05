from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils.text import slugify
from apps.authentication.models import Role, UserRole
from apps.profiles.models import ConsumerProfile, VendorProfile, RiderProfile
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class RegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=50)
    last_name = serializers.CharField(max_length=50)
    phone = serializers.CharField(max_length=20)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(max_length=20)

    def validate_phone(self, value):
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_role(self, value):
        # ইনপুট রোল ক্লিনিং
        cleaned_role = value.strip().lower()
        valid_roles = ['consumer', 'vendor', 'rider']
        if cleaned_role not in valid_roles:
            raise serializers.ValidationError(f"Role must be one of {valid_roles}")
        return cleaned_role

    def create(self, validated_data):
        role_name = validated_data["role"] # এটি অলরেডি ছোট হাতের অক্ষরে আসবে

        with transaction.atomic():
            # ১. ইউজার অবজেক্ট তৈরি
            user = User.objects.create_user(
                first_name=validated_data["first_name"],
                last_name=validated_data["last_name"],
                username=validated_data["phone"],
                phone_number=validated_data["phone"],
                email=validated_data["email"],
                password=validated_data["password"]
            )

            # ২. ডাটাবেজ থেকে রোল অবজেক্ট আনা
            try:
                role = Role.objects.get(name=role_name)
            except Role.DoesNotExist:
                raise serializers.ValidationError({
                    "role": f"Role '{role_name}'টি ডাটাবেজে পাওয়া যায়নি। দয়া করে শেলে রোলটি তৈরি করুন।"
                })

            # ৩. ইউজার এবং রোল কানেক্ট করা
            UserRole.objects.create(user=user, role=role)

            # ৪. প্রোফাইল তৈরি (এখানে লজিক আরও টাইট করা হয়েছে)
            if role_name == "consumer":
                ConsumerProfile.objects.create(user=user)
            
            elif role_name == "vendor":
                shop_name = f"{user.first_name}'s Shop"
                base_slug = slugify(shop_name)
                slug = base_slug
                counter = 1
                while VendorProfile.objects.filter(slug=slug).exists():
                    slug = f"{base_slug}-{counter}"
                    counter += 1
                VendorProfile.objects.create(user=user, name=shop_name, slug=slug)
            
            elif role_name == "rider":
                RiderProfile.objects.create(user=user)
            
            else:
                raise serializers.ValidationError({"error": "Unknown role type. Profile creation failed."})

            return user


class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField()
    password = serializers.CharField()


class CustomTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
        token = super().get_token(user)
        try:
            role = UserRole.objects.get(user=user).role.name
        except UserRole.DoesNotExist:
            role = "consumer"

        token["role"] = role
        token["phone"] = user.phone_number
        return token