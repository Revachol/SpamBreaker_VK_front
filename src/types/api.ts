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

// ── Telegram Bot Types ────────────────────────────────────────────────
export interface TelegramBotToken {
  token: string
  expires_at: string // ISO 8601 UTC
  created_at: string // ISO 8601 UTC
}

export interface TelegramBotStatus {
  connected: boolean
  chat_id?: string
  activated_at?: string // ISO 8601 UTC
}

export interface TelegramBotSettings {
  sensitivity: number
  banned_words: string[]
  enabled: boolean
}

export interface VerifyChatRequest {
  chat_id: string
}

export interface VerifyChatResponse {
  success: boolean
  verified: boolean
  message: string
  activated: boolean
  token?: string
}

export interface AdminInfo {
  id: string
  username: string
}