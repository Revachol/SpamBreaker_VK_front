import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import styles from './TelegramSetupPage.module.css'

// Имитация получения токена с бэкенда.
// TODO: заменить на реальный вызов GET /api/v1/bots/telegram/token
function generateLinkToken(userId: string): string {
  const base = btoa(`${userId}:${Date.now()}`).replace(/=/g, '').slice(0, 24)
  return `SB-${base.toUpperCase()}`
}

const BOT_USERNAME = 'SpamBreakerBot' // TODO: вынести в env

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
        href={`https://t.me/${botUsername}`}
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
        для полноценной работы. Минимум — права на чтение сообщений.
      </>
    ),
  },
  {
    num: '03',
    title: 'Отправьте ключ активации',
    desc: (
      <>
        Напишите боту в вашей группе следующую команду. Бот привяжет чат
        к вашему аккаунту и начнёт работу.
      </>
    ),
  },
]

export function TelegramSetupPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const linkToken = user ? generateLinkToken(user.id) : '...'
  const linkCommand = `/link ${linkToken}`

  // Сохраняем токен в localStorage чтобы страница управления знала что делать
  useEffect(() => {
    if (linkToken !== '...') {
      localStorage.setItem('sb_link_token', linkToken)
    }
  }, [linkToken])

  function handleCopy() {
    navigator.clipboard.writeText(linkCommand).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function handleConfirm() {
    setConfirming(true)
    // TODO: GET /api/v1/bots/telegram/status?token=... чтобы проверить что бот привязался
    // Пока просто переходим на страницу управления
    await new Promise((r) => setTimeout(r, 800))
    navigate('/bots/telegram/manage')
  }

  return (
    <div className={styles.page}>
      {/* Header */}
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

        {/* Steps */}
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

                {/* Step 1 action */}
                {i === 0 && step.action && (
                  <div className={styles.stepAction}>
                    {step.action(BOT_USERNAME)}
                  </div>
                )}

                {/* Step 3 — token block */}
                {i === 2 && (
                  <div className={styles.tokenBlock}>
                    <div className={styles.tokenHeader}>
                      <span className={styles.tokenLabel}>Команда для отправки в группу</span>
                      <button className={styles.copyBtn} onClick={handleCopy}>
                        {copied ? '✓ Скопировано' : 'Копировать'}
                      </button>
                    </div>
                    <pre className={styles.tokenCode}>{linkCommand}</pre>
                    <div className={styles.tokenNote}>
                      ⚠️ Ключ привязан к вашему аккаунту. Не передавайте его третьим лицам.
                      Токен действителен 24 часа.
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Confirm button */}
        <div className={styles.confirmBlock}>
          <div className={styles.confirmNote}>
            После того как отправили команду боту — нажмите кнопку ниже.
          </div>
          <button
            className={styles.confirmBtn}
            onClick={handleConfirm}
            disabled={confirming}
          >
            {confirming && <span className={styles.spinner} />}
            {confirming ? 'Проверяем подключение…' : '✓ Я подключил бота'}
          </button>
        </div>
      </div>
    </div>
  )
}