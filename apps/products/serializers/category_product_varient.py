from rest_framework import serializers

from apps.products.models import Category, ProductVariant


class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "slug",
            "image",
            "icon",
        )


class ProductVariantListSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source="product.id", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_slug = serializers.CharField(source="product.slug", read_only=True)

    category_id = serializers.IntegerField(source="product.category.id", read_only=True)
    category_name = serializers.CharField(source="product.category.name", read_only=True)

    brand_id = serializers.SerializerMethodField()
    brand_name = serializers.SerializerMethodField()

    thumbnail = serializers.ImageField(source="product.thumbnail", read_only=True)

    is_prescription_required = serializers.BooleanField(
        source="product.is_prescription_required",
        read_only=True,
    )

    class Meta:
        model = ProductVariant
        fields = (
            "id",
            "product_id",
            "product_name",
            "product_slug",
            "variant_name",
            "sku",
            "price",
            "sale_price",
            "thumbnail",
            "category_id",
            "category_name",
            "brand_id",
            "brand_name",
            "is_prescription_required",
        )

    def get_brand_id(self, obj):
        if obj.product.brand:
            return obj.product.brand.id
        return None

    def get_brand_name(self, obj):
        if obj.product.brand:
            return obj.product.brand.name
        return None