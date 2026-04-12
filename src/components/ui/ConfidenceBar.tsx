import styles from './ConfidenceBar.module.css'

interface ConfidenceBarProps {
  value: number // 0.0 – 1.0
  showLabel?: boolean
}

export function ConfidenceBar({ value, showLabel = true }: ConfidenceBarProps) {
  const pct = Math.round(value * 100)

  return (
    <div className={styles.wrap}>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className={styles.label}>{pct}%</span>}
    </div>
  )
}
