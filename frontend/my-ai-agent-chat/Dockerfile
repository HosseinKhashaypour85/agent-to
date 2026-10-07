FROM hub.hamdocker.ir/node:20 AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

FROM hub.hamdocker.ir/node:20 AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/ ./

EXPOSE 3000

CMD ["npm", "start"]