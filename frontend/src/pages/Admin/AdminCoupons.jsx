import { useEffect, useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiTag } from 'react-icons/fi'
import api from '../../services/api'
import { formatCurrency } from '../../utils/format'
import toast from 'react-hot-toast'

const EMPTY = {
  code: '', type: 'percent', value: '', minOrderValue: '',
  maxDiscount: '', usageLimit: '', expiresAt: '', isActive: true,
}

export default function AdminCoupons() {
  const [coupons,  setCoupons]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)

  const fetch = () => {
    setLoading(true)
    api.get('/coupons').then(setCoupons).catch(() => toast.error('Failed to load')).finally(() => setLoading(false))
  }

  useEffect(fetch, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const openEdit   = (c) => {
    setEditing(c)
    setForm({
      code: c.code, type: c.type, value: c.value,
      minOrderValue: c.minOrderValue || '', maxDiscount: c.maxDiscount || '',
      usageLimit: c.usageLimit ?? '', isActive: c.isActive,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
    })
    setShowForm(true)
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        code:          form.code.toUpperCase().trim(),
        value:         parseFloat(form.value),
        minOrderValue: form.minOrderValue ? parseFloat(form.minOrderValue) : 0,
        maxDiscount:   form.maxDiscount   ? parseFloat(form.maxDiscount)   : undefined,
        usageLimit:    form.usageLimit    ? parseInt(form.usageLimit)       : null,
        expiresAt:     form.expiresAt     || null,
      }
      if (editing) {
        await api.put(`/coupons/${editing._id}`, payload)
        toast.success('Coupon updated')
      } else {
        await api.post('/coupons', payload)
        toast.success('Coupon created')
      }
      setShowForm(false); fetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  const deleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return
    try { await api.delete(`/coupons/${id}`); toast.success('Deleted'); fetch() }
    catch { toast.error('Delete failed') }
  }

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <FiTag className="text-2xl text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-800 flex-1">Coupons</h1>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm">
          <FiPlus /> New Coupon
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-12">Loading…</p>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FiTag className="text-5xl mx-auto mb-3 opacity-30" />
          <p>No coupons yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-5 py-3 text-left">Code</th>
                <th className="px-5 py-3 text-left">Discount</th>
                <th className="px-5 py-3 text-left">Min Order</th>
                <th className="px-5 py-3 text-left">Usage</th>
                <th className="px-5 py-3 text-left">Expires</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono font-semibold text-indigo-700">{c.code}</td>
                  <td className="px-5 py-3">
                    {c.type === 'percent'
                      ? `${c.value}%${c.maxDiscount ? ` (max ${formatCurrency(c.maxDiscount)})` : ''}`
                      : formatCurrency(c.value)}
                  </td>
                  <td className="px-5 py-3">{c.minOrderValue ? formatCurrency(c.minOrderValue) : '—'}</td>
                  <td className="px-5 py-3">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ' / ∞'}</td>
                  <td className="px-5 py-3">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)}    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><FiEdit2 /></button>
                      <button onClick={() => deleteCoupon(c._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><FiX size={20} /></button>
            <h2 className="text-xl font-bold text-gray-800 mb-5">{editing ? 'Edit Coupon' : 'New Coupon'}</h2>
            <form onSubmit={save} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <input required value={form.code} onChange={f('code')} placeholder="SAVE20"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono uppercase" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select value={form.type} onChange={f('type')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="percent">Percent (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value * {form.type === 'percent' ? '(%)' : '(₹)'}</label>
                  <input required type="number" min="0" value={form.value} onChange={f('value')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order (₹)</label>
                  <input type="number" min="0" value={form.minOrderValue} onChange={f('minOrderValue')} placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                {form.type === 'percent' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (₹)</label>
                    <input type="number" min="0" value={form.maxDiscount} onChange={f('maxDiscount')} placeholder="No cap"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                  <input type="number" min="1" value={form.usageLimit} onChange={f('usageLimit')} placeholder="Unlimited"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expires On</label>
                  <input type="date" value={form.expiresAt} onChange={f('expiresAt')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={f('isActive')} className="w-4 h-4" />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? 'Saving…' : (editing ? 'Save Changes' : 'Create Coupon')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
