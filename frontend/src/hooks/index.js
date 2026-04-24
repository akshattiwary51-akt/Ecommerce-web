import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export function useCart() {
  const { items, loading } = useSelector((s) => s.cart)
  const subtotal = items.reduce((sum, i) => {
    const price = i.product?.discountPrice || i.product?.price || 0
    return sum + price * i.quantity
  }, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)
  return { items, loading, subtotal, count }
}

export function useAuth() {
  const { user, token, loading } = useSelector((s) => s.auth)
  return { user, token, loading, isAuthenticated: !!token }
}
