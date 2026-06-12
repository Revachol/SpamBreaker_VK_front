import { useState, useMemo } from 'react'
import { moderationApi } from '@/api'
import { useApi } from '@/hooks'
import { Badge, ConfidenceBar, Spinner } from '@/components/ui'
import type { CheckRecord } from '@/types'
import styles from './DashboardPage.module.css'

// ── Stat chip ───────────────────────────────────────────────────────────

function StatChip({ label, value, accent }: {
  label: string
  value: string | number
  accent?: string
}) {
  return (
    <div className={styles.statChip}>
      <span className={styles.statValue} style={accent ? { color: accent } : {}}>
        {value}
      </span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}

// ── Label bar (one category row) ────────────────────────────────────────

function LabelBar({ label, count, total, color }: {
  label: string
  count: number
  total: number
  color: string
}) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className={styles.labelBarRow}>
      <span className={styles.labelBarName} style={{ color }}>{label}</span>
      <div className={styles.labelBarTrack}>
        <div className={styles.labelBarFill} style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className={styles.labelBarCount}>{count}</span>
      <span className={styles.labelBarPct}>{Math.round(pct)}%</span>
    </div>
  )
}

// ── Activity bar chart (last 7 days) ────────────────────────────────────

function ActivityChart({ records }: { records: CheckRecord[] }) {
  const days = useMemo(() => {
    const map: Record<string, { total: number; neg: number }> = {}
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      map[d.toISOString().slice(0, 10)] = { total: 0, neg: 0 }
    }
    for (const r of records) {
      const day = r.created_at.slice(0, 10)
      if (map[day]) {
        map[day].total++
        if (r.label === 'negative') map[day].neg++
      }
    }
    return Object.entries(map).map(([date, v]) => ({ day: date.slice(8), ...v }))
  }, [records])

  const maxVal = Math.max(...days.map(d => d.total), 1)

  return (
    <div className={styles.actChart}>
      <div className={styles.actBars}>
        {days.map(({ day, total, neg }) => (
          <div key={day} className={styles.actCol}>
            <div className={styles.actBarWrap}>
              {total > 0 ? (
                <div
                  className={styles.actBarTotal}
                  style={{ height: `${(total / maxVal) * 100}%` }}
                  title={`${total} проверок, ${neg} блок.`}
                >
                  {neg > 0 && (
                    <div
                      className={styles.actBarNeg}
                      style={{ height: `${(neg / total) * 100}%` }}
                    />
                  )}
                </div>
              ) : (
                <div className={styles.actBarEmpty} />
              )}
            </div>
            <span className={styles.actDay}>{day}</span>
          </div>
        ))}
      </div>
      <div className={styles.actLegend}>
        <span className={styles.actLegendItem}>
          <span className={styles.actDotGreen} />Проверено
        </span>
        <span className={styles.actLegendItem}>
          <span className={styles.actDotRed} />Заблокировано
        </span>
      </div>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────

export function DashboardPage() {
  const [inputText, setInputText] = useState('')
  const [checking, setChecking] = useState(false)
  const [checkError, setCheckError] = useState<string | null>(null)
  const [result, setResult] = useState<Awaited<ReturnType<typeof moderationApi.check>> | null>(null)

  const { data: history, loading: histLoading } = useApi(
    () => moderationApi.getHistory({ limit: 100 }),
    []
  )

  async function handleCheck() {
    if (!inputText.trim()) return
    setChecking(true)
    setCheckError(null)
    setResult(null)
    try {
      const res = await moderationApi.check({ text: inputText })
      setResult(res)
    } catch (e: unknown) {
      setCheckError(e instanceof Error ? e.message : 'Ошибка запроса')
    } finally {
      setChecking(false)
    }
  }

  // ── Derived stats ──
  const stats = useMemo(() => {
    if (!history?.length) return null
    const total = history.length
    let pos = 0, neu = 0, neg = 0, confSum = 0, todayCount = 0
    const today = new Date().toISOString().slice(0, 10)
    for (const r of history) {
      if (r.label === 'positive') pos++
      else if (r.label === 'neutral') neu++
      else neg++
      confSum += r.confidence
      if (r.created_at.startsWith(today)) todayCount++
    }
    return { total, pos, neu, neg, today: todayCount, avgConf: confSum / total, spamRate: (neg / total) * 100 }
  }, [history])

  const recentBlocked = useMemo(
    () => (history ?? []).filter(r => r.label === 'negative').slice(0, 8),
    [history]
  )

  const recentAll = (history ?? []).slice(0, 5)

  return (
    <div className={styles.page}>

      {/* ── Stats chips ── */}
      {!histLoading && stats && (
        <div className={styles.statsRow}>
          <StatChip label="Всего проверок" value={stats.total} />
          <StatChip label="Сегодня" value={stats.today} />
          <StatChip
            label="Заблокировано"
            value={stats.neg}
            accent="var(--red)"
          />
          <StatChip
            label="Доля спама"
            value={`${Math.round(stats.spamRate)}%`}
            accent={stats.spamRate > 30 ? 'var(--amber)' : 'var(--accent)'}
          />
        </div>
      )}

      {/* ── Check panel ── */}
      <section className={styles.checkPanel}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Проверить текст</h2>
          <span className={styles.sectionSub}>POST /api/v1/check</span>
        </div>

        <textarea
          className={styles.textarea}
          placeholder="Введите текст для анализа тональности…"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          maxLength={5000}
          rows={4}
        />

        <div className={styles.textareaFooter}>
          <span className={styles.charCount}>{inputText.length} / 5000</span>
          <button
            className={styles.checkBtn}
            onClick={handleCheck}
            disabled={checking || !inputText.trim()}
          >
            {checking ? <Spinner size="sm" /> : null}
            {checking ? 'Анализ…' : 'Проверить'}
          </button>
        </div>

        {checkError && <div className={styles.errorBox}>{checkError}</div>}

        {result && (
          <div className={styles.resultCard}>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Вердикт</span>
              <Badge label={result.label} />
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Уверенность</span>
              <ConfidenceBar value={result.confidence} />
            </div>
            <div className={styles.scoresRow}>
              {Object.entries(result.all_scores ?? {}).map(([k, v]) => (
                <div key={k} className={styles.scoreItem}>
                  <span className={styles.scoreKey}>{k}</span>
                  <ConfidenceBar value={v as number} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Analytics: distribution + activity ── */}
      {!histLoading && stats && history && history.length > 0 && (
        <div className={styles.analyticsRow}>

          {/* Distribution */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Распределение тональности</span>
              <span className={styles.cardSub}>последние {stats.total}</span>
            </div>
            <div className={styles.labelBars}>
              <LabelBar label="Позитив" count={stats.pos} total={stats.total} color="var(--accent)" />
              <LabelBar label="Нейтрал" count={stats.neu} total={stats.total} color="var(--text-dim)" />
              <LabelBar label="Негатив" count={stats.neg} total={stats.total} color="var(--red)" />
            </div>
            <div className={styles.avgConfRow}>
              <span className={styles.avgConfLabel}>Средняя уверенность</span>
              <div className={styles.avgConfBar}>
                <div className={styles.avgConfFill} style={{ width: `${stats.avgConf * 100}%` }} />
              </div>
              <span className={styles.avgConfVal}>{Math.round(stats.avgConf * 100)}%</span>
            </div>
          </section>

          {/* Activity */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Активность за 7 дней</span>
            </div>
            <ActivityChart records={history} />
          </section>

        </div>
      )}

      {/* ── Recent blocked ── */}
      {!histLoading && recentBlocked.length > 0 && (
        <section className={styles.blockedPanel}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Недавние блокировки</h2>
            <a href="/history" className={styles.viewAll}>Все →</a>
          </div>
          <div className={styles.blockedList}>
            {recentBlocked.map(r => (
              <div key={r.id} className={styles.blockedItem}>
                <span className={styles.blockedText} title={r.text}>
                  {r.text.length > 72 ? r.text.slice(0, 72) + '…' : r.text}
                </span>
                <div className={styles.blockedMeta}>
                  <div className={styles.blockedConfBar}>
                    <div
                      className={styles.blockedConfFill}
                      style={{ width: `${r.confidence * 100}%` }}
                    />
                  </div>
                  <span className={styles.blockedConfVal}>
                    {Math.round(r.confidence * 100)}%
                  </span>
                  <span className={styles.blockedDate}>
                    {new Date(r.created_at).toLocaleString('ru-RU', {
                      day: '2-digit', month: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Recent all ── */}
      <section className={styles.recentPanel}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Последние проверки</h2>
          <a href="/history" className={styles.viewAll}>Все →</a>
        </div>

        {histLoading && (
          <div className={styles.loadingCenter}><Spinner /></div>
        )}

        {!histLoading && recentAll.length === 0 && (
          <div className={styles.empty}>Проверок пока нет</div>
        )}

        {!histLoading && recentAll.length > 0 && (
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>Текст</span>
              <span>Вердикт</span>
              <span>Уверенность</span>
              <span>Время</span>
            </div>
            {recentAll.map(rec => (
              <div key={rec.id} className={styles.tableRow}>
                <span className={styles.cellText} title={rec.text}>
                  {rec.text.length > 60 ? rec.text.slice(0, 60) + '…' : rec.text}
                </span>
                <Badge label={rec.label} />
                <ConfidenceBar value={rec.confidence} />
                <span className={styles.cellDate}>
                  {new Date(rec.created_at).toLocaleString('ru-RU')}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
