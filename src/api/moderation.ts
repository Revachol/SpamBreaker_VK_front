import { apiClient } from './client'
import type { CheckRecord, CheckRequest, HealthResponse, PaginationParams, TelegramBot, TelegramBotToken, TelegramBotStatus, TelegramBotSettings, VerifyChatResponse, AdminInfo } from '@/types'

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

  // ── Telegram Bot List ───────────────────────────────────────────────

  /** GET /api/v1/bots/telegram */
  listTelegramBots: () =>
    apiClient.get<TelegramBot[]>('/api/v1/bots/telegram'),

  /** POST /api/v1/bots/telegram */
  createTelegramBot: (name: string) =>
    apiClient.post<TelegramBot>('/api/v1/bots/telegram', { name }),

  // ── Single Bot ──────────────────────────────────────────────────────

  /** GET /api/v1/bots/telegram/:botId */
  getTelegramBot: (botId: string) =>
    apiClient.get<TelegramBot>(`/api/v1/bots/telegram/${botId}`),

  /** DELETE /api/v1/bots/telegram/:botId */
  deleteTelegramBot: (botId: string) =>
    apiClient.del<void>(`/api/v1/bots/telegram/${botId}`),

  /** PUT /api/v1/bots/telegram/:botId */
  renameTelegramBot: (botId: string, name: string) =>
    apiClient.put<TelegramBot>(`/api/v1/bots/telegram/${botId}`, { name }),

  /** GET /api/v1/bots/telegram/:botId/token */
  getTelegramBotToken: (botId: string) =>
    apiClient.get<TelegramBotToken>(`/api/v1/bots/telegram/${botId}/token`),

  /** GET /api/v1/bots/telegram/:botId/status */
  getTelegramBotStatus: (botId: string) =>
    apiClient.get<TelegramBotStatus>(`/api/v1/bots/telegram/${botId}/status`),

  /** GET /api/v1/bots/telegram/:botId/settings */
  getTelegramBotSettings: (botId: string) =>
    apiClient.get<TelegramBotSettings>(`/api/v1/bots/telegram/${botId}/settings`),

  /** POST /api/v1/bots/telegram/:botId/settings */
  updateTelegramBotSettings: (botId: string, settings: Partial<TelegramBotSettings>) =>
    apiClient.post<TelegramBotSettings>(`/api/v1/bots/telegram/${botId}/settings`, settings),

  /** POST /api/v1/bots/telegram/:botId/disable */
  disableTelegramBot: (botId: string) =>
    apiClient.post<void>(`/api/v1/bots/telegram/${botId}/disable`, {}),

  /** POST /api/v1/bots/telegram/:botId/verify-chat */
  verifyTelegramChat: (botId: string, chatId: string) =>
    apiClient.post<VerifyChatResponse>(`/api/v1/bots/telegram/${botId}/verify-chat`, { chat_id: chatId }),

  /** GET /api/v1/bots/telegram/:botId/history */
  getTelegramBotHistory: (botId: string, { limit = 100, offset = 0 }: PaginationParams = {}) =>
    apiClient.get<CheckRecord[]>(`/api/v1/bots/telegram/${botId}/history?limit=${limit}&offset=${offset}`),

  // ── Admins ──────────────────────────────────────────────────────────

  /** GET /api/v1/bots/telegram/:botId/admins */
  getTelegramAdmins: (botId: string) =>
    apiClient.get<AdminInfo[]>(`/api/v1/bots/telegram/${botId}/admins`),

  /** POST /api/v1/bots/telegram/:botId/admins */
  addTelegramAdmin: (botId: string, username: string) =>
    apiClient.post<AdminInfo[]>(`/api/v1/bots/telegram/${botId}/admins`, { username }),

  /** DELETE /api/v1/bots/telegram/:botId/admins/:username */
  removeTelegramAdmin: (botId: string, username: string) =>
    apiClient.del<AdminInfo[]>(`/api/v1/bots/telegram/${botId}/admins/${encodeURIComponent(username)}`),
}
