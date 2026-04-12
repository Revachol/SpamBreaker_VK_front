import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import styles from './AuthPage.module.css'

export function RegisterPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!login.trim() || !password || !confirm) return

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
      // TODO: заменить на реальный вызов API когда появится бэкенд авторизации
      // const res = await authApi.register({ login, password })
      // useAuthStore.getState().setAuth(res.user, res.token)
      await new Promise((r) => setTimeout(r, 600))
      setError('Регистрация ещё не реализована на бэкенде.')
    } catch {
      setError('Не удалось создать аккаунт. Попробуйте позже.')
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
              value={login}
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
            disabled={loading || !login.trim() || !password || !confirm}
          >
            {loading ? <span className={styles.spinner} /> : null}
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