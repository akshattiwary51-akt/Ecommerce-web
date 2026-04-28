import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiShoppingCart, FiHeart } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import { addToCart } from '../../store/slices/cartSlice'
import { toggleWishlist } from '../../store/slices/wishlistSlice'
import StarRating from '../common/StarRating'
import { formatCurrency } from '../../utils/format'
import toast from 'react-hot-toast'

const CATEGORY_FALLBACK = {
  electronics:   { bg: '#e0f2fe', accent: '#0369a1', icon: '💻' },
  clothing:      { bg: '#fce7f3', accent: '#be185d', icon: '👕' },
  'home-kitchen':{ bg: '#fef3c7', accent: '#b45309', icon: '🍳' },
  sports:        { bg: '#dcfce7', accent: '#15803d', icon: '⚽' },
  books:         { bg: '#ede9fe', accent: '#6d28d9', icon: '📚' },
  toys:          { bg: '#fff7ed', accent: '#c2410c', icon: '🧸' },
  grocery:       { bg: '#f0fdf4', accent: '#166534', icon: '🛒' },
  beauty:        { bg: '#fdf2f8', accent: '#9d174d', icon: '💄' },
}

const DEFAULT_FALLBACK = { bg: '#f1f5f9', accent: '#475569', icon: '🛍️' }

export default function ProductCard({ product }) {
  const dispatch = useDispatch()
  const { user } = useSelector((s) => s.auth)
  const { items: wishlist } = useSelector((s) => s.wishlist)

  const urls = product.images?.map((i) => i.url).filter(Boolean) || []
  const [urlIdx, setUrlIdx]       = useState(0)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError]   = useState(false)

  const currentUrl = urls[urlIdx] || null
  const fallback   = CATEGORY_FALLBACK[product.category] || DEFAULT_FALLBACK
  const isWishlisted = wishlist.some(
    (w) => (w.product?._id || w._id) === product._id
  )
  const discount = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : null

  const handleImgError = () => {
    if (urlIdx + 1 < urls.length) {
      setUrlIdx(urlIdx + 1)
      setImgLoaded(false)
    } else {
      setImgError(true)
    }
  }

  const handleAddToCart = (e) => {
    e.preventDefault(); e.stopPropagation()
    dispatch(addToCart({ productId: product._id, quantity: 1 }))
    toast.success('Added to cart')
  }

  const handleWishlist = (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!user) return toast.error('Please login first')
    dispatch(toggleWishlist(product._id))
  }

  return (
    <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div
        className="card"
        style={{ overflow: 'hidden', transition: 'box-shadow 0.2s, transform 0.2s', cursor: 'pointer' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.12)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = ''
          e.currentTarget.style.transform = ''
        }}
      >
        {/* Image container */}
        <div style={{ position: 'relative', width: '100%', paddingBottom: '68%', overflow: 'hidden', background: fallback.bg }}>

          {/* Shimmer skeleton */}
          {!imgLoaded && !imgError && currentUrl && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 1,
              background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s infinite',
            }} />
          )}

          {/* Actual image */}
          {currentUrl && !imgError && (
            <img
              key={currentUrl}
              src={currentUrl}
              alt={product.name}
              loading="lazy"
              decoding="async"
              onLoad={() => setImgLoaded(true)}
              onError={handleImgError}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center',
                transition: 'opacity 0.3s ease, transform 0.4s ease',
                opacity: imgLoaded ? 1 : 0,
                transform: 'scale(1)',
                display: 'block',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
            />
          )}

          {/* Category tile — shown when all image URLs fail */}
          {(imgError || !currentUrl) && (
            <div style={{
              position: 'absolute', inset: 0,
              background: fallback.bg,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 48 }}>{fallback.icon}</span>
              <span style={{
                fontSize: 11, fontWeight: 700, color: fallback.accent,
                textTransform: 'uppercase', letterSpacing: '0.07em',
              }}>
                {product.category}
              </span>
            </div>
          )}

          {/* Discount badge */}
          {discount && (
            <span className="badge badge-danger"
              style={{ position: 'absolute', top: 10, left: 10, zIndex: 3 }}>
              -{discount}%
            </span>
          )}

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            style={{
              position: 'absolute', top: 10, right: 10, zIndex: 3,
              background: '#fff', border: 'none', borderRadius: '50%',
              width: 34, height: 34,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 6px rgba(0,0,0,0.18)', cursor: 'pointer',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = '' }}
          >
            {isWishlisted
              ? <FaHeart color="#ef4444" size={15} />
              : <FiHeart size={15} color="#64748b" />}
          </button>

          {/* Out of stock */}
          {product.stockQty === 0 && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 4,
              background: 'rgba(0,0,0,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                color: '#fff', fontWeight: 700, fontSize: 12,
                background: 'rgba(0,0,0,0.65)',
                padding: '4px 14px', borderRadius: 20, letterSpacing: '0.04em',
              }}>
                OUT OF STOCK
              </span>
            </div>
          )}
        </div>

        {/* Product info */}
        <div style={{ padding: '0.875rem' }}>
          <p style={{
            fontSize: 11, color: '#64748b', marginBottom: 3,
            textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500,
          }}>
            {product.brand}
          </p>

          <p style={{
            fontWeight: 500, fontSize: 13.5, color: '#0f172a',
            marginBottom: 6, lineHeight: 1.45,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
            minHeight: '2.9em',
          }}>
            {product.name}
          </p>

          <StarRating rating={product.avgRating} count={product.reviewCount} size={12} />

          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginTop: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                {formatCurrency(product.discountPrice || product.price)}
              </span>
              {product.discountPrice && (
                <span style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'line-through' }}>
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            <button
              className="btn btn-primary btn-sm"
              onClick={handleAddToCart}
              disabled={product.stockQty === 0}
              aria-label="Add to cart"
              style={{ padding: '6px 10px', minWidth: 36, flexShrink: 0 }}
            >
              <FiShoppingCart size={14} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}