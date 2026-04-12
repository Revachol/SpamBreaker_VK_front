import { Link } from 'react-router-dom'
import styles from './LandingPage.module.css'

export function LandingPage() {
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
          <Link to="/login" className={styles.navBtnOutline}>Войти</Link>
          <Link to="/register" className={styles.navBtnFill}>Регистрация</Link>
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

        <div className={styles.heroCta}>
          <Link to="/register" className={styles.ctaPrimary}>
            Начать бесплатно
            <span className={styles.ctaArrow}>→</span>
          </Link>
          <Link to="/docs" className={styles.ctaSecondary}>
            Документация API
          </Link>
        </div>

        {/* Decorative code snippet */}
        <div className={styles.heroCode}>
          <div className={styles.heroCodeDots}>
            <span /><span /><span />
          </div>
          <pre className={styles.heroCodePre}>{`POST /api/v1/check
Content-Type: application/json

{ "text": "Сегодня отличный день!" }

→ { "label": "positive", "confidence": 0.94 }`}</pre>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className={styles.features}>
        <Link to="/dashboard" className={styles.featureCard}>
          <div className={styles.featureIconWrap}>
            <span className={styles.featureIcon}>⚡</span>
          </div>
          <div className={styles.featureContent}>
            <div className={styles.featureTag}>Для команд</div>
            <h2 className={styles.featureTitle}>Готовые решения</h2>
            <p className={styles.featureDesc}>
              Панель управления с историей проверок, статистикой и мониторингом
              состояния сервиса. Всё готово к работе — просто зарегистрируйтесь.
            </p>
            <div className={styles.featureFooter}>
              <span>Открыть панель</span>
              <span className={styles.featureArrow}>→</span>
            </div>
          </div>
        </Link>

        <Link to="/docs" className={`${styles.featureCard} ${styles.featureCardAlt}`}>
          <div className={styles.featureIconWrap}>
            <span className={styles.featureIcon}>{'</>'}</span>
          </div>
          <div className={styles.featureContent}>
            <div className={`${styles.featureTag} ${styles.featureTagAlt}`}>Для разработчиков</div>
            <h2 className={styles.featureTitle}>Подключить API</h2>
            <p className={styles.featureDesc}>
              REST API с JSON-ответами. Один POST-запрос — и вы получаете вердикт
              с вероятностями всех классов. Без сложных настроек.
            </p>
            <div className={styles.featureFooter}>
              <span>Читать документацию</span>
              <span className={styles.featureArrow}>→</span>
            </div>
          </div>
        </Link>
      </section>

      {/* ── Stats strip ── */}
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
          <div className={styles.docsCtaText}>
            <h3 className={styles.docsCtaTitle}>Полная документация API</h3>
            <p className={styles.docsCtaDesc}>
              Эндпоинты, схемы данных, примеры запросов на cURL.
            </p>
          </div>
          <Link to="/docs" className={styles.docsCtaBtn}>
            Открыть документацию →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <span>SpamBreaker · v0.0.1</span>
        <span className={styles.footerDim}>TinyBERT · Go · PostgreSQL</span>
      </footer>
    </div>
  )
}