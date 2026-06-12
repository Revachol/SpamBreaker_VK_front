import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { LandingPage } from '@/pages/LandingPage'
import { DocsPage } from '@/pages/DocsPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { TelegramSetupPage } from '@/pages/TelegramSetupPage'
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

        {/* ── Защищённые: bot setup (без sidebar layout) ── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/bots/telegram/:botId/setup" element={<TelegramSetupPage />} />
        </Route>

        {/* ── Защищённые: с sidebar layout ── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/check" element={<DashboardPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/bots/telegram" element={<BotListPage />} />
            <Route path="/bots/telegram/:botId" element={<BotManagePage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
