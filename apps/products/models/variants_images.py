from django.db import models
from .category_brand import StatusChoices
from .product_core import Product

class ImageStatusChoices(models.TextChoices):
    ACTIVE = 'active', 'Active'
    HIDDEN = 'hidden', 'Hidden'


# ====================================================================
# 8. Product Variants Model
# ====================================================================
class ProductVariant(models.Model):
    """
    PharmaSys Product Variant Model.
    Handles different configurations like pack sizes (e.g., 10 Pcs, 30 Pcs) or potencies (500mg, 650mg).
    """
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE, 
        related_name='variants'
    )
    variant_name = models.CharField(
        max_length=255, 
        help_text="e.g., 500mg, 10 Pcs Pack, 100ml Bottle"
    )
    sku = models.CharField(max_length=100, unique=True, db_index=True)
    barcode = models.CharField(max_length=100, unique=True, null=True, blank=True)
    
    # Financial Fields
    price = models.DecimalField(max_digits=12, decimal_places=2)  # Regular Price
    sale_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)  # Discounted Price
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)  # Buying/Vendor Cost
    
    # Order Limitations
    min_order_qty = models.PositiveIntegerField(default=1)
    max_order_qty = models.PositiveIntegerField(null=True, blank=True)
    
    # Shipping/Logistics Fields
    weight = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        null=True, 
        blank=True, 
        help_text="Weight in grams/kg"
    )
    # Dimensions JSON: { "length": 0, "width": 0, "height": 0, "unit": "cm" }
    dimensions = models.JSONField(default=dict, blank=True)
    
    status = models.CharField(
        max_length=20, 
        choices=StatusChoices.choices, 
        default=StatusChoices.ACTIVE
    )
    
    # Meta JSON: { "pack_size": "10 pcs", "color": "", "size": "" }
    meta = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ph_product_variants'
        ordering = ['price']

    def __str__(self):
        return f"{self.product.name} - {self.variant_name}"


# ====================================================================
# 9. Product Images Model
# ====================================================================
class ProductImage(models.Model):
    """
    PharmaSys Product Image Gallery.
    Can be tied to a generic product or a specific variant.
    """
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE, 
        related_name='images'
    )
    # কন্ডিশনাল নাল: ইমেজ যদি নির্দিষ্ট কোনো ভ্যারিয়েন্টের হয় (যেমন: পাতার কালার বা প্যাকের সাইজ আলাদা হলে)
    variant = models.ForeignKey(
        ProductVariant, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='images'
    )
    image_url = models.ImageField(upload_to='products/gallery/')
    is_primary = models.BooleanField(default=False)  # মেইন ইমেজ ট্র্যাকিং
    sort_order = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=20, 
        choices=ImageStatusChoices.choices, 
        default=ImageStatusChoices.ACTIVE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ph_product_images'
        ordering = ['sort_order']

    def __str__(self):
        return f"Image for {self.product.name}"