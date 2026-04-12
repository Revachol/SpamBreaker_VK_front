import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { DocsPage } from '@/pages/DocsPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'

export function App() {
  return (
    <BrowserRouter>
      <div className="grid-bg" aria-hidden="true" />
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/docs" element={<DocsPage />} />

        {/* Защищённые маршруты — внутри общего layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/history" element={<HistoryPage />} />
            {/* Сюда будут добавляться новые страницы */}
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}