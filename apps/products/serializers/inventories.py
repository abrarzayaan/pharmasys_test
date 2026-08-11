# pyrefly: ignore [missing-import]
from rest_framework import serializers
from apps.products.models import Inventory


class InventorySerializer(serializers.ModelSerializer):
    # মডেলের কাস্টম @property ফিল্ডটিকে এপিআই রেসপন্সে দেখানোর জন্য Read-Only ফিল্ড
    available_stock = serializers.IntegerField(read_only=True)
    
    # ফ্রন্টএন্ড UI-তে প্রোডাক্ট ট্র্যাক করার সুবিধার জন্য রিলেশনাল ডেটা রিড করা
    variant_name = serializers.CharField(source='variant.variant_name', read_only=True)
    product_name = serializers.CharField(source='variant.product.name', read_only=True)
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)

    class Meta:
        model = Inventory
        fields = [
            'id', 'vendor', 'vendor_name', 'variant', 'product_name', 'variant_name', 
            'stock_qty', 'reserved_qty', 'damaged_qty', 'reorder_level', 
            'available_stock', 'status', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'updated_at']
        extra_kwargs = {
            'vendor': {'required': False, 'allow_null': True}
        }

    def validate(self, attrs):
        """
        Lead Developer Logic: স্টক কাউন্টের ওপর ভিত্তি করে ডাইনামিক স্ট্যাটাস ক্যালকুলেশন
        """
        stock_qty = attrs.get('stock_qty', self.instance.stock_qty if self.instance else 0)
        reserved_qty = attrs.get('reserved_qty', self.instance.reserved_qty if self.instance else 0)
        damaged_qty = attrs.get('damaged_qty', self.instance.damaged_qty if self.instance else 0)
        reorder_level = attrs.get('reorder_level', self.instance.reorder_level if self.instance else 10)

        if (reserved_qty + damaged_qty) > stock_qty:
            raise serializers.ValidationError({
                "stock_qty": "Total reserved and damaged stock cannot exceed the actual physical stock qty."
            })

        available = stock_qty - (reserved_qty + damaged_qty)
        
        if available <= 0:
            attrs['status'] = 'out_of_stock'
        elif available <= reorder_level:
            attrs['status'] = 'low_stock'
        else:
            attrs['status'] = 'in_stock'

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        if not validated_data.get('vendor') and request and hasattr(request, 'user'):
            from apps.profiles.models import VendorProfile
            user = request.user
            if hasattr(user, 'vendor_profile'):
                validated_data['vendor'] = user.vendor_profile
            else:
                vprof, _ = VendorProfile.objects.get_or_create(
                    user=user,
                    defaults={'name': f"{user.username} Store", 'slug': f"{user.username}-store", 'status': 'active'}
                )
                validated_data['vendor'] = vprof
            
        return super().create(validated_data)