import api from '@/api/axios';
import type {
  AdminVariantItem,
  BulkDiscountRulePayload,
  VariantMetaFlags,
} from '../types/admin.types';

export interface CategoryPayload {
  name: string;
  parent?: number | null;
  sort_order?: number;
  status?: 'active' | 'hidden';
  metadata?: {
    show_on_homepage?: boolean;
    seo_title?: string;
    seo_description?: string;
  };
}

export interface ProductPayload {
  name: string;
  category: number;
  brand?: number | null;
  is_prescription_required?: boolean;
  status?: 'active' | 'hidden';
  short_description?: Record<string, unknown> | string;
  long_description?: Record<string, unknown> | string;
  meta?: {
    tags?: string[];
    seo_title?: string;
    seo_description?: string;
    returnable?: boolean;
    warranty_days?: number;
  };
}

export interface VariantPayload {
  product: number;
  variant_name: string;
  sku: string;
  barcode?: string;
  price: number;
  sale_price?: number | null;
  cost_price?: number | null;
  min_order_qty?: number;
  max_order_qty?: number | null;
  status?: 'active' | 'hidden';
  short_description?: {
    dosage?: string;
    storage?: string;
    warnings?: string;
    side_effects?: string;
  };
  long_description?: {
    about?: string;
    highlights?: string[];
    indications?: string;
  };
  meta?: VariantMetaFlags;
}

export const INITIAL_MOCK_VARIANTS: AdminVariantItem[] = [
  {
    id: 12,
    sku: 'NAPA-EXT-500',
    product_id: 1,
    product_name: 'Napa Extra 500mg',
    variant_name: '10 Tablets Strip',
    category_name: 'Prescription Medicines',
    brand_name: 'Beximco Pharmaceuticals',
    price: 35,
    sale_price: 30,
    cost_price: 25,
    min_order_qty: 1,
    max_order_qty: 10,
    status: 'active',
    meta: {
      pack_size: '10 Pcs Blister Pack',
      is_hot_deal: true,
      is_best_selling: true,
      is_featured: true,
    },
  },
  {
    id: 45,
    sku: 'SERGEL-20MG-BOX',
    product_id: 2,
    product_name: 'Sergel 20mg Omeprazole',
    variant_name: '20 Capsules Box',
    category_name: 'Gastric & Digestive Care',
    brand_name: 'Healthcare Pharmaceuticals',
    price: 140,
    sale_price: 120,
    cost_price: 100,
    min_order_qty: 1,
    max_order_qty: 5,
    status: 'active',
    meta: {
      pack_size: '20 Capsules Box',
      is_hot_deal: true,
      is_featured: false,
    },
  },
  {
    id: 18,
    sku: 'SECLO-20MG-STRIP',
    product_id: 3,
    product_name: 'Seclo 20mg',
    variant_name: '10 Capsules Pack',
    category_name: 'Gastric & Digestive Care',
    brand_name: 'Square Pharmaceuticals',
    price: 60,
    sale_price: null,
    cost_price: 45,
    min_order_qty: 1,
    max_order_qty: 10,
    status: 'active',
    meta: {
      pack_size: '10 Pcs Pack',
      is_hot_deal: false,
      is_featured: true,
    },
  },
  {
    id: 30,
    sku: 'REX-SYRUP-100ML',
    product_id: 4,
    product_name: 'Rex Cough Syrup',
    variant_name: '100ml Bottle',
    category_name: 'Cold & Allergy',
    brand_name: 'ACI Pharmaceuticals',
    price: 180,
    sale_price: 160,
    cost_price: 130,
    min_order_qty: 1,
    max_order_qty: 3,
    status: 'active',
    meta: {
      pack_size: '100ml Bottle',
      is_hot_deal: false,
      is_featured: false,
    },
  },
  {
    id: 55,
    sku: 'FINIX-20-BOX',
    product_id: 5,
    product_name: 'Finix 20mg Rabeprazole',
    variant_name: '20 Tablets Box',
    category_name: 'Gastric & Digestive Care',
    brand_name: 'Incepta Pharmaceuticals',
    price: 160,
    sale_price: 140,
    cost_price: 110,
    min_order_qty: 1,
    max_order_qty: 5,
    status: 'active',
    meta: {
      pack_size: '20 Pcs Box',
      is_hot_deal: true,
      is_featured: true,
    },
  },
  {
    id: 60,
    sku: 'MAXPRO-40-PACK',
    product_id: 6,
    product_name: 'Maxpro 40mg Esomeprazole',
    variant_name: '14 Tablets Pack',
    category_name: 'Gastric & Digestive Care',
    brand_name: 'Renata Limited',
    price: 154,
    sale_price: null,
    cost_price: 120,
    min_order_qty: 1,
    max_order_qty: 5,
    status: 'active',
    meta: {
      pack_size: '14 Pcs Pack',
      is_hot_deal: false,
      is_featured: false,
    },
  },
];

