export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  icon: string | null;
  sort_order?: number;
  status?: string;
}

export interface Category {
  id: number;
  parent: number | null;
  name: string;
  slug: string;
  image: string | null;
  icon: string | null;
  sort_order: number;
  status: string;
  children: Subcategory[];
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  status?: string;
}

export interface ProductVariantItem {
  id: number;
  product_id: number;
  product_name: string;
  product_slug: string;
  variant_name: string;
  sku: string;
  price: string | number;
  sale_price: string | number | null;
  thumbnail: string | null;
  category_id: number | null;
  category_name: string | null;
  brand_id: number | null;
  brand_name: string | null;
  is_prescription_required: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
