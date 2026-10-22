import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiPackage, FiShoppingCart, FiUsers, FiDollarSign, FiTrendingUp } from 'react-icons/fi'
import api from '../../services/api'
import Spinner from '../../components/common/Spinner'
import { formatCurrency } from '../../utils/format'

export default function AdminDashboard() {
  const [stats,  setStats]  = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/orders/admin/all?limit=5'),
      api.get('/products?limit=1'),
    ]).then(([ordersRes, productsRes]) => {
      const allOrders = ordersRes.orders || []
      const revenue   = allOrders.reduce((s, o) => s + (o.total || 0), 0)
      setOrders(allOrders)
      setStats({
        totalOrders:   ordersRes.total || 0,
        revenue,
        totalProducts: productsRes.total || 0,
      })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Total Orders',   value: stats?.totalOrders ?? '—',                icon: <FiShoppingCart />, color: 'bg-blue-50 text-blue-700'   },
          { label: 'Revenue',        value: formatCurrency(stats?.revenue ?? 0),      icon: <FiDollarSign />,  color: 'bg-green-50 text-green-700' },
          { label: 'Products',       value: stats?.totalProducts ?? '—',              icon: <FiPackage />,     color: 'bg-purple-50 text-purple-700'},
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-6 flex items-center gap-4 ${s.color}`}>
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className="text-sm font-medium opacity-70">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Nav */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <Link to="/admin/orders"
          className="flex items-center gap-3 p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
          <FiShoppingCart className="text-2xl text-blue-600" />
          <div>
            <p className="font-semibold text-gray-800">Manage Orders</p>
            <p className="text-sm text-gray-500">View, update status, process returns</p>
          </div>
        </Link>
        <Link to="/admin/products"
          className="flex items-center gap-3 p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
          <FiPackage className="text-2xl text-purple-600" />
          <div>
            <p className="font-semibold text-gray-800">Manage Products</p>
            <p className="text-sm text-gray-500">Add, edit, delete products</p>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-indigo-600 hover:underline">View all →</Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Order ID</th>
                  <th className="px-6 py-3 text-left">Customer</th>
                  <th className="px-6 py-3 text-left">Total</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">#{o._id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4">{o.user?.name || '—'}</td>
                    <td className="px-6 py-4">{formatCurrency(o.total)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    pending:    'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped:    'bg-indigo-100 text-indigo-700',
    delivered:  'bg-green-100 text-green-700',
    cancelled:  'bg-red-100 text-red-700',
  }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}
