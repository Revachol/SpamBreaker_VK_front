import { useState } from 'react'
import styles from './DocsPage.module.css'

/* ── Types ── */
type Method = 'GET' | 'POST'

interface Param {
  name: string
  type: string
  required: boolean
  description: string
}

interface ResponseExample {
  label: string
  code: string
}

interface Endpoint {
  id: string
  method: Method
  path: string
  summary: string
  description: string
  params?: Param[]
  paramKind?: 'query' | 'path' | 'body'
  examples: ResponseExample[]
  statuses: { code: number | string; desc: string }[]
}

/* ── Data ── */
const ENDPOINTS: Endpoint[] = [
  {
    id: 'health',
    method: 'GET',
    path: '/health',
    summary: 'Статус сервиса',
    description:
      'Health-check для Docker и оркестраторов. Возвращает статус ok и текущее время сервера (UTC). Не требует параметров.',
    examples: [
      {
        label: 'cURL',
        code: `curl -X GET "http://localhost:8080/health"`,
      },
      {
        label: 'Response 200',
        code: `{\n  "status": "ok",\n  "ts": "2025-01-15T14:30:00Z"\n}`,
      },
    ],
    statuses: [{ code: 200, desc: 'Сервис работает нормально.' }],
  },
  {
    id: 'check',
    method: 'POST',
    path: '/api/v1/check',
    summary: 'Проверить текст',
    description:
      'Основной эндпоинт. Отправляет текст в ML-сервис, получает вердикт тональности, сохраняет запись в PostgreSQL и возвращает результат. Ошибка сохранения не блокирует ответ клиенту.',
    paramKind: 'body',
    params: [
      {
        name: 'text',
        type: 'string',
        required: true,
        description: 'Текст для анализа. Макс. 5 000 символов. Пустые строки недопустимы.',
      },
    ],
    examples: [
      {
        label: 'cURL',
        code: `curl -X POST "http://localhost:8080/api/v1/check" \\\n  -H "Content-Type: application/json" \\\n  -d '{"text": "Сегодня отличный день!"}'`,
      },
      {
        label: 'Response 200',
        code: `{\n  "id":         "550e8400-e29b-41d4-a716-446655440000",\n  "text":       "Сегодня отличный день!",\n  "label":      "positive",\n  "confidence": 0.9421,\n  "all_scores": {\n    "positive": 0.9421,\n    "neutral":  0.0468,\n    "negative": 0.0111\n  },\n  "created_at": "2025-01-15T14:30:00Z"\n}`,
      },
      {
        label: 'Response 400',
        code: `{ "error": "text must not be empty" }\n// или\n{ "error": "text too long: max 5000 characters" }`,
      },
      {
        label: 'Response 502',
        code: `{ "error": "ml client: do request: ..." }`,
      },
    ],
    statuses: [
      { code: 200, desc: 'Вердикт успешно получен. Тело — объект CheckRecord.' },
      { code: 400, desc: 'Ошибка валидации: пустой текст, превышена длина, невалидный JSON.' },
      { code: 502, desc: 'ML-сервис недоступен или вернул ошибку.' },
    ],
  },
  {
    id: 'history',
    method: 'GET',
    path: '/api/v1/history',
    summary: 'История проверок',
    description:
      'Возвращает список проверок с пагинацией. Сортировка: новые сверху (ORDER BY created_at DESC).',
    paramKind: 'query',
    params: [
      {
        name: 'limit',
        type: 'integer',
        required: false,
        description: 'Количество записей. Диапазон: 1–100. По умолчанию: 20.',
      },
      {
        name: 'offset',
        type: 'integer',
        required: false,
        description: 'Смещение для пагинации. По умолчанию: 0.',
      },
    ],
    examples: [
      {
        label: 'cURL',
        code: `curl "http://localhost:8080/api/v1/history?limit=10&offset=0"`,
      },
      {
        label: 'Response 200',
        code: `[\n  {\n    "id":         "550e8400-...",\n    "text":       "Сегодня отличный день!",\n    "label":      "positive",\n    "confidence": 0.9421,\n    "all_scores": { "positive": 0.9421, "neutral": 0.0468, "negative": 0.0111 },\n    "created_at": "2025-01-15T14:30:00Z"\n  }\n]`,
      },
    ],
    statuses: [
      { code: 200, desc: 'Массив CheckRecord. Пустой массив [] если записей нет.' },
      { code: 500, desc: 'Ошибка обращения к базе данных.' },
    ],
  },
  {
    id: 'history-id',
    method: 'GET',
    path: '/api/v1/history/{id}',
    summary: 'Запись по ID',
    description: 'Возвращает одну запись по её UUID.',
    paramKind: 'path',
    params: [
      {
        name: 'id',
        type: 'string (UUID)',
        required: true,
        description: 'UUID записи. Пример: 550e8400-e29b-41d4-a716-446655440000',
      },
    ],
    examples: [
      {
        label: 'cURL',
        code: `curl "http://localhost:8080/api/v1/history/550e8400-e29b-41d4-a716-446655440000"`,
      },
      {
        label: 'Response 200',
        code: `{\n  "id":         "550e8400-e29b-41d4-a716-446655440000",\n  "text":       "Сегодня отличный день!",\n  "label":      "positive",\n  "confidence": 0.9421,\n  "all_scores": { "positive": 0.9421, "neutral": 0.0468, "negative": 0.0111 },\n  "created_at": "2025-01-15T14:30:00Z"\n}`,
      },
      {
        label: 'Response 404',
        code: `{ "error": "record not found" }`,
      },
    ],
    statuses: [
      { code: 200, desc: 'Объект CheckRecord найден.' },
      { code: 404, desc: 'Запись с указанным ID не найдена.' },
    ],
  },
]

