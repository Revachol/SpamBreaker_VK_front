import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { moderationApi } from '@/api'
import styles from './TelegramSetupPage.module.css'

const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'SpamBreakerBot'

const STEPS = [
  {
    num: '01',
    title: 'Добавьте бота в группу',
    desc: (
      <>
        Откройте вашу группу в Telegram, нажмите{' '}
        <strong>Управление группой → Администраторы → Добавить администратора</strong>{' '}
        и найдите бота по имени.
      </>
    ),
    action: (botUsername: string) => (
      <a
        href={`https://t.me/SpamBreakerOff_bot`}
        target="_blank"
        rel="noreferrer"
        className={styles.stepLink}
      >
        Открыть @{botUsername} →
      </a>
    ),
  },
  {
    num: '02',
    title: 'Дайте права администратора',
    desc: (
      <>
        Боту необходимы права{' '}
        <strong>Удаление сообщений</strong> и{' '}
        <strong>Блокировка пользователей</strong>{' '}
        для полноценной работы.
      </>
    ),
  },
  {
    num: '03',
    title: 'Отправьте токен в группе',
    desc: (
      <>
        Скопируйте команду ниже и отправьте её в чат группы. Бот получит её,
        привяжется к вашему аккаунту и начнёт модерацию.
      </>
    ),
  },
]

export function TelegramSetupPage() {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(null)
  const [tokenLoading, setTokenLoading] = useState(true)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [connected, setConnected] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    async function init() {
      // If the bot is already active, skip setup and go to management page
      try {
        await moderationApi.getTelegramBotSettings()
        navigate('/bots/telegram/manage', { replace: true })
        return
      } catch {
        // Not connected yet — continue with setup wizard
      }

      try {
        const data = await moderationApi.getTelegramBotToken()
        setToken(data.token)
        localStorage.setItem('sb_link_token', data.token)
      } catch {
        setTokenError('Не удалось загрузить токен. Обновите страницу.')
      } finally {
        setTokenLoading(false)
      }
    }
    init()
  }, [navigate])

  useEffect(() => {
    if (!token) return

    intervalRef.current = setInterval(async () => {
      try {
        const status = await moderationApi.getTelegramBotStatus(token)
        if (status.connected) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setConnected(true)
          setTimeout(() => navigate('/bots/telegram/manage'), 1200)
        }
      } catch {
        // polling errors — ignore
      }
    }, 3000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [token, navigate])

  async function copyCommand() {
    if (!token) return
    const text = `/connect ${token}`
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // fallback for HTTP / old browsers
      const el = document.createElement('textarea')
      el.value = text
      el.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.backLink}>← Главная</Link>
        <div className={styles.headerCenter}>
          <div className={styles.platformBadge}>
            <span className={styles.platformIcon}>✈</span>
            Telegram
          </div>
        </div>
        <div />
      </header>

      <div className={styles.content}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Подключение Telegram-бота</h1>
          <p className={styles.desc}>
            Следуйте инструкции — займёт около 3 минут.
            После подключения бот начнёт анализировать сообщения в реальном времени.
          </p>
        </div>

        <div className={styles.steps}>
          {STEPS.map((step, i) => (
            <div key={step.num} className={styles.step}>
              <div className={styles.stepLeft}>
                <div className={styles.stepNum}>{step.num}</div>
                {i < STEPS.length - 1 && <div className={styles.stepLine} />}
              </div>
              <div className={styles.stepBody}>
                <div className={styles.stepTitle}>{step.title}</div>
                <div className={styles.stepDesc}>{step.desc}</div>

                {i === 0 && step.action && (
                  <div className={styles.stepAction}>
                    {step.action(BOT_USERNAME)}
                  </div>
                )}

                {i === 2 && (
                  <div className={styles.tokenBlock}>
                    <div className={styles.tokenHeader}>
                      <span className={styles.tokenLabel}>КОМАНДА ДЛЯ ОТПРАВКИ В ЧАТ</span>
                      <button className={styles.copyBtn} onClick={copyCommand} disabled={!token}>
                        {copied ? '✓ Скопировано' : 'Копировать'}
                      </button>
                    </div>
                    {tokenLoading ? (
                      <div className={styles.tokenCode} style={{ color: 'var(--text-muted)' }}>
                        Загрузка токена…
                      </div>
                    ) : tokenError ? (
                      <div className={styles.tokenCode} style={{ color: 'var(--red)', fontSize: '13px' }}>
                        {tokenError}
                      </div>
                    ) : (
                      <div className={styles.tokenCode}>
                        /connect {token}
                      </div>
                    )}
                    <div className={styles.tokenNote}>
                      ⚠️ Отправьте эту команду прямо в чат группы (не боту в личку).
                      Бот должен быть добавлен как администратор.
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.confirmBlock}>
          {connected ? (
            <>
              <div className={styles.connectedIcon}>✓</div>
              <div className={styles.confirmNote} style={{ color: 'var(--accent)', fontWeight: 600 }}>
                Бот подключён! Переходим на страницу управления…
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={styles.spinner} style={{ borderColor: 'rgba(255,255,255,.15)', borderTopColor: 'var(--accent)' }} />
                <span className={styles.confirmNote}>
                  Ожидаем подключения бота…
                </span>
              </div>
              <div className={styles.confirmNote} style={{ fontSize: '12px', opacity: 0.6 }}>
                Отправьте команду в группу — страница обновится автоматически
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
