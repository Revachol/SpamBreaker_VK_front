import { apiClient } from './client'

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  confirm_password: string
}

export interface AuthResponse {
  token: string
  id: string
  username: string
  role: string
}

export const authApi = {
  /** POST /api/v1/auth/login */
  login: (payload: LoginRequest) =>
    apiClient.post<AuthResponse>('/api/v1/auth/login', payload),

  /** POST /api/v1/auth/register */
  register: (payload: RegisterRequest) =>
    apiClient.post<AuthResponse>('/api/v1/auth/register', payload),
}