let localVariantsStore: AdminVariantItem[] = [...INITIAL_MOCK_VARIANTS];
let localCategoriesStore: { id: number; name: string }[] = [
  { id: 1, name: 'Prescription Medicines' },
  { id: 2, name: 'Gastric & Digestive Care' },
  { id: 3, name: 'Cold & Allergy' },
  { id: 4, name: 'Personal Care & Hygiene' },
];
let localBrandsStore: { id: number; name: string }[] = [
  { id: 1, name: 'Beximco Pharmaceuticals Ltd.' },
  { id: 2, name: 'Square Pharmaceuticals Ltd.' },
  { id: 3, name: 'Incepta Pharmaceuticals' },
];
let localProductsStore: { id: number; name: string; category_name: string }[] = [
  { id: 1, name: 'Napa Extra 500mg', category_name: 'Prescription Medicines' },
  { id: 2, name: 'Sergel 20mg Omeprazole', category_name: 'Gastric & Digestive Care' },
  { id: 3, name: 'Seclo 20mg', category_name: 'Gastric & Digestive Care' },
  { id: 4, name: 'Rex Cough Syrup', category_name: 'Cold & Allergy' },
  { id: 5, name: 'Finix 20mg Rabeprazole', category_name: 'Gastric & Digestive Care' },
  { id: 6, name: 'Maxpro 40mg Esomeprazole', category_name: 'Gastric & Digestive Care' },
];

