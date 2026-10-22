import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '3rem 0 1.5rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: '0.75rem' }}>ShopEase</p>
            <p style={{ fontSize: 13, lineHeight: 1.7 }}>Your one-stop destination for quality products at great prices.</p>
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 600, marginBottom: '0.75rem', fontSize: 14 }}>Shop</p>
            {['All Products', 'Categories', 'New Arrivals', 'Sale'].map(l => (
              <Link key={l} to="/products" style={{ display: 'block', fontSize: 13, marginBottom: 6, color: '#94a3b8' }}>{l}</Link>
            ))}
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 600, marginBottom: '0.75rem', fontSize: 14 }}>Account</p>
            {[['Login', '/login'], ['Register', '/register'], ['Orders', '/orders'], ['Profile', '/profile']].map(([l, h]) => (
              <Link key={l} to={h} style={{ display: 'block', fontSize: 13, marginBottom: 6, color: '#94a3b8' }}>{l}</Link>
            ))}
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 600, marginBottom: '0.75rem', fontSize: 14 }}>Support</p>
            {['FAQ', 'Returns & Exchanges', 'Shipping Info', 'Contact Us'].map(l => (
              <span key={l} style={{ display: 'block', fontSize: 13, marginBottom: 6, cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1.25rem', textAlign: 'center', fontSize: 13 }}>
          © {new Date().getFullYear()} ShopEase. Built with React & Node.js.
        </div>
      </div>
    </footer>
  )
}
