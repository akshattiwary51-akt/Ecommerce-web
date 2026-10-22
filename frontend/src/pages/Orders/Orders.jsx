import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchOrders } from '../../store/slices/orderSlice'
import { Spinner } from '../../components/common/Spinner'
import { formatCurrency, formatDate, getStatusColor } from '../../utils/format'

export default function Orders() {
  const dispatch = useDispatch()
  const { list, loading } = useSelector((s) => s.orders)

  useEffect(() => { dispatch(fetchOrders()) }, [dispatch])

  if (loading) return <Spinner center />

  return (
    <div className="container" style={{ maxWidth: 800 }}>
      <h1 className="page-title">My Orders</h1>
      {list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ fontSize: 48, marginBottom: '1rem' }}>📦</p>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>No orders yet.</p>
          <Link to="/products" className="btn btn-primary">Shop Now</Link>
        </div>
      ) : list.map(order => (
        <div key={order._id} className="card" style={{ padding: '1.25rem', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14 }}>Order #{order._id.slice(-8).toUpperCase()}</p>
              <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{formatDate(order.createdAt)}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className={`badge badge-${getStatusColor(order.status)}`} style={{ textTransform: 'capitalize' }}>{order.status}</span>
              <span style={{ fontWeight: 700 }}>{formatCurrency(order.total)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {order.items?.slice(0, 3).map(item => (
              <img key={item._id} src={item.product?.images?.[0]?.url || 'https://placehold.co/50'} alt=""
                style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
            ))}
            {order.items?.length > 3 && <div style={{ width: 48, height: 48, borderRadius: 6, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#64748b' }}>+{order.items.length - 3}</div>}
          </div>
          <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">View Details</Link>
        </div>
      ))}
    </div>
  )
}
