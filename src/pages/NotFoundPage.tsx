import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.code}>404</div>
      <div className={styles.msg}>Страница не найдена</div>
      <Link to="/dashboard" className={styles.link}>← На главную</Link>
    </div>
  )
}
