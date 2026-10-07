FROM hub.hamdocker.ir/node:20 AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM hub.hamdocker.ir/node:20 AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/dist ./dist

RUN npm ci --omit=dev

EXPOSE 3000

CMD ["npm", "start"]