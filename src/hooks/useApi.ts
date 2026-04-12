import { useState, useEffect, useCallback } from 'react'
import { ApiClientError } from '@/api/client'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Простой хук для data-fetching.
 * Позже можно заменить на React Query / SWR — интерфейс останется совместимым.
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []): UseApiState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetcher()
      .then((res) => {
        if (!cancelled) {
          setData(res)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          if (err instanceof ApiClientError) {
            const body = err.body as { error?: string }
            setError(body?.error ?? `HTTP ${err.status}`)
          } else if (err instanceof Error) {
            setError(err.message)
          } else {
            setError('Unknown error')
          }
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps])

  return { data, loading, error, refetch }
}