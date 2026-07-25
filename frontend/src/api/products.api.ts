import api from './axios';
import type { Category, Brand, ProductVariantItem, PaginatedResponse } from '@/types/product.types';

export const productsApi = {
  getCategories: () =>
    api.get<Category[] | PaginatedResponse<Category>>('/products/categories/'),

  getBrands: () =>
    api.get<Brand[] | PaginatedResponse<Brand>>('/products/brands/'),

  getVariantsBySubcategory: (subcategoryId: number) =>
    api.get<PaginatedResponse<ProductVariantItem> | ProductVariantItem[]>(
      `/products/subcategories/${subcategoryId}/variants/`
    ),

  getVariantDetail: (id: number) =>
    api.get<any>(`/products/variants/${id}/`),

  getVariants: (params?: Record<string, any>) =>
    api.get<PaginatedResponse<ProductVariantItem> | ProductVariantItem[]>('/products/variants/', { params }),
};
