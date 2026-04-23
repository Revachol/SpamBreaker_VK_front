import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { authApi, ApiClientError } from '@/api'
import { useAuthStore } from '@/store'
import styles from './AuthPage.module.css'

export function LoginPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const [username, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password) return

    setLoading(true)
    setError(null)

    try {
      const res = await authApi.login({ username: username.trim(), password })
      setAuth(res.token, { id: res.id, login: res.username, role: res.role })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (err instanceof ApiClientError) {
        const body = err.body as { error?: string }
        if (err.status === 401 || err.status === 403) {
          setError('Неверный логин или пароль.')
        } else {
          setError(body?.error ?? `Ошибка ${err.status}`)
        }
      } else {
        setError('Не удалось подключиться к серверу.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.bg} />
      <Link to="/" className={styles.backLink}>← Главная</Link>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🛡️</div>
          <span className={styles.logoName}>SpamBreaker</span>
        </div>
        <h1 className={styles.title}>Добро пожаловать</h1>
        <p className={styles.sub}>Войдите в свой аккаунт</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="login">Логин</label>
            <input id="login" className={styles.input} type="text"
              placeholder="your_login" value={username}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="username" disabled={loading} />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Пароль</label>
            <input id="password" className={styles.input} type="password"
              placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password" disabled={loading} />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button className={styles.submitBtn} type="submit"
            disabled={loading || !username.trim() || !password}>
            {loading && <span className={styles.spinner} />}
            {loading ? 'Вход…' : 'Войти'}
          </button>
        </form>
        <div className={styles.footer}>
          <span className={styles.footerText}>Нет аккаунта?</span>
          <Link to="/register" className={styles.footerLink}>Зарегистрироваться</Link>
        </div>
      </div>
    </div>
  )
}