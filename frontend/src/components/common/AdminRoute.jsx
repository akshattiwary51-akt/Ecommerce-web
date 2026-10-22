import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

export default function AdminRoute() {
  const { user, loading } = useSelector((s) => s.auth)
  if (loading) return null
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />
  return <Outlet />
}