export const adminCatalogApi = {
  // GET Categories List
  getCategories: async (): Promise<{ id: number; name: string }[]> => {
    try {
      const res = await api.get('/products/categories/');
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return localCategoriesStore;
    } catch {
      return localCategoriesStore;
    }
  },

  // GET Brands List
  getBrands: async (): Promise<{ id: number; name: string }[]> => {
    try {
      const res = await api.get('/products/brands/');
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return [
        { id: 1, name: 'Beximco Pharmaceuticals' },
        { id: 2, name: 'Square Pharmaceuticals' },
        { id: 3, name: 'Incepta Pharmaceuticals' },
      ];
    } catch {
      return [
        { id: 1, name: 'Beximco Pharmaceuticals' },
        { id: 2, name: 'Square Pharmaceuticals' },
        { id: 3, name: 'Incepta Pharmaceuticals' },
      ];
    }
  },

  // GET Products List
  getProducts: async (): Promise<{ id: number; name: string; category_name: string }[]> => {
    try {
      const res = await api.get('/products/products/');
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return localProductsStore;
    } catch {
      return localProductsStore;
    }
  },

  // GET Variants List
  getVariants: async (searchQuery?: string, categoryFilter?: string): Promise<AdminVariantItem[]> => {
    try {
      const params: Record<string, string> = {};
      if (searchQuery) params.search = searchQuery;
      if (categoryFilter && categoryFilter !== 'ALL') params.category = categoryFilter;

      const res = await api.get('/products/variants/', { params });
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return localVariantsStore;
    } catch {
      let result = [...localVariantsStore];
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter(
          (v) =>
            v.product_name.toLowerCase().includes(q) ||
            v.sku.toLowerCase().includes(q) ||
            v.variant_name.toLowerCase().includes(q)
        );
      }
      if (categoryFilter && categoryFilter !== 'ALL') {
        result = result.filter((v) => v.category_name === categoryFilter);
      }
      return result;
    }
  },

  // CREATE Category (POST /api/products/categories/)
  createCategory: async (payload: CategoryPayload) => {
    try {
      const res = await api.post('/products/categories/', payload);
      if (res.data?.id && res.data?.name) {
        localCategoriesStore.push({ id: res.data.id, name: res.data.name });
      }
      return res.data;
    } catch (err: unknown) {
      const newCat = { id: Date.now(), name: payload.name };
      localCategoriesStore.push(newCat);
      return newCat;
    }
  },

  // CREATE Product (POST /api/products/products/)
  createProduct: async (payload: ProductPayload) => {
    try {
      const res = await api.post('/products/products/', payload);
      if (res.data?.id && res.data?.name) {
        localProductsStore.push({
          id: res.data.id,
          name: res.data.name,
          category_name: res.data.category_name || 'General',
        });
      }
      return res.data;
    } catch (err: unknown) {
      const newProd = { id: Date.now(), name: payload.name, category_name: 'General' };
      localProductsStore.push(newProd);
      return newProd;
    }
  },

  // CREATE Variant with Meta Builder (POST /api/products/variants/)
  createVariant: async (payload: VariantPayload): Promise<AdminVariantItem> => {
    try {
      const res = await api.post('/products/variants/', payload);
      const data = res.data;
      if (data && data.id) {
        const mappedItem: AdminVariantItem = {
          id: data.id,
          sku: data.sku || `SKU-${data.id}`,
          product_id: data.product || payload.product,
          product_name: data.product_name || 'New Product',
          variant_name: data.variant_name || payload.variant_name,
          category_name: data.category_name || 'General',
          brand_name: data.brand_name || 'Generic Brand',
          price: Number(data.price) || payload.price,
          sale_price: data.sale_price !== null ? Number(data.sale_price) : null,
          min_order_qty: data.min_order_qty || 1,
          status: data.status || 'active',
          meta: data.meta || payload.meta || {},
        };
        localVariantsStore.unshift(mappedItem);
        return mappedItem;
      }
      throw new Error('Invalid response structure');
    } catch {
      const matchedProd = localProductsStore.find((p) => p.id === payload.product);
      const newVariant: AdminVariantItem = {
        id: Date.now(),
        sku: payload.sku,
        product_id: payload.product,
        product_name: matchedProd ? matchedProd.name : 'Custom Product',
        variant_name: payload.variant_name,
        category_name: matchedProd ? matchedProd.category_name : 'General',
        price: payload.price,
        sale_price: payload.sale_price || null,
        min_order_qty: payload.min_order_qty || 1,
        status: payload.status || 'active',
        meta: payload.meta || {},
      };
      localVariantsStore.unshift(newVariant);
      return newVariant;
    }
  },

  // UPLOAD Variant Image (POST /api/products/images/)
  uploadVariantImage: async (formData: FormData) => {
    try {
      const res = await api.post('/products/images/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch {
      return { id: Date.now(), status: 'active', is_primary: true };
    }
  },

  // PATCH Single Variant Pricing & Meta
  updateVariantPricing: async (
    variantId: number,
    price: number,
    salePrice: number | null,
    meta?: VariantMetaFlags
  ): Promise<AdminVariantItem> => {
    try {
      const payload: Record<string, unknown> = { price, sale_price: salePrice };
      if (meta) payload.meta = meta;

      const res = await api.patch(`/products/variants/${variantId}/`, payload);
      return res.data;
    } catch {
      localVariantsStore = localVariantsStore.map((v) => {
        if (v.id === variantId) {
          return {
            ...v,
            price,
            sale_price: salePrice,
            meta: meta ? { ...v.meta, ...meta } : v.meta,
          };
        }
        return v;
      });
      return localVariantsStore.find((v) => v.id === variantId)!;
    }
  },

  // POST Apply Bulk Discount Rule
  applyBulkDiscountRule: async (payload: BulkDiscountRulePayload): Promise<AdminVariantItem[]> => {
    try {
      const res = await api.post('/admin/products/variants/bulk-discount/', payload);
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return localVariantsStore;
    } catch {
      localVariantsStore = localVariantsStore.map((v) => {
        if (payload.variant_ids.includes(v.id)) {
          let calculatedSalePrice = v.price;
          if (payload.discount_type === 'flat') {
            calculatedSalePrice = Math.max(0, v.price - payload.discount_value);
          } else if (payload.discount_type === 'percentage') {
            const discountAmount = (v.price * payload.discount_value) / 100;
            calculatedSalePrice = Math.max(0, Math.round(v.price - discountAmount));
          }

          const updatedMeta: VariantMetaFlags = { ...v.meta };
          if (payload.is_hot_deal !== undefined) updatedMeta.is_hot_deal = payload.is_hot_deal;
          if (payload.is_featured !== undefined) updatedMeta.is_featured = payload.is_featured;

          return {
            ...v,
            sale_price: calculatedSalePrice,
            meta: updatedMeta,
          };
        }
        return v;
      });

      return localVariantsStore;
    }
  },

  // CREATE Brand (POST /api/products/brands/)
  createBrand: async (payload: { name: string; status?: string; metadata?: Record<string, any> }) => {
    try {
      const res = await api.post('/products/brands/', payload);
      if (res.data?.id && res.data?.name) {
        localBrandsStore.push({ id: res.data.id, name: res.data.name });
      }
      return res.data;
    } catch {
      const newBrand = { id: Date.now(), name: payload.name };
      localBrandsStore.push(newBrand);
      return newBrand;
    }
  },

  // GET Vendors List
  getVendors: async (): Promise<{ id: number; name: string; username?: string }[]> => {
    try {
      const res = await api.get('/admin/orders/vendors/');
      const data = res.data;
      const list = Array.isArray(data) ? data : (data && Array.isArray(data.results) ? data.results : []);
      if (list.length > 0) {
        return list.map((v: any) => ({
          id: v.id,
          name: v.name || v.username || `Vendor Hub #${v.id}`,
          username: v.username || `vendor_${v.id}`,
        }));
      }
      return [
        { id: 1, name: 'Lazz Pharma (Dhanmondi Hub)', username: 'lazz_dhanmondi' },
        { id: 2, name: 'Tamanna Pharmacy (Gulshan Hub)', username: 'tamanna_gulshan' },
        { id: 3, name: 'Aroggo Central Depot', username: 'aroggo_depot' },
        { id: 4, name: 'Popular Medicine Store (Uttara)', username: 'popular_uttara' },
      ];
    } catch {
      return [
        { id: 1, name: 'Lazz Pharma (Dhanmondi Hub)', username: 'lazz_dhanmondi' },
        { id: 2, name: 'Tamanna Pharmacy (Gulshan Hub)', username: 'tamanna_gulshan' },
        { id: 3, name: 'Aroggo Central Depot', username: 'aroggo_depot' },
        { id: 4, name: 'Popular Medicine Store (Uttara)', username: 'popular_uttara' },
      ];
    }
  },

  // CREATE Inventory Batch (POST /api/products/inventories/)
  createInventory: async (payload: {
    variant: number;
    vendor?: number | null;
    stock_qty: number;
    reserved_qty?: number;
    damaged_qty?: number;
    reorder_level?: number;
  }) => {
    try {
      const res = await api.post('/products/inventories/', payload);
      return res.data;
    } catch {
      return { id: Date.now(), ...payload, status: 'in_stock' };
    }
  },
};
