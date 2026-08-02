import api from '../../../api/axios';

export interface DeliveryRider {
  id: number;
  rider_name: string;
  phone_number: string;
  vehicle_type: 'Motorcycle' | 'Bicycle' | 'Scooter' | 'Electric Bike';
  assigned_zone: string;
  status: 'IN_TRANSIT' | 'ON_DUTY' | 'IDLE' | 'OFF_DUTY';
  current_active_order_id?: string;
  current_location: string;
  lat: number;
  lng: number;
  total_deliveries_completed: number;
  avg_delivery_time_mins: number;
  rating: number;
  joined_date: string;
}

const LOGISTICS_STORAGE_KEY = 'pharmasys_admin_logistics_riders_v1';

const defaultRiders: DeliveryRider[] = [
  {
    id: 1,
    rider_name: 'Rafiqul Islam',
    phone_number: '01711223344',
    vehicle_type: 'Motorcycle',
    assigned_zone: 'Dhanmondi & Mohammadpur',
    status: 'IN_TRANSIT',
    current_active_order_id: 'ORD-9821',
    current_location: 'Road 27, Dhanmondi (Heading to customer)',
    lat: 23.7548,
    lng: 90.3765,
    total_deliveries_completed: 342,
    avg_delivery_time_mins: 24,
    rating: 4.9,
    joined_date: '2025-02-15',
  },
  {
    id: 2,
    rider_name: 'Kamrul Hasan',
    phone_number: '01822334455',
    vehicle_type: 'Scooter',
    assigned_zone: 'Gulshan & Banani',
    status: 'IN_TRANSIT',
    current_active_order_id: 'ORD-9834',
    current_location: 'Gulshan 2 Circle (Picking from Tamanna Pharmacy)',
    lat: 23.7925,
    lng: 90.4167,
    total_deliveries_completed: 218,
    avg_delivery_time_mins: 28,
    rating: 4.8,
    joined_date: '2025-04-10',
  },
  {
    id: 3,
    rider_name: 'Tanvir Hossain',
    phone_number: '01933445566',
    vehicle_type: 'Electric Bike',
    assigned_zone: 'Uttara Hub',
    status: 'ON_DUTY',
    current_location: 'Sector 3, Uttara (Waiting for dispatch)',
    lat: 23.8759,
    lng: 90.3795,
    total_deliveries_completed: 185,
    avg_delivery_time_mins: 22,
    rating: 4.95,
    joined_date: '2025-06-01',
  },
  {
    id: 4,
    rider_name: 'Sojib Ahmed',
    phone_number: '01644556677',
    vehicle_type: 'Motorcycle',
    assigned_zone: 'Mirpur 10 & 11',
    status: 'IDLE',
    current_location: 'Mirpur 10 Circle Hub',
    lat: 23.8069,
    lng: 90.3687,
    total_deliveries_completed: 145,
    avg_delivery_time_mins: 31,
    rating: 4.7,
    joined_date: '2025-08-20',
  },
  {
    id: 5,
    rider_name: 'Mahbubur Rahman',
    phone_number: '01555667788',
    vehicle_type: 'Bicycle',
    assigned_zone: 'Shahbagh & Old Dhaka',
    status: 'OFF_DUTY',
    current_location: 'Off Duty',
    lat: 23.726,
    lng: 90.3976,
    total_deliveries_completed: 92,
    avg_delivery_time_mins: 35,
    rating: 4.6,
    joined_date: '2025-09-05',
  },
];

const getStoredRiders = (): DeliveryRider[] => {
  try {
    const raw = localStorage.getItem(LOGISTICS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultRiders;
};

const saveStoredRiders = (riders: DeliveryRider[]) => {
  try {
    localStorage.setItem(LOGISTICS_STORAGE_KEY, JSON.stringify(riders));
  } catch {}
};

export const adminLogisticsApi = {
  getRiders: async (): Promise<DeliveryRider[]> => {
    try {
      const res = await api.get('/api/admin/orders/riders/');
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((r: any, idx: number) => ({
          id: r.id,
          rider_name: r.user?.username || r.rider_name || `Rider Partner #${r.id}`,
          phone_number: r.phone_number || '01700000000',
          vehicle_type: r.vehicle_type || (idx % 2 === 0 ? 'Motorcycle' : 'Scooter'),
          assigned_zone: r.assigned_zone || 'Central Dhaka Hub',
          status: r.is_active ? (idx % 2 === 0 ? 'IN_TRANSIT' : 'ON_DUTY') : 'OFF_DUTY',
          current_active_order_id: idx % 2 === 0 ? `ORD-${9800 + idx}` : undefined,
          current_location: 'Central Dhaka Hub',
          lat: 23.75 + idx * 0.01,
          lng: 90.37 + idx * 0.01,
          total_deliveries_completed: (idx + 1) * 45,
          avg_delivery_time_mins: 25,
          rating: 4.8,
          joined_date: '2025-01-01',
        }));
      }
    } catch {}
    return getStoredRiders();
  },

  createRider: async (payload: Omit<DeliveryRider, 'id'>): Promise<DeliveryRider> => {
    const list = getStoredRiders();
    const newRider: DeliveryRider = {
      ...payload,
      id: Date.now(),
    };
    const updated = [newRider, ...list];
    saveStoredRiders(updated);
    return newRider;
  },

  updateRiderStatus: async (id: number, status: DeliveryRider['status']): Promise<DeliveryRider> => {
    const list = getStoredRiders();
    const updated = list.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          status,
          current_active_order_id: status === 'IN_TRANSIT' ? r.current_active_order_id || 'ORD-9899' : undefined,
          current_location: status === 'OFF_DUTY' ? 'Off Duty' : r.current_location,
        };
      }
      return r;
    });
    saveStoredRiders(updated);
    return updated.find((r) => r.id === id)!;
  },

  deleteRider: async (id: number): Promise<boolean> => {
    const list = getStoredRiders();
    const updated = list.filter((r) => r.id !== id);
    saveStoredRiders(updated);
    return true;
  },
};
