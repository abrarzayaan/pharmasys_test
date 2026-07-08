from rest_framework import serializers
from apps.profiles.models import Address, ConsumerProfile, VendorProfile, RiderProfile

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        exclude = ['user', 'created_at', 'updated_at']


class ConsumerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsumerProfile
        exclude = ['user', 'created_at', 'updated_at']


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