import { NavLink } from 'react-router-dom'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard',  icon: '◈' },
  { to: '/history',   label: 'История',     icon: '◫' },
  { to: '/docs',      label: 'API Docs',    icon: '◉' },
]

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>🛡️</div>
        <div>
          <div className={styles.logoName}>SpamBreaker</div>
          <div className={styles.logoSub}>Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
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

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.version}>v0.0.1</div>
      </div>
    </aside>
  )
}
