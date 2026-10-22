import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FiShoppingCart, FiHeart, FiUser, FiLogOut, FiPackage } from 'react-icons/fi'
import { logout } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((s) => s.auth)
  const { items } = useSelector((s) => s.cart)

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)

  const handleLogout = async () => {
    await dispatch(logout())
    toast.success('Logged out')
    navigate('/')
  }
  return (
    <nav style={{
      background: '#fff', borderBottom: '1px solid #e2e8f0',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', height: 60 }}>
        <Link to="/" style={{ fontWeight: 700, fontSize: 20, color: '#2563eb', letterSpacing: '-0.5px' }}>
          ShopEase
        </Link>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <form onSubmit={(e) => { e.preventDefault(); navigate(`/products?search=${e.target.q.value}`) }}
            style={{ display: 'flex', width: '100%', maxWidth: 420 }}>
            <input name="q" className="form-input" placeholder="Search products..."
              style={{ borderRadius: '8px 0 0 8px', borderRight: 'none' }} />
            <button type="submit" className="btn btn-primary"
              style={{ borderRadius: '0 8px 8px 0', padding: '0 1rem' }}>Search</button>
          </form>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Link to="/products" className="btn btn-outline btn-sm">Shop</Link>

          {user && (
            <Link to="/wishlist" style={{ padding: '8px', color: '#64748b', display: 'flex' }}>
              <FiHeart size={20} />
            </Link>
          )}

          <Link to="/cart" style={{ padding: '8px', color: '#64748b', display: 'flex', position: 'relative' }}>
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
              <Link to="/orders" style={{ padding: '8px', color: '#64748b', display: 'flex' }}>
                <FiPackage size={20} />
              </Link>
              <Link to="/profile" style={{ padding: '8px', color: '#64748b', display: 'flex' }}>
                <FiUser size={20} />
              </Link>
              <button onClick={handleLogout} style={{ padding: '8px', color: '#64748b', background: 'none', border: 'none', display: 'flex' }}>
                <FiLogOut size={20} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
