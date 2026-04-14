import { useEffect } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { ApiClientError } from '@/api'

/**
 * Оборачивает защищённые маршруты.
 * Если токен протух и API вернул 401 — автоматически разлогиниваем.
 */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()

  useEffect(() => {
    // Глобальный перехват 401 — разлогиниваем и редиректим
    function handleUnauthorized(e: CustomEvent<ApiClientError>) {
      if (e.detail.status === 401) {
        clearAuth()
        navigate('/login', { replace: true })
      }
    }

    window.addEventListener('api:unauthorized', handleUnauthorized as EventListener)
    return () => window.removeEventListener('api:unauthorized', handleUnauthorized as EventListener)
  }, [clearAuth, navigate])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}