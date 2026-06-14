import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { moderationApi } from '@/api'
import { useAuthStore } from '@/store'
import { BotStatsTab } from './BotStatsTab'
import type { AdminInfo, BotInfo, CheckRecord, ServicePlatform } from '@/types'
import styles from './BotManagePage.module.css'

type SensitivityLevel = 'soft' | 'medium' | 'strict'
type BotTab = 'info' | 'settings' | 'admins' | 'stats'

const LEVEL_THRESHOLD: Record<SensitivityLevel, number> = {
  soft: 70,
  medium: 30,
  strict: 5,
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
    desc: 'Шутки, подколы и лёгкий стёб допустимы. Бот реагирует только на очевидный спам и жёсткий контент.',
    blocks: ['Спам и реклама', 'Угрозы физического вреда', 'Ссылки казино/фарм'],
    allows: ['Подколы и троллинг', 'Лёгкий мат в контексте', 'Острые шутки'],
    color: 'var(--accent)',
    dim: 'rgba(0, 229, 160, 0.06)',
  },
  {
    id: 'medium',
    name: 'Умеренный',
    tagline: 'Большой чат',
    desc: 'Нейтральный юмор проходит, прямые оскорбления блокируются. Баланс для активных сообществ.',
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

function normalizeService(value?: string): ServicePlatform {
  return value === 'vk' ? 'vk' : 'telegram'
}

function valueToLevel(v: number): SensitivityLevel {
  const value = v > 1 ? v : v * 100
  if (value >= 50) return 'soft'
  if (value >= 15) return 'medium'
  return 'strict'
}

function formatDate(value?: string) {
  if (!value) return 'не указана'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ru-RU')
}

function statusLabel(status?: string) {
  if (status === 'active') return 'Активен'
  if (status === 'inactive') return 'Не активен'
  if (status === 'suspended') return 'Выключен'
  return 'Недоступен'
}

function verdictLabel(label: string) {
  if (label === 'positive') return 'Позитив'
  if (label === 'neutral') return 'Нейтрал'
  if (label === 'negative') return 'Негатив'
  return label
}

function InfoField({ label, value }: { label: string; value?: string }) {
  return (
    <div className={styles.infoField}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value || 'не указано'}</span>
    </div>
  )
}

