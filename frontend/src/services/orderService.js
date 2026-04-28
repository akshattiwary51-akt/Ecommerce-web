import api from './api'

const orderService = {
  placeOrder:   (data) => api.post('/orders', data),
  getOrders:    ()     => api.get('/orders'),
  getOrderById: (id)   => api.get(`/orders/${id}`),
  getTracking:  (id)   => api.get(`/orders/${id}/tracking`),
  requestReturn:(data) => api.post('/orders/return', data),
  cancelOrder:  (id)   => api.put(`/orders/${id}/cancel`),

  // Bug 3 fix — URLs now match the actual backend routes exactly
  createStripeIntent:   (orderId) => api.post('/payments/stripe/create-intent', { orderId }),
  confirmStripePayment: (data)    => api.post('/payments/stripe/confirm', data),
  createRazorpayOrder:  (orderId) => api.post('/payments/razorpay/create', { orderId }),
  verifyRazorpay:       (data)    => api.post('/payments/razorpay/verify', data),
}

export default orderService
