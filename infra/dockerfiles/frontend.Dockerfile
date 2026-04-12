# ── Stage 1: build ────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Копируем манифесты первыми — слой кешируется пока они не изменились
COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile

# Копируем исходники и собираем
COPY . .

# Передаём URL бэкенда на этапе сборки
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ── Stage 2: serve ────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Убираем дефолтный конфиг nginx
RUN rm /etc/nginx/conf.d/default.conf

COPY infra/nginx/nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
