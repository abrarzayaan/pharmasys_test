import api from '@/api/axios';
import type {
  AdminOrder,
  AdminVendor,
  AdminRider,
  VendorAssignmentPayload,
  RiderAssignmentPayload,
  OrderStatusUpdatePayload,
} from '../types/admin.types';

// Mock Vendors for Assignment
export const MOCK_VENDORS: AdminVendor[] = [
  { id: 1, name: 'Lazz Pharma (Dhanmondi Hub)', phone: '+8801711122233', address: 'Dhanmondi 27, Dhaka', rating: 4.9, available_stock: 45 },
  { id: 2, name: 'Tamanna Pharmacy (Gulshan Hub)', phone: '+8801822334455', address: 'Gulshan 2, Dhaka', rating: 4.8, available_stock: 30 },
  { id: 3, name: 'Aroggo Central Depot', phone: '+8801933445566', address: 'Tejgaon I/A, Dhaka', rating: 4.7, available_stock: 120 },
  { id: 4, name: 'Popular Medicine Store (Uttara)', phone: '+8801544556677', address: 'Sector 4, Uttara', rating: 4.6, available_stock: 15 },
];

// Mock Delivery Riders
export const MOCK_RIDERS: AdminRider[] = [
  { id: 101, name: 'Rahim Uddin (Rider #12)', phone: '+8801700112233', vehicle_type: 'Motorbike', is_online: true, active_workload: 1, rating: 4.9 },
  { id: 102, name: 'Shafiqul Islam (Rider #08)', phone: '+8801800223344', vehicle_type: 'Motorbike', is_online: true, active_workload: 0, rating: 4.8 },
  { id: 103, name: 'Tanvir Ahmed (Rider #15)', phone: '+8801900334455', vehicle_type: 'Bicycle', is_online: true, active_workload: 3, rating: 4.7 },
  { id: 104, name: 'Kamal Hossain (Rider #03)', phone: '+8801500445566', vehicle_type: 'Delivery Van', is_online: false, active_workload: 0, rating: 4.6 },
];

