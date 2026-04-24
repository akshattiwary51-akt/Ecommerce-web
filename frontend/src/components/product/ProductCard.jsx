import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiHeart, FiShoppingCart } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import { addToCart } from '../../store/slices/cartSlice'
import { toggleWishlist } from '../../store/slices/wishlistSlice'
import StarRating from '../common/StarRating'
import { formatCurrency } from '../../utils/format'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const dispatch = useDispatch()
  const { user } = useSelector((s) => s.auth)
  const { items: wishlist } = useSelector((s) => s.wishlist)
  const isWishlisted = wishlist.some(w => w.product?._id === product._id || w._id === product._id)

  const handleAddToCart = (e) => {
    e.preventDefault()
    dispatch(addToCart({ productId: product._id, quantity: 1 }))
    toast.success('Added to cart')
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    if (!user) return toast.error('Please login first')
    dispatch(toggleWishlist(product._id))
  }

  const discount = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : null

  return (
    <Link to={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ overflow: 'hidden', transition: 'box-shadow 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
        <div style={{ position: 'relative', paddingBottom: '70%', background: '#f1f5f9' }}>
          <img
            src={product.images?.[0]?.url || 'https://placehold.co/400x280?text=No+Image'}
            alt={product.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {discount && (
            <span className="badge badge-danger" style={{ position: 'absolute', top: 10, left: 10 }}>
              -{discount}%
            </span>
          )}
          <button onClick={handleWishlist}
            style={{ position: 'absolute', top: 10, right: 10, background: '#fff', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isWishlisted ? <FaHeart color="#ef4444" size={16} /> : <FiHeart size={16} color="#64748b" />}
          </button>
        </div>
        <div style={{ padding: '0.875rem' }}>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{product.brand}</p>
          <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {product.name}
          </p>
          <StarRating rating={product.avgRating} count={product.reviewCount} size={12} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, justifyContent: 'space-between' }}>
            <div>
              {product.discountPrice ? (
                <>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatCurrency(product.discountPrice)}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'line-through', marginLeft: 5 }}>{formatCurrency(product.price)}</span>
                </>
              ) : (
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatCurrency(product.price)}</span>
              )}
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleAddToCart}>
              <FiShoppingCart size={13} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
