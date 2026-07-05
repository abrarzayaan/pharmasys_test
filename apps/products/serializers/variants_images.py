from rest_framework import serializers
from apps.products.models import ProductVariant, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'product', 'variant', 'image_url', 'is_primary', 'sort_order', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProductVariantSerializer(serializers.ModelSerializer):
    # একটি ভ্যারিয়েন্টের আন্ডারে থাকা ইমেজগুলো একসাথে দেখার জন্য নেস্টেড রিলেশন (Read-Only)
    variant_images = ProductImageSerializer(source='images', many=True, read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = ProductVariant
        fields = [
            'id', 'product', 'product_name', 'variant_name', 'sku', 'barcode', 
            'price', 'sale_price', 'cost_price', 'min_order_qty', 'max_order_qty', 
            'weight', 'dimensions', 'status', 'meta', 'variant_images', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        """
        Lead Developer Logic: ডাইনামিক প্রাইস ভ্যালিডেশন এবং JSON স্ট্রাকচার কন্ট্রোল
        """
        # ১. বিজনেস লজিক চেক: সেল প্রাইস কখনো রেগুলার প্রাইসের চেয়ে বেশি হতে পারে না
        price = attrs.get('price')
        sale_price = attrs.get('sale_price')
        
        if price and sale_price and sale_price > price:
            raise serializers.ValidationError({
                "sale_price": "Sale price cannot be greater than the regular price."
            })

        # ২. ডাইনামিক Dimensions JSON ভ্যালিডেশন
        dimensions = attrs.get('dimensions', {})
        if not isinstance(dimensions, dict):
            raise serializers.ValidationError({"dimensions": "Dimensions must be a valid JSON object."})
        
        dimensions.setdefault('length', 0.0)
        dimensions.setdefault('width', 0.0)
        dimensions.setdefault('height', 0.0)
        dimensions.setdefault('unit', 'cm')
        attrs['dimensions'] = dimensions

        # ৩. ডাইনামিক Meta JSON ভ্যালিডেশন
        meta = attrs.get('meta', {})
        if not isinstance(meta, dict):
            raise serializers.ValidationError({"meta": "Meta must be a valid JSON object."})
            
        meta.setdefault('pack_size', '')
        meta.setdefault('color', '')
        meta.setdefault('size', '')
        attrs['meta'] = meta

        return attrs