// Mock Admin Orders List
export const INITIAL_MOCK_ORDERS: AdminOrder[] = [
  {
    id: 1089,
    order_number: 'ORD-1089',
    order_status: 'PLACED',
    payment_status: 'PENDING',
    payment_method: 'Cash on Delivery',
    subtotal_amount: 420,
    delivery_fee: 50,
    discount_amount: 0,
    total_amount: 470,
    customer_name: 'Abrar Zayaan',
    customer_phone: '+8801712345678',
    shipping_address: 'House 42, Road 11, Dhanmondi, Dhaka',
    city: 'Dhaka',
    requires_prescription: false,
    created_at: '2026-08-01T09:30:00Z',
    updated_at: '2026-08-01T09:30:00Z',
    assigned_rider: null,
    items: [
      {
        id: 501,
        product_variant_id: 12,
        variant_name: '10 Tablets Strip',
        product_name: 'Napa Extra 500mg',
        quantity: 2,
        unit_price: 35,
        total_price: 70,
        assigned_vendor_id: null,
        assigned_vendor_name: null,
        available_vendors: [MOCK_VENDORS[0], MOCK_VENDORS[2]],
      },
      {
        id: 502,
        product_variant_id: 45,
        variant_name: '20 Capsules Box',
        product_name: 'Sergel 20mg Omeprazole',
        quantity: 5,
        unit_price: 70,
        total_price: 350,
        assigned_vendor_id: null,
        assigned_vendor_name: null,
        available_vendors: [MOCK_VENDORS[0], MOCK_VENDORS[1], MOCK_VENDORS[2]],
      },
    ],
  },
  {
    id: 1088,
    order_number: 'ORD-1088',
    order_status: 'CONFIRMED',
    payment_status: 'PAID',
    payment_method: 'bKash Online Payment',
    subtotal_amount: 360,
    delivery_fee: 40,
    discount_amount: 20,
    total_amount: 380,
    customer_name: 'Karim Ahmed',
    customer_phone: '+8801811223344',
    shipping_address: 'Flat 4A, Green Road, Farmgate, Dhaka',
    city: 'Dhaka',
    requires_prescription: true,
    prescription_approved: true,
    created_at: '2026-08-01T08:15:00Z',
    updated_at: '2026-08-01T08:45:00Z',
    assigned_rider: MOCK_RIDERS[0],
    items: [
      {
        id: 503,
        product_variant_id: 18,
        variant_name: '10 Capsules Pack',
        product_name: 'Seclo 20mg',
        quantity: 3,
        unit_price: 120,
        total_price: 360,
        assigned_vendor_id: 1,
        assigned_vendor_name: 'Lazz Pharma (Dhanmondi Hub)',
        available_vendors: [MOCK_VENDORS[0]],
      },
    ],
  },
  {
    id: 1087,
    order_number: 'ORD-1087',
    order_status: 'PROCESSING',
    payment_status: 'PAID',
    payment_method: 'Nagad Online',
    subtotal_amount: 180,
    delivery_fee: 50,
    discount_amount: 0,
    total_amount: 230,
    customer_name: 'Tanvir Hossain',
    customer_phone: '+8801922334455',
    shipping_address: 'Sector 7, Road 4, Uttara, Dhaka',
    city: 'Dhaka',
    requires_prescription: false,
    created_at: '2026-08-01T07:20:00Z',
    updated_at: '2026-08-01T08:00:00Z',
    assigned_rider: MOCK_RIDERS[1],
    items: [
      {
        id: 504,
        product_variant_id: 30,
        variant_name: '100ml Bottle',
        product_name: 'Rex Cough Syrup',
        quantity: 1,
        unit_price: 180,
        total_price: 180,
        assigned_vendor_id: 3,
        assigned_vendor_name: 'Aroggo Central Depot',
        available_vendors: [MOCK_VENDORS[2]],
      },
    ],
  },
  {
    id: 1086,
    order_number: 'ORD-1086',
    order_status: 'OUT_FOR_DELIVERY',
    payment_status: 'PAID',
    payment_method: 'bKash Online Payment',
    subtotal_amount: 850,
    delivery_fee: 60,
    discount_amount: 50,
    total_amount: 860,
    customer_name: 'Nusrat Jahan',
    customer_phone: '+8801533445566',
    shipping_address: 'House 15, Road 9, Gulshan 1, Dhaka',
    city: 'Dhaka',
    requires_prescription: true,
    prescription_approved: true,
    created_at: '2026-08-01T06:10:00Z',
    updated_at: '2026-08-01T08:30:00Z',
    assigned_rider: MOCK_RIDERS[0],
    items: [
      {
        id: 505,
        product_variant_id: 55,
        variant_name: '20 Tablets Box',
        product_name: 'Finix 20mg Rabeprazole',
        quantity: 2,
        unit_price: 150,
        total_price: 300,
        assigned_vendor_id: 2,
        assigned_vendor_name: 'Tamanna Pharmacy (Gulshan Hub)',
        available_vendors: [MOCK_VENDORS[1]],
      },
      {
        id: 506,
        product_variant_id: 60,
        variant_name: '14 Tablets Pack',
        product_name: 'Maxpro 40mg Esomeprazole',
        quantity: 1,
        unit_price: 550,
        total_price: 550,
        assigned_vendor_id: 2,
        assigned_vendor_name: 'Tamanna Pharmacy (Gulshan Hub)',
        available_vendors: [MOCK_VENDORS[1]],
      },
    ],
  },
];

let localOrdersStore: AdminOrder[] = [...INITIAL_MOCK_ORDERS];

