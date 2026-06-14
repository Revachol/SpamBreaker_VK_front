import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'
import styles from './Topbar.module.css'

const PAGE_TITLES: Record<string, string> = {
  '/accounts': 'Аккаунты',
  '/bots/telegram': 'Боты Telegram',
  '/bots/vk': 'Боты Vkontakte',
  '/api': 'АПИ',
  '/stats': 'Статистика',
  '/check': 'Статистика',
  '/history': 'История проверок',
  '/docs': 'API Docs',
}

export function Topbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, clearAuth } = useAuthStore()

  const title = PAGE_TITLES[pathname] ?? (pathname.startsWith('/bots/') ? 'Управление ботом' : 'SpamBreaker')

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
              onClick={() => navigate('/accounts')}
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