export function BotManagePage() {
  const { botId, service: serviceParam } = useParams<{ botId: string; service?: string }>()
  const navigate = useNavigate()
  const service = normalizeService(serviceParam)
  const { user } = useAuthStore()

  const [activeTab, setActiveTab] = useState<BotTab>('info')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [bot, setBot] = useState<BotInfo | null>(null)
  const [history, setHistory] = useState<CheckRecord[]>([])
  const [admins, setAdmins] = useState<AdminInfo[]>([])

  const [sensitivityLevel, setSensitivityLevel] = useState<SensitivityLevel>('medium')
  const [sensitivitySaved, setSensitivitySaved] = useState(false)
  const [savingS, setSavingS] = useState(false)
  const [switchingStatus, setSwitchingStatus] = useState(false)

  const [bannedInput, setBannedInput] = useState('')
  const [bannedWords, setBannedWords] = useState<string[]>([])
  const [savingB, setSavingB] = useState(false)
  const [bannedSaved, setBannedSaved] = useState(false)

  const [adminInput, setAdminInput] = useState('')
  const [addingAdmin, setAddingAdmin] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)
  const [adminSaved, setAdminSaved] = useState(false)

  useEffect(() => {
    if (!botId) {
      navigate(`/bots/${service}`, { replace: true })
      return
    }

    let cancelled = false

    async function fetchAll() {
      try {
        setLoading(true)
        setError(null)

        const [botInfo, settings, botHistory, adminList] = await Promise.all([
          moderationApi.getBot(botId!),
          moderationApi.getBotSettings(botId!),
          moderationApi.getBotHistory(botId!, { limit: 12, offset: 0 }).catch(() => []),
          moderationApi.getBotAdmins(botId!).catch(() => []),
        ])

        if (cancelled) return
        setBot(botInfo)
        setSensitivityLevel(valueToLevel(settings.sensitivity))
        setBannedWords(settings.banned_words ?? [])
        setHistory(botHistory)
        setAdmins(adminList)
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status
        if (status === 404 || status === 403) {
          navigate(`/bots/${service}`, { replace: true })
        } else if (!cancelled) {
          setError('Не удалось загрузить данные бота')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAll()

    return () => {
      cancelled = true
    }
  }, [botId, navigate, service])

  const recentHistory = useMemo(() => history.slice(0, 6), [history])

  async function handleSaveSensitivity() {
    if (!botId) return
    setSavingS(true)
    setSensitivitySaved(false)
    setError(null)
    try {
      await moderationApi.updateBotSettings(botId, {
        sensitivity: LEVEL_THRESHOLD[sensitivityLevel],
      })
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
      await moderationApi.updateBotSettings(botId, { banned_words: bannedWords })
      setBannedSaved(true)
      setTimeout(() => setBannedSaved(false), 2500)
    } catch {
      setError('Не удалось сохранить список запрещённых слов')
    } finally {
      setSavingB(false)
    }
  }

  async function handleToggleBot(nextEnabled: boolean) {
    if (!botId) return
    setSwitchingStatus(true)
    setError(null)
    try {
      await moderationApi.setBotActive(botId, nextEnabled)
      const updatedBot = await moderationApi.getBot(botId)
      const expectedStatus = nextEnabled ? 'active' : 'suspended'

      if (updatedBot.status !== expectedStatus) {
        throw new Error('Unexpected bot status')
      }

      setBot(updatedBot)
    } catch {
      setError(nextEnabled ? 'Не удалось включить бота' : 'Не удалось отключить бота')
    } finally {
      setSwitchingStatus(false)
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
      const updated = await moderationApi.addBotAdmin(botId, username)
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
      const updated = await moderationApi.removeBotAdmin(botId, username)
      setAdmins(updated ?? [])
    } catch {
      setAdminError('Не удалось удалить администратора')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.tabs}>
        {[
          ['info', 'Инфо'],
          ['settings', 'Настройки'],
          ['admins', 'Админы'],
          ['stats', 'Статистика'],
        ].map(([id, label]) => (
          <button
            key={id}
            className={`${styles.tab} ${activeTab === id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(id as BotTab)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.statusBanner}>
        <div className={styles.statusDot} />
        <span className={styles.statusText}>
          {loading ? 'Загрузка...' : (
            <>
              {bot?.name && <strong>{bot.name} · </strong>}
              {statusLabel(bot?.status)}
            </>
          )}
        </span>
        <span className={styles.statusNote}>{bot?.platform ?? service}</span>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {loading && <div className={styles.loading}>Загрузка данных...</div>}

      {!loading && activeTab === 'info' && (
        <>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Информация по боту</div>
              <div className={styles.cardSub}>Основные данные приложения</div>
            </div>
            <div className={styles.infoGrid}>
              <InfoField label="ID" value={bot?.id} />
              <InfoField label="Название" value={bot?.name} />
              <InfoField label="Платформа" value={bot?.platform ?? service} />
              <InfoField label="Статус" value={statusLabel(bot?.status)} />
              <InfoField label="Внешний ID" value={bot?.external_id} />
              <InfoField label="Аккаунт" value={bot?.own_acc_id} />
              <InfoField label="Владелец" value={bot?.owner_id} />
              <InfoField label="Создан" value={formatDate(bot?.created_at)} />
              <InfoField label="Обновлен" value={formatDate(bot?.updated_at)} />
              <InfoField label="Верифицирован" value={formatDate(bot?.verified_at)} />
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Краткая история модерации</div>
              <div className={styles.cardSub}>Последние проверки по боту</div>
            </div>
            {recentHistory.length === 0 ? (
              <div className={styles.bannedEmpty}>Истории пока нет</div>
            ) : (
              <div className={styles.historyList}>
                {recentHistory.map((record) => (
                  <div key={record.id} className={styles.historyItem}>
                    <span className={styles.historyVerdict}>{verdictLabel(record.label)}</span>
                    <span className={styles.historyText} title={record.text}>
                      {record.text.length > 72 ? `${record.text.slice(0, 72)}...` : record.text}
                    </span>
                    <span className={styles.historyDate}>{formatDate(record.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {!loading && activeTab === 'settings' && (
        <>
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
                    type="button"
                  >
                    <div className={styles.levelCardTop}>
                      <div>
                        <div className={styles.levelName} style={active ? { color: level.color } : {}}>
                          {level.name}
                        </div>
                        <div className={styles.levelTagline}>{level.tagline}</div>
                      </div>
                      <div
                        className={`${styles.levelRadio} ${active ? styles.levelRadioActive : ''}`}
                        style={active ? { borderColor: level.color, background: level.color } : {}}
                      />
                    </div>
                    <p className={styles.levelDesc}>{level.desc}</p>
                    <div className={styles.levelExamples}>
                      <div className={styles.levelCol}>
                        <div className={styles.levelColTitle}>Блокирует</div>
                        {level.blocks.map((b) => (
                          <div key={b} className={styles.levelBlock}>x {b}</div>
                        ))}
                      </div>
                      <div className={styles.levelCol}>
                        <div className={styles.levelColTitle}>Пропускает</div>
                        {level.allows.map((a) => (
                          <div key={a} className={styles.levelAllow}>+ {a}</div>
                        ))}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className={styles.cardFooter}>
              {sensitivitySaved && <span className={styles.savedMsg}>Сохранено</span>}
              <button
                className={styles.saveBtn}
                onClick={handleSaveSensitivity}
                disabled={savingS}
                type="button"
              >
                {savingS && <span className={styles.spinner} />}
                {savingS ? 'Сохраняем...' : 'Сохранить'}
              </button>
            </div>
          </section>

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
                placeholder="Введите слово и нажмите Enter..."
                value={bannedInput}
                onChange={(e) => setBannedInput(e.target.value)}
                onKeyDown={handleAddWord}
              />

              {bannedWords.length > 0 ? (
                <div className={styles.tags}>
                  {bannedWords.map((w) => (
                    <div key={w} className={styles.tag}>
                      <span>{w}</span>
                      <button className={styles.tagRemove} onClick={() => handleRemoveWord(w)} type="button">x</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.bannedEmpty}>
                  Список пуст: введите слово и нажмите Enter
                </div>
              )}
            </div>

            <div className={styles.cardFooter}>
              {bannedSaved && <span className={styles.savedMsg}>Список сохранён</span>}
              <button
                className={styles.saveBtn}
                onClick={handleSaveBanned}
                disabled={savingB}
                type="button"
              >
                {savingB && <span className={styles.spinner} />}
                {savingB ? 'Отправляем...' : `Отправить (${bannedWords.length})`}
              </button>
            </div>
          </section>

          <section className={styles.dangerZone}>
            <div className={styles.dangerTitle}>Опасная зона</div>
            <div className={styles.dangerBlock}>
              <div>
                <div className={styles.dangerLabel}>Состояние бота</div>
                <div className={styles.dangerDesc}>
                  Выключенный бот перестанет анализировать сообщения. Настройки сохранятся.
                </div>
              </div>
              <div className={styles.statusTogglebar}>
                <button
                  className={`${styles.statusToggleBtn} ${bot?.status === 'active' ? styles.statusToggleActive : ''}`}
                  onClick={() => handleToggleBot(true)}
                  disabled={switchingStatus}
                  type="button"
                >
                  Включить
                </button>
                <button
                  className={`${styles.statusToggleBtn} ${bot?.status !== 'active' ? styles.statusToggleActive : ''}`}
                  onClick={() => handleToggleBot(false)}
                  disabled={switchingStatus}
                  type="button"
                >
                  Отключить
                </button>
              </div>
            </div>

          </section>
        </>
      )}

      {!loading && activeTab === 'admins' && (
        <section className={styles.adminsSection}>
          <div className={styles.adminsSectionHeader}>
            <div>
              <div className={styles.adminsSectionTitle}>Администраторы</div>
              <div className={styles.adminsSectionSub}>Пользователи с доступом к управлению ботом</div>
            </div>
            {adminSaved && <span className={styles.savedMsg}>Сохранено</span>}
          </div>

          <div className={styles.adminsInputRow}>
            <input
              className={styles.adminsInput}
              type="text"
              placeholder="Логин пользователя..."
              value={adminInput}
              onChange={(e) => setAdminInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAdmin() } }}
              disabled={addingAdmin}
            />
            <button
              className={styles.adminsAddBtn}
              onClick={handleAddAdmin}
              disabled={addingAdmin || !adminInput.trim()}
              type="button"
            >
              {addingAdmin ? '...' : 'Добавить'}
            </button>
          </div>

          {adminError && <div className={styles.adminsError}>{adminError}</div>}

          {admins.length === 0 ? (
            <div className={styles.adminsEmpty}>админов нет</div>
          ) : (
            <div className={styles.adminsTable}>
              <div className={styles.adminsHead}>
                <span>ИД</span>
                <span>Имя</span>
                <span>Роль</span>
                <span />
              </div>
              {admins.map((a) => (
                <div key={a.id || a.username} className={styles.adminsRow}>
                  <span className={styles.adminId}>{a.id || 'не указан'}</span>
                  <span className={styles.adminName}>@{a.username}</span>
                  <span>{a.role || 'Админ'}</span>
                  <span>
                    {user?.login !== a.username && (
                      <button
                        className={styles.adminTagRemove}
                        onClick={() => handleRemoveAdmin(a.username)}
                        title="Удалить"
                        type="button"
                      >
                        x
                      </button>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {!loading && activeTab === 'stats' && botId && <BotStatsTab botId={botId} />}
    </div>
  )
}
