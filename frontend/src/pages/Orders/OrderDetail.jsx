import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrderById } from '../../store/slices/orderSlice'
import { Spinner } from '../../components/common/Spinner'
import { formatCurrency, formatDate, getStatusColor } from '../../utils/format'

const TRACKING_STEPS = ['pending', 'processing', 'shipped', 'delivered']

export default function OrderDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { current: order, loading } = useSelector((s) => s.orders)

  useEffect(() => { dispatch(fetchOrderById(id)) }, [id, dispatch])

  if (loading) return <Spinner center />
  if (!order) return <div className="container"><p>Order not found.</p></div>

  const statusIdx = TRACKING_STEPS.indexOf(order.status)

  return (
    <div className="container" style={{ maxWidth: 800 }}>
      <h1 className="page-title">Order #{order._id.slice(-8).toUpperCase()}</h1>

      {/* Tracking steps */}
      {!['cancelled', 'returned'].includes(order.status) && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: 600, marginBottom: '1.25rem' }}>Order Tracking</p>
          <div style={{ display: 'flex', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 14, left: '12.5%', right: '12.5%', height: 2, background: '#e2e8f0' }} />
            <div style={{ position: 'absolute', top: 14, left: '12.5%', width: `${Math.max(0, statusIdx / (TRACKING_STEPS.length - 1)) * 75}%`, height: 2, background: '#2563eb', transition: 'width 0.5s' }} />
            {TRACKING_STEPS.map((s, i) => (
              <div key={s} style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', margin: '0 auto 6px',
                  background: i <= statusIdx ? '#2563eb' : '#e2e8f0',
                  color: i <= statusIdx ? '#fff' : '#94a3b8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600,
                }}>
                  {i < statusIdx ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 12, textTransform: 'capitalize', fontWeight: i === statusIdx ? 600 : 400, color: i <= statusIdx ? '#2563eb' : '#94a3b8' }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <p style={{ fontWeight: 600, marginBottom: '1rem' }}>Items Ordered</p>
        {order.items?.map(item => (
          <div key={item._id} style={{ display: 'flex', gap: '1rem', paddingBottom: '0.875rem', marginBottom: '0.875rem', borderBottom: '1px solid #f1f5f9' }}>
            <img src={item.product?.images?.[0]?.url || 'https://placehold.co/60'} alt=""
              style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 500, fontSize: 14 }}>{item.product?.name}</p>
              <p style={{ fontSize: 13, color: '#64748b' }}>Qty: {item.quantity} × {formatCurrency(item.unitPrice)}</p>
            </div>
            <p style={{ fontWeight: 600 }}>{formatCurrency(item.unitPrice * item.quantity)}</p>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: 8 }}>
          <span>Total</span><span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      {/* Address & Payment */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Delivery Address</p>
          <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
            {order.address?.line1}<br />
            {order.address?.line2 && <>{order.address.line2}<br /></>}
            {order.address?.city}, {order.address?.state}<br />
            {order.address?.postalCode}, {order.address?.country}
          </p>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Payment Info</p>
          <p style={{ fontSize: 14, color: '#475569' }}>
            Method: <span style={{ textTransform: 'capitalize' }}>{order.paymentMethod}</span>
          </p>
          <p style={{ fontSize: 14, color: '#475569', marginTop: 4 }}>
            Status: <span className={`badge badge-${order.paymentStatus === 'paid' ? 'success' : 'warning'}`}>{order.paymentStatus || 'pending'}</span>
          </p>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>Placed {formatDate(order.createdAt)}</p>
        </div>
      </div>
    </div>
  )
}
