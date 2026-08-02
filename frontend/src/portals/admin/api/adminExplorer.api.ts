import api from '../../../api/axios';

export interface ModelFieldMeta {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'date' | 'foreign_key';
  required?: boolean;
  readOnly?: boolean;
  description?: string;
}

export interface ModelMeta {
  key: string;
  name: string;
  app: string;
  icon: string;
  description: string;
  endpoint: string;
  fields: ModelFieldMeta[];
}

export interface ModelRecord {
  id: number | string;
  [key: string]: any;
}

export const registeredModelsMeta: ModelMeta[] = [
  {
    key: 'products.ProductVariant',
    name: 'Product Variants & SKUs',
    app: 'Products & Catalog',
    icon: '💊',
    description: 'Master list of buyable medicine variants, prices, packaging, and meta flags.',
    endpoint: '/api/products/variants/',
    fields: [
      { name: 'id', type: 'number', readOnly: true },
      { name: 'product', type: 'foreign_key', required: true, description: 'Product ID' },
      { name: 'variant_name', type: 'string', required: true },
      { name: 'sku', type: 'string', required: true },
      { name: 'price', type: 'number', required: true },
      { name: 'sale_price', type: 'number' },
      { name: 'pack_size', type: 'string' },
      { name: 'is_active', type: 'boolean' },
      { name: 'meta', type: 'json', description: 'JSON object for flags: is_hot_deal, is_best_selling, is_flash_sale' },
      { name: 'created_at', type: 'date', readOnly: true },
    ],
  },
  {
    key: 'products.Product',
    name: 'Master Products',
    app: 'Products & Catalog',
    icon: '📦',
    description: 'Core product catalog items with brand, category, and prescription requirements.',
    endpoint: '/api/products/products/',
    fields: [
      { name: 'id', type: 'number', readOnly: true },
      { name: 'name', type: 'string', required: true },
      { name: 'generic_name', type: 'string' },
      { name: 'category', type: 'foreign_key', required: true },
      { name: 'brand', type: 'foreign_key' },
      { name: 'is_prescription_required', type: 'boolean' },
      { name: 'short_description', type: 'json' },
      { name: 'long_description', type: 'json' },
    ],
  },
  {
    key: 'products.Category',
    name: 'Categories',
    app: 'Products & Catalog',
    icon: '🗂️',
    description: 'Top-level healthcare product categories (e.g. Prescription, OTC, Baby Care).',
    endpoint: '/api/products/categories/',
    fields: [
      { name: 'id', type: 'number', readOnly: true },
      { name: 'name', type: 'string', required: true },
      { name: 'slug', type: 'string' },
      { name: 'is_active', type: 'boolean' },
      { name: 'icon_name', type: 'string' },
    ],
  },
  {
    key: 'products.Brand',
    name: 'Pharmaceutical Brands',
    app: 'Products & Catalog',
    icon: '🏢',
    description: 'Pharma companies and manufacturer brands (e.g. Square, Incepta, Beximco).',
    endpoint: '/api/products/brands/',
    fields: [
      { name: 'id', type: 'number', readOnly: true },
      { name: 'name', type: 'string', required: true },
      { name: 'slug', type: 'string' },
      { name: 'origin_country', type: 'string' },
    ],
  },
  {
    key: 'products.Inventory',
    name: 'Stock Inventories',
    app: 'Inventory & Warehouses',
    icon: '🏭',
    description: 'Warehouse and vendor stock tracking per variant.',
    endpoint: '/api/products/inventories/',
    fields: [
      { name: 'id', type: 'number', readOnly: true },
      { name: 'variant', type: 'foreign_key', required: true },
      { name: 'vendor', type: 'foreign_key' },
      { name: 'stock_qty', type: 'number', required: true },
      { name: 'reserved_qty', type: 'number' },
      { name: 'damaged_qty', type: 'number' },
    ],
  },
  {
    key: 'orders.Order',
    name: 'Customer Orders',
    app: 'Order Fulfillment',
    icon: '🛒',
    description: 'Customer purchase orders, total amounts, statuses, and delivery addresses.',
    endpoint: '/api/orders/orders/',
    fields: [
      { name: 'id', type: 'number', readOnly: true },
      { name: 'order_number', type: 'string', readOnly: true },
      { name: 'user', type: 'foreign_key', required: true },
      { name: 'total_amount', type: 'number', required: true },
      { name: 'status', type: 'string', required: true },
      { name: 'payment_status', type: 'string' },
      { name: 'created_at', type: 'date', readOnly: true },
    ],
  },
  {
    key: 'authentication.Users',
    name: 'User Accounts',
    app: 'Authentication & Users',
    icon: '👤',
    description: 'Registered customer accounts, phone numbers, email addresses, and staff flags.',
    endpoint: '/api/auth/users/',
    fields: [
      { name: 'id', type: 'number', readOnly: true },
      { name: 'username', type: 'string', required: true },
      { name: 'phone_number', type: 'string', required: true },
      { name: 'email', type: 'string' },
      { name: 'is_staff', type: 'boolean' },
      { name: 'is_active', type: 'boolean' },
      { name: 'date_joined', type: 'date', readOnly: true },
    ],
  },
  {
    key: 'promotions.Coupon',
    name: 'Promotional Coupons',
    app: 'Marketing & Promos',
    icon: '🎟️',
    description: 'Discount promo codes, percentage or flat discounts, and validity periods.',
    endpoint: '/api/promotions/coupons/',
    fields: [
      { name: 'id', type: 'number', readOnly: true },
      { name: 'code', type: 'string', required: true },
      { name: 'discount_type', type: 'string', required: true },
      { name: 'discount_value', type: 'number', required: true },
      { name: 'min_order_amount', type: 'number' },
      { name: 'is_active', type: 'boolean' },
    ],
  },
  {
    key: 'cms.HeroBannerSlide',
    name: 'Hero Banner Slides',
    app: 'CMS & Content',
    icon: '🖼️',
    description: 'Dynamic homepage hero banners, badge tags, and background image URLs.',
    endpoint: '/api/cms/hero-banners/',
    fields: [
      { name: 'id', type: 'number', readOnly: true },
      { name: 'headline', type: 'string', required: true },
      { name: 'subheadline', type: 'string' },
      { name: 'image_url', type: 'string', required: true },
      { name: 'badge_tag', type: 'string' },
      { name: 'type', type: 'string', required: true },
      { name: 'is_active', type: 'boolean' },
      { name: 'sort_order', type: 'number' },
    ],
  },
];

