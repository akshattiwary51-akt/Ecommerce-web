import api from './api'

const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  addReview: (productId, data) => api.post(`/products/${productId}/reviews`, data),
  getWishlist: () => api.get('/wishlist'),
  toggleWishlist: (productId) => api.post(`/wishlist/${productId}`),
}

export default productService
