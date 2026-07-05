from .category_brand import CategorySerializer, BrandSerializer
from .product_core import ProductSerializer
from .variants_images import ProductVariantSerializer, ProductImageSerializer
from .attributes import ProductAttributeSerializer, ProductAttributeValueSerializer
from .inventories import InventorySerializer

# অন্য কোথাও থেকে এক লাইনে সব সিরিয়ালাইজার ইম্পোর্ট করার সুবিধা দেবে এটি
__all__ = ['CategorySerializer', 'BrandSerializer', 
           'ProductSerializer',
           'ProductVariantSerializer', 'ProductImageSerializer',
           'ProductAttributeSerializer', 'ProductAttributeValueSerializer',
           'InventorySerializer'
        ]