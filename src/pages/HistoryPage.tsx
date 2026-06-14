import { useState } from 'react'
import { moderationApi } from '@/api'
import { useApi } from '@/hooks'
import { Badge, ConfidenceBar, Spinner } from '@/components/ui'
import styles from './HistoryPage.module.css'

const PAGE_SIZE = 20

export function HistoryPage() {
  const [offset, setOffset] = useState(0)

  const { data, loading, error, refetch } = useApi(
    () => moderationApi.getHistory({ limit: PAGE_SIZE, offset }),
    [offset]
  )

  const hasPrev = offset > 0
  const hasNext = data ? data.length === PAGE_SIZE : false

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <button className={styles.refreshBtn} onClick={refetch} disabled={loading}>
          {loading ? <Spinner size="sm" /> : '↻'} Обновить
        </button>
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}

      {loading && !data && (
        <div className={styles.loadingCenter}>
          <Spinner size="lg" />
        </div>
      )}

      {!loading && data && data.length === 0 && (
        <div className={styles.empty}>Записей не найдено</div>
      )}

      {data && data.length > 0 && (
        <>
          <div className={styles.tableWrap}>
            <div className={styles.tableHead}>
              <span>ID</span>
              <span>Текст</span>
              <span>Вердикт</span>
              <span>Уверенность</span>
              <span>Positive</span>
              <span>Neutral</span>
              <span>Negative</span>
              <span>Дата</span>
            </div>

            {data.map((rec) => (
              <div key={rec.id} className={styles.tableRow}>
                <span className={styles.cellId} title={rec.id}>
                  {rec.id.slice(0, 8)}…
                </span>
                <span className={styles.cellText} title={rec.text}>
                  {rec.text.length > 50 ? rec.text.slice(0, 50) + '…' : rec.text}
                </span>
                <Badge label={rec.label} />
                <ConfidenceBar value={rec.confidence} />
                <span className={styles.cellScore}>
                  {Math.round((rec.all_scores?.positive ?? 0) * 100)}%
                </span>
                <span className={styles.cellScore}>
                  {Math.round((rec.all_scores?.neutral ?? 0) * 100)}%
                </span>
                <span className={styles.cellScore}>
                  {Math.round((rec.all_scores?.negative ?? 0) * 100)}%
                </span>
                <span className={styles.cellDate}>
                  {new Date(rec.created_at).toLocaleString('ru-RU')}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.pagination}>
            <span className={styles.pageInfo}>
              Записи {offset + 1}–{offset + data.length}
            </span>
            <div className={styles.pageButtons}>
              <button
                className={styles.pageBtn}
                onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
                disabled={!hasPrev || loading}
              >
                ← Назад
              </button>
              <button
                className={styles.pageBtn}
                onClick={() => setOffset((o) => o + PAGE_SIZE)}
                disabled={!hasNext || loading}
              >
                Вперёд →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
