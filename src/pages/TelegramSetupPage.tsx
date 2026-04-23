import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { moderationApi } from '@/api'
// @ts-expect-error - Type is used indirectly through API calls
import type { TelegramBotToken } from '@/types'
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
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)
  const [retriesLeft, setRetriesLeft] = useState(0)

  const linkCommand = linkToken ? `/link ${linkToken}` : '/link ...'

  // Получаем токен с бэкенда
  useEffect(() => {
    async function fetchToken() {
      try {
        setLoading(true)
        const response = await moderationApi.getTelegramBotToken()
        setLinkToken(response.token)
        // Сохраняем токен в localStorage чтобы страница управления знала что делать
        localStorage.setItem('sb_link_token', response.token)
      } catch (err) {
        setError('Не удалось получить токен для подключения бота')
        console.error('Failed to fetch Telegram bot token:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchToken()
    }
  }, [user])
  function handleCopy() {
    navigator.clipboard.writeText(linkCommand).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function checkBotStatusWithRetry(retries = 3) {
    if (!linkToken) return false
    
    setRetrying(true)
    setRetriesLeft(retries)
    
    try {
      // Проверяем статус бота с бэкенда
      const status = await moderationApi.getTelegramBotStatus(linkToken)
      if (status.connected) {
        setRetrying(false)
        return true
      } else {
        // Бот еще не подключен
        if (retries > 0) {
          // Показываем сообщение о повторной попытке
          setError(`Бот еще не подключен. Повторная попытка через 3 секунды... (${retries} попыток осталось)`)
          setRetriesLeft(retries)
          // Ждем 3 секунды и повторяем попытку
          await new Promise(resolve => setTimeout(resolve, 3000))
          return await checkBotStatusWithRetry(retries - 1)
        } else {
          setError('Бот еще не подключен. Убедитесь, что вы отправили команду боту и попробуйте снова.')
          setRetrying(false)
          return false
        }
      }
    } catch (err) {
      if (retries > 0) {
        // Показываем сообщение о повторной попытке
        setError(`Ошибка при проверке статуса бота. Повторная попытка через 3 секунды... (${retries} попыток осталось)`)
        setRetriesLeft(retries)
        // Ждем 3 секунды и повторяем попытку
        await new Promise(resolve => setTimeout(resolve, 3000))
        return await checkBotStatusWithRetry(retries - 1)
      } else {
        setError('Не удалось проверить статус бота. Попробуйте позже.')
        console.error('Failed to check Telegram bot status:', err)
        setRetrying(false)
        return false
      }
    }
  }

  async function handleConfirm() {
    if (!linkToken) return
    
    setConfirming(true)
    setError(null)
    
    const isConnected = await checkBotStatusWithRetry()
    if (isConnected) {
      // Бот успешно подключен, переходим на страницу управления
      navigate('/bots/telegram/manage')
    }
    
    setConfirming(false)
  }

  function handleCancelRetry() {
    // Cancel the retry process
    setRetrying(false)
    setConfirming(false)
    setError('Проверка подключения отменена. Нажмите кнопку снова, чтобы попробовать еще раз.')
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
          
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}
          
          {retrying ? (
            <div className={styles.confirmBtn} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={styles.spinner} />
                Проверяем подключение… ({retriesLeft} попыток осталось)
              </div>
              <button
                className={styles.copyBtn}
                onClick={handleCancelRetry}
                style={{ width: '100%' }}
              >
                Отменить проверку
              </button>
            </div>
          ) : (
            <button
              className={styles.confirmBtn}
              onClick={handleConfirm}
              disabled={confirming || !linkToken || loading}
            >
              {confirming && <span className={styles.spinner} />}
              {confirming ? 'Проверяем подключение…' : '✓ Я подключил бота'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}