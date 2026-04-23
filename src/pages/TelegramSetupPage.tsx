import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
        для полноценной работы. Минимум — права на чтение сообщений.
      </>
    ),
  },
  {
    num: '03',
    title: 'Введите ID чата',
    desc: (
      <>
        Введите ID или username вашей группы Telegram. Бот проверит, что он находится в чате
        и активирует модерацию.
      </>
    ),
  },
]


export function TelegramSetupPage() {
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const [chatId, setChatId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)


  async function handleConfirm() {
    if (!chatId.trim()) {
      setError('Пожалуйста, введите ID чата')
      return
    }
    
    setConfirming(true)
    setError(null)
    
    try {
      // Проверяем и активируем бота через новый API
      const response = await moderationApi.verifyTelegramChat(chatId.trim())
      if (response.success && response.verified) {
        // Бот успешно подключен, переходим на страницу управления
        navigate('/bots/telegram/manage')
      } else {
        setError(response.message || 'Не удалось активировать бота')
      }
    } catch (err) {
      setError('Не удалось активировать бота. Убедитесь, что бот добавлен в чат и имеет необходимые права.')
      console.error('Failed to verify Telegram chat:', err)
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

                {/* Step 3 — chat ID input */}
                {i === 2 && (
                  <div className={styles.tokenBlock}>
                    <div className={styles.tokenHeader}>
                      <span className={styles.tokenLabel}>ID или username чата</span>
                    </div>
                    <input
                      type="text"
                      value={chatId}
                      onChange={(e) => setChatId(e.target.value)}
                      placeholder="Введите ID чата или @username"
                      className={styles.chatIdInput}
                    />
                    <div className={styles.tokenNote}>
                      ⚠️ Бот должен быть добавлен в чат как администратор перед активацией.
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
            После того как добавили бота в чат и дали ему права — введите ID чата и нажмите кнопку ниже.
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
                Проверяем подключение…
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
              disabled={confirming || !chatId.trim()}
            >
              {confirming && <span className={styles.spinner} />}
              {confirming ? 'Проверяем подключение…' : '✓ Проверить и активировать'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}