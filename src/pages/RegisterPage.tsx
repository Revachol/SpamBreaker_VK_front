import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { authApi, ApiClientError } from '@/api'
import { useAuthStore } from '@/store'
import styles from './AuthPage.module.css'

export function RegisterPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const [username, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password || !confirm) return

    if (password !== confirm) {
      setError('Пароли не совпадают.')
      return
    }
    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await authApi.register({ username: username.trim(), password, confirm_password: confirm })
      setAuth(res.token, res.user ? { ...res.user, login: res.user.username } : null)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (err instanceof ApiClientError) {
        const body = err.body as { error?: string }
        if (err.status === 409) {
          setError('Пользователь с таким логином уже существует.')
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

        <h1 className={styles.title}>Создать аккаунт</h1>
        <p className={styles.sub}>Регистрация займёт меньше минуты</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-login">Логин</label>
            <input
              id="reg-login"
              className={styles.input}
              type="text"
              placeholder="your_login"
              value={username}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-password">Пароль</label>
            <input
              id="reg-password"
              className={styles.input}
              type="password"
              placeholder="Минимум 6 символов"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-confirm">Повторите пароль</label>
            <input
              id="reg-confirm"
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            className={styles.submitBtn}
            type="submit"
            disabled={loading || !username.trim() || !password || !confirm}
          >
            {loading && <span className={styles.spinner} />}
            {loading ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className={styles.footer}>
          <span className={styles.footerText}>Уже есть аккаунт?</span>
          <Link to="/login" className={styles.footerLink}>Войти</Link>
        </div>
      </div>
    </div>
  )
}