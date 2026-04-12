import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store'

/**
 * Оборачивает защищённые маршруты.
 * Когда появится реальная авторизация — просто поменять логику в auth store,
 * этот компонент трогать не нужно.
 */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
