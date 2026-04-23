import { useState, useEffect } from 'react'
import styles from './BotManagePage.module.css'
import { moderationApi } from '@/api'
import type { TelegramBotSettings, TelegramBotStatus } from '@/types'

// TODO: загружать с бэкенда GET /api/v1/bots/telegram/settings
const MOCK_CHAT_ID = '@your_group' // заглушка

export function BotManagePage() {
  const [sensitivity, setSensitivity] = useState(70)
  const [sensitivitySaved, setSensitivitySaved] = useState(false)
  const [savingS, setSavingS] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [bannedInput, setBannedInput] = useState('')
  const [bannedWords, setBannedWords] = useState<string[]>([])
  const [savingB, setSavingB] = useState(false)
  const [bannedSaved, setBannedSaved] = useState(false)
  
  const [botStatus, setBotStatus] = useState<TelegramBotStatus | null>(null)

  // Загружаем настройки бота с бэкенда
  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true)
        // Загружаем настройки
        const settings = await moderationApi.getTelegramBotSettings()
        setSensitivity(settings.sensitivity)
        setBannedWords(settings.banned_words)
        
        // Загружаем статус бота
        // TODO: Возможно, стоит объединить эти два эндпоинта
        const token = localStorage.getItem('sb_link_token')
        if (token) {
          try {
            const status = await moderationApi.getTelegramBotStatus(token)
            setBotStatus(status)
          } catch (statusErr) {
            // Если не удалось получить статус бота, возможно токен истек
            setError('Не удалось получить статус бота. Возможно, токен истек. Пройдите процесс подключения заново.')
            console.error('Failed to fetch Telegram bot status:', statusErr)
          }
        } else {
          // Если токен отсутствует, перенаправляем на страницу настройки
          setError('Токен подключения не найден. Пройдите процесс подключения заново.')
        }
      } catch (err) {
        setError('Не удалось загрузить настройки бота')
        console.error('Failed to fetch Telegram bot settings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  async function handleSaveSensitivity() {
    setSavingS(true)
    setSensitivitySaved(false)
    setError(null)
    
    try {
      await moderationApi.updateTelegramBotSettings({ sensitivity })
      setSensitivitySaved(true)
      setTimeout(() => setSensitivitySaved(false), 2500)
    } catch (err) {
      setError('Не удалось сохранить настройки чувствительности')
      console.error('Failed to save sensitivity settings:', err)
    } finally {
      setSavingS(false)
    }
  }

  function handleAddWord(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const word = bannedInput.trim().toLowerCase()
      if (word && !bannedWords.includes(word)) {
        setBannedWords((prev) => [...prev, word])
      }
      setBannedInput('')
    }
  }

  function handleRemoveWord(word: string) {
    setBannedWords((prev) => prev.filter((w) => w !== word))
  }

  async function handleSaveBanned() {
    setSavingB(true)
    setBannedSaved(false)
    setError(null)
    
    try {
      await moderationApi.updateTelegramBotSettings({ banned_words: bannedWords })
      setBannedSaved(true)
      setTimeout(() => setBannedSaved(false), 2500)
    } catch (err) {
      setError('Не удалось сохранить список запрещённых слов')
      console.error('Failed to save banned words:', err)
    } finally {
      setSavingB(false)
    }
  }

  async function handleDisableBot() {
    try {
      await moderationApi.disableTelegramBot()
      // Обновляем статус бота
      setBotStatus(prev => prev ? {...prev, connected: false} : null)
      // Показываем сообщение об успешном отключении
      setError('Бот успешно отключен')
      setTimeout(() => setError(null), 3000)
    } catch (err) {
      setError('Не удалось отключить бота')
      console.error('Failed to disable Telegram bot:', err)
    }
  }

  const sensitivityLabel =
    sensitivity < 40 ? 'Мягкий' :
    sensitivity < 70 ? 'Умеренный' :
    sensitivity < 90 ? 'Строгий' : 'Максимальный'

  const sensitivityColor =
    sensitivity < 40 ? 'var(--accent)' :
    sensitivity < 70 ? 'var(--blue)' :
    sensitivity < 90 ? 'var(--amber)' : 'var(--red)'

  return (
    <div className={styles.page}>
      {/* ── Status banner ── */}
      <div className={styles.statusBanner}>
        <div className={styles.statusDot} />
        <span className={styles.statusText}>
          {loading ? 'Загрузка...' : botStatus?.connected ? 'Бот активен' : 'Бот не активен'} ·{' '}
          <span className={styles.statusChat}>
            {botStatus?.chat_id || MOCK_CHAT_ID}
          </span>
        </span>
        {loading ? (
          <span className={styles.statusNote}>Загрузка данных...</span>
        ) : (
          <span className={styles.statusNote}>
            {botStatus?.connected
              ? `Подключен ${botStatus.activated_at ? new Date(botStatus.activated_at).toLocaleString('ru-RU') : ''}`
              : 'Бот еще не подключен'}
          </span>
        )}
      </div>
      
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
      
      {error && !loading && (
        <div className={styles.errorActions}>
          <button
            className={styles.retryBtn}
            onClick={() => {
              // Очищаем ошибку и перенаправляем на страницу настройки
              setError(null)
              window.location.href = '/bots/telegram'
            }}
          >
            Переподключить бота
          </button>
        </div>
      )}
      
      {!loading && (
        <div className={styles.grid}>
          {/* ── Sensitivity ── */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Чувствительность</div>
              <div className={styles.cardSub}>
                Порог вероятности негатива, при котором бот реагирует
              </div>
            </div>

            <div className={styles.sliderWrap}>
              <div className={styles.sliderTop}>
                <span className={styles.sliderLabel}>Порог срабатывания</span>
                <span className={styles.sliderValue} style={{ color: sensitivityColor }}>
                  {sensitivity}% — {sensitivityLabel}
                </span>
              </div>

              <input
                className={styles.slider}
                type="range"
                min={10}
                max={99}
                step={1}
                value={sensitivity}
                onChange={(e) => setSensitivity(Number(e.target.value))}
                style={{ '--val': `${(sensitivity - 10) / 89 * 100}%` } as React.CSSProperties}
              />

              <div className={styles.sliderTicks}>
                <span>Мягкий</span>
                <span>Умеренный</span>
                <span>Строгий</span>
                <span>Макс.</span>
              </div>
            </div>

            <div className={styles.cardFooter}>
              {sensitivitySaved && (
                <span className={styles.savedMsg}>✓ Сохранено</span>
              )}
              <button
                className={styles.saveBtn}
                onClick={handleSaveSensitivity}
                disabled={savingS}
              >
                {savingS && <span className={styles.spinner} />}
                {savingS ? 'Сохраняем…' : 'Сохранить'}
              </button>
            </div>
          </section>

          {/* ── Banned words ── */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Запрещённые слова</div>
              <div className={styles.cardSub}>
                Сообщения с этими словами блокируются вне зависимости от оценки ML
              </div>
            </div>

            <div className={styles.bannedWrap}>
              <input
                className={styles.bannedInput}
                type="text"
                placeholder="Введите слово и нажмите Enter…"
                value={bannedInput}
                onChange={(e) => setBannedInput(e.target.value)}
                onKeyDown={handleAddWord}
              />

              {bannedWords.length > 0 ? (
                <div className={styles.tags}>
                  {bannedWords.map((w) => (
                    <div key={w} className={styles.tag}>
                      <span>{w}</span>
                      <button className={styles.tagRemove} onClick={() => handleRemoveWord(w)}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.bannedEmpty}>
                  Список пуст — введите слово и нажмите Enter
                </div>
              )}
            </div>

            <div className={styles.cardFooter}>
              {bannedSaved && (
                <span className={styles.savedMsg}>✓ Список сохранён</span>
              )}
              <button
                className={styles.saveBtn}
                onClick={handleSaveBanned}
                disabled={savingB || bannedWords.length === 0}
              >
                {savingB && <span className={styles.spinner} />}
                {savingB ? 'Отправляем…' : `Отправить (${bannedWords.length})`}
              </button>
            </div>
          </section>
        </div>
      )}

      {!loading && (
        <section className={styles.dangerZone}>
          <div className={styles.dangerTitle}>Опасная зона</div>
          <div className={styles.dangerRow}>
            <div>
              <div className={styles.dangerLabel}>Отключить бота</div>
              <div className={styles.dangerDesc}>
                Бот перестанет анализировать сообщения. Настройки сохранятся.
              </div>
            </div>
            {/* TODO: POST /api/v1/bots/telegram/disable */}
            <button className={styles.dangerBtn} onClick={handleDisableBot}>Отключить</button>
          </div>
        </section>
      )}
    </div>
  )
}