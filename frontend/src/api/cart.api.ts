import api from './axios';

export const cartApi = {
  getCart:        ()                                        => api.get('/cart/'),
  addItem:        (variant_id: number, quantity: number)    => api.post('/cart/items/', { variant_id, quantity }),
  updateItem:     (variant_id: number, quantity: number)    => api.patch(`/cart/items/${variant_id}/`, { quantity }),
  removeItem:     (variant_id: number)                      => api.delete(`/cart/items/${variant_id}/`),
  clearCart:      ()                                        => api.delete('/cart/clear/'),
};
