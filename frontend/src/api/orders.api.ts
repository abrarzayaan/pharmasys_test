import api from './axios';

export interface PlaceOrderPayload {
  address_id: number;
  payment_method: 'COD';
  coupon_code?: string;
  notes?: string;
}

export const ordersApi = {
  placeOrder:  (data: PlaceOrderPayload) => api.post('/orders/', data),
  getOrders:   (params?: object)         => api.get('/orders/', { params }),
  getOrder:    (id: number)              => api.get(`/orders/${id}/`),
  cancelOrder: (id: number)             => api.patch(`/orders/${id}/cancel/`),
  trackOrder:  (id: number)             => api.get(`/orders/${id}/tracking/`),
  buyNow:      (data: object)           => api.post('/orders/buy-now/', data),
};
