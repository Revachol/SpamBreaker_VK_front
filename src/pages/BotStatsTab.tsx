import { useState, useEffect, useMemo } from 'react'
import { moderationApi } from '@/api'
import type { CheckRecord } from '@/types'
import styles from './BotStatsTab.module.css'

// ── Chart ──────────────────────────────────────────────────────────────

interface DayPoint {
  date: string
  total: number
  banned: number
}

function LineChart({ data }: { data: DayPoint[] }) {
  if (data.length === 0) return null

  const W = 560
  const H = 160
  const PAD = { top: 16, right: 16, bottom: 36, left: 36 }
  const iW = W - PAD.left - PAD.right
  const iH = H - PAD.top - PAD.bottom

  const maxVal = Math.max(...data.map(d => d.total), 4)
  const n = data.length

  const xOf = (i: number) => PAD.left + (n > 1 ? (i / (n - 1)) * iW : iW / 2)
  const yOf = (v: number) => PAD.top + iH - Math.round((v / maxVal) * iH)

  const toPolyline = (vals: number[]) =>
    vals.map((v, i) => `${xOf(i)},${yOf(v)}`).join(' ')

  const ticks = [0, Math.round(maxVal / 2), maxVal]
  const labelStep = Math.max(1, Math.ceil(n / 7))
  const xLabels = data
    .map((d, i) => ({ i, label: d.date.slice(5) }))
    .filter((_, i) => i % labelStep === 0 || i === n - 1)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart} aria-label="График сообщений">
      {ticks.map(t => (
        <g key={t}>
          <line x1={PAD.left} y1={yOf(t)} x2={PAD.left + iW} y2={yOf(t)} stroke="var(--border)" strokeWidth="1" />
          <text x={PAD.left - 6} y={yOf(t) + 4} textAnchor="end" fontSize="10" fill="var(--text-muted)">{t}</text>
        </g>
      ))}
      {xLabels.map(({ i, label }) => (
        <text key={i} x={xOf(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{label}</text>
      ))}
      <polyline points={toPolyline(data.map(d => d.total))} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
      <polyline points={toPolyline(data.map(d => d.banned))} fill="none" stroke="var(--red)" strokeWidth="2" strokeLinejoin="round" />
      {data.map((d, i) => <circle key={`t${i}`} cx={xOf(i)} cy={yOf(d.total)} r="3" fill="var(--accent)" />)}
      {data.map((d, i) => <circle key={`b${i}`} cx={xOf(i)} cy={yOf(d.banned)} r="3" fill="var(--red)" />)}
    </svg>
  )
}

// ── Verdict badge ──────────────────────────────────────────────────────

const VERDICT_LABEL: Record<string, string> = {
  positive: 'Позитив',
  neutral:  'Нейтрал',
  negative: 'Негатив',
}
const VERDICT_COLOR: Record<string, string> = {
  positive: 'var(--accent)',
  neutral:  'var(--text-muted)',
  negative: 'var(--red)',
}

function VerdictBadge({ label }: { label: string }) {
  return (
    <span className={styles.badge} style={{ color: VERDICT_COLOR[label] ?? 'var(--text)' }}>
      {VERDICT_LABEL[label] ?? label}
    </span>
  )
}

// ── Recent events table (no message text) ─────────────────────────────

function EventsTable({ records, title }: { records: CheckRecord[]; title: string }) {
  return (
    <div className={styles.tableWrap}>
      <div className={styles.tableTitle}>{title}</div>
      {records.length === 0 ? (
        <div className={styles.empty}>Нет данных</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Вердикт</th>
              <th>Уверенность</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r.id}>
                <td><VerdictBadge label={r.label} /></td>
                <td>{Math.round(r.confidence * 100)}%</td>
                <td className={styles.dateCell}>
                  {new Date(r.created_at).toLocaleString('ru-RU', {
                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────

interface BotStatsTabProps {
  botId: string
}

export function BotStatsTab({ botId }: BotStatsTabProps) {
  const [records, setRecords] = useState<CheckRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!botId) return
    moderationApi
      .getTelegramBotHistory(botId, { limit: 200, offset: 0 })
      .then(data => setRecords(data ?? []))
      .catch(() => setError('Не удалось загрузить статистику'))
      .finally(() => setLoading(false))
  }, [botId])

  const dailyStats = useMemo<DayPoint[]>(() => {
    const map: Record<string, { total: number; banned: number }> = {}
    records.forEach(r => {
      const day = r.created_at.slice(0, 10)
      if (!map[day]) map[day] = { total: 0, banned: 0 }
      map[day].total++
      if (r.label === 'negative') map[day].banned++
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, v]) => ({ date, ...v }))
  }, [records])

  const recentAll    = records.slice(0, 8)
  const recentBanned = records.filter(r => r.label === 'negative').slice(0, 8)

  const totalAll    = records.length
  const totalBanned = records.filter(r => r.label === 'negative').length

  if (loading) return <div className={styles.loading}>Загрузка статистики…</div>
  if (error)   return <div className={styles.error}>{error}</div>

  return (
    <div className={styles.statsPage}>
      {/* ── Summary chips ── */}
      <div className={styles.chips}>
        <div className={styles.chip}>
          <span className={styles.chipValue}>{totalAll}</span>
          <span className={styles.chipLabel}>Всего проверок</span>
        </div>
        <div className={`${styles.chip} ${styles.chipRed}`}>
          <span className={styles.chipValue}>{totalBanned}</span>
          <span className={styles.chipLabel}>Заблокировано</span>
        </div>
        <div className={styles.chip}>
          <span className={styles.chipValue}>
            {totalAll > 0 ? Math.round((totalBanned / totalAll) * 100) : 0}%
          </span>
          <span className={styles.chipLabel}>Доля спама</span>
        </div>
      </div>

      {/* ── Chart card ── */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Активность за последние 14 дней</span>
          <div className={styles.legend}>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: 'var(--accent)' }} />
              Все проверки
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: 'var(--red)' }} />
              Заблокированные
            </span>
          </div>
        </div>
        {dailyStats.length === 0 ? (
          <div className={styles.empty}>Нет данных для отображения графика</div>
        ) : (
          <LineChart data={dailyStats} />
        )}
      </section>

      {/* ── Tables ── */}
      <div className={styles.tables}>
        <EventsTable records={recentAll}    title="Последние проверки" />
        <EventsTable records={recentBanned} title="Последние блокировки" />
      </div>
    </div>
  )
}
