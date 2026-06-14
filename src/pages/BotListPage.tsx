import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { moderationApi } from '@/api'
import type { ServicePlatform, UserBot, UserBotRole } from '@/types'
import styles from './BotListPage.module.css'

const SERVICES: { id: ServicePlatform; label: string; icon: string }[] = [
  { id: 'telegram', label: 'Telegram', icon: 'T' },
  { id: 'vk', label: 'Vkontakte', icon: 'VK' },
]

type ActivityFilter = 'all' | 'active' | 'inactive'
type RoleFilter = 'all' | UserBotRole
type BotRow = UserBot & {
  role?: UserBotRole
  status?: string
  verified_at?: string
  platform?: string
}

function normalizeService(value?: string): ServicePlatform {
  return value === 'vk' ? 'vk' : 'telegram'
}

function serviceIcon(platform?: string) {
  return platform === 'vk' ? 'VK' : 'T'
}

function roleLabel(role?: string) {
  if (!role) return 'не указана'
  return role === 'moderator' ? 'Модератор' : 'Администратор'
}

function activityLabel(bot: BotRow) {
  if (bot.status === 'active' || (!bot.status && bot.verified_at)) return 'Активен'
  if (bot.status === 'inactive') return 'Не активен'
  if (bot.status === 'suspended') return 'Недоступен'
  return 'Выключен'
}

function isActive(bot: BotRow) {
  return activityLabel(bot) === 'Активен'
}

function statusClass(bot: BotRow) {
  const label = activityLabel(bot)
  if (label === 'Активен') return styles.statusActive
  if (label === 'Не активен') return styles.statusInactive
  if (label === 'Недоступен') return styles.statusUnavailable
  return styles.statusDisabled
}

export function BotListPage() {
  const navigate = useNavigate()
  const { service: serviceParam } = useParams<{ service?: string }>()
  const service = normalizeService(serviceParam)

  const [bots, setBots] = useState<BotRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [activity, setActivity] = useState<ActivityFilter>('all')
  const [role, setRole] = useState<RoleFilter>('all')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    moderationApi
      .listUserBots(service, role === 'all' ? undefined : role)
      .then((data) => {
        if (!cancelled) {
          setBots((data ?? []).map((bot) => ({
            ...bot,
            platform: bot.platform ?? service,
            role: bot.role ?? (role === 'all' ? undefined : role),
          })))
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBots([])
          setError('Не удалось загрузить список ботов')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [service, role])

  const filteredBots = useMemo(() => {
    const q = query.trim().toLowerCase()
    return bots.filter((bot) => {
      const nameMatch = !q || bot.name.toLowerCase().includes(q)
      const activityMatch =
        activity === 'all' ||
        (activity === 'active' ? isActive(bot) : !isActive(bot))
      return nameMatch && activityMatch
    })
  }, [bots, query, activity])

  function selectService(next: ServicePlatform) {
    navigate(`/bots/${next}`)
  }

  return (
    <div className={styles.page}>
      <div className={styles.togglebar} aria-label="Выбор сервиса">
        {SERVICES.map((item) => (
          <button
            key={item.id}
            className={`${styles.toggleBtn} ${service === item.id ? styles.toggleBtnActive : ''}`}
            onClick={() => selectService(item.id)}
            type="button"
          >
            <span className={styles.serviceIcon}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>Боты</h1>
        <div className={styles.controls}>
          <input
            className={styles.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию"
          />
          <select
            className={styles.select}
            value={activity}
            onChange={(e) => setActivity(e.target.value as ActivityFilter)}
          >
            <option value="all">Все</option>
            <option value="active">Активные</option>
            <option value="inactive">Выключенные</option>
          </select>
          <select
            className={styles.select}
            value={role}
            onChange={(e) => setRole(e.target.value as RoleFilter)}
          >
            <option value="all">Все роли</option>
            <option value="admin">Администраторы</option>
            <option value="moderator">Модераторы</option>
          </select>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.empty}>загрузка...</div>
      ) : filteredBots.length === 0 ? (
        <div className={styles.empty}>ботов нет</div>
      ) : (
        <div className={styles.list}>
          {filteredBots.map((bot) => (
            <button
              key={bot.id}
              className={styles.row}
              onClick={() => navigate(`/bots/${service}/${bot.id}`)}
              type="button"
            >
              <span className={styles.rowIcon}>{serviceIcon(bot.platform ?? service)}</span>
              <span className={styles.rowMain}>
                <span className={styles.botName}>{bot.name}</span>
                <span className={styles.botMeta}>
                  Роль: {roleLabel(bot.role)} · Аккаунт: {bot.own_acc_id || 'не указан'}
                </span>
              </span>
              <span className={`${styles.status} ${statusClass(bot)}`}>
                {activityLabel(bot)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