export const adminOrderApi = {
  // GET `/api/admin/orders/`
  getOrders: async (statusFilter?: string, searchQuery?: string): Promise<AdminOrder[]> => {
    try {
      const params: Record<string, string> = {};
      if (statusFilter && statusFilter !== 'ALL') params.order_status = statusFilter;
      if (searchQuery) params.order_number = searchQuery;

      const res = await api.get('/admin/orders/', { params });
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return localOrdersStore;
    } catch {
      // Fallback mock store filter
      let result = [...localOrdersStore];
      if (statusFilter && statusFilter !== 'ALL') {
        result = result.filter((o) => o.order_status === statusFilter);
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter(
          (o) =>
            o.order_number.toLowerCase().includes(q) ||
            o.customer_name.toLowerCase().includes(q) ||
            o.customer_phone.includes(q)
        );
      }
      return result;
    }
  },

  // GET `/api/admin/orders/{id}/`
  getOrderDetail: async (id: number): Promise<AdminOrder> => {
    try {
      const res = await api.get(`/admin/orders/${id}/`);
      return res.data;
    } catch {
      const found = localOrdersStore.find((o) => o.id === id);
      if (!found) throw new Error('Order not found');
      return found;
    }
  },

  // PATCH `/api/admin/orders/{id}/assign-vendor/`
  assignVendors: async (orderId: number, payload: VendorAssignmentPayload): Promise<AdminOrder> => {
    try {
      const res = await api.patch(`/admin/orders/${orderId}/assign-vendor/`, payload);
      return res.data;
    } catch {
      localOrdersStore = localOrdersStore.map((o) => {
        if (o.id === orderId) {
          const updatedItems = o.items.map((item) => {
            const assignment = payload.items.find((i) => i.order_item_id === item.id);
            if (assignment) {
              const vendor = MOCK_VENDORS.find((v) => v.id === assignment.vendor_id);
              return {
                ...item,
                assigned_vendor_id: assignment.vendor_id,
                assigned_vendor_name: vendor ? vendor.name : 'Assigned Vendor',
              };
            }
            return item;
          });
          return { ...o, items: updatedItems, updated_at: new Date().toISOString() };
        }
        return o;
      });
      return localOrdersStore.find((o) => o.id === orderId)!;
    }
  },

  // PATCH `/api/admin/orders/{id}/assign-rider/`
  assignRider: async (orderId: number, payload: RiderAssignmentPayload): Promise<AdminOrder> => {
    try {
      const res = await api.patch(`/admin/orders/${orderId}/assign-rider/`, payload);
      return res.data;
    } catch {
      const rider = MOCK_RIDERS.find((r) => r.id === payload.rider_id) || MOCK_RIDERS[0];
      localOrdersStore = localOrdersStore.map((o) => {
        if (o.id === orderId) {
          return { ...o, assigned_rider: rider, updated_at: new Date().toISOString() };
        }
        return o;
      });
      return localOrdersStore.find((o) => o.id === orderId)!;
    }
  },

  // PATCH `/api/admin/orders/{id}/confirm/`
  confirmOrder: async (orderId: number): Promise<AdminOrder> => {
    try {
      const res = await api.patch(`/admin/orders/${orderId}/confirm/`);
      return res.data;
    } catch {
      localOrdersStore = localOrdersStore.map((o) => {
        if (o.id === orderId) {
          return { ...o, order_status: 'CONFIRMED', updated_at: new Date().toISOString() };
        }
        return o;
      });
      return localOrdersStore.find((o) => o.id === orderId)!;
    }
  },

  // PATCH `/api/admin/orders/{id}/status/`
  updateStatus: async (orderId: number, payload: OrderStatusUpdatePayload): Promise<AdminOrder> => {
    try {
      const res = await api.patch(`/admin/orders/${orderId}/status/`, payload);
      return res.data;
    } catch {
      localOrdersStore = localOrdersStore.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            order_status: payload.status,
            remarks: payload.remarks,
            updated_at: new Date().toISOString(),
          };
        }
        return o;
      });
      return localOrdersStore.find((o) => o.id === orderId)!;
    }
  },

  // GET `/api/admin/orders/vendors/`
  getVendors: async (): Promise<AdminVendor[]> => {
    try {
      const res = await api.get('/admin/orders/vendors/');
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return MOCK_VENDORS;
    } catch {
      return MOCK_VENDORS;
    }
  },

  // GET `/api/admin/orders/riders/`
  getRiders: async (): Promise<AdminRider[]> => {
    try {
      const res = await api.get('/admin/orders/riders/');
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return MOCK_RIDERS;
    } catch {
      return MOCK_RIDERS;
    }
  },
};
