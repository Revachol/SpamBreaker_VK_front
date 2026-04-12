/**
 * Базовый HTTP-клиент.
 *
 * Сейчас: JSON + базовая обработка ошибок.
 * Позже: сюда добавятся Authorization-заголовок из auth store,
 *         refresh-token логика и retry.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

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

  // TODO: вставить JWT из auth store, когда появится авторизация:
  // const token = useAuthStore.getState().token
  // if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers })

  if (!res.ok) {
    let body: unknown
    try {
      body = await res.json()
    } catch {
      body = { error: res.statusText }
    }
    throw new ApiClientError(res.status, body)
  }

  // 204 No Content → вернуть null
  if (res.status === 204) return null as T

  return res.json() as Promise<T>
}

export const apiClient = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'GET' }),

  post: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, {
      ...init,
      method: 'POST',
      body: JSON.stringify(body),
    }),
}