const STORAGE_PREFIX = 'pharmasys_explorer_data_';

const seedMockData = (key: string): ModelRecord[] => {
  if (key === 'products.ProductVariant') {
    return [
      { id: 101, product: 1, variant_name: 'Napa Extend 665mg (10 Tablets)', sku: 'NAPA-665-10', price: 20, sale_price: 18, pack_size: '10 Strip', is_active: true, meta: { is_hot_deal: true, is_best_selling: true }, created_at: '2026-07-20T10:00:00Z' },
      { id: 102, product: 2, variant_name: 'Ace Plus 500mg+65mg (10 Strips)', sku: 'ACE-500-10', price: 35, sale_price: 30, pack_size: '10 Box', is_active: true, meta: { is_flash_sale: true }, created_at: '2026-07-22T14:30:00Z' },
      { id: 103, product: 3, variant_name: 'Seclo 20mg Capsule (14 Caps)', sku: 'SECLO-20-14', price: 98, sale_price: 85, pack_size: '14 Cap Pack', is_active: true, meta: { is_featured: true }, created_at: '2026-07-25T09:15:00Z' },
    ];
  }
  if (key === 'products.Product') {
    return [
      { id: 1, name: 'Napa Extend', generic_name: 'Paracetamol 665mg', category: 1, brand: 1, is_prescription_required: false, short_description: { bdt: 'Fast relief' }, long_description: { usage: 'Take after meals' } },
      { id: 2, name: 'Ace Plus', generic_name: 'Paracetamol + Caffeine', category: 1, brand: 1, is_prescription_required: false, short_description: { info: 'Pain relief' }, long_description: {} },
      { id: 3, name: 'Seclo 20', generic_name: 'Omeprazole 20mg', category: 1, brand: 2, is_prescription_required: true, short_description: { info: 'Gastric relief' }, long_description: {} },
    ];
  }
  if (key === 'products.Category') {
    return [
      { id: 1, name: 'Prescription Medicines', slug: 'prescription', is_active: true, icon_name: 'Pills' },
      { id: 2, name: 'OTC & Healthcare', slug: 'otc-healthcare', is_active: true, icon_name: 'Stethoscope' },
      { id: 3, name: 'Baby & Mother Care', slug: 'baby-care', is_active: true, icon_name: 'Baby' },
    ];
  }
  if (key === 'products.Brand') {
    return [
      { id: 1, name: 'Square Pharmaceuticals Ltd.', slug: 'square-pharma', origin_country: 'Bangladesh' },
      { id: 2, name: 'Incepta Pharmaceuticals Ltd.', slug: 'incepta-pharma', origin_country: 'Bangladesh' },
      { id: 3, name: 'Beximco Pharma Ltd.', slug: 'beximco-pharma', origin_country: 'Bangladesh' },
    ];
  }
  return [
    { id: 1, name: 'Sample Record 1', is_active: true, created_at: new Date().toISOString() },
    { id: 2, name: 'Sample Record 2', is_active: true, created_at: new Date().toISOString() },
  ];
};

