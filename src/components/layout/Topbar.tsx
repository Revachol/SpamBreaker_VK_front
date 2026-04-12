import { useLocation } from 'react-router-dom'
import styles from './Topbar.module.css'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/history':   'История проверок',
  '/docs':      'API Docs',
}

export function Topbar() {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] ?? 'SpamBreaker'

  return (
    <header className={styles.topbar}>
      <div className={styles.title}>{title}</div>
      <div className={styles.right}>
        <div className={styles.statusDot} title="Core API" />
        <span className={styles.statusLabel}>Core API</span>
      </div>
    </header>
  )
}
