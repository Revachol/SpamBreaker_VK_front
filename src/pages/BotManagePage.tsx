import { useState } from 'react'
import styles from './BotManagePage.module.css'

// TODO: загружать с бэкенда GET /api/v1/bots/telegram/settings
const MOCK_CHAT_ID = '@your_group' // заглушка

export function BotManagePage() {
  const [sensitivity, setSensitivity] = useState(70)
  const [sensitivitySaved, setSensitivitySaved] = useState(false)
  const [savingS, setSavingS] = useState(false)

  const [bannedInput, setBannedInput] = useState('')
  const [bannedWords, setBannedWords] = useState<string[]>([])
  const [savingB, setSavingB] = useState(false)
  const [bannedSaved, setBannedSaved] = useState(false)

  async function handleSaveSensitivity() {
    setSavingS(true)
    setSensitivitySaved(false)
    // TODO: POST /api/v1/bots/telegram/settings { sensitivity }
    await new Promise((r) => setTimeout(r, 600))
    setSavingS(false)
    setSensitivitySaved(true)
    setTimeout(() => setSensitivitySaved(false), 2500)
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
    // TODO: POST /api/v1/bots/telegram/settings { banned_words: bannedWords }
    await new Promise((r) => setTimeout(r, 600))
    setSavingB(false)
    setBannedSaved(true)
    setTimeout(() => setBannedSaved(false), 2500)
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
          Бот активен · <span className={styles.statusChat}>{MOCK_CHAT_ID}</span>
        </span>
        {/* TODO: показывать реальный chat_id из бэкенда */}
        <span className={styles.statusNote}>ID чата будет подтянут с бэкенда</span>
      </div>

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

      {/* ── Danger zone ── */}
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
          <button className={styles.dangerBtn}>Отключить</button>
        </div>
      </section>
    </div>
  )
}