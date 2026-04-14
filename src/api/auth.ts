import { apiClient } from './client'

export interface LoginRequest {
  login: string
  password: string
}

export interface RegisterRequest {
  login: string
  password: string
  confirm_password: string
}

// Поправить под реальную схему ответа бэкенда если отличается
export interface AuthResponse {
  token: string
  user?: {
    id: string
    login: string
    role: string
  }
}

export const authApi = {
  /** POST /api/v1/auth/login */
  login: (payload: LoginRequest) =>
    apiClient.post<AuthResponse>('/api/v1/auth/login', payload),

  /** POST /api/v1/auth/register */
  register: (payload: RegisterRequest) =>
    apiClient.post<AuthResponse>('/api/v1/auth/register', payload),
}