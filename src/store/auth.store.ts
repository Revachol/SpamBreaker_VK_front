import { create } from 'zustand'

interface User {
  id: string
  login: string
  role?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean

  setAuth: (token: string, user?: User | null) => void
  clearAuth: () => void
}

const TOKEN_KEY = 'sb_token'
const USER_KEY  = 'sb_user'

// Восстанавливаем сессию из localStorage при старте приложения
function loadPersistedAuth(): Pick<AuthState, 'token' | 'user' | 'isAuthenticated'> {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return { token: null, user: null, isAuthenticated: false }

  try {
    const raw = localStorage.getItem(USER_KEY)
    const user = raw ? (JSON.parse(raw) as User) : null
    return { token, user, isAuthenticated: true }
  } catch {
    return { token, user: null, isAuthenticated: true }
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...loadPersistedAuth(),

  setAuth: (token, user = null) => {
    localStorage.setItem(TOKEN_KEY, token)
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },

  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ token: null, user: null, isAuthenticated: false })
  },
}))
