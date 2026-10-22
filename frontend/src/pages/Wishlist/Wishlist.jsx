import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { FiHeart, FiShoppingBag } from 'react-icons/fi'
import { fetchWishlist } from '../../store/slices/wishlistSlice'
import ProductCard from '../../components/product/ProductCard'
import Spinner from '../../components/common/Spinner'

export default function Wishlist() {
  const dispatch = useDispatch()
  const { items, loading } = useSelector((s) => s.wishlist)

  useEffect(() => {
    dispatch(fetchWishlist())
  }, [dispatch])

  if (loading) return <Spinner />

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <FiHeart className="text-2xl text-rose-500" />
        <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>
        <span className="ml-auto text-sm text-gray-500">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FiHeart className="text-6xl text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-500 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-400 mb-6">Save items you love and come back to them later.</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            <FiShoppingBag /> Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
