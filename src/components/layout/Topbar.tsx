import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'
import styles from './Topbar.module.css'

const PAGE_TITLES: Record<string, string> = {
  '/check':           'Проверка текста',
  '/history':         'История проверок',
  '/docs':            'API Docs',
  '/bots/telegram':   'Подключение Telegram',
  '/bots/telegram/manage': 'Управление ботом',
}

export function Topbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, clearAuth } = useAuthStore()

  const title = PAGE_TITLES[pathname] ?? 'SpamBreaker'

  function handleLogout() {
    clearAuth()
    navigate('/', { replace: true })
  }

  return (
    <header className={styles.topbar}>
      <div className={styles.title}>{title}</div>

      <div className={styles.right}>
        <div className={styles.statusDot} title="Core API" />
        <span className={styles.statusLabel}>Core API</span>

        {isAuthenticated && (
          <div className={styles.userBlock}>
            <span
              className={styles.userName}
              onClick={() => navigate('/check')}
              style={{ cursor: 'pointer' }}
            >
              {user?.login ?? 'Аккаунт'}
            </span>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Выйти
            </button>
          </div>
        )}
      </div>
    </header>
  )
}