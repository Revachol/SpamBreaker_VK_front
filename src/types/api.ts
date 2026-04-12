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
  all_scores: AllScores
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