const getStoredModelData = (key: string): ModelRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw) return JSON.parse(raw);
  } catch {}
  const seeded = seedMockData(key);
  saveStoredModelData(key, seeded);
  return seeded;
};

const saveStoredModelData = (key: string, records: ModelRecord[]) => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(records));
  } catch {}
};

export const adminExplorerApi = {
  getRegisteredModels: (): ModelMeta[] => {
    return registeredModelsMeta;
  },

  getModelRecords: async (modelKey: string): Promise<ModelRecord[]> => {
    const meta = registeredModelsMeta.find((m) => m.key === modelKey);
    if (meta?.endpoint) {
      try {
        const res = await api.get(meta.endpoint);
        if (Array.isArray(res.data) && res.data.length > 0) return res.data;
        if (res.data?.results && Array.isArray(res.data.results)) return res.data.results;
      } catch {}
    }
    return getStoredModelData(modelKey);
  },

  createRecord: async (modelKey: string, payload: Record<string, any>): Promise<ModelRecord> => {
    const meta = registeredModelsMeta.find((m) => m.key === modelKey);
    if (meta?.endpoint) {
      try {
        const res = await api.post(meta.endpoint, payload);
        if (res.data && res.data.id) return res.data;
      } catch {}
    }
    const list = getStoredModelData(modelKey);
    const newRecord: ModelRecord = {
      ...payload,
      id: Date.now(),
      created_at: new Date().toISOString(),
    };
    const updated = [newRecord, ...list];
    saveStoredModelData(modelKey, updated);
    return newRecord;
  },

  updateRecord: async (modelKey: string, recordId: number | string, payload: Record<string, any>): Promise<ModelRecord> => {
    const meta = registeredModelsMeta.find((m) => m.key === modelKey);
    if (meta?.endpoint) {
      try {
        const res = await api.patch(`${meta.endpoint}${recordId}/`, payload);
        if (res.data) return res.data;
      } catch {}
    }
    const list = getStoredModelData(modelKey);
    const updated = list.map((item) => (item.id === recordId ? { ...item, ...payload } : item));
    saveStoredModelData(modelKey, updated);
    return updated.find((item) => item.id === recordId)!;
  },

  deleteRecord: async (modelKey: string, recordId: number | string): Promise<boolean> => {
    const meta = registeredModelsMeta.find((m) => m.key === modelKey);
    if (meta?.endpoint) {
      try {
        await api.delete(`${meta.endpoint}${recordId}/`);
      } catch {}
    }
    const list = getStoredModelData(modelKey);
    const updated = list.filter((item) => item.id !== recordId);
    saveStoredModelData(modelKey, updated);
    return true;
  },

  bulkDeleteRecords: async (modelKey: string, recordIds: Array<number | string>): Promise<boolean> => {
    const list = getStoredModelData(modelKey);
    const idSet = new Set(recordIds);
    const updated = list.filter((item) => !idSet.has(item.id));
    saveStoredModelData(modelKey, updated);
    return true;
  },

  exportToCSV: (modelKey: string, records: ModelRecord[]) => {
    if (records.length === 0) return;
    const keys = Object.keys(records[0]);
    const csvLines = [
      keys.join(','),
      ...records.map((r) =>
        keys
          .map((k) => {
            const val = r[k];
            const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${modelKey.replace('.', '_')}_export_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  },

  exportToJSON: (modelKey: string, records: ModelRecord[]) => {
    if (records.length === 0) return;
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${modelKey.replace('.', '_')}_export_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },
};
