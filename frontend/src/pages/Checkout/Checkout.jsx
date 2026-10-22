import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { placeOrder } from '../../store/slices/orderSlice'
import { clearCartItems } from '../../store/slices/cartSlice'
import { useCart } from '../../hooks'
import { formatCurrency } from '../../utils/format'
import orderService from '../../services/orderService'
import toast from 'react-hot-toast'

// ─── SDK loaders ─────────────────────────────────────────────────────────────
// Bug 4 fix: dynamically inject SDK scripts only when needed, avoid polluting
// every page with third-party scripts the user may never reach.

function loadScript(src, id) {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) return resolve(true)        // already loaded
    const script = document.createElement('script')
    script.id  = id
    script.src = src
    script.onload  = () => resolve(true)
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.body.appendChild(script)
  })
}

const loadRazorpaySDK = () =>
  loadScript('https://checkout.razorpay.com/v1/checkout.js', 'razorpay-sdk')

const loadStripeSDK = () =>
  loadScript('https://js.stripe.com/v3/', 'stripe-sdk')

// ─── Step labels ─────────────────────────────────────────────────────────────
const STEPS = ['Address', 'Payment', 'Review', 'Confirmation']

export default function Checkout() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { items, subtotal } = useCart()
  const { loading: orderLoading } = useSelector((s) => s.orders)

  const [step,    setStep]    = useState(0)
  const [address, setAddress] = useState({
    line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India',
  })
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [processing, setProcessing]       = useState(false)
  const [placedOrder, setPlacedOrder]     = useState(null)
  const [stripeReady, setStripeReady]     = useState(false)

  // Stripe refs — we mount card element into a div without needing @stripe/react-stripe-js
  const stripeRef      = useRef(null)   // Stripe instance
  const cardElementRef = useRef(null)   // Stripe CardElement DOM instance
  const cardMountRef   = useRef(null)   // div to mount card element into

  const tax   = subtotal * 0.18
  const total = subtotal + tax

  // ── Pre-load SDKs as soon as the user reaches step 1 (payment selection) ───
  useEffect(() => {
    if (step === 1) {
      loadRazorpaySDK().catch(() => {})   // load silently; handle error on use
      loadStripeSDK().catch(() => {})
    }
  }, [step])

  // ── Mount Stripe card element when user picks Stripe and reaches Review ─────
  useEffect(() => {
    if (step === 2 && paymentMethod === 'stripe' && cardMountRef.current) {
      initStripeCardElement()
    }
    return () => {
      // Unmount card element when leaving the stripe review screen
      if (cardElementRef.current) {
        cardElementRef.current.unmount()
        cardElementRef.current = null
        setStripeReady(false)
      }
    }
  }, [step, paymentMethod])

  const initStripeCardElement = async () => {
    try {
      await loadStripeSDK()
      const pk = import.meta.env.VITE_STRIPE_PUBLIC_KEY
      if (!pk || pk.startsWith('pk_test_your')) {
        toast.error('Stripe public key is not configured in .env')
        return
      }
      stripeRef.current = window.Stripe(pk)
      const elements    = stripeRef.current.elements()
      cardElementRef.current = elements.create('card', {
        style: {
          base: {
            fontSize: '15px', color: '#0f172a',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            '::placeholder': { color: '#94a3b8' },
          },
          invalid: { color: '#dc2626' },
        },
      })
      cardElementRef.current.mount(cardMountRef.current)
      cardElementRef.current.on('ready', () => setStripeReady(true))
    } catch (err) {
      toast.error('Could not load Stripe. Check your internet connection.')
    }
  }

  // ─── Step handlers ────────────────────────────────────────────────────────

  const handleAddressNext = (e) => {
    e.preventDefault()
    setStep(1)
  }

  const handlePaymentNext = (e) => {
    e.preventDefault()
    setStep(2)
  }

  // ── Main payment execution (Bug 2 + Bug 6 + Bug 7 + Bug 8 all fixed here) ──
  const handlePay = async () => {
    if (processing || orderLoading) return
    setProcessing(true)

    try {
      // ─ Step 1: Create the DB order (status=pending, paymentStatus=pending)
      // Bug 7 fix: cart is NOT cleared here — only cleared after confirmed payment
      const orderPayload = { address, paymentMethod }
      const newOrder     = await orderService.placeOrder(orderPayload)
      const orderId      = newOrder._id

      // ─ Step 2: Execute payment based on selected method ──────────────────

      if (paymentMethod === 'cod') {
        // COD: no gateway needed — order is already placed, just clear cart
        await dispatch(clearCartItems())
        setPlacedOrder(newOrder)
        setStep(3)
        return
      }

      if (paymentMethod === 'razorpay') {
        await handleRazorpayPayment(orderId, newOrder)
        return
      }

      if (paymentMethod === 'stripe') {
        await handleStripePayment(orderId, newOrder)
        return
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Payment failed. Please try again.'
      toast.error(msg)
    } finally {
      setProcessing(false)
    }
  }

  // ── Razorpay flow ─────────────────────────────────────────────────────────
  const handleRazorpayPayment = async (orderId, orderData) => {
    // Bug 4 fix: ensure SDK is loaded
    try {
      await loadRazorpaySDK()
    } catch {
      toast.error('Razorpay SDK failed to load. Check your internet connection.')
      setProcessing(false)
      return
    }

    if (!window.Razorpay) {
      toast.error('Razorpay is not available. Try refreshing the page.')
      setProcessing(false)
      return
    }

    // Bug 5 fix: actually create a Razorpay order on the backend
    let rzpOrderData
    try {
      rzpOrderData = await orderService.createRazorpayOrder(orderId)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not initialise Razorpay payment.')
      setProcessing(false)
      return
    }

    const options = {
      key:          rzpOrderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount:       rzpOrderData.amount,
      currency:     rzpOrderData.currency || 'INR',
      name:         'ShopEase',
      description:  `Order #${orderId.slice(-8).toUpperCase()}`,
      order_id:     rzpOrderData.razorpayOrderId,
      prefill: {
        name:  '',    // fill from user profile if available
        email: '',
      },
      theme: { color: '#2563eb' },

      handler: async (response) => {
        // Called by Razorpay after successful payment
        try {
          await orderService.verifyRazorpay({
            orderId,
            razorpayOrderId:   response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })
          // Bug 7 fix: cart cleared only AFTER payment is confirmed
          await dispatch(clearCartItems())
          setPlacedOrder(orderData)
          setStep(3)
          toast.success('Payment successful!')
        } catch (err) {
          toast.error(err?.response?.data?.message || 'Payment verification failed.')
        }
        setProcessing(false)
      },

      modal: {
        ondismiss: () => {
          // User closed the Razorpay modal without paying
          toast('Payment cancelled. Your order is held — you can retry.', { icon: 'ℹ️' })
          setProcessing(false)
        },
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (response) => {
      toast.error(`Payment failed: ${response.error.description}`)
      setProcessing(false)
    })
    rzp.open()
  }

  // ── Stripe flow ───────────────────────────────────────────────────────────
  const handleStripePayment = async (orderId, orderData) => {
    if (!stripeRef.current || !cardElementRef.current) {
      toast.error('Card element is not ready yet. Please wait a moment.')
      setProcessing(false)
      return
    }

    let clientSecret
    try {
      const intentData = await orderService.createStripeIntent(orderId)
      clientSecret     = intentData.clientSecret
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not initialise Stripe payment.')
      setProcessing(false)
      return
    }

    const { error, paymentIntent } = await stripeRef.current.confirmCardPayment(
      clientSecret,
      { payment_method: { card: cardElementRef.current } }
    )

    if (error) {
      toast.error(error.message || 'Card payment failed.')
      setProcessing(false)
      return
    }

    if (paymentIntent.status === 'succeeded') {
      try {
        await orderService.confirmStripePayment({
          orderId,
          paymentIntentId: paymentIntent.id,
        })
        // Bug 7 fix: cart cleared only AFTER payment is confirmed
        await dispatch(clearCartItems())
        setPlacedOrder(orderData)
        setStep(3)
        toast.success('Payment successful!')
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Payment confirmation failed.')
      }
    }
    setProcessing(false)
  }

  const isLoading = processing || orderLoading

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="container" style={{ maxWidth: 820 }}>
      <h1 className="page-title">Checkout</h1>

      {/* Step indicator */}
      <div style={{ display: 'flex', marginBottom: '2rem', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: 14, left: '12%', right: '12%',
          height: 2, background: '#e2e8f0', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', top: 14, left: '12%',
          width: `${(Math.min(step, STEPS.length - 1) / (STEPS.length - 1)) * 76}%`,
          height: 2, background: '#2563eb', zIndex: 0,
          transition: 'width 0.4s ease',
        }} />
        {STEPS.map((label, i) => (
          <div key={label} style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', margin: '0 auto 6px',
              background: i < step ? '#2563eb' : i === step ? '#2563eb' : '#e2e8f0',
              color: i <= step ? '#fff' : '#94a3b8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13,
              boxShadow: i === step ? '0 0 0 4px #dbeafe' : 'none',
              transition: 'all 0.3s',
            }}>
              {i < step ? '✓' : i + 1}
            </div>
            <span style={{
              fontSize: 12, fontWeight: i === step ? 700 : 400,
              color: i === step ? '#2563eb' : i < step ? '#64748b' : '#94a3b8',
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: '1.5rem', alignItems: 'start' }}>
        <div className="card" style={{ padding: '1.75rem' }}>

          {/* ── Step 0: Address ─────────────────────────────────────────── */}
          {step === 0 && (
            <form onSubmit={handleAddressNext}>
              <h2 style={sectionTitle}>Delivery Address</h2>
              {[
                ['line1',      'Address Line 1',            true ],
                ['line2',      'Address Line 2 (optional)', false],
                ['city',       'City',                      true ],
                ['state',      'State',                     true ],
                ['postalCode', 'Postal Code',               true ],
              ].map(([key, label, required]) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <input
                    className="form-input"
                    value={address[key]}
                    onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
                    required={required}
                  />
                </div>
              ))}
              <button className="btn btn-primary btn-full" type="submit" style={{ marginTop: 8 }}>
                Continue to Payment →
              </button>
            </form>
          )}

          {/* ── Step 1: Payment method ───────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={handlePaymentNext}>
              <h2 style={sectionTitle}>Payment Method</h2>
              {[
                ['cod',       '💵 Cash on Delivery',                     'Pay when your order arrives.'],
                ['razorpay',  '💳 Razorpay (UPI / Cards / Netbanking)',  'Secure checkout powered by Razorpay.'],
                ['stripe',    '💳 Stripe (International Cards)',          'Pay securely with any credit/debit card.'],
              ].map(([val, label, sub]) => (
                <label
                  key={val}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '0.875rem 1rem',
                    border: `2px solid ${paymentMethod === val ? '#2563eb' : '#e2e8f0'}`,
                    background: paymentMethod === val ? '#eff6ff' : '#fff',
                    borderRadius: 10, marginBottom: 10, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="radio" name="payment" value={val}
                    checked={paymentMethod === val}
                    onChange={() => setPaymentMethod(val)}
                    style={{ accentColor: '#2563eb', marginTop: 2 }}
                  />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: paymentMethod === val ? 600 : 400, marginBottom: 2 }}>{label}</p>
                    <p style={{ fontSize: 12, color: '#64748b' }}>{sub}</p>
                  </div>
                </label>
              ))}

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="button" className="btn btn-outline" onClick={() => setStep(0)}>
                  ← Back
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Review Order →
                </button>
              </div>
            </form>
          )}

          {/* ── Step 2: Review + Payment execution ──────────────────────── */}
          {step === 2 && (
            <div>
              <h2 style={sectionTitle}>Review & Pay</h2>

              {/* Address summary */}
              <div style={summaryBox}>
                <p style={summaryLabel}>📍 Delivering to</p>
                <p style={{ fontSize: 14 }}>
                  {address.line1}{address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} – {address.postalCode}, {address.country}
                </p>
              </div>

              {/* Payment summary */}
              <div style={summaryBox}>
                <p style={summaryLabel}>💳 Payment via</p>
                <p style={{ fontSize: 14 }}>
                  {paymentMethod === 'cod'      && 'Cash on Delivery'}
                  {paymentMethod === 'razorpay' && 'Razorpay (UPI / Cards / Netbanking)'}
                  {paymentMethod === 'stripe'   && 'Stripe (International Cards)'}
                </p>
              </div>

              {/* Items list */}
              <div style={{ marginBottom: '1.25rem' }}>
                {items.map((item) => (
                  <div key={item._id} style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 13.5, color: '#334155',
                    padding: '5px 0', borderBottom: '1px solid #f1f5f9',
                  }}>
                    <span style={{ flex: 1, paddingRight: 8 }}>
                      {item.product?.name} <span style={{ color: '#94a3b8' }}>× {item.quantity}</span>
                    </span>
                    <span style={{ fontWeight: 500 }}>
                      {formatCurrency((item.product?.discountPrice || item.product?.price || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginTop: 8 }}>
                  <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginTop: 4 }}>
                  <span>Tax (18% GST)</span><span>{formatCurrency(tax)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15, marginTop: 10, paddingTop: 10, borderTop: '2px solid #e2e8f0' }}>
                  <span>Total</span><span style={{ color: '#2563eb' }}>{formatCurrency(total)}</span>
                </div>
              </div>

              {/* ── Stripe card element mount point ── */}
              {paymentMethod === 'stripe' && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <p style={summaryLabel}>Card Details</p>
                  <div
                    ref={cardMountRef}
                    style={{
                      border: '1.5px solid #e2e8f0', borderRadius: 8,
                      padding: '12px 14px', background: '#fff',
                      minHeight: 44,
                    }}
                  />
                  {!stripeReady && (
                    <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
                      Loading secure card form…
                    </p>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-outline" onClick={() => setStep(1)} disabled={isLoading}>
                  ← Back
                </button>

                <button
                  className="btn btn-primary"
                  style={{ flex: 1, position: 'relative' }}
                  onClick={handlePay}
                  disabled={isLoading || (paymentMethod === 'stripe' && !stripeReady)}
                >
                  {isLoading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span className="spinner" style={{ width: 16, height: 16 }} />
                      Processing…
                    </span>
                  ) : (
                    <>
                      {paymentMethod === 'cod'      && `Place Order • ${formatCurrency(total)}`}
                      {paymentMethod === 'razorpay' && `Pay ${formatCurrency(total)} via Razorpay`}
                      {paymentMethod === 'stripe'   && `Pay ${formatCurrency(total)} via Card`}
                    </>
                  )}
                </button>
              </div>

              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 10, textAlign: 'center' }}>
                🔒 All transactions are encrypted and secure
              </p>
            </div>
          )}

          {/* ── Step 3: Confirmation ─────────────────────────────────────── */}
          {step === 3 && placedOrder && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: '#dcfce7', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem', fontSize: 32,
              }}>
                ✅
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Order Confirmed!</h2>
              <p style={{ color: '#64748b', marginBottom: 6 }}>
                Order <strong>#{placedOrder._id?.slice(-8).toUpperCase()}</strong> has been placed successfully.
              </p>
              <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: '2rem' }}>
                {paymentMethod === 'cod'
                  ? 'You will pay on delivery.'
                  : 'Payment received. We are processing your order.'}
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <Link to={`/orders/${placedOrder._id}`} className="btn btn-primary">
                  Track Order
                </Link>
                <Link to="/products" className="btn btn-outline">
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── Summary sidebar ────────────────────────────────────────────── */}
        {step < 3 && (
          <div className="card" style={{ padding: '1.25rem' }}>
            <p style={{ fontWeight: 700, marginBottom: '1rem', fontSize: 14 }}>Order Summary</p>
            {items.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94a3b8' }}>Cart is empty</p>
            ) : (
              <>
                {items.slice(0, 4).map((item) => (
                  <div key={item._id} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <img
                      src={item.product?.images?.[0]?.url}
                      alt={item.product?.name}
                      loading="lazy"
                      onError={(e) => { e.target.style.display = 'none' }}
                      style={{ width: 42, height: 42, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                    />
                    <div style={{ overflow: 'hidden' }}>
                      <p style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.3,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.product?.name}
                      </p>
                      <p style={{ fontSize: 12, color: '#64748b' }}>
                        ×{item.quantity} · {formatCurrency((item.product?.discountPrice || item.product?.price || 0) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
                {items.length > 4 && (
                  <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>
                    +{items.length - 4} more items
                  </p>
                )}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 10, marginTop: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#64748b', marginBottom: 5 }}>
                    <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#64748b', marginBottom: 8 }}>
                    <span>Tax (18%)</span><span>{formatCurrency(tax)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
                    <span>Total</span><span style={{ color: '#2563eb' }}>{formatCurrency(total)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Shared micro-styles ────────────────────────────────────────────────────
const sectionTitle = { fontSize: 16, fontWeight: 700, marginBottom: '1.25rem', color: '#0f172a' }
const summaryBox   = { background: '#f8fafc', borderRadius: 8, padding: '0.875rem 1rem', marginBottom: '1rem', border: '1px solid #f1f5f9' }
const summaryLabel = { fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }
