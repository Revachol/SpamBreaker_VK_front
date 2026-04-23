import { apiClient } from './client'
import type { CheckRecord, CheckRequest, HealthResponse, PaginationParams, TelegramBotToken, TelegramBotStatus, TelegramBotSettings } from '@/types'

export const moderationApi = {
  /** GET /health */
  health: () => apiClient.get<HealthResponse>('/health'),

  /** POST /api/v1/check */
  check: (payload: CheckRequest) => apiClient.post<CheckRecord>('/api/v1/check', payload),

  /** GET /api/v1/history */
  getHistory: ({ limit = 20, offset = 0 }: PaginationParams = {}) =>
    apiClient.get<CheckRecord[]>(`/api/v1/history?limit=${limit}&offset=${offset}`),

  /** GET /api/v1/history/:id */
  getRecord: (id: string) => apiClient.get<CheckRecord>(`/api/v1/history/${id}`),

  // ── Telegram Bot API ────────────────────────────────────────────────
  /** GET /api/v1/bots/telegram/token */
  getTelegramBotToken: () => apiClient.get<TelegramBotToken>('/api/v1/bots/telegram/token'),

  /** GET /api/v1/bots/telegram/status */
  getTelegramBotStatus: (token: string) =>
    apiClient.get<TelegramBotStatus>(`/api/v1/bots/telegram/status?token=${token}`),

  /** GET /api/v1/bots/telegram/settings */
  getTelegramBotSettings: () =>
    apiClient.get<TelegramBotSettings>('/api/v1/bots/telegram/settings'),

  /** POST /api/v1/bots/telegram/settings */
  updateTelegramBotSettings: (settings: Partial<TelegramBotSettings>) =>
    apiClient.post<TelegramBotSettings>('/api/v1/bots/telegram/settings', settings),

  /** POST /api/v1/bots/telegram/disable */
  disableTelegramBot: () => apiClient.post<void>('/api/v1/bots/telegram/disable', {}),
}