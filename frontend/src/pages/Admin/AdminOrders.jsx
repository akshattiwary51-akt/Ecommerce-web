import { useEffect, useState } from 'react'
import { FiRefreshCw } from 'react-icons/fi'
import api from '../../services/api'
import Spinner from '../../components/common/Spinner'
import { formatCurrency } from '../../utils/format'
import toast from 'react-hot-toast'

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrders() {
  const [data,    setData]    = useState({ orders: [], total: 0, pages: 1 })
  const [page,    setPage]    = useState(1)
  const [filter,  setFilter]  = useState('')
  const [loading, setLoading] = useState(true)

  const fetchOrders = () => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: 20 })
    if (filter) params.set('status', filter)
    api.get(`/orders/admin/all?${params}`)
      .then(setData)
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }

  useEffect(fetchOrders, [page, filter])

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status, note: `Status updated to ${status}` })
      toast.success(`Order updated to ${status}`)
      fetchOrders()
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-800 flex-1">All Orders</h1>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        <button onClick={fetchOrders} className="p-2 text-gray-500 hover:text-gray-800">
          <FiRefreshCw />
        </button>
      </div>

      {loading ? <Spinner /> : (
        <>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Order</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Items</th>
                    <th className="px-4 py-3 text-left">Total</th>
                    <th className="px-4 py-3 text-left">Payment</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.orders.map((o) => (
                    <tr key={o._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        #{o._id.slice(-6).toUpperCase()}
                        <br />
                        <span className="text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{o.user?.name}</p>
                        <p className="text-gray-400 text-xs">{o.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(o.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${o.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {o.paymentStatus || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor(o.status)}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          defaultValue={o.status}
                          onChange={(e) => updateStatus(o._id, e.target.value)}
                          className="border border-gray-300 rounded text-xs px-2 py-1"
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>{data.total} total orders</p>
            <div className="flex gap-2">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-full ${p === page ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function statusColor(s) {
  return {
    pending:    'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped:    'bg-indigo-100 text-indigo-700',
    delivered:  'bg-green-100 text-green-700',
    cancelled:  'bg-red-100 text-red-700',
  }[s] || 'bg-gray-100 text-gray-600'
}
