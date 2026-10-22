import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function PrivateRoute() {
  const { token } = useSelector((s) => s.auth)
  return token ? <Outlet /> : <Navigate to="/login" replace />
}