const STATUS_COLOR: Record<number, string> = {
  200: 'var(--accent)',
  400: 'var(--amber)',
  404: 'var(--amber)',
  500: 'var(--red)',
  502: 'var(--red)',
}

/* ── Component ── */
export function DocsPage() {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(['health']))
  const [activeTab, setActiveTab] = useState<Record<string, number>>({})
  const [copied, setCopied] = useState<string | null>(null)

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function getTab(id: string) {
    return activeTab[id] ?? 0
  }

  function setTab(id: string, idx: number) {
    setActiveTab((prev) => ({ ...prev, [id]: idx }))
  }

  function copyCode(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 1500)
    })
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} />
          REST API Reference
        </div>
        <h1 className={styles.h1}>
          SpamBreaker <span className={styles.h1accent}>API Docs</span>
        </h1>
        <p className={styles.heroDesc}>
          Сервис тонального анализа текста на основе TinyBERT + CrossAttention.
          Определяет позитив, нейтральный тон и негатив с оценкой уверенности.
        </p>

        <div className={styles.baseUrlBar}>
          <span className={styles.baseUrlLabel}>Base URL</span>
          <span className={styles.baseUrlValue} id="baseUrl">
            {import.meta.env.VITE_API_URL || 'http://localhost:8080'}
          </span>
          <button
            className={styles.copyBtn}
            onClick={() =>
              copyCode(import.meta.env.VITE_API_URL || 'http://localhost:8080', 'baseUrl')
            }
          >
            {copied === 'baseUrl' ? 'скопировано!' : 'копировать'}
          </button>
        </div>
      </div>

      {/* Overview chips */}
      <div className={styles.chips}>
        {[
          ['Версия', '0.0.1'],
          ['Формат', 'JSON'],
          ['Протокол', 'HTTP/1.1'],
          ['Макс. текст', '5 000 символов'],
          ['Таймаут ML', '5 секунд'],
        ].map(([k, v]) => (
          <div key={k} className={styles.chip}>
            <span className={styles.chipKey}>{k}</span>
            <span className={styles.chipVal}>{v}</span>
          </div>
        ))}
      </div>

      {/* Models */}
      <section className={styles.modelsSection}>
        <div className={styles.sectionTitle}>Модели данных</div>

        <div className={styles.modelCard}>
          <div className={styles.modelHeader}>
            <span className={styles.modelName}>CheckRecord</span>
            <span className={styles.modelType}>object</span>
          </div>
          {[
            ['id', 'string', 'UUID v4. Уникальный идентификатор записи.'],
            ['text', 'string', 'Исходный текст, переданный на проверку.'],
            ['label', '"positive" | "neutral" | "negative"', 'Результат классификации.'],
            ['confidence', 'float64', 'Вероятность победившего класса. Диапазон: 0.0–1.0.'],
            ['all_scores', '{ positive, neutral, negative }', 'Вероятности всех трёх классов.'],
            ['created_at', 'string (ISO 8601 UTC)', 'Время создания записи.'],
          ].map(([name, type, desc]) => (
            <div key={name} className={styles.fieldRow}>
              <span className={styles.fieldName}>{name}</span>
              <span className={styles.fieldType}>{type}</span>
              <span className={styles.fieldDesc}>{desc}</span>
            </div>
          ))}
        </div>

        <div className={styles.modelCard}>
          <div className={styles.modelHeader}>
            <span className={styles.modelName}>ErrorResponse</span>
            <span className={styles.modelType}>object</span>
          </div>
          <div className={styles.fieldRow}>
            <span className={styles.fieldName}>error</span>
            <span className={styles.fieldType}>string</span>
            <span className={styles.fieldDesc}>Человекочитаемое описание ошибки.</span>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section>
        <div className={styles.sectionTitle}>Эндпоинты</div>

        {ENDPOINTS.map((ep) => {
          const isOpen = openIds.has(ep.id)
          const tab = getTab(ep.id)

          return (
            <div key={ep.id} className={`${styles.endpoint} ${isOpen ? styles.endpointOpen : ''}`}>
              {/* Header */}
              <div className={styles.epHeader} onClick={() => toggle(ep.id)}>
                <span
                  className={`${styles.methodPill} ${
                    ep.method === 'GET' ? styles.pillGet : styles.pillPost
                  }`}
                >
                  {ep.method}
                </span>
                <span className={styles.epPath}>{ep.path}</span>
                <span className={styles.epSummary}>{ep.summary}</span>
                <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>▶</span>
              </div>

              {/* Body */}
              {isOpen && (
                <div className={styles.epBody}>
                  {/* Description */}
                  <div className={styles.epSection}>
                    <div className={styles.epLabel}>Описание</div>
                    <p className={styles.desc}>{ep.description}</p>
                  </div>

                  {/* Params */}
                  {ep.params && (
                    <div className={styles.epSection}>
                      <div className={styles.epLabel}>
                        {ep.paramKind === 'body'
                          ? 'Тело запроса — application/json'
                          : ep.paramKind === 'query'
                            ? 'Query-параметры'
                            : 'Path-параметры'}
                      </div>
                      <table className={styles.paramsTable}>
                        <thead>
                          <tr>
                            <th>Параметр</th>
                            <th>Тип</th>
                            <th>Обязательно</th>
                            <th>Описание</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ep.params.map((p) => (
                            <tr key={p.name}>
                              <td className={styles.paramName}>{p.name}</td>
                              <td className={styles.paramType}>{p.type}</td>
                              <td>
                                {p.required ? (
                                  <span className={styles.tagRequired}>required</span>
                                ) : (
                                  <span className={styles.tagOptional}>optional</span>
                                )}
                              </td>
                              <td className={styles.paramDesc}>{p.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Examples tabs */}
                  <div className={styles.epSection}>
                    <div className={styles.tabs}>
                      {ep.examples.map((ex, i) => (
                        <button
                          key={ex.label}
                          className={`${styles.tab} ${tab === i ? styles.tabActive : ''}`}
                          onClick={() => setTab(ep.id, i)}
                        >
                          {ex.label}
                        </button>
                      ))}
                    </div>
                    <div className={styles.codeBlock}>
                      <div className={styles.codeHeader}>
                        <span className={styles.codeLang}>
                          {ep.examples[tab].label.toLowerCase().includes('curl') ? 'bash' : 'json'}
                        </span>
                        <button
                          className={styles.codeCopy}
                          onClick={() =>
                            copyCode(ep.examples[tab].code, `${ep.id}-${tab}`)
                          }
                        >
                          {copied === `${ep.id}-${tab}` ? 'скопировано!' : 'copy'}
                        </button>
                      </div>
                      <pre className={styles.pre}>{ep.examples[tab].code}</pre>
                    </div>
                  </div>

                  {/* Status codes */}
                  <div className={styles.epSection}>
                    <div className={styles.epLabel}>Коды ответа</div>
                    <div className={styles.statusList}>
                      {ep.statuses.map((s) => (
                        <div key={s.code} className={styles.statusItem}>
                          <span
                            className={styles.statusCode}
                            style={{ color: STATUS_COLOR[Number(s.code)] ?? 'var(--text)' }}
                          >
                            {s.code}
                          </span>
                          <span className={styles.statusDesc}>{s.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </section>
    </div>
  )
}
