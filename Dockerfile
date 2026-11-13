# Сборка фронтенда (нужны devDependencies: vite и плагин React).
# Debian slim, а не alpine: позже сюда добавится Playwright/Chromium, ему нужен glibc.
FROM node:22-bookworm-slim AS build
# onnxruntime-node (OCR) не должен тянуть CUDA-бинарники: считаем на процессоре.
ENV ONNXRUNTIME_NODE_INSTALL=skip
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY client ./client
COPY shared ./shared
COPY vite.config.js ./
RUN npm run build

# Рабочий образ: только сервер, общий код и собранный dist.
FROM node:22-bookworm-slim
ENV NODE_ENV=production \
    API_PORT=3001 \
    ONNXRUNTIME_NODE_INSTALL=skip
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY server ./server
COPY shared ./shared
COPY --from=build /app/dist ./dist
# Заявки пишутся в server/data — туда монтируется том; владелец node, чтобы процесс мог писать.
RUN mkdir -p server/data && chown node:node server/data
USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3001/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
# --experimental-sqlite: встроенный node:sqlite в Node 22 ещё за флагом (в Node 24 уже без).
CMD ["node", "--experimental-sqlite", "server/index.js"]
