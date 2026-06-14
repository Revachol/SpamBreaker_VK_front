import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { useState } from 'react'
import styles from './LandingPage.module.css'

export function LandingPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false)

  function handleLogout() {
    clearAuth()
    navigate('/', { replace: true })
  }

  return (
    <div className={styles.page}>
      {/* ── Navbar ── */}
      <header className={styles.nav}>
        <div className={styles.navLogo}>
          <span className={styles.navLogoMark}>SB</span>
          <span className={styles.navLogoName}>SpamBreaker</span>
        </div>
        <div className={styles.navLinks}>
          <Link to="/docs" className={styles.navLink}>Docs</Link>
          {isAuthenticated ? (
            <>
              <Link to="/accounts" className={styles.navLink}>
                Личный кабинет
              </Link>
              <span className={styles.navUser}>{user?.login ?? 'Аккаунт'}</span>
              <button className={styles.navBtnOutline} onClick={handleLogout}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.navBtnOutline}>Войти</Link>
              <Link to="/register" className={styles.navBtnFill}>Регистрация</Link>
            </>
          )}
        </div>
      </header>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroLeft}>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeTag}>BETA</span>
              <span>ML-фильтрация · TinyBERT · PyTorch</span>
            </div>
            <h1 className={styles.heroTitle}>
              Анализ тональности<br />
              <span className={styles.heroTitleAccent}>без лишнего шума</span>
            </h1>
            <p className={styles.heroDesc}>
              SpamBreaker определяет позитив, нейтральный тон и негатив в тексте.
              Подключите API в несколько строк или используйте готовые интеграции.
            </p>
            {!isAuthenticated && (
              <div className={styles.heroCta}>
                <Link to="/register" className={styles.ctaPrimary}>
                  Начать бесплатно <span className={styles.ctaArrow}>→</span>
                </Link>
                <Link to="/docs" className={styles.ctaSecondary}>Документация API</Link>
              </div>
            )}
          </div>

          <div className={styles.heroRight}>
            <div className={styles.terminal}>
              <div className={styles.terminalHeader}>
                <span className={styles.terminalHost}>spambreaker</span>
                <span className={styles.terminalAt}>@</span>
                <span className={styles.terminalPath}>api:~/v1/check</span>
              </div>
              <pre className={styles.terminalCmd}>{`$ curl -X POST /api/bot/v1/telegram/check \\
  -H "Content-Type: application/json" \\
  -d '{
    "text":    "Купить подписчиков дёшево!",
    "chat_id": 42
  }'`}</pre>
              <div className={styles.terminalDivider} />
              <pre className={styles.terminalOutput}>{`{
  "label":      "negative",
  "confidence": 0.97,
  "action":     "deleted"
}`}</pre>
              <div className={styles.terminalFooter}>
                <span className={styles.terminalStatus}>● SPAM</span>
                <span className={styles.terminalStatusLabel}>сообщение удалено</span>
                <div className={styles.terminalSpacer} />
                <span className={styles.terminalPromptStr}>$</span>
                <span className={styles.terminalCursor} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className={styles.features}>
        <div
          className={styles.featureCard}
          onClick={() => setIsPlatformModalOpen(true)}
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.featureIconWrap}><span className={styles.featureIcon}>⚡</span></div>
          <div className={styles.featureContent}>
            <div className={styles.featureTag}>Для команд</div>
            <h2 className={styles.featureTitle}>Готовые решения</h2>
            <p className={styles.featureDesc}>
              Панель управления с историей проверок, статистикой и мониторингом состояния сервиса.
            </p>
            <div className={styles.featureFooter}>
              <span>Выбрать платформу</span>
              <span className={styles.featureArrow}>→</span>
            </div>
          </div>
        </div>
        <Link to="/docs" className={`${styles.featureCard} ${styles.featureCardAlt}`}>
          <div className={styles.featureIconWrap}><span className={styles.featureIcon}>{'</>'}</span></div>
          <div className={styles.featureContent}>
            <div className={`${styles.featureTag} ${styles.featureTagAlt}`}>Для разработчиков</div>
            <h2 className={styles.featureTitle}>Подключить API</h2>
            <p className={styles.featureDesc}>
              REST API с JSON-ответами. Один POST-запрос — и вы получаете вердикт с вероятностями всех классов.
            </p>
            <div className={styles.featureFooter}>
              <span>Читать документацию</span>
              <span className={styles.featureArrow}>→</span>
            </div>
          </div>
        </Link>
      </section>

      {/* ── How it works ── */}
      <section className={styles.process}>
        <div className={styles.processGrid}>
          {[
            {
              num: '01',
              label: 'Подключите бота',
              desc: 'Добавьте в Telegram-группу и выполните /connect TOKEN — займёт меньше минуты',
            },
            {
              num: '02',
              label: 'Настройте правила',
              desc: 'Порог токсичности, список стоп-слов, реакция при нарушении: уведомить, удалить или забанить',
            },
            {
              num: '03',
              label: 'Модерация работает',
              desc: 'ML анализирует каждое сообщение автоматически, в реальном времени — без вашего участия',
            },
          ].map(({ num, label, desc }) => (
            <div key={num} className={styles.processStep}>
              <span className={styles.processNum}>{num}</span>
              <div className={styles.processLabel}>{label}</div>
              <div className={styles.processDesc}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Docs CTA ── */}
      <section className={styles.docsCta}>
        <div className={styles.docsCtaInner}>
          <div>
            <h3 className={styles.docsCtaTitle}>Полная документация API</h3>
            <p className={styles.docsCtaDesc}>Эндпоинты, схемы данных, примеры запросов на cURL.</p>
          </div>
          <Link to="/docs" className={styles.docsCtaBtn}>Открыть документацию →</Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>SpamBreaker · v0.0.1</span>
        <span className={styles.footerDim}>TinyBERT · Go · PostgreSQL</span>
      </footer>

      {/* Platform Selection Modal */}
      {isPlatformModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsPlatformModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Выберите платформу</h2>
              <button
                className={styles.modalClose}
                onClick={() => setIsPlatformModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.platformCards}>
                {/* Telegram — active */}
                <Link to="/bots/telegram" className={styles.platformCard}>
                  <div className={styles.platformCardTop}>
                    <div className={`${styles.platformIcon} ${styles.platformIconTg}`}>
                      <TelegramIcon />
                    </div>
                    <div className={styles.platformBadge}>Доступно</div>
                  </div>
                  <h3 className={styles.platformName}>Telegram</h3>
                  <p className={styles.platformDesc}>
                    Добавьте бота в группу или канал. Он будет модерировать сообщения в реальном времени.
                  </p>
                  <div className={styles.platformFooter}>
                    <span>Подключить</span>
                    <span className={styles.platformArrow}>→</span>
                  </div>
                </Link>

                {/* VK — disabled */}
                <div className={`${styles.platformCard} ${styles.platformCardDisabled}`}>
                  <div className={styles.platformCardTop}>
                    <div className={`${styles.platformIcon} ${styles.platformIconVk}`}>
                      <VkIcon />
                    </div>
                    <div className={`${styles.platformBadge} ${styles.platformBadgeSoon}`}>Скоро</div>
                  </div>
                  <h3 className={styles.platformName}>ВКонтакте</h3>
                  <p className={styles.platformDesc}>
                    Интеграция с сообществами ВКонтакте находится в разработке.
                  </p>
                  <div className={styles.platformFooter}>
                    <span className={styles.platformFooterMuted}>Недоступно</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TelegramIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function VkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 9V15M7 12H10M10 9V15M13 9V15M13 12C13 12 13 10 15.5 10C16.9 10 17 11 17 12V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
