// Зеркалит доменные типы Go-бэкенда.
// При изменении схемы API обновлять здесь.

export type VerdictLabel = 'positive' | 'neutral' | 'negative'

export interface AllScores {
  positive: number
  neutral: number
  negative: number
}

/** Результат одной проверки — возвращается и из /check, и из /history */
export interface CheckRecord {
  id: string
  text: string
  label: VerdictLabel
  confidence: number
  all_scores: AllScores | null
  created_at: string // ISO 8601 UTC
}

export interface CheckRequest {
  text: string
  chat_id?: string
}

export interface HealthResponse {
  status: 'ok'
  ts: string
}

export interface ApiError {
  error: string
}

// ── Pagination ────────────────────────────────────────────────────────
export interface PaginationParams {
  limit?: number
  offset?: number
}

// ── Platform / user account types ─────────────────────────────────────

export type ServicePlatform = 'telegram' | 'vk'
export type UserBotRole = 'admin' | 'moderator'

export interface ModeratorAccount {
  id: string
  account_id: string
  platform: string
  verified_at?: string
}

export interface ModeratorAccountInfo extends ModeratorAccount {
  moderator_id: string
  token_expires_at?: string
}

export interface VerificationToken {
  token: string
  expires_at: string
  instruction?: string
}

// ── Bot Types ────────────────────────────────────────────────────────

export interface TelegramBotSettings {
  sensitivity: number
  banned_words: string[]
  enabled: boolean
}

export interface UserBot {
  id: string
  name: string
  external_id?: string
  own_acc_id?: string
  owner_id?: string
  created_at?: string
  role?: UserBotRole
  platform?: string
  status?: string
  updated_at?: string
  verified_at?: string
}

export interface BotInfo {
  id: string
  name: string
  external_id?: string
  own_acc_id?: string
  owner_id?: string
  platform?: string
  status?: string
  created_at?: string
  updated_at?: string
  verified_at?: string
}

export interface AdminInfo {
  id: string
  username: string
  role?: string
  created_at?: string
}
