import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FiShoppingCart, FiHeart, FiUser, FiLogOut, FiPackage, FiSettings, FiSearch, FiX } from 'react-icons/fi'
import { logout } from '../../store/slices/authSlice'
import { formatCurrency } from '../../utils/format'
import api from '../../services/api'
import toast from 'react-hot-toast'

// ── Debounce hook ─────────────────────────────────────────────────────────────
function useDebounce (value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((s) => s.auth)
  const { items } = useSelector((s) => s.cart)
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)

  // ── Search autocomplete state ─────────────────────────────────────────────
  const [query,       setQuery]       = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showDrop,    setShowDrop]    = useState(false)
  const [activeIdx,   setActiveIdx]   = useState(-1)
  const searchRef = useRef(null)
  const debouncedQ = useDebounce(query, 220)

  // Fetch suggestions whenever debounced query changes
  useEffect(() => {
    if (debouncedQ.length < 2) { setSuggestions([]); return }
    api.get(`/products/suggest?q=${encodeURIComponent(debouncedQ)}`)
      .then((data) => { setSuggestions(data); setShowDrop(true); setActiveIdx(-1) })
      .catch(() => {})
  }, [debouncedQ])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowDrop(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const goToSearch = (q) => {
    setShowDrop(false)
    setQuery(q)
    navigate(`/products?search=${encodeURIComponent(q)}`)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) goToSearch(query.trim())
  }

  const handleKeyDown = (e) => {
    if (!showDrop || suggestions.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, -1)) }
    if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      navigate(`/products/${suggestions[activeIdx]._id}`)
      setShowDrop(false)
      setQuery(suggestions[activeIdx].name)
    }
    if (e.key === 'Escape') setShowDrop(false)
  }

  const handleLogout = async () => {
    await dispatch(logout())
    toast.success('Logged out')
    navigate('/')
  }

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', height: 60 }}>

        {/* Logo */}
        <Link to="/" style={{ fontWeight: 700, fontSize: 20, color: '#2563eb', letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>
          ShopEase
        </Link>

        {/* Search with autocomplete */}
        <div ref={searchRef} style={{ flex: 1, position: 'relative', maxWidth: 480 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); if (e.target.value.length >= 2) setShowDrop(true) }}
                onFocus={() => { if (suggestions.length) setShowDrop(true) }}
                onKeyDown={handleKeyDown}
                placeholder="Search products…"
                className="form-input"
                style={{ paddingLeft: 34, borderRadius: '8px 0 0 8px', borderRight: 'none', width: '100%' }}
              />
              {query && (
                <button type="button" onClick={() => { setQuery(''); setSuggestions([]); setShowDrop(false) }}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}>
                  <FiX size={14} />
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-primary" style={{ borderRadius: '0 8px 8px 0', padding: '0 1rem', whiteSpace: 'nowrap' }}>
              Search
            </button>
          </form>

          {/* Dropdown */}
          {showDrop && suggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,.1)', zIndex: 200, overflow: 'hidden',
            }}>
              {suggestions.map((s, idx) => (
                <div
                  key={s._id}
                  onMouseDown={() => { navigate(`/products/${s._id}`); setShowDrop(false); setQuery(s.name) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', cursor: 'pointer',
                    background: idx === activeIdx ? '#eff6ff' : 'transparent',
                    borderBottom: idx < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                  }}
                  onMouseEnter={() => setActiveIdx(idx)}
                >
                  {s.image ? (
                    <img src={s.image} alt={s.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 36, height: 36, borderRadius: 6, background: '#f1f5f9', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#6b7280', textTransform: 'capitalize' }}>{s.category}</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#2563eb', flexShrink: 0 }}>{formatCurrency(s.price)}</span>
                </div>
              ))}
              <div
                onMouseDown={() => goToSearch(query)}
                style={{ padding: '10px 14px', fontSize: 13, color: '#2563eb', cursor: 'pointer', background: '#f8fafc', textAlign: 'center' }}
              >
                See all results for "<strong>{query}</strong>"
              </div>
            </div>
          )}
        </div>

        {/* Right icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Link to="/products" className="btn btn-outline btn-sm">Shop</Link>

          {user && (
            <Link to="/wishlist" style={{ padding: '8px', color: '#64748b', display: 'flex' }} title="Wishlist">
              <FiHeart size={20} />
            </Link>
          )}

          <Link to="/cart" style={{ padding: '8px', color: '#64748b', display: 'flex', position: 'relative' }} title="Cart">
            <FiShoppingCart size={20} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2,
                background: '#2563eb', color: '#fff',
                borderRadius: '50%', width: 16, height: 16,
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{cartCount}</span>
            )}
          </Link>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Link to="/orders"  style={{ padding: '8px', color: '#64748b', display: 'flex' }} title="Orders"><FiPackage size={20} /></Link>
              <Link to="/profile" style={{ padding: '8px', color: '#64748b', display: 'flex' }} title="Profile"><FiUser size={20} /></Link>
              {user.role === 'admin' && (
                <Link to="/admin" style={{ padding: '8px', color: '#7c3aed', display: 'flex' }} title="Admin"><FiSettings size={20} /></Link>
              )}
              <button onClick={handleLogout} style={{ padding: '8px', color: '#64748b', background: 'none', border: 'none', display: 'flex', cursor: 'pointer' }} title="Logout">
                <FiLogOut size={20} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login"    className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  )
}
