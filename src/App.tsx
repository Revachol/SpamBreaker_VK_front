import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { LandingPage } from '@/pages/LandingPage'
import { DocsPage } from '@/pages/DocsPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { AccountsPage } from '@/pages/AccountsPage'
import { BotListPage } from '@/pages/BotListPage'
import { BotManagePage } from '@/pages/BotManagePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'

export function App() {
  return (
    <BrowserRouter>
      <div className="grid-bg" aria-hidden="true" />
      <Routes>
        {/* ── Публичные ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/docs" element={<DocsPage />} />

        {/* ── Защищённые: с sidebar layout ── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/bots" element={<Navigate to="/bots/telegram" replace />} />
            <Route path="/bots/:service" element={<BotListPage />} />
            <Route path="/bots/:service/:botId" element={<BotManagePage />} />
            <Route path="/api" element={<Navigate to="/docs" replace />} />
            <Route path="/stats" element={<DashboardPage />} />
            <Route path="/check" element={<Navigate to="/stats" replace />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
