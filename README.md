# SpamBreaker — Frontend

Административная панель для сервиса тонального анализа текста.

## Стек

- **React 18** + **Vite 5** + **TypeScript**
- **React Router v6** — маршрутизация
- **Zustand** — глобальный стейт (auth, будущие фичи)
- **CSS Modules** — стилизация без конфликтов
- **nginx** — статика в продакшене

---

## Структура проекта

```
src/
├── api/               # HTTP-клиент и методы по доменам
│   ├── client.ts      # Базовый fetch-клиент (сюда добавится JWT)
│   └── moderation.ts  # Методы: check, history, health
├── components/
│   ├── layout/        # AppLayout, Sidebar, Topbar, ProtectedRoute
│   └── ui/            # Badge, ConfidenceBar, Spinner
├── hooks/
│   └── useApi.ts      # Дата-фетчинг хук (заменяемый на RQ/SWR)
├── pages/
│   ├── DashboardPage  # Форма проверки + последние записи
│   ├── HistoryPage    # Таблица истории с пагинацией
│   ├── DocsPage       # API документация
│   ├── LoginPage      # Заглушка авторизации
│   └── NotFoundPage
├── store/
│   └── auth.store.ts  # Zustand: isAuthenticated, user, token
├── styles/
│   └── globals.css    # CSS-переменные и базовые стили
└── types/
    └── api.ts         # TypeScript-типы зеркалящие Go-бэкенд
```

---

## Запуск

```bash
# 1. Зависимости
npm install

# 2. Конфиг окружения
cp .env.example .env
# Отредактировать VITE_API_URL если нужно

# 3. Dev-сервер (с proxy на Core API)
npm run dev
```

---

## Продакшен

```bash
# Собрать образ
docker build \
  --build-arg VITE_API_URL=https://api.your-domain.com \
  -f infra/dockerfiles/frontend.Dockerfile \
  -t spambreaker-front .

# Или через compose
cp .env.example .env   # заполнить VITE_API_URL, MODE, TAG
docker compose up -d
```

---

## Добавить новую страницу

1. Создать `src/pages/MyPage.tsx` + `MyPage.module.css`
2. Добавить маршрут в `src/App.tsx` внутрь `<Route element={<AppLayout />}>`
3. Добавить пункт в `Sidebar.tsx` → массив `NAV_ITEMS`
4. Добавить заголовок в `Topbar.tsx` → объект `PAGE_TITLES`

---

## Добавить авторизацию

1. Реализовать `POST /auth/login` на бэкенде (возвращает JWT)
2. В `src/store/auth.store.ts` поменять `isAuthenticated: true` → `false`
3. В `LoginPage.tsx` добавить форму, вызвать `useAuthStore.setAuth(user, token)`
4. В `src/api/client.ts` раскомментировать блок с `Authorization` заголовком
