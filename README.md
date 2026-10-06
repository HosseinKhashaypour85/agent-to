# 🤖 My AI Agent Backend

> **قدرت هوش مصنوعی برای کسب‌وکارهای شما** — یک بک‌اند مقیاس‌پذیر، ماژولار و پرقدرت برای چت‌بات هوشمند، CRM، و اتوماسیون فروش

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.x-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)](https://sequelize.org/)
[![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## ✨ ویژگی‌های کلیدی

### 🧠 **هوش مصنوعی و چت‌بات**
- **تشخیص نیت (Intent Detection)** با دقت بالا برای درک نیاز مشتری
- **جستجوی معنایی** در پایگاه دانش (Knowledge Base) با벡تور دیتابیس
- **اجرا ابزارها (Tool Calling)** برای قیمت، موجودی، سفارش، ارسال، پرداخت
- **پاسخ‌دهی چندزبانه** (فارسی، انگلیسی، و بیشتر)
- **شخصیت‌سازی ایجنت** (لحن، زبان، پرامپت سیستمی)

### 📊 **CRM هوشمند (AI-Powered CRM)**
- **AI Lead Scoring** — محاسبه امتیاز لید بر اساس رفتار، نیت و سیگنال‌ها
- **دماهای لید** 🔥 DAGH (۷۵+) | 🟡 WARM (۴۰-۷۴) | 🔵 COLD (<۴۰)
- **تاریخچه مکالمات** کامل با خلاصه‌سازی هوشمند
- **تایم‌لاین رویدادها** — ردیابی هر تعامل مشتری
- **پروفایل ۳۶۰ درجه مشتری** — همه داده‌ها در یک نگاه

### 🏢 **مدیریت کسب‌وکار**
- **Multi-tenant** — izolasi کامل داده بین کسب‌وکارها
- **مدیریت سایت‌ها** — نصب آسان ویجت چت روی وب‌سایت
- **کانال‌های پیام‌رسانی** — تلگرام، واتس‌اپ، وب‌سایت، وردپرس
- **پایگاه دانش** — مدیریت مقالات، FAQ، مستندات
- **مدیریت محصولات** — کاتلог کامل با موجودی و قیمت

### 💳 **اشتراک و پرداخت**
- **پلن‌های اشتراک** چندسطحه (Free, Pro, Enterprise)
- **مدیریت اشتراک‌ها** — ارتقا، تمدید، انقضا
- **درگاه پرداخت** قابل توسعه

### 🔧 **نصب و راه‌اندازی**
- **اسکریپت نصب یک‌خطی** برای وب‌سایت‌ها
- **توکن‌های نصب امن** با انقضا
- **وب‌هوک‌ها** برای رویدادهای بلادرنگ

---

## 🏗 معماری

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway (Express)                    │
├─────────────────────────────────────────────────────────────────┤
│  Auth │ Sites │ Customers │ Leads │ Conversations │ Messages   │
│   AI  │ Knowledge │ Products │ Chat │ CRM │ Admin │ Installer  │
├─────────────────────────────────────────────────────────────────┤
│                    Business Logic Layer                         │
│  Intent Detection │ Tool Executor │ CRM Intelligence           │
│  Lead Scoring │ Customer Memory │ Knowledge Search             │
├─────────────────────────────────────────────────────────────────┤
│                     Data Access Layer (Sequelize)               │
│  MySQL (Primary) │ Redis (Queue/Cache) │ Vector DB (Knowledge) │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 شروع سریع

### پیش‌نیازها
- **Node.js** 20+
- **MySQL** 8.0+
- **Redis** 7+ (اختیاری - برای صف‌های Lead Scoring)

### نصب

```bash
# کلون ریپازیتوری
git clone https://github.com/your-org/my-ai-agent-back.git
cd my-ai-agent-back

# نصب وابستگی‌ها
npm install

# کپی فایل محیطی و تنظیم متغیرها
cp .env.example .env
# ویرایش .env با اطلاعات دیتابیس و کلیدها

# اجرای مایگریشن و سینک دیتابیس
npm run db:sync

# اجرای سرور توسعه
npm run dev
```

### متغیرهای محیطی

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=my_ai_agent
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_long_random_secret_key_here
JWT_EXPIRES_IN=7d

# AI Service (KayaAI)
KAYA_AI_API_KEY=sk-llm-xxxxx
KAYA_AI_BASE_URL=https://kayaai.ir/api
KAYA_AI_MODEL=deepseek/deepseek-v4-flash

# Redis (Optional - for Lead Scoring Queue)
REDIS_URL=redis://localhost:6379

# URLs
PUBLIC_API_URL=http://localhost:3000
PUBLIC_FRONTEND_URL=http://localhost:3001
```

---

## 📡 API Reference

### احراز هویت
```http
POST /api/v1/auth/register    # ثبت‌نام
POST /api/v1/auth/login       # ورود
GET  /api/v1/auth/me          # پروفایل کاربر
```

### سایت‌ها و نصب
```http
GET    /api/v1/sites                    # لیست سایت‌ها
POST   /api/v1/sites                    # ایجاد سایت
GET    /api/v1/sites/:id                # جزئیات سایت
GET    /api/v1/install/script           # اسکریپت نصب ویجت
POST   /api/v1/install/token            # تولید توکن نصب
```

### چت و مکالمات
```http
POST   /api/v1/chat/message             # ارسال پیام (عمومی)
GET    /api/v1/conversations            # لیست مکالمات
GET    /api/v1/conversations/:id        # جزئیات مکالمه
GET    /api/v1/conversations/:id/messages # پیام‌های مکالمه
```

### CRM و Lead Scoring
```http
GET    /api/v1/crm/dashboard/lead-stats           # آمار داشبورد
GET    /api/v1/crm/lead-score/temperature/:temp   # لیدها بر اساس دما
GET    /api/v1/crm/lead-score/:customerId         # امتیاز لید مشتری
POST   /api/v1/crm/lead-score/calculate           # محاسبه امتیاز
GET    /api/v1/crm/customers/:id/conversations    # مکالمات مشتری
GET    /api/v1/crm/customers/:id/history          # تاریخچه کامل
GET    /api/v1/crm/customers/:id/timeline         # تایم‌لاین
GET    /api/v1/crm/customers/:id/profile          # پروفایل ۳۶۰ درجه
```

### هوش مصنوعی
```http
POST   /api/v1/ai/chat                  # چت با AI
GET    /api/v1/ai/intent                # تشخیص نیت
```

### مدیریت کسب‌وکار (Admin)
```http
GET    /api/v1/admin/businesses              # لیست کسب‌وکارها
GET    /api/v1/admin/businesses/:id/overview # نمای کلی کسب‌وکار
GET    /api/v1/admin/plans                   # پلن‌های اشتراک
GET    /api/v1/admin/subscriptions           # اشتراک‌ها
```

---

## 📁 ساختار پروژه

```
src/
├── app.ts                    # پیکربندی Express و میدلوارها
├── server.ts                 # نقطه ورود، Bootstrap، Associations
├── config/
│   └── database.ts           # تنظیمات Sequelize
├── middlewares/
│   ├── auth.middleware.ts    # JWT Authentication
│   └── validation.middleware.ts
├── models/                   # مدل‌های Sequelize
│   ├── User.ts
│   ├── Tenant.ts
│   ├── Customer.ts
│   ├── Lead.ts
│   ├── LeadScore.ts          # مدل امتیاز لید
│   ├── CustomerMemory.ts     # حافظه مشتری
│   ├── Conversation.ts
│   ├── Message.ts
│   ├── Agent.ts
│   ├── KnowledgeBase.ts
│   ├── Product.ts
│   └── ...
├── modules/
│   ├── auth/                 # احراز هویت
│   ├── site/                 # مدیریت سایت‌ها
│   ├── customer/             # مدیریت مشتریان
│   ├── lead/                 # مدیریت لیدها
│   ├── conversation/         # مکالمات
│   ├── message/              # پیام‌ها
│   ├── ai/                   # سرویس‌های AI
│   │   ├── ai.service.ts     # سرویس اصلی چت
│   │   ├── intent.service.ts # تشخیص نیت
│   │   └── intent.executor.ts # اجرای ابزارها
│   ├── knowledge/            # پایگاه دانش
│   ├── product/              # محصولات
│   ├── chat/                 # چت عمومی
│   ├── crm/                  # 🎯 CRM ماژول
│   │   ├── lead-scoring.service.ts   # موتور امتیازدهی
│   │   ├── lead-scoring.controller.ts
│   │   ├── customer-history.service.ts
│   │   ├── customer-history.controller.ts
│   │   ├── customer-memory.service.ts
│   │   ├── crm-intelligence.service.ts
│   │   └── lead-score.queue.ts       # صف BullMQ
│   ├── agent/                # مدیریت ایجنت‌ها
│   ├── installer/            # نصب ویجت
│   ├── telegram/             # بات تلگرام
│   └── admin/                # پنل ادمین
└── utils/
    └── helpers.ts
```

---

## 🧪 تست‌ها

```bash
# تست واحد
npm run test

# تست یکپارچه
npm run test:e2e

# پوشش کد
npm run test:coverage
```

---

## 🐳 داکر

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: my_ai_agent
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  mysql_data:
  redis_data:
```

```bash
# اجرا با داکر
docker-compose up -d
```

---

## 📈 مانیتورینگ و لاگ‌ها

- **Request Logging** — همه درخواست‌ها لاگ می‌شوند
- **Error Tracking** — خطاها با Stack Trace ثبت می‌شوند
- **Queue Monitoring** — وضعیت صف Lead Scoring
- **Health Check** — `GET /api/v1/health`

---

## 🔐 امنیت

- ✅ **Helmet.js** — هدرهای امنیتی HTTP
- ✅ **CORS** — تنظیمات قابل پیکربندی
- ✅ **Rate Limiting** — محدودیت نرخ درخواست (قابل اضافه کردن)
- ✅ **JWT** — توکن‌های امن با انقضا
- ✅ **Password Hashing** — bcrypt با salt 12 Round
- ✅ **Input Validation** — اعتبارسنجی ورودی‌ها
- ✅ **SQL Injection Prevention** — استفاده از ORM (Sequelize)

---

## 🤝 مشارکت

```bash
# Fork ریپازیتوری
# ایجاد شاخه جدید
git checkout -b feature/amazing-feature

# Commit تغییرات
git commit -m 'feat: add amazing feature'

# Push به Fork
git push origin feature/amazing-feature

# باز کردن Pull Request
```

### استانداردهای کد
- **ESLint** + **Prettier** برای فرمت‌بندی
- **Conventional Commits** برای پیام‌های کامیت
- **TypeScript Strict Mode** فعال
- **تست‌نویسی** الزامی برای فیچرهای جدید

---

## 📄 لایسنس

این پروژه تحت لایسنس **MIT** منتشر شده است. دیدن [LICENSE](LICENSE) برای جزئیات بیشتر.

---

## 👥 تیم توسعه

| نقش | نام | گیت‌هاب |
|-----|-----|---------|
| Backend Lead | [Your Name](https://github.com/yourusername) | @yourusername |
| AI Engineer | [AI Expert](https://github.com/aiexpert) | @aiexpert |
| DevOps | [DevOps Pro](https://github.com/devopspro) | @devopspro |

---

## 🙏 تشکر از

- [Sequelize](https://sequelize.org/) — ORM قدرتمند
- [BullMQ](https://bullmq.io/) — صف‌های توزیع شده
- [KayaAI](https://kayaai.ir/) — سرویس مدل‌های زبانی
- [Express](https://expressjs.com/) — فریم‌ورک وب
- [TypeScript](https://www.typescriptlang.org/) — تایپ‌سیفتی

---

## 📞 پشتیبانی

- **ایمیل:** support@myaiagent.ir
- **تلگرام:** [@myaiagent_support](https://t.me/myaiagent_support)
- **اینستاگرام:** [@myaiagent](https://instagram.com/myaiagent)
- **داکیومنتیشن:** [docs.myaiagent.ir](https://docs.myaiagent.ir)

---

<div align="center">

### ⭐ اگر این پروژه براتون مفید بود، ستاره بدید!

**ساخته شده با ❤️ در ایران**

[🇮🇷 فارسی] | [🇺🇸 English] | [🇨🇳 中文] | [🇪🇸 Español]

</div>