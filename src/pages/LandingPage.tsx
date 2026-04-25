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
          <span className={styles.navLogoIcon}>🛡️</span>
          <span className={styles.navLogoName}>SpamBreaker</span>
        </div>
        <div className={styles.navLinks}>
          <Link to="/docs" className={styles.navLink}>Docs</Link>
          {isAuthenticated ? (
            <>
              <Link to="/bots/telegram/manage" className={styles.navLink}>
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
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          ML-powered · TinyBERT + CrossAttention
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
        <div className={styles.heroCode}>
          <div className={styles.heroCodeDots}><span /><span /><span /></div>
          <pre className={styles.heroCodePre}>{`POST /api/v1/check
Content-Type: application/json

{ "text": "Сегодня отличный день!)" }

→ { "label": "positive", "confidence": 0.94 }`}</pre>
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

      {/* ── Platform selection (authenticated) ── */}
      {/* Removed - now using modal approach */}

      {/* ── Stats ── */}
      <section className={styles.stats}>
        {[
          { val: '3',      label: 'класса тональности' },
          { val: '5 000',  label: 'символов максимум'  },
          { val: '<200ms', label: 'медианное время'    },
          { val: 'REST',   label: 'JSON API'           },
        ].map(({ val, label }) => (
          <div key={label} className={styles.statItem}>
            <div className={styles.statVal}>{val}</div>
            <div className={styles.statLabel}>{label}</div>
          </div>
        ))}
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
