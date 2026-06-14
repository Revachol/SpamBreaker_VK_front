import { apiClient } from './client'
import type {
  AdminInfo,
  BotInfo,
  CheckRecord,
  CheckRequest,
  HealthResponse,
  ModeratorAccount,
  ModeratorAccountInfo,
  PaginationParams,
  ServicePlatform,
  TelegramBotSettings,
  UserBot,
  UserBotRole,
  VerificationToken,
} from '@/types'

function withQuery(path: string, params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value))
  })
  const search = query.toString()
  return search ? `${path}?${search}` : path
}

export const moderationApi = {
  /** GET /health */
  health: () => apiClient.get<HealthResponse>('/health'),

  /** POST /api/bot/v1/{service}/check */
  check: (payload: CheckRequest, service: ServicePlatform = 'telegram') =>
    apiClient.post<CheckRecord>(`/api/bot/v1/${service}/check`, payload),

  /** GET /api/v1/history */
  getHistory: ({ limit = 20, offset = 0 }: PaginationParams = {}) =>
    apiClient.get<CheckRecord[]>(`/api/v1/history?limit=${limit}&offset=${offset}`),

  /** GET /api/v1/history/:id */
  getRecord: (id: string) => apiClient.get<CheckRecord>(`/api/v1/history/${id}`),

  // ── User accounts ───────────────────────────────────────────────────

  /** GET /api/v1/user/account */
  listAccounts: (platform: ServicePlatform, active?: boolean) =>
    apiClient.get<ModeratorAccount[]>(withQuery('/api/v1/user/account', { platform, active })),

  /** GET /api/v1/user/account/{accID} */
  getAccount: (accId: string) =>
    apiClient.get<ModeratorAccountInfo>(`/api/v1/user/account/${accId}`),

  /** POST /api/v1/user/{service}/verify */
  initiateAccountVerification: (service: ServicePlatform) =>
    apiClient.post<VerificationToken>(`/api/v1/user/${service}/verify`, undefined),

  // ── User Bot List ───────────────────────────────────────────────────

  /** GET /api/v1/user/bot */
  listUserBots: (platform: ServicePlatform, role?: UserBotRole) =>
    apiClient.get<UserBot[]>(withQuery('/api/v1/user/bot', { platform, role })),

  // ── Single Bot ──────────────────────────────────────────────────────

  /** GET /api/v1/bot/{appID}/ */
  getBot: (botId: string) =>
    apiClient.get<BotInfo>(`/api/v1/bot/${botId}/`),

  /** GET /api/v1/bot/{appID}/settings */
  getBotSettings: (botId: string) =>
    apiClient.get<TelegramBotSettings>(`/api/v1/bot/${botId}/settings`),

  /** GET /api/v1/bot/{appID}/settings */
  getTelegramBotSettings: (botId: string) =>
    apiClient.get<TelegramBotSettings>(`/api/v1/bot/${botId}/settings`),

  /** POST /api/v1/bot/{appID}/settings */
  updateBotSettings: (botId: string, settings: Partial<TelegramBotSettings>) =>
    apiClient.post<TelegramBotSettings>(`/api/v1/bot/${botId}/settings`, settings),

  /** POST /api/v1/bot/{appID}/settings */
  updateTelegramBotSettings: (botId: string, settings: Partial<TelegramBotSettings>) =>
    apiClient.post<TelegramBotSettings>(`/api/v1/bot/${botId}/settings`, settings),

  /** POST /api/v1/bot/{appID}/active?status={boolean} */
  setBotActive: (botId: string, status: boolean) =>
    apiClient.post<Record<string, boolean>>(`/api/v1/bot/${botId}/active?status=${status}`, undefined),

  /** POST /api/v1/bot/{appID}/active?status=false */
  disableBot: (botId: string) =>
    apiClient.post<Record<string, boolean>>(`/api/v1/bot/${botId}/active?status=false`, undefined),

  /** POST /api/v1/bot/{appID}/active?status=false */
  disableTelegramBot: (botId: string) =>
    apiClient.post<Record<string, boolean>>(`/api/v1/bot/${botId}/active?status=false`, undefined),

  /** GET /api/v1/bot/{appID}/history */
  getBotHistory: (botId: string, { limit = 100, offset = 0 }: PaginationParams = {}) =>
    apiClient.get<CheckRecord[]>(`/api/v1/bot/${botId}/history?limit=${limit}&offset=${offset}`),

  /** GET /api/v1/bot/{appID}/history */
  getTelegramBotHistory: (botId: string, { limit = 100, offset = 0 }: PaginationParams = {}) =>
    apiClient.get<CheckRecord[]>(`/api/v1/bot/${botId}/history?limit=${limit}&offset=${offset}`),

  // ── Admins ──────────────────────────────────────────────────────────

  /** GET /api/v1/bot/{appID}/admin */
  getBotAdmins: (botId: string) =>
    apiClient.get<AdminInfo[]>(`/api/v1/bot/${botId}/admin`),

  /** GET /api/v1/bot/{appID}/admin */
  getTelegramAdmins: (botId: string) =>
    apiClient.get<AdminInfo[]>(`/api/v1/bot/${botId}/admin`),

  /** POST /api/v1/bot/{appID}/admin */
  addBotAdmin: (botId: string, username: string) =>
    apiClient.post<AdminInfo[]>(`/api/v1/bot/${botId}/admin`, { username }),

  /** POST /api/v1/bot/{appID}/admin */
  addTelegramAdmin: (botId: string, username: string) =>
    apiClient.post<AdminInfo[]>(`/api/v1/bot/${botId}/admin`, { username }),

  /** DELETE /api/v1/bot/{appID}/admin/{username} */
  removeBotAdmin: (botId: string, username: string) =>
    apiClient.del<AdminInfo[]>(`/api/v1/bot/${botId}/admin/${encodeURIComponent(username)}`),

  /** DELETE /api/v1/bot/{appID}/admin/{username} */
  removeTelegramAdmin: (botId: string, username: string) =>
    apiClient.del<AdminInfo[]>(`/api/v1/bot/${botId}/admin/${encodeURIComponent(username)}`),
}
