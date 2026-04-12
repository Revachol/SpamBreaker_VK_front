/**
 * Auth store — скелет для будущей JWT-авторизации.
 *
 * Сейчас хранит только флаг isAuthenticated = true (bypass).
 * Позже: login/logout, refresh-token, persist в localStorage.
 */
import { create } from 'zustand'

interface User {
  id: string
  login: string
  role: 'admin' | 'viewer'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean

  // Actions
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  // TODO: заменить на false когда появится бэкенд авторизации
  isAuthenticated: true,
  user: null,
  token: null,

  setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
  clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
}))