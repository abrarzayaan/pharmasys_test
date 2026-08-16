import api from '@/api/axios';

export interface ActiveRiderOrder {
  id: number;
  order_number: string;
  order_status: string;
  delivery_address: string;
  placed_at?: string;
}

export interface AdminRiderItem {
  id: number;
  rider_name: string;
  phone_number: string;
  email: string;
  vehicle_type: string;
  vehicle_number: string;
  nid_no: string;
  license_no: string;
  availability_status: 'online' | 'offline' | 'busy';
  verification_status: 'pending' | 'verified' | 'rejected';
  is_free: boolean;
  active_orders: ActiveRiderOrder[];
  joined_date?: string;
}

export const adminRiderVerificationApi = {
  getRiders: async (params?: {
    verification_status?: string;
    search?: string;
  }): Promise<AdminRiderItem[]> => {
    try {
      const res = await api.get('/profiles/admin/riders/', { params });
      return res.data;
    } catch {
      const fallbackRes = await api.get('/admin-riders/', { params });
      return fallbackRes.data;
    }
  },

  updateRiderVerification: async (
    id: number,
    payload: {
      verification_status?: 'pending' | 'verified' | 'rejected';
      availability_status?: 'online' | 'offline' | 'busy';
    }
  ): Promise<{ message: string; rider: Partial<AdminRiderItem> }> => {
    try {
      const res = await api.patch(`/profiles/admin/riders/${id}/`, payload);
      return res.data;
    } catch {
      const fallbackRes = await api.patch(`/admin-riders/${id}/`, payload);
      return fallbackRes.data;
    }
  },
};
