import { apiClient } from './client'
import type { CheckRecord, CheckRequest, HealthResponse, PaginationParams, TelegramBotToken, TelegramBotStatus, TelegramBotSettings, VerifyChatResponse, AdminInfo } from '@/types'

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

  /** POST /api/v1/bots/telegram/verify-chat */
  verifyTelegramChat: (chatId: string) =>
    apiClient.post<VerifyChatResponse>('/api/v1/bots/telegram/verify-chat', { chat_id: chatId }),

  /** GET /api/v1/bots/telegram/history */
  getTelegramBotHistory: ({ limit = 50, offset = 0 }: PaginationParams = {}) =>
    apiClient.get<CheckRecord[]>(`/api/v1/bots/telegram/history?limit=${limit}&offset=${offset}`),

  // ── Admins ──────────────────────────────────────────────────────────
  /** GET /api/v1/bots/telegram/admins */
  getTelegramAdmins: () =>
    apiClient.get<AdminInfo[]>('/api/v1/bots/telegram/admins'),

  /** POST /api/v1/bots/telegram/admins */
  addTelegramAdmin: (username: string) =>
    apiClient.post<AdminInfo[]>('/api/v1/bots/telegram/admins', { username }),

  /** DELETE /api/v1/bots/telegram/admins/:username */
  removeTelegramAdmin: (username: string) =>
    apiClient.del<AdminInfo[]>(`/api/v1/bots/telegram/admins/${encodeURIComponent(username)}`),
}