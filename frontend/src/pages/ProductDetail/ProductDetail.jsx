import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductById } from '../../store/slices/productSlice'
import { addToCart } from '../../store/slices/cartSlice'
import { toggleWishlist } from '../../store/slices/wishlistSlice'
import { Spinner } from '../../components/common/Spinner'
import StarRating from '../../components/common/StarRating'
import { formatCurrency, formatDate } from '../../utils/format'
import { FiHeart, FiShoppingCart, FiPackage, FiRefreshCw } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function ProductDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { current: product, loading } = useSelector((s) => s.products)
  const { user } = useSelector((s) => s.auth)
  const { items: wishlist } = useSelector((s) => s.wishlist)
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [review, setReview] = useState({ rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)

  const isWishlisted = wishlist.some(w => w.product?._id === id || w._id === id)

  useEffect(() => { dispatch(fetchProductById(id)) }, [id, dispatch])

  if (loading) return <Spinner center />
  if (!product) return <div className="container"><p>Product not found.</p></div>

  const price = product.discountPrice || product.price
  const discount = product.discountPrice ? Math.round((1 - product.discountPrice / product.price) * 100) : null

  const handleAddToCart = () => {
    dispatch(addToCart({ productId: product._id, quantity: qty }))
    toast.success(`${qty} item(s) added to cart`)
  }

  const handleWishlist = () => {
    if (!user) return toast.error('Please login first')
    dispatch(toggleWishlist(product._id))
  }

  const handleReview = async (e) => {
    e.preventDefault()
    if (!user) return toast.error('Please login to review')
    setSubmitting(true)
    try {
      await api.post(`/products/${product._id}/reviews`, review)
      toast.success('Review submitted!')
      dispatch(fetchProductById(id))
      setReview({ rating: 5, comment: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally { setSubmitting(false) }
  }

  const images = product.images?.length ? product.images : [{ url: 'https://placehold.co/600x400?text=No+Image' }]

  return (
    <div className="container">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '3rem' }}>
        {/* Images */}
        <div>
          <div style={{ background: '#f8fafc', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
            <img src={images[activeImg]?.url} alt={product.name}
              style={{ width: '100%', height: 400, objectFit: 'contain' }} />
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8 }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  style={{ border: `2px solid ${i === activeImg ? '#2563eb' : '#e2e8f0'}`, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', background: 'none', padding: 0 }}>
                  <img src={img.url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>{product.brand}</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: '0.75rem', lineHeight: 1.3 }}>{product.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
            <StarRating rating={product.avgRating} count={product.reviews?.length} />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{formatCurrency(price)}</span>
            {discount && <>
              <span style={{ fontSize: 16, color: '#94a3b8', textDecoration: 'line-through', marginLeft: 10 }}>{formatCurrency(product.price)}</span>
              <span className="badge badge-danger" style={{ marginLeft: 8 }}>{discount}% off</span>
            </>}
          </div>

          <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '1.5rem' }}>{product.description}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: 13, color: product.stockQty > 0 ? '#16a34a' : '#dc2626', fontWeight: 500 }}>
              {product.stockQty > 0 ? `In Stock (${product.stockQty})` : 'Out of Stock'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
            <label style={{ fontSize: 13, fontWeight: 500 }}>Qty:</label>
            <div style={{ display: 'flex', border: '1.5px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                style={{ width: 36, border: 'none', background: '#f8fafc', cursor: 'pointer', fontSize: 16 }}>−</button>
              <span style={{ width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500 }}>{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stockQty, q + 1))}
                style={{ width: 36, border: 'none', background: '#f8fafc', cursor: 'pointer', fontSize: 16 }}>+</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary btn-lg" style={{ flex: 1 }}
              disabled={product.stockQty === 0} onClick={handleAddToCart}>
              <FiShoppingCart size={16} /> Add to Cart
            </button>
            <button className="btn btn-outline" style={{ padding: '0 1rem' }} onClick={handleWishlist}>
              {isWishlisted ? <FaHeart color="#ef4444" size={18} /> : <FiHeart size={18} />}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569' }}>
              <FiPackage size={14} /> Free Delivery
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569' }}>
              <FiRefreshCw size={14} /> 30-Day Returns
            </span>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '1.25rem' }}>Customer Reviews</h2>
        {product.reviews?.length === 0 && <p style={{ color: '#64748b' }}>No reviews yet. Be the first!</p>}
        {product.reviews?.map(r => (
          <div key={r._id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontWeight: 500, fontSize: 14 }}>{r.user?.name || 'User'}</span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{formatDate(r.createdAt)}</span>
            </div>
            <StarRating rating={r.rating} size={12} />
            <p style={{ fontSize: 14, color: '#475569', marginTop: 6 }}>{r.comment}</p>
          </div>
        ))}

        {user && (
          <form onSubmit={handleReview} style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: '1rem' }}>Write a Review</h3>
            <div className="form-group">
              <label className="form-label">Rating</label>
              <select className="form-input" style={{ width: 160 }} value={review.rating}
                onChange={e => setReview(r => ({ ...r, rating: Number(e.target.value) }))}>
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Comment</label>
              <textarea className="form-input" rows={3} value={review.comment}
                onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
                placeholder="Share your experience..." required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
