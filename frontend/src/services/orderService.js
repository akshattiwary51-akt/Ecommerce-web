import api from './api'

const orderService = {
  placeOrder: (data) => api.post('/orders', data),
  getOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getTracking: (id) => api.get(`/orders/${id}/tracking`),
  requestReturn: (data) => api.post('/orders/return', data),
  createPaymentIntent: (orderId) => api.post('/payments/create-intent', { orderId }),
  verifyPayment: (data) => api.post('/payments/verify', data),
}

export default orderService
