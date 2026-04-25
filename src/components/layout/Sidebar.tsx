import { NavLink } from 'react-router-dom'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { to: '/check',                label: 'Проверка',   icon: '◈' },
  { to: '/bots/telegram/manage',label: 'Telegram бот', icon: '✈' },
  { to: '/history',             label: 'История',    icon: '◫' },
  { to: '/docs',                label: 'API Docs',   icon: '◉' },
]

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>🛡️</div>
        <div>
          <div className={styles.logoName}><a href="/">SpamBreaker</a></div>
          <div className={styles.logoSub}>Admin Panel</div>
        </div>
      </div>

      <nav className={styles.nav}>
        <div className={styles.navLabel}>Навигация</div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.version}>v0.0.1</div>
      </div>
    </aside>
  )
}