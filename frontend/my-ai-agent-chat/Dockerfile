FROM hub.hamdocker.ir/node:20 AS builder

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PRIVATE_BUILD_WORKER=1
ENV TOKIO_WORKER_THREADS=2
ENV NODE_OPTIONS=--max-old-space-size=2048

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

FROM hub.hamdocker.ir/node:20 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/ ./

EXPOSE 3000

CMD ["npm", "start"]