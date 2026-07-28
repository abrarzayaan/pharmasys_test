# pyrefly: ignore [missing-import]
from rest_framework import serializers
from apps.products.models import ProductVariant, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'variant', 'image_url', 'is_primary', 'sort_order', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProductVariantSerializer(serializers.ModelSerializer):
    # একটি ভ্যারিয়েন্টের আন্ডারে থাকা ইমেজগুলো একসাথে দেখার জন্য নেস্টেড রিলেশন (Read-Only)
    variant_images = ProductImageSerializer(source='images', many=True, read_only=True)
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    category_id = serializers.IntegerField(source='product.category.id', read_only=True, allow_null=True)
    category_name = serializers.CharField(source='product.category.name', read_only=True, allow_null=True)
    brand_id = serializers.SerializerMethodField()
    brand_name = serializers.SerializerMethodField()
    is_prescription_required = serializers.BooleanField(source='product.is_prescription_required', read_only=True)
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = [
            'id', 'product', 'product_id', 'product_name', 'product_slug', 'variant_name', 'sku', 'barcode', 
            'short_description', 'long_description',
            'price', 'sale_price', 'cost_price', 'min_order_qty', 'max_order_qty', 
            'weight', 'dimensions', 'status', 'meta', 'thumbnail', 'category_id', 'category_name', 
            'brand_id', 'brand_name', 'is_prescription_required', 'variant_images', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_brand_id(self, obj):
        if obj.product and obj.product.brand:
            return obj.product.brand.id
        return None

    def get_brand_name(self, obj):
        if obj.product and obj.product.brand:
            return obj.product.brand.name
        return None

    def get_thumbnail(self, obj):
        active_images = obj.images.filter(status='active')
        primary_image = active_images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = active_images.first()
        
        if primary_image and primary_image.image_url:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(primary_image.image_url.url)
            return primary_image.image_url.url
        
        if obj.product and obj.product.thumbnail:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.product.thumbnail.url)
            return obj.product.thumbnail.url
            
        return None

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
        meta.setdefault('is_quick_access', False)
        meta.setdefault('is_hot_deal', False)
        meta.setdefault('is_best_selling', False)
        attrs['meta'] = meta

        return attrs