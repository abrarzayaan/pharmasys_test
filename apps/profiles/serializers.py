# pyrefly: ignore [missing-import]
from rest_framework import serializers
from apps.profiles.models import Address, ConsumerProfile, VendorProfile, RiderProfile

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        exclude = ['user', 'created_at', 'updated_at']


class ConsumerProfileSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(source='user.phone_number', read_only=True)
    first_name = serializers.CharField(source='user.first_name', required=False, allow_blank=True)
    last_name = serializers.CharField(source='user.last_name', required=False, allow_blank=True)
    email = serializers.EmailField(source='user.email', required=False, allow_blank=True)

    class Meta:
        model = ConsumerProfile
        fields = ['id', 'date_of_birth', 'gender', 'profile_image', 'phone', 'first_name', 'last_name', 'email']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        if user_data:
            user = instance.user
            for attr, val in user_data.items():
                setattr(user, attr, val)
            user.save()

        return super().update(instance, validated_data)


class VendorProfileSerializer(serializers.ModelSerializer):
    address = AddressSerializer(required=False, allow_null=True)

    class Meta:
        model = VendorProfile
        exclude = ['user', 'created_at', 'updated_at']

    def update(self, instance, validated_data):
        address_data = validated_data.pop('address', None)
        
        # মূল ভেন্ডর প্রোফাইল আপডেট
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # ওয়ান-টু-ওয়ান অ্যাড্রেস ক্রিয়েশন বা আপডেট হ্যান্ডেলিং
        if address_data:
            if instance.address:
                # আগের অ্যাড্রেস থাকলে সেটা আপডেট হবে
                for attr, value in address_data.items():
                    setattr(instance.address, attr, value)
                instance.address.save()
            else:
                # না থাকলে নতুন অ্যাড্রেস তৈরি হয়ে লিঙ্ক হবে
                new_address = Address.objects.create(user=instance.user, **address_data)
                instance.address = new_address
                instance.save()

        return instance


class RiderProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiderProfile
        exclude = ['user', 'created_at', 'updated_at']