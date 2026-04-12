import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import styles from './LoginPage.module.css'

/**
 * Заглушка страницы авторизации.
 * Когда auth store вернёт isAuthenticated = false —
 * здесь нужно реализовать форму логина и вызов useAuthStore.setAuth().
 */
export function LoginPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // Уже авторизован — редиректим
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🛡️</span>
          <span className={styles.logoName}>SpamBreaker</span>
        </div>

        <h1 className={styles.title}>Вход</h1>
        <p className={styles.sub}>Авторизация появится в следующем релизе.</p>

        {/* TODO: форма логина */}
        <div className={styles.todo}>
          <code>// TODO: JWT login form</code>
        </div>
      </div>
    </div>
  )
}
