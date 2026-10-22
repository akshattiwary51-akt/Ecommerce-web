import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchProducts } from '../../store/slices/productSlice'
import ProductCard from '../../components/product/ProductCard'
import { Spinner } from '../../components/common/Spinner'

export default function Home() {
  const dispatch = useDispatch()
  const { items, loading } = useSelector((s) => s.products)

  useEffect(() => {
    dispatch(fetchProducts({ limit: 8, sort: 'newest' }))
  }, [dispatch])

  const categories = [
    { name: 'Electronics', icon: '💻', slug: 'electronics' },
    { name: 'Clothing', icon: '👕', slug: 'clothing' },
    { name: 'Home & Kitchen', icon: '🏠', slug: 'home-kitchen' },
    { name: 'Sports', icon: '⚽', slug: 'sports' },
    { name: 'Books', icon: '📚', slug: 'books' },
    { name: 'Beauty', icon: '💄', slug: 'beauty' },
  ]

  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%)', color: '#fff', padding: '5rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.1 }}>
            Shop Everything,<br />Delivered Fast
          </h1>
          <p style={{ fontSize: 18, opacity: 0.85, marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>
            Thousands of products. Secure payments. Easy returns.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-lg" style={{ background: '#fff', color: '#1e40af', border: 'none', fontWeight: 600 }}>
              Shop Now
            </Link>
            <Link to="/register" className="btn btn-lg btn-outline" style={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff' }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="container" style={{ margin: '3rem auto' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: '1.25rem' }}>Shop by Category</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {categories.map(cat => (
            <Link key={cat.slug} to={`/products?category=${cat.slug}`}
              style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '1.25rem', textAlign: 'center', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.12)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{cat.icon}</div>
                <p style={{ fontSize: 13, fontWeight: 500 }}>{cat.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="container" style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>New Arrivals</h2>
          <Link to="/products" style={{ fontSize: 14, color: '#2563eb', fontWeight: 500 }}>View all →</Link>
        </div>
        {loading ? <Spinner center /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
            {items.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>

      {/* Trust badges */}
      <div style={{ background: '#f1f5f9', padding: '2.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, textAlign: 'center' }}>
            {[
              ['🚚', 'Free Shipping', 'On orders above ₹500'],
              ['🔒', 'Secure Payment', 'SSL encrypted checkout'],
              ['↩️', 'Easy Returns', '30-day return policy'],
              ['⭐', 'Top Rated', '4.8/5 avg customer rating'],
            ].map(([icon, title, sub]) => (
              <div key={title}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
                <p style={{ fontWeight: 600, marginBottom: 2 }}>{title}</p>
                <p style={{ fontSize: 13, color: '#64748b' }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
