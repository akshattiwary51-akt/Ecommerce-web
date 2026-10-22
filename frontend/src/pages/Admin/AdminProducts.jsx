import { useEffect, useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import api from '../../services/api'
import Spinner from '../../components/common/Spinner'
import { formatCurrency } from '../../utils/format'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  name: '', brand: '', category: 'electronics', price: '', discountPrice: '',
  stockQty: '', description: '', images: [{ url: '', alt: '' }],
}

const CATEGORIES = ['electronics','clothing','home-kitchen','sports','books','toys','grocery','beauty']

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)   // product being edited
  const [form,     setForm]     = useState(EMPTY_FORM)
  const [saving,   setSaving]   = useState(false)

  const fetchProducts = () => {
    setLoading(true)
    api.get(`/products?page=${page}&limit=20`)
      .then((r) => { setProducts(r.products || r); setTotal(r.total || 0) })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false))
  }

  useEffect(fetchProducts, [page])

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true) }
  const openEdit   = (p)  => {
    setEditing(p)
    setForm({
      name: p.name, brand: p.brand || '', category: p.category,
      price: p.price, discountPrice: p.discountPrice || '',
      stockQty: p.stockQty, description: p.description || '',
      images: p.images?.length ? p.images : [{ url: '', alt: '' }],
    })
    setShowForm(true)
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        price:         parseFloat(form.price),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : undefined,
        stockQty:      parseInt(form.stockQty),
        images:        form.images.filter((i) => i.url),
      }
      if (editing) {
        await api.put(`/products/${editing._id}`, payload)
        toast.success('Product updated')
      } else {
        await api.post('/products', payload)
        toast.success('Product created')
      }
      setShowForm(false)
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      toast.success('Product deleted')
      fetchProducts()
    } catch {
      toast.error('Delete failed')
    }
  }

  const pages = Math.ceil(total / 20)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex-1">Products</h1>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          <FiPlus /> Add Product
        </button>
      </div>

      {loading ? <Spinner /> : (
        <>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Price</th>
                    <th className="px-4 py-3 text-left">Stock</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.images?.[0]?.url && (
                            <img src={p.images[0].url} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />
                          )}
                          <div>
                            <p className="font-medium text-gray-800 line-clamp-1">{p.name}</p>
                            <p className="text-gray-400 text-xs">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{p.category}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{formatCurrency(p.discountPrice || p.price)}</p>
                        {p.discountPrice && <p className="text-xs text-gray-400 line-through">{formatCurrency(p.price)}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.stockQty > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {p.stockQty > 0 ? p.stockQty : 'Out of stock'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(p)}   className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><FiEdit2 /></button>
                          <button onClick={() => deleteProduct(p._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).slice(0, 10).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-full text-sm ${p === page ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
              <FiX size={20} />
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-6">{editing ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={save} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input value={form.brand} onChange={(e) => setForm({...form, brand: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input required type="number" min="0" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (₹)</label>
                  <input type="number" min="0" value={form.discountPrice} onChange={(e) => setForm({...form, discountPrice: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Qty *</label>
                  <input required type="number" min="0" value={form.stockQty} onChange={(e) => setForm({...form, stockQty: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs</label>
                {form.images.map((img, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input placeholder="https://..." value={img.url}
                      onChange={(e) => {
                        const imgs = [...form.images]; imgs[idx] = {...img, url: e.target.value}; setForm({...form, images: imgs})
                      }}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    {form.images.length > 1 && (
                      <button type="button" onClick={() => setForm({...form, images: form.images.filter((_, i) => i !== idx)})}
                        className="text-red-400 hover:text-red-600"><FiX /></button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setForm({...form, images: [...form.images, { url: '', alt: '' }]})}
                  className="text-sm text-indigo-600 hover:underline">+ Add image</button>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? 'Saving…' : (editing ? 'Save Changes' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
