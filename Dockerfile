FROM hub.hamdocker.ir/node:20 AS builder

ARG NODE_OPTIONS

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

FROM hub.hamdocker.ir/node:20 AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/ ./

CMD ["npm", "start"]