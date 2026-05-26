import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styles from './BotManagePage.module.css'
import { moderationApi } from '@/api'
import { useAuthStore } from '@/store'
import { BotStatsTab } from './BotStatsTab'
import type { TelegramBotSettings, TelegramBotStatus, AdminInfo } from '@/types'

type SensitivityLevel = 'soft' | 'medium' | 'strict'

const LEVEL_THRESHOLD: Record<SensitivityLevel, number> = {
  soft: 0.7,
  medium: 0.3,
  strict: 0.05,
}

const SENSITIVITY_LEVELS: {
  id: SensitivityLevel
  name: string
  tagline: string
  desc: string
  blocks: string[]
  allows: string[]
  color: string
  dim: string
}[] = [
  {
    id: 'soft',
    name: 'Свободный',
    tagline: 'Чат-тусовка',
    desc: 'Шутки, подколы и лёгкий стёб — окей. Бот реагирует только на очевидный спам и жёсткий контент.',
    blocks: ['Спам и реклама', 'Угрозы физического вреда', 'Ссылки казино/фарм'],
    allows: ['Подколы и троллинг', 'Лёгкий мат в контексте', 'Острые шутки'],
    color: 'var(--accent)',
    dim: 'rgba(0, 229, 160, 0.06)',
  },
  {
    id: 'medium',
    name: 'Умеренный',
    tagline: 'Большой чат',
    desc: 'Нейтральный юмор проходит, прямые оскорбления — нет. Баланс для активных сообществ.',
    blocks: ['Прямые оскорбления', 'Реклама и спам', 'Грубый мат'],
    allows: ['Ирония и сарказм', 'Спорные мнения', 'Нейтральный флуд'],
    color: 'var(--blue)',
    dim: 'rgba(77, 168, 255, 0.06)',
  },
  {
    id: 'strict',
    name: 'Строгий',
    tagline: 'Рабочее пространство',
    desc: 'Только по делу. Для рабочих чатов, поддержки и официальных сообществ.',
    blocks: ['Мат и грубость', 'Любые оскорбления', 'Реклама и офтоп'],
    allows: ['Деловое общение', 'Вопросы по теме', 'Позитивные сообщения'],
    color: 'var(--amber)',
    dim: 'rgba(245, 166, 35, 0.06)',
  },
]

function valueToLevel(v: number): SensitivityLevel {
  if (v >= 0.5) return 'soft'
  if (v >= 0.175) return 'medium'
  return 'strict'
}

