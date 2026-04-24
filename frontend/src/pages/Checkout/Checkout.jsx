import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { placeOrder } from '../../store/slices/orderSlice'
import { clearCartItems } from '../../store/slices/cartSlice'
import { useCart } from '../../hooks'
import { formatCurrency } from '../../utils/format'
import toast from 'react-hot-toast'

const STEPS = ['Address', 'Payment', 'Confirm']

export default function Checkout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, subtotal } = useCart()
  const { loading } = useSelector((s) => s.orders)
  const [step, setStep] = useState(0)
  const [address, setAddress] = useState({ line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India' })
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const tax = subtotal * 0.18
  const total = subtotal + tax

  const handleAddress = (e) => {
    e.preventDefault()
    setStep(1)
  }

  const handlePayment = (e) => {
    e.preventDefault()
    setStep(2)
  }

  const handlePlaceOrder = async () => {
    try {
      const result = await dispatch(placeOrder({ address, paymentMethod, items })).unwrap()
      await dispatch(clearCartItems())
      toast.success('Order placed successfully!')
      navigate(`/orders/${result._id}`)
    } catch (err) {
      toast.error(err || 'Failed to place order')
    }
  }

  return (
    <div className="container" style={{ maxWidth: 800 }}>
      <h1 className="page-title">Checkout</h1>

      {/* Step indicator */}
      <div style={{ display: 'flex', marginBottom: '2rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 14, left: '15%', right: '15%', height: 2, background: '#e2e8f0', zIndex: 0 }} />
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', margin: '0 auto 6px',
              background: i <= step ? '#2563eb' : '#e2e8f0',
              color: i <= step ? '#fff' : '#94a3b8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 600, fontSize: 13,
            }}>{i + 1}</div>
            <span style={{ fontSize: 13, fontWeight: i === step ? 600 : 400, color: i === step ? '#2563eb' : '#64748b' }}>{s}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          {step === 0 && (
            <form onSubmit={handleAddress}>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: '1.25rem' }}>Delivery Address</h2>
              {[['line1', 'Address Line 1'], ['line2', 'Address Line 2 (optional)'], ['city', 'City'], ['state', 'State'], ['postalCode', 'Postal Code']].map(([key, label]) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <input className="form-input" value={address[key]}
                    onChange={e => setAddress(a => ({ ...a, [key]: e.target.value }))}
                    required={key !== 'line2'} />
                </div>
              ))}
              <button className="btn btn-primary btn-full" type="submit">Continue to Payment</button>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={handlePayment}>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: '1.25rem' }}>Payment Method</h2>
              {[
                ['cod', '💵 Cash on Delivery'],
                ['razorpay', '💳 Razorpay (UPI / Cards / Netbanking)'],
                ['stripe', '💳 Stripe (International Cards)'],
              ].map(([val, label]) => (
                <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.875rem 1rem', border: `2px solid ${paymentMethod === val ? '#2563eb' : '#e2e8f0'}`, borderRadius: 10, marginBottom: 10, cursor: 'pointer' }}>
                  <input type="radio" name="payment" value={val} checked={paymentMethod === val}
                    onChange={() => setPaymentMethod(val)} style={{ accentColor: '#2563eb' }} />
                  <span style={{ fontSize: 14, fontWeight: paymentMethod === val ? 500 : 400 }}>{label}</span>
                </label>
              ))}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-outline" onClick={() => setStep(0)}>← Back</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Review Order</button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: '1.25rem' }}>Order Review</h2>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '1rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Delivering to</p>
                <p style={{ fontSize: 14 }}>{address.line1}, {address.city}, {address.state} — {address.postalCode}</p>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Payment</p>
                <p style={{ fontSize: 14, textTransform: 'capitalize' }}>{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}</p>
              </div>
              {items.map(item => (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                  <span>{item.product?.name} × {item.quantity}</span>
                  <span>{formatCurrency((item.product?.discountPrice || item.product?.price || 0) * item.quantity)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 1 }} disabled={loading} onClick={handlePlaceOrder}>
                  {loading ? 'Placing Order…' : `Place Order • ${formatCurrency(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <p style={{ fontWeight: 600, marginBottom: '1rem' }}>Summary</p>
          {items.slice(0, 3).map(item => (
            <div key={item._id} style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: 13 }}>
              <img src={item.product?.images?.[0]?.url || 'https://placehold.co/40'} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
              <div>
                <p style={{ fontWeight: 500, lineHeight: 1.3 }}>{item.product?.name}</p>
                <p style={{ color: '#64748b' }}>×{item.quantity}</p>
              </div>
            </div>
          ))}
          {items.length > 3 && <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>+{items.length - 3} more items</p>}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 10, marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
              <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 8 }}>
              <span>Tax (18%)</span><span>{formatCurrency(tax)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>Total</span><span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
