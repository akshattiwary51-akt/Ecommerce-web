import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchCart, updateCartItem, removeCartItem } from '../../store/slices/cartSlice'
import { useCart } from '../../hooks'
import { Spinner } from '../../components/common/Spinner'
import { formatCurrency } from '../../utils/format'
import { FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function Cart() {
  const dispatch = useDispatch()
  const { items, loading, subtotal } = useCart()
  const tax = subtotal * 0.18
  const total = subtotal + tax

  useEffect(() => { dispatch(fetchCart()) }, [dispatch])

  const handleUpdate = (itemId, qty) => {
    if (qty < 1) return
    dispatch(updateCartItem({ itemId, quantity: qty }))
  }

  const handleRemove = (itemId) => {
    dispatch(removeCartItem(itemId))
    toast.success('Item removed')
  }

  if (loading) return <Spinner center />

  return (
    <div className="container">
      <h1 className="page-title">Shopping Cart</h1>
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ fontSize: 48, marginBottom: '1rem' }}>🛒</p>
          <p style={{ fontSize: 16, color: '#64748b', marginBottom: '1.5rem' }}>Your cart is empty</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {items.map((item, i) => {
              const p = item.product
              const price = p?.discountPrice || p?.price || 0
              return (
                <div key={item._id} style={{ display: 'flex', gap: '1rem', padding: '1rem 1.25rem', borderBottom: i < items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <img src={p?.images?.[0]?.url || 'https://placehold.co/80x80'} alt={p?.name}
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <Link to={`/products/${p?._id}`} style={{ fontWeight: 500, fontSize: 14, color: '#0f172a' }}>{p?.name}</Link>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{p?.brand}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 10 }}>
                      <div style={{ display: 'flex', border: '1.5px solid #e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
                        <button onClick={() => handleUpdate(item._id, item.quantity - 1)}
                          style={{ width: 30, border: 'none', background: '#f8fafc', cursor: 'pointer' }}>−</button>
                        <span style={{ width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{item.quantity}</span>
                        <button onClick={() => handleUpdate(item._id, item.quantity + 1)}
                          style={{ width: 30, border: 'none', background: '#f8fafc', cursor: 'pointer' }}>+</button>
                      </div>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(price * item.quantity)}</span>
                    </div>
                  </div>
                  <button onClick={() => handleRemove(item._id)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', alignSelf: 'flex-start', padding: 4 }}>
                    <FiTrash2 size={16} />
                  </button>
                </div>
              )
            })}
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <p style={{ fontWeight: 600, fontSize: 16, marginBottom: '1.25rem' }}>Order Summary</p>
            {[['Subtotal', subtotal], ['Tax (18% GST)', tax]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 10 }}>
                <span style={{ color: '#64748b' }}>{l}</span>
                <span>{formatCurrency(v)}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, marginBottom: '1.25rem' }}>
              <span>Total</span><span>{formatCurrency(total)}</span>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-full btn-lg">Proceed to Checkout</Link>
          </div>
        </div>
      )}
    </div>
  )
}