export function BotManagePage() {
  const { botId } = useParams<{ botId: string }>()
  const navigate = useNavigate()

  const [sensitivityLevel, setSensitivityLevel] = useState<SensitivityLevel>('medium')
  const [sensitivitySaved, setSensitivitySaved] = useState(false)
  const [savingS, setSavingS] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [bannedInput, setBannedInput] = useState('')
  const [bannedWords, setBannedWords] = useState<string[]>([])
  const [savingB, setSavingB] = useState(false)
  const [bannedSaved, setBannedSaved] = useState(false)

  const [botStatus, setBotStatus] = useState<TelegramBotStatus | null>(null)
  const [botName, setBotName] = useState<string>('')

  const [admins, setAdmins] = useState<AdminInfo[]>([])
  const [adminInput, setAdminInput] = useState('')
  const [addingAdmin, setAddingAdmin] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)
  const [adminSaved, setAdminSaved] = useState(false)

  const [activeTab, setActiveTab] = useState<'settings' | 'stats'>('settings')

  const { user } = useAuthStore()

  useEffect(() => {
    if (!botId) {
      navigate('/bots/telegram', { replace: true })
      return
    }

    async function fetchAll() {
      try {
        setLoading(true)

        const [bot, settings] = await Promise.all([
          moderationApi.getTelegramBot(botId!),
          moderationApi.getTelegramBotSettings(botId!),
        ])

        setBotName(bot.name)
        setSensitivityLevel(valueToLevel(settings.sensitivity))
        setBannedWords(settings.banned_words ?? [])
        setBotStatus({ connected: bot.status === 'active', chat_id: bot.chat_id, activated_at: bot.verified_at })

        try {
          const adminList = await moderationApi.getTelegramAdmins(botId!)
          setAdmins(adminList ?? [])
        } catch {
          // соадмины некритичны
        }
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status
        if (status === 404 || status === 403) {
          navigate('/bots/telegram', { replace: true })
        } else {
          setError('Не удалось загрузить настройки бота')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [botId, navigate])

  async function handleSaveSensitivity() {
    if (!botId) return
    setSavingS(true)
    setSensitivitySaved(false)
    setError(null)
    try {
      await moderationApi.updateTelegramBotSettings(botId, { sensitivity: LEVEL_THRESHOLD[sensitivityLevel] })
      setSensitivitySaved(true)
      setTimeout(() => setSensitivitySaved(false), 2500)
    } catch {
      setError('Не удалось сохранить настройки чувствительности')
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
    if (!botId) return
    setSavingB(true)
    setBannedSaved(false)
    setError(null)
    try {
      await moderationApi.updateTelegramBotSettings(botId, { banned_words: bannedWords })
      setBannedSaved(true)
      setTimeout(() => setBannedSaved(false), 2500)
    } catch {
      setError('Не удалось сохранить список запрещённых слов')
    } finally {
      setSavingB(false)
    }
  }

  async function handleDisableBot() {
    if (!botId) return
    try {
      await moderationApi.disableTelegramBot(botId)
      setBotStatus((prev) => prev ? { ...prev, connected: false } : null)
    } catch {
      setError('Не удалось отключить бота')
    }
  }

  async function handleAddAdmin() {
    if (!botId) return
    const username = adminInput.trim()
    if (!username) return
    setAddingAdmin(true)
    setAdminError(null)
    setAdminSaved(false)
    try {
      const updated = await moderationApi.addTelegramAdmin(botId, username)
      setAdmins(updated ?? [])
      setAdminInput('')
      setAdminSaved(true)
      setTimeout(() => setAdminSaved(false), 2500)
    } catch (e: unknown) {
      const msg = (e as { body?: { error?: string } })?.body?.error
      setAdminError(msg ?? 'Не удалось добавить администратора')
    } finally {
      setAddingAdmin(false)
    }
  }

  async function handleRemoveAdmin(username: string) {
    if (!botId) return
    setAdminError(null)
    try {
      const updated = await moderationApi.removeTelegramAdmin(botId, username)
      setAdmins(updated ?? [])
    } catch {
      setAdminError('Не удалось удалить администратора')
    }
  }

  return (
    <div className={styles.page}>
      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'settings' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Настройки
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'stats' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Статистика
        </button>
      </div>

      {activeTab === 'stats' && <BotStatsTab />}

      {activeTab === 'settings' && <>
      {/* ── Status banner ── */}
      <div className={styles.statusBanner}>
        <div className={styles.statusDot} />
        <span className={styles.statusText}>
          {loading ? 'Загрузка...' : (
            <>
              {botName && <strong>{botName} · </strong>}
              {botStatus?.connected ? 'Бот активен' : 'Бот не активен'}
              {botStatus?.chat_id && (
                <> · <span className={styles.statusChat}>{botStatus.chat_id}</span></>
              )}
            </>
          )}
        </span>
        <span className={styles.statusNote}>
          {loading ? 'Загрузка данных...' : botStatus?.connected
            ? `Подключен ${botStatus.activated_at ? new Date(botStatus.activated_at).toLocaleString('ru-RU') : ''}`
            : 'Бот ещё не подключён'}
        </span>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {!loading && (
        <>
          {/* ── Sensitivity ── */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Чувствительность</div>
              <div className={styles.cardSub}>
                Выберите режим модерации, подходящий вашему сообществу
              </div>
            </div>

            <div className={styles.sensitivityLevels}>
              {SENSITIVITY_LEVELS.map((level) => {
                const active = sensitivityLevel === level.id
                return (
                  <button
                    key={level.id}
                    className={`${styles.levelCard} ${active ? styles.levelCardActive : ''}`}
                    style={active ? { borderColor: level.color, background: level.dim } : {}}
                    onClick={() => setSensitivityLevel(level.id)}
                  >
                    <div className={styles.levelCardTop}>
                      <div>
                        <div className={styles.levelName} style={active ? { color: level.color } : {}}>
                          {level.name}
                        </div>
                        <div className={styles.levelTagline}>{level.tagline}</div>
                      </div>
                      <div className={`${styles.levelRadio} ${active ? styles.levelRadioActive : ''}`}
                        style={active ? { borderColor: level.color, background: level.color } : {}}
                      />
                    </div>
                    <p className={styles.levelDesc}>{level.desc}</p>
                    <div className={styles.levelExamples}>
                      <div className={styles.levelCol}>
                        <div className={styles.levelColTitle}>Блокирует</div>
                        {level.blocks.map((b) => (
                          <div key={b} className={styles.levelBlock}>× {b}</div>
                        ))}
                      </div>
                      <div className={styles.levelCol}>
                        <div className={styles.levelColTitle}>Пропускает</div>
                        {level.allows.map((a) => (
                          <div key={a} className={styles.levelAllow}>✓ {a}</div>
                        ))}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className={styles.cardFooter}>
              {sensitivitySaved && <span className={styles.savedMsg}>✓ Сохранено</span>}
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
                      <button className={styles.tagRemove} onClick={() => handleRemoveWord(w)}>×</button>
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
              {bannedSaved && <span className={styles.savedMsg}>✓ Список сохранён</span>}
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
        </>
      )}

      {!loading && (
        <section className={styles.adminsSection}>
          <div className={styles.adminsSectionHeader}>
            <div>
              <div className={styles.adminsSectionTitle}>Администраторы</div>
              <div className={styles.adminsSectionSub}>
                Другие пользователи с доступом к этой панели управления
              </div>
            </div>
            {adminSaved && <span className={styles.savedMsg}>✓ Сохранено</span>}
          </div>

          <div className={styles.adminsInputRow}>
            <input
              className={styles.adminsInput}
              type="text"
              placeholder="Логин пользователя…"
              value={adminInput}
              onChange={(e) => setAdminInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAdmin() } }}
              disabled={addingAdmin}
            />
            <button
              className={styles.adminsAddBtn}
              onClick={handleAddAdmin}
              disabled={addingAdmin || !adminInput.trim()}
            >
              {addingAdmin ? '…' : 'Добавить'}
            </button>
          </div>

          {adminError && <div className={styles.adminsError}>{adminError}</div>}

          {admins.length === 0 ? (
            <div className={styles.adminsEmpty}>Соадминов пока нет</div>
          ) : (
            <div className={styles.adminsList}>
              {admins.map((a) => (
                <div key={a.id} className={styles.adminTag}>
                  <span className={styles.adminTagName}>@{a.username}</span>
                  {user?.login !== a.username && (
                    <button
                      className={styles.adminTagRemove}
                      onClick={() => handleRemoveAdmin(a.username)}
                      title="Удалить"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
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
            <button className={styles.dangerBtn} onClick={handleDisableBot}>Отключить</button>
          </div>
        </section>
      )}
      </>}
    </div>
  )
}
