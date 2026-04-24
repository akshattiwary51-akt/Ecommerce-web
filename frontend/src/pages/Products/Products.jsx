import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { fetchProducts, setFilter, setPage } from '../../store/slices/productSlice'
import ProductCard from '../../components/product/ProductCard'
import { Spinner, Pagination } from '../../components/common/Spinner'

const CATEGORIES = ['Electronics', 'Clothing', 'Home & Kitchen', 'Sports', 'Books', 'Beauty', 'Toys', 'Grocery']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
]

export default function Products() {
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const { items, total, pages, loading, filters } = useSelector((s) => s.products)

  useEffect(() => {
    const params = { ...filters }
    if (searchParams.get('search')) params.search = searchParams.get('search')
    if (searchParams.get('category')) params.category = searchParams.get('category')
    dispatch(fetchProducts(params))
  }, [filters, searchParams, dispatch])

  const handleFilter = (key, val) => dispatch(setFilter({ [key]: val }))

  return (
    <div className="container">
      <h1 className="page-title">All Products {total > 0 && <span style={{ fontSize: 14, fontWeight: 400, color: '#64748b' }}>({total} items)</span>}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Sidebar Filters */}
        <aside className="card" style={{ padding: '1.25rem' }}>
          <p style={{ fontWeight: 600, marginBottom: '1rem' }}>Filters</p>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input" value={filters.category}
              onChange={e => handleFilter('category', e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Min Price (₹)</label>
            <input className="form-input" type="number" placeholder="0"
              value={filters.minPrice}
              onChange={e => handleFilter('minPrice', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Max Price (₹)</label>
            <input className="form-input" type="number" placeholder="Any"
              value={filters.maxPrice}
              onChange={e => handleFilter('maxPrice', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Min Rating</label>
            <select className="form-input" value={filters.rating}
              onChange={e => handleFilter('rating', e.target.value)}>
              <option value="">Any Rating</option>
              {[4, 3, 2, 1].map(r => <option key={r} value={r}>{r}★ & above</option>)}
            </select>
          </div>

          <button className="btn btn-outline btn-sm btn-full"
            onClick={() => dispatch(setFilter({ category: '', minPrice: '', maxPrice: '', rating: '', sort: 'newest' }))}>
            Clear Filters
          </button>
        </aside>

        {/* Product Grid */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <select className="form-input" style={{ width: 200 }} value={filters.sort}
              onChange={e => handleFilter('sort', e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {loading ? <Spinner center /> : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
              <p style={{ fontSize: 48, marginBottom: '1rem' }}>🔍</p>
              <p style={{ fontSize: 16 }}>No products found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {items.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          <Pagination page={filters.page} pages={pages} onChange={(p) => dispatch(setPage(p))} />
        </div>
      </div>
    </div>
  )
}
