# مستندات رفع مشکلات CRM Backend

## خلاصه
تمام endpoint های CRM اکنون به درستی کار می‌کنند و خطای 500 Internal Server Error برطرف شده است.

---

## مشکلات شناسایی شده و راه‌حل‌ها

### ۱. خطاهای Redis Connection Flooding Logs
**مشکل:** BullMQ queue worker برای lead scoring سعی می‌کرد به Redis (که اجرا نشده بود) متصل شود و خطای `ECONNREFUSED` هر چند ثانیه یکبار لاگ‌ها را پر می‌کرد.

**راه‌حل:** فایل `src/modules/crm/lead-score.queue.ts` تغییر یافت تا صف و worker فقط زمانی ساخته شود که متغیر محیطی `REDIS_URL`plicitly تنظیم شده باشد.

```typescript
// قبل: همیشه سعی می‌کرد به redis://localhost:6379 وصل شود
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// بعد: فقط اگر REDIS_URL تنظیم شده باشد
const REDIS_URL = process.env.REDIS_URL;
if (REDIS_URL) {
  // ایجاد connection، queue و worker
}
```

---

### ۲. Sequelize Associations ثبت نشده بودند
**مشکل:** Association `LeadScore.belongsTo(Customer, { as: "customer" })` در متد استاتیک `associate()` مدل تعریف شده بود اما فراخوانی نمی‌شد. کوئری‌های `include` با خطای "Customer is not associated to LeadScore" مواجه می‌شدند.

**راه‌حل:** Associations در `src/server.ts` در زمان لود ماژول به صورت دستی ثبت شدند (خطوط 62-75):

```typescript
LeadScore.belongsTo(Customer, {
  foreignKey: "customerId",
  as: "customer",
});

LeadScore.belongsTo(Lead, {
  foreignKey: "leadId",
  as: "lead",
});

Customer.hasMany(LeadScore, {
  foreignKey: "customerId",
  as: "leadScores",
});
```

---

### ۳. عدم تطابق Collation بین جداول
**مشکل:** جدول `lead_scores` از collation `utf8mb4_0900_ai_ci` استفاده می‌کرد در حالی که جدول `customers` از `utf8mb4_unicode_ci` استفاده می‌کرد. این باعث خطای MySQL می‌شد:
```
Illegal mix of collations (utf8mb4_0900_ai_ci,IMPLICIT) and (utf8mb4_unicode_ci,IMPLICIT) for operation '='
```

**راه‌حل:** اجرای `ALTER TABLE` در bootstrap سرور برای یکسان‌سازی collation:

```sql
ALTER TABLE lead_scores CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## Endpoint های کارآمد

تمام endpoint های زیر اکنون با کد وضعیت 200 پاسخ می‌دهند:

| متد | مسیر | توضیح |
|-----|------|-------|
| GET | `/api/v1/crm/dashboard/lead-stats` | آمار داشبورد (تعداد hot/warm/cold + top hot leads) |
| GET | `/api/v1/crm/lead-score/temperature/:temperature` | لیدها بر اساس دما (HOT/WARM/COLD) |
| GET | `/api/v1/crm/lead-score/:customerId` | امتیاز لید یک مشتری |
| POST | `/api/v1/crm/lead-score/calculate` | محاسبه امتیاز لید |
| GET | `/api/v1/crm/customers/:customerId/conversations` | مکالمات مشتری |
| GET | `/api/v1/crm/customers/:customerId/history` | خلاصه تاریخچه مشتری |
| GET | `/api/v1/crm/customers/:customerId/timeline` | تایم‌لاین مشتری |
| GET | `/api/v1/crm/customers/:customerId/profile` | پروفایل کامل مشتری |
| GET | `/api/v1/crm/conversations/:conversationId` | جزئیات مکالمه |
| GET | `/api/v1/crm/conversations/:conversationId/messages` | پیام‌های مکالمه |

---

## فایل‌های تغییر یافته

| فایل | تغییرات |
|------|---------|
| `src/modules/crm/lead-score.queue.ts` | شرطی‌سازی ایجاد Redis queue/worker |
| `src/server.ts` | ثبت manual associations + collation fix |
| `src/models/Customer.ts` | اضافه کردن `tableOptions.collate` برای سازگاری آینده |
| `src/modules/crm/lead-scoring.service.ts` | حذف لاگ‌های debug |
| `src/modules/crm/lead-scoring.controller.ts` | حذف لاگ‌های debug |
| `src/modules/crm/crm.routes.ts` | حذف middleware لاگینگ درخواست |
| `src/app.ts` | حذف middleware لاگینگ درخواست و test routes |

---

## نحوه اجرا

```bash
# نصب وابستگی‌ها
npm install

# اجرای سرور توسعه
npx tsx src/server.ts
```

سرور روی پورت 3000 بالا می‌آید:
```
🚀 Server running on http://localhost:3000
```

---

## تست دستی

```bash
# دریافت توکن احراز هویت
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# تست endpoint داشبورد
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:3000/api/v1/crm/dashboard/lead-stats

# تست endpoint لیدهای داغ
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:3000/api/v1/crm/lead-score/temperature/HOT
```

---

## نکات مهم برای توسعه فرانت‌اند

1. **احراز هویت:** تمام endpoint های CRM نیاز به header `Authorization: Bearer <JWT_TOKEN>` دارند
2. **Tenant Isolation:** تمام کوئری‌ها بر اساس `tenantId` از توکن JWT فیلتر می‌شوند
3. **Response Format:** تمام پاسخ‌ها فرمت یکسان `{ success: boolean, data?: any, message?: string }` دارند
4. **Error Handling:** خطاها با کد وضعیت مناسب و پیام‌های فارسی برگردانده می‌شوند

---

## مراحل بعدی پیشنهادی

- [ ] ساخت فرانت‌اند Next.js برای داشبورد CRM
- [ ] پیاده‌سازی UI برای AI Lead Scoring
- [ ] پیاده‌سازی UI برای Conversation History
- [ ] اضافه کردن pagination و filtering در فرانت‌اند
- [ ] تست‌های یکپارچه (E2E) برای endpoint های CRM