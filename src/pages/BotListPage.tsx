import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { moderationApi } from '@/api'
import type { TelegramBot } from '@/types'
import styles from './BotListPage.module.css'

function StatusDot({ status }: { status: TelegramBot['status'] }) {
  const cls =
    status === 'active'    ? styles.dotActive :
    status === 'suspended' ? styles.dotSuspended :
                             styles.dotInactive
  return <div className={`${styles.statusDot} ${cls}`} />
}

function statusLabel(status: TelegramBot['status']) {
  if (status === 'active')    return 'Активен'
  if (status === 'suspended') return 'Заблокирован'
  return 'Не подключён'
}

export function BotListPage() {
  const navigate = useNavigate()
  const [bots, setBots] = useState<TelegramBot[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    moderationApi.listTelegramBots()
      .then(setBots)
      .catch(() => {/* список пуст или ошибка — показываем empty state */})
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate() {
    setCreating(true)
    setCreateError(null)
    try {
      const bot = await moderationApi.createTelegramBot(newName.trim() || 'Telegram Bot')
      setShowDialog(false)
      setNewName('')
      navigate(`/bots/telegram/${bot.id}/setup`)
    } catch {
      setCreateError('Не удалось создать бота. Попробуйте ещё раз.')
    } finally {
      setCreating(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleCreate()
    if (e.key === 'Escape') { setShowDialog(false); setNewName('') }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Telegram-боты</h1>
        <button className={styles.addBtn} onClick={() => { setShowDialog(true); setCreateError(null) }}>
          + Добавить бота
        </button>
      </div>

      {loading ? null : bots.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>✈</div>
          <div className={styles.emptyTitle}>Ботов пока нет</div>
          <div className={styles.emptyDesc}>
            Добавьте первого бота и подключите его к Telegram-группе
          </div>
          <button className={styles.addBtn} onClick={() => setShowDialog(true)}>
            + Добавить бота
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {bots.map((bot) => (
            <div key={bot.id} className={styles.card}>
              <StatusDot status={bot.status} />
              <div className={styles.info}>
                <div className={styles.botName}>{bot.name}</div>
                <div className={styles.botMeta}>
                  {statusLabel(bot.status)}
                  {bot.chat_id && (
                    <> · <span className={styles.chatId}>{bot.chat_id}</span></>
                  )}
                </div>
              </div>
              <button
                className={styles.manageBtn}
                onClick={() => navigate(`/bots/telegram/${bot.id}`)}
              >
                Настроить →
              </button>
            </div>
          ))}
        </div>
      )}

      {showDialog && (
        <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) { setShowDialog(false); setNewName('') } }}>
          <div className={styles.dialog}>
            <div className={styles.dialogTitle}>Новый Telegram-бот</div>
            <input
              className={styles.dialogInput}
              type="text"
              placeholder="Название бота (например: Основной бот)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              maxLength={64}
            />
            {createError && <div className={styles.error}>{createError}</div>}
            <div className={styles.dialogActions}>
              <button className={styles.cancelBtn} onClick={() => { setShowDialog(false); setNewName('') }}>
                Отмена
              </button>
              <button className={styles.createBtn} onClick={handleCreate} disabled={creating}>
                {creating ? <span className={styles.spinner} /> : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
