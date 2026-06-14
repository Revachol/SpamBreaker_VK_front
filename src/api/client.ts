/**
 * Базовый HTTP-клиент.
 * - Подставляет JWT из localStorage в каждый запрос.
 * - При 401 диспатчит событие api:unauthorized для ProtectedRoute.
 */

const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown
  ) {
    super(`API error ${status}`)
    this.name = 'ApiClientError'
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  }

  const token = localStorage.getItem('sb_token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers })

  if (!res.ok) {
    let body: unknown
    try {
      body = await res.json()
    } catch {
      body = { error: res.statusText }
    }

    const err = new ApiClientError(res.status, body)

    // Глобальное событие — ProtectedRoute его слушает и разлогинивает
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent('api:unauthorized', { detail: err }))
    }

    throw err
  }

  if (res.status === 204) return null as T
  return res.json() as Promise<T>
}

export const apiClient = {
  get:  <T>(path: string, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'GET' }),

  post: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'POST', body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'PUT', body: JSON.stringify(body) }),

  del: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'DELETE' }),
}