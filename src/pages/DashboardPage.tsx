import { useState } from 'react'
import { moderationApi } from '@/api'
import { useApi } from '@/hooks'
import { Badge, ConfidenceBar, Spinner } from '@/components/ui'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  const [inputText, setInputText] = useState('')
  const [checking, setChecking] = useState(false)
  const [checkError, setCheckError] = useState<string | null>(null)
  const [result, setResult] = useState<Awaited<ReturnType<typeof moderationApi.check>> | null>(null)

  const { data: history, loading: histLoading } = useApi(
    () => moderationApi.getHistory({ limit: 5 }),
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

  return (
    <div className={styles.page}>
      {/* Check panel */}
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

      {/* Recent checks */}
      <section className={styles.recentPanel}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Последние проверки</h2>
          <a href="/history" className={styles.viewAll}>Все →</a>
        </div>

        {histLoading && (
          <div className={styles.loadingCenter}>
            <Spinner />
          </div>
        )}

        {!histLoading && history && history.length === 0 && (
          <div className={styles.empty}>Проверок пока нет</div>
        )}

        {!histLoading && history && history.length > 0 && (
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>Текст</span>
              <span>Вердикт</span>
              <span>Уверенность</span>
              <span>Время</span>
            </div>
            {history.map((rec) => (
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
