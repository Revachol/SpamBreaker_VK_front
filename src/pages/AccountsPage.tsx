import { useEffect, useMemo, useState } from 'react'
import { moderationApi } from '@/api'
import type { ModeratorAccount, ServicePlatform, VerificationToken } from '@/types'
import styles from './AccountsPage.module.css'

const SERVICES: { id: ServicePlatform; label: string; icon: string }[] = [
  { id: 'telegram', label: 'Telegram', icon: 'T' },
  { id: 'vk', label: 'Vkontakte', icon: 'VK' },
]

type QuotaToken = VerificationToken & {
  id: string
  platform: ServicePlatform
}

function formatDate(value?: string) {
  if (!value) return 'не указана'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ru-RU')
}

function serviceIcon(platform: string) {
  return platform === 'vk' ? 'VK' : 'T'
}

export function AccountsPage() {
  const [service, setService] = useState<ServicePlatform>('telegram')
  const [accounts, setAccounts] = useState<ModeratorAccount[]>([])
  const [quotas, setQuotas] = useState<QuotaToken[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    moderationApi
      .listAccounts(service)
      .then((data) => {
        if (!cancelled) setAccounts(data ?? [])
      })
      .catch(() => {
        if (!cancelled) {
          setAccounts([])
          setError('Не удалось загрузить аккаунты')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [service])

  const serviceQuotas = useMemo(
    () => quotas.filter((quota) => quota.platform === service),
    [quotas, service]
  )

  async function copyToken(token: string) {
    try {
      await navigator.clipboard.writeText(token)
    } catch {
      const el = document.createElement('textarea')
      el.value = token
      el.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(token)
    setTimeout(() => setCopied(null), 1400)
  }

  async function createQuota() {
    setCreating(true)
    setCreateError(null)
    try {
      const token = await moderationApi.initiateAccountVerification(service)
      setQuotas((prev) => [
        {
          ...token,
          id: `${service}-${token.token}`,
          platform: service,
        },
        ...prev,
      ])
    } catch {
      setCreateError('Не удалось создать токен подтверждения')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.togglebar} aria-label="Выбор сервиса">
        {SERVICES.map((item) => (
          <button
            key={item.id}
            className={`${styles.toggleBtn} ${service === item.id ? styles.toggleBtnActive : ''}`}
            onClick={() => setService(item.id)}
            type="button"
          >
            <span className={styles.serviceIcon}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>Аккаунты</h1>
        <button
          className={styles.addBtn}
          onClick={createQuota}
          disabled={creating}
          type="button"
        >
          {creating ? 'Создаем токен...' : '+ Добавить аккаунт'}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {createError && <div className={styles.error}>{createError}</div>}

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionTitle}>Квоты на добавление</div>
            <div className={styles.sectionSub}>Токены подтверждения аккаунта</div>
          </div>
        </div>

        {serviceQuotas.length === 0 ? (
          <div className={styles.empty}>токенов нет</div>
        ) : (
          <div className={styles.list}>
            {serviceQuotas.map((quota) => (
              <div key={quota.id} className={styles.item}>
                <span className={styles.itemIcon}>{serviceIcon(quota.platform)}</span>
                <div className={styles.itemMain}>
                  <div className={styles.tokenRow}>
                    <span className={styles.token} title={quota.token}>{quota.token}</span>
                    <button
                      className={styles.copyBtn}
                      onClick={() => copyToken(quota.token)}
                      type="button"
                    >
                      {copied === quota.token ? 'скопировано' : 'копировать'}
                    </button>
                  </div>
                  <div className={styles.meta}>Истекает: {formatDate(quota.expires_at)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionTitle}>Добавленные аккаунты</div>
            <div className={styles.sectionSub}>Аккаунты пользователя в выбранной соцсети</div>
          </div>
        </div>

        {loading ? (
          <div className={styles.empty}>загрузка...</div>
        ) : accounts.length === 0 ? (
          <div className={styles.empty}>аккаунтов нет</div>
        ) : (
          <div className={styles.list}>
            {accounts.map((account) => (
              <div key={account.id} className={styles.item}>
                <span className={styles.itemIcon}>{serviceIcon(account.platform)}</span>
                <div className={styles.itemMain}>
                  <div className={styles.accountName}>{account.account_id}</div>
                  <div className={styles.meta}>Верификация: {formatDate(account.verified_at)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
