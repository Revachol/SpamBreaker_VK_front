import { apiClient } from './client'
import type { CheckRecord, CheckRequest, HealthResponse, PaginationParams } from '@/types'

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
}