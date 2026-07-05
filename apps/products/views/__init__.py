from .category_brand import CategoryViewSet, BrandViewSet
from .product_core import ProductViewSet
from .variants_images import ProductVariantViewSet, ProductImageViewSet
from .attributes import ProductAttributeViewSet, ProductAttributeValueViewSet
from .inventories import InventoryViewSet

__all__ = [
    'CategoryViewSet', 'BrandViewSet', 
    'ProductViewSet',
    'ProductVariantViewSet', 'ProductImageViewSet',
    'ProductAttributeViewSet', 'ProductAttributeValueViewSet',
    'InventoryViewSet'
]