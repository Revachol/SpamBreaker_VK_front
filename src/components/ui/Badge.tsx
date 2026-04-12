import type { VerdictLabel } from '@/types'
import styles from './Badge.module.css'

interface BadgeProps {
  label: VerdictLabel | string
}

const META: Record<string, { emoji: string; cls: string }> = {
  positive: { emoji: '🟢', cls: 'positive' },
  neutral:  { emoji: '⚪️', cls: 'neutral'  },
  negative: { emoji: '🔴', cls: 'negative'  },
}

export function Badge({ label }: BadgeProps) {
  const meta = META[label] ?? { emoji: '❓', cls: 'unknown' }
  return (
    <span className={`${styles.badge} ${styles[meta.cls]}`}>
      {meta.emoji} {label}
    </span>
  